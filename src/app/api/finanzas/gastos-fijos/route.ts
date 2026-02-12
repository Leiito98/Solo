import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function safeNumber(x: any) {
  const v = Number(x);
  return Number.isFinite(v) ? v : 0;
}

export async function GET() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: negocio } = await supabase
    .from("negocios")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!negocio) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { data, error } = await admin
    .from("gastos_fijos")
    .select("id, nombre, categoria, monto_mensual, dia_vencimiento, activo")
    .eq("negocio_id", negocio.id)
    .order("activo", { ascending: false })
    .order("nombre", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ items: data || [] });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: negocio } = await supabase
    .from("negocios")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!negocio) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const nombre = String(body?.nombre || "").trim();
  const categoria = String(body?.categoria || "otros").trim();
  const monto_mensual = safeNumber(body?.monto_mensual);
  const dia_vencimiento = Math.max(1, Math.min(31, Math.floor(safeNumber(body?.dia_vencimiento || 10))));

  if (!nombre) return NextResponse.json({ error: "nombre requerido" }, { status: 400 });

  const { data, error } = await admin
    .from("gastos_fijos")
    .insert({
      negocio_id: negocio.id,
      nombre,
      categoria,
      monto_mensual,
      dia_vencimiento,
      activo: true,
    })
    .select("id, nombre, categoria, monto_mensual, dia_vencimiento, activo")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, item: data });
}
