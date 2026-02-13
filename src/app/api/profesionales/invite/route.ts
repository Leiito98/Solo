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
  if (!profesionalId) {
    return NextResponse.json({ error: "profesionalId requerido" }, { status: 400 });
  }

  // 1) Traer profesional
  const { data: prof, error: profErr } = await supabase
    .from("profesionales")
    .select("id, negocio_id, email, auth_user_id")
    .eq("id", profesionalId)
    .single();

  if (profErr || !prof) {
    return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 });
  }

  if (!prof.email) {
    return NextResponse.json({ error: "El profesional no tiene email" }, { status: 400 });
  }

  if (prof.auth_user_id) {
    return NextResponse.json({ ok: true, message: "Ya está vinculado" });
  }

  // 2) Verificar que el usuario actual es OWNER del negocio del profesional
  const { data: negocio, error: negErr } = await supabase
    .from("negocios")
    .select("id")
    .eq("id", prof.negocio_id)
    .eq("owner_id", user.id)
    .single();

  if (negErr || !negocio) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3) Invitar usuario (email de supabase)
  const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
    prof.email,
    {
      // Ajustá a tu dominio si querés:
      // redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/pro/dashboard`,
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/pro/dashboard`,
    }
  );

  if (inviteErr || !invited?.user?.id) {
    return NextResponse.json({ error: inviteErr?.message || "No se pudo invitar" }, { status: 500 });
  }

  // 4) Guardar vínculo auth_user_id
  const { error: upErr } = await supabase
    .from("profesionales")
    .update({ auth_user_id: invited.user.id })
    .eq("id", prof.id);

  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
