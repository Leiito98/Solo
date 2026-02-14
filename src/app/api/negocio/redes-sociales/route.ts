// src/app/api/negocio/redes-sociales/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function normalizeUrl(input: any) {
  const v = String(input ?? "").trim();
  if (!v) return null;
  if (!/^https?:\/\//i.test(v)) return `https://${v}`;
  return v;
}

function isValidHttpUrl(input: string | null) {
  if (!input) return true;
  try {
    const u = new URL(input);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const negocioId = String(body?.negocioId || "").trim();
  const facebook = normalizeUrl(body?.facebook);
  const instagram = normalizeUrl(body?.instagram);

  if (!negocioId) return NextResponse.json({ error: "negocioId requerido" }, { status: 400 });

  if (!isValidHttpUrl(facebook)) {
    return NextResponse.json({ error: "Facebook inválido" }, { status: 400 });
  }
  if (!isValidHttpUrl(instagram)) {
    return NextResponse.json({ error: "Instagram inválido" }, { status: 400 });
  }

  // Verificar pertenencia
  const { data: myBiz, error: myBizErr } = await supabase
    .from("negocios")
    .select("id")
    .eq("id", negocioId)
    .eq("owner_id", user.id)
    .single();

  if (myBizErr || !myBiz) {
    return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
  }

  const { error: updErr } = await supabase
    .from("negocios")
    .update({
      facebook,
      instagram,
    })
    .eq("id", negocioId)
    .eq("owner_id", user.id);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
