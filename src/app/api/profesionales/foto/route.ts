import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const BUCKET = "profesionales";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Verifica auth + negocio y devuelve ambos o una respuesta de error. */
async function resolveContext() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: negocio } = await supabase
    .from("negocios")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!negocio)
    return { error: NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 }) };

  return { supabase, admin, negocio };
}

/** Elimina la foto anterior del Storage si existe y pertenece a nuestro bucket. */
async function deletePreviousFoto(
  admin: ReturnType<typeof createAdminClient>,
  foto_url: string | null
) {
  if (!foto_url) return;

  // La URL pública tiene la forma: .../storage/v1/object/public/<bucket>/<path>
  const marker = `/object/public/${BUCKET}/`;
  const idx = foto_url.indexOf(marker);
  if (idx === -1) return;

  const storagePath = foto_url.slice(idx + marker.length);
  await admin.storage.from(BUCKET).remove([storagePath]);
}

// ─── POST — subir / reemplazar foto ───────────────────────────────────────────

export async function POST(req: Request) {
  const ctx = await resolveContext();
  if ("error" in ctx) return ctx.error;
  const { admin, negocio } = ctx;

  // Parsear multipart/form-data
  const formData = await req.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Body inválido" }, { status: 400 });

  const profesional_id = String(formData.get("profesional_id") ?? "").trim();
  const foto = formData.get("foto") as File | null;

  if (!profesional_id) return NextResponse.json({ error: "profesional_id requerido" }, { status: 400 });
  if (!foto) return NextResponse.json({ error: "foto requerida" }, { status: 400 });

  // Validaciones
  if (!ALLOWED_TYPES.includes(foto.type))
    return NextResponse.json({ error: "Tipo de archivo no permitido. Usá JPG, PNG o WEBP." }, { status: 422 });
  if (foto.size > MAX_BYTES)
    return NextResponse.json({ error: "La imagen supera los 5 MB." }, { status: 422 });

  // Verificar que el profesional pertenece al negocio
  const { data: profesional, error: profErr } = await admin
    .from("profesionales")
    .select("id, foto_url")
    .eq("id", profesional_id)
    .eq("negocio_id", negocio.id)
    .single();

  if (profErr || !profesional)
    return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 });

  // Eliminar foto anterior del Storage (si había)
  await deletePreviousFoto(admin, profesional.foto_url);

  // Subir nueva foto
  const ext = foto.type.split("/")[1].replace("jpeg", "jpg");
  const storagePath = `${negocio.id}/${profesional_id}/perfil.${ext}`;
  const buffer = Buffer.from(await foto.arrayBuffer());

  const { error: uploadErr } = await admin.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: foto.type,
      upsert: true, // sobreescribe si ya existe el mismo path
    });

  if (uploadErr)
    return NextResponse.json({ error: uploadErr.message }, { status: 500 });

  // Obtener URL pública
  const { data: publicData } = admin.storage.from(BUCKET).getPublicUrl(storagePath);
  const foto_url = publicData.publicUrl;

  // Persistir en la tabla
  const { error: updateErr } = await admin
    .from("profesionales")
    .update({ foto_url })
    .eq("id", profesional_id)
    .eq("negocio_id", negocio.id);

  if (updateErr)
    return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, foto_url });
}

// ─── DELETE — eliminar foto ────────────────────────────────────────────────────

export async function DELETE(req: Request) {
  const ctx = await resolveContext();
  if ("error" in ctx) return ctx.error;
  const { admin, negocio } = ctx;

  const url = new URL(req.url);
  const profesional_id = url.searchParams.get("profesional_id");
  if (!profesional_id)
    return NextResponse.json({ error: "profesional_id requerido" }, { status: 400 });

  // Verificar que el profesional pertenece al negocio
  const { data: profesional, error: profErr } = await admin
    .from("profesionales")
    .select("id, foto_url")
    .eq("id", profesional_id)
    .eq("negocio_id", negocio.id)
    .single();

  if (profErr || !profesional)
    return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 });

  // Eliminar del Storage
  await deletePreviousFoto(admin, profesional.foto_url);

  // Limpiar la columna
  const { error: updateErr } = await admin
    .from("profesionales")
    .update({ foto_url: null })
    .eq("id", profesional_id)
    .eq("negocio_id", negocio.id);

  if (updateErr)
    return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}