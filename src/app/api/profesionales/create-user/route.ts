import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const profesionalId = String(body?.profesionalId || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "").trim();

  if (!profesionalId) return NextResponse.json({ error: "profesionalId requerido" }, { status: 400 });
  if (!email) return NextResponse.json({ error: "email requerido" }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "password mínimo 6 caracteres" }, { status: 400 });

  // Traer profesional
  const { data: prof, error: profErr } = await supabase
    .from("profesionales")
    .select("id, negocio_id, email, auth_user_id")
    .eq("id", profesionalId)
    .single();

  if (profErr || !prof) return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 });
  if (prof.auth_user_id) return NextResponse.json({ error: "Este profesional ya tiene usuario" }, { status: 400 });

  // Verificar owner
  const { data: negocio } = await supabase
    .from("negocios")
    .select("id")
    .eq("id", prof.negocio_id)
    .eq("owner_id", user.id)
    .single();

  if (!negocio) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Crear usuario de Auth con password
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // así no requiere confirmar email (opcional)
  });

  if (createErr || !created?.user?.id) {
    return NextResponse.json({ error: createErr?.message || "No se pudo crear usuario" }, { status: 500 });
  }

  // Vincular auth_user_id al profesional + guardar email si estaba vacío o distinto
  const { error: upErr } = await supabase
    .from("profesionales")
    .update({ auth_user_id: created.user.id, email })
    .eq("id", prof.id);

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
