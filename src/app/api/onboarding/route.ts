import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function normalizeSlug(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function cleanText(v: any) {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const nombre = String(body?.nombre || "").trim();
  const vertical = String(body?.vertical || "").trim();
  const slugRaw = String(body?.slug || "").trim();

  const slug = normalizeSlug(slugRaw || nombre);

  const color_primario = cleanText(body?.color_primario);
  const color_secundario = cleanText(body?.color_secundario);

  const direccion = cleanText(body?.direccion);
  const telefono = cleanText(body?.telefono);

  const email = cleanText(body?.email);

  if (!nombre) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  if (!vertical) return NextResponse.json({ error: "Vertical requerida" }, { status: 400 });
  if (!slug) return NextResponse.json({ error: "Slug inválido" }, { status: 400 });

  // ✅ slug único (excluye tu propio negocio)
  const { data: existing, error: existErr } = await supabase
    .from("negocios")
    .select("id, owner_id")
    .eq("slug", slug)
    .maybeSingle();

  if (existErr) return NextResponse.json({ error: existErr.message }, { status: 500 });

  if (existing && existing.owner_id !== user.id) {
    return NextResponse.json({ error: "Ese slug ya está en uso" }, { status: 409 });
  }

  // ✅ update del negocio del owner
  const { error: updErr } = await supabase
    .from("negocios")
    .update({
      nombre,
      vertical,
      slug,
      color_primario,
      color_secundario,
      direccion,
      telefono,
      email,
    })
    .eq("owner_id", user.id);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, slug });
}
