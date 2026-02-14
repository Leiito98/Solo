import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function pick<T extends Record<string, any>>(obj: T, keys: (keyof T)[]) {
  const out: Partial<T> = {};
  for (const k of keys) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const payload = pick(body, ["logo_url", "banner_url", "color_primario", "color_secundario"]);

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "No payload" }, { status: 400 });
  }

  // Encontrar negocio del owner
  const { data: negocio, error: nErr } = await supabase
    .from("negocios")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (nErr || !negocio) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { error: uErr } = await supabase
    .from("negocios")
    .update(payload)
    .eq("id", negocio.id);

  if (uErr) return NextResponse.json({ error: uErr.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
