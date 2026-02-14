import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const BUCKET = "servicios";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// ─── helpers ──────────────────────────────────────────────────────────────────

async function resolveContext() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: negocio } = await supabase
    .from("negocios")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!negocio)
    return { error: NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 }) };

  return { supabase, admin, negocio };
}

async function deletePreviousImagen(
  admin: ReturnType<typeof createAdminClient>,
  imagen_url: string | null
) {
  if (!imagen_url) return;

  const marker = `/object/public/${BUCKET}/`;
  const idx = imagen_url.indexOf(marker);
  if (idx === -1) return;

  const storagePath = imagen_url.slice(idx + marker.length);
  await admin.storage.from(BUCKET).remove([storagePath]);
}

// ─── POST — subir / reemplazar imagen ─────────────────────────────────────────

export async function POST(req: Request) {
  const ctx = await resolveContext();
  if ("error" in ctx) return ctx.error;
  const { admin, negocio } = ctx;

  const formData = await req.formData().catch(() => null);
  if (!formData)
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });

  const servicio_id = String(formData.get("servicio_id") ?? "").trim();
  const imagen = formData.get("imagen") as File | null;

  if (!servicio_id)
    return NextResponse.json({ error: "servicio_id requerido" }, { status: 400 });
  if (!imagen)
    return NextResponse.json({ error: "imagen requerida" }, { status: 400 });

  if (!ALLOWED_TYPES.includes(imagen.type))
    return NextResponse.json(
      { error: "Tipo de archivo no permitido. Usá JPG, PNG o WEBP." },
      { status: 422 }
    );
  if (imagen.size > MAX_BYTES)
    return NextResponse.json({ error: "La imagen supera los 5 MB." }, { status: 422 });

  // Verificar que el servicio pertenece al negocio
  const { data: servicio, error: svcErr } = await admin
    .from("servicios")
    .select("id, imagen_url")
    .eq("id", servicio_id)
    .eq("negocio_id", negocio.id)
    .single();

  if (svcErr || !servicio)
    return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });

  // Eliminar imagen anterior del Storage
  await deletePreviousImagen(admin, servicio.imagen_url);

  // Subir nueva imagen
  const ext = imagen.type.split("/")[1].replace("jpeg", "jpg");
  const storagePath = `${negocio.id}/${servicio_id}/imagen.${ext}`;
  const buffer = Buffer.from(await imagen.arrayBuffer());

  const { error: uploadErr } = await admin.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: imagen.type,
      upsert: true,
    });

  if (uploadErr)
    return NextResponse.json({ error: uploadErr.message }, { status: 500 });

  // Obtener URL pública
  const { data: publicData } = admin.storage.from(BUCKET).getPublicUrl(storagePath);
  const imagen_url = publicData.publicUrl;

  // Persistir en la tabla
  const { error: updateErr } = await admin
    .from("servicios")
    .update({ imagen_url })
    .eq("id", servicio_id)
    .eq("negocio_id", negocio.id);

  if (updateErr)
    return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, imagen_url });
}

// ─── DELETE — eliminar imagen ──────────────────────────────────────────────────

export async function DELETE(req: Request) {
  const ctx = await resolveContext();
  if ("error" in ctx) return ctx.error;
  const { admin, negocio } = ctx;

  const url = new URL(req.url);
  const servicio_id = url.searchParams.get("servicio_id");
  if (!servicio_id)
    return NextResponse.json({ error: "servicio_id requerido" }, { status: 400 });

  const { data: servicio, error: svcErr } = await admin
    .from("servicios")
    .select("id, imagen_url")
    .eq("id", servicio_id)
    .eq("negocio_id", negocio.id)
    .single();

  if (svcErr || !servicio)
    return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });

  await deletePreviousImagen(admin, servicio.imagen_url);

  const { error: updateErr } = await admin
    .from("servicios")
    .update({ imagen_url: null })
    .eq("id", servicio_id)
    .eq("negocio_id", negocio.id);

  if (updateErr)
    return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}