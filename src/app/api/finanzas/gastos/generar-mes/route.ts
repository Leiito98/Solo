import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function clampDay(y: number, m: number, d: number) {
  // m 1-12, devuelve date válida dentro del mes
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate(); // último día del mes
  return Math.min(Math.max(d, 1), last);
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
  const periodo = String(body?.periodo || new Date().toISOString().slice(0, 7));

  if (!/^\d{4}-\d{2}$/.test(periodo)) {
    return NextResponse.json({ error: "periodo inválido (YYYY-MM)" }, { status: 400 });
  }

  const [y, m] = periodo.split("-").map(Number);

  const { data: gastos, error: gErr } = await admin
    .from("gastos_fijos")
    .select("id, nombre, monto_mensual, dia_vencimiento, activo")
    .eq("negocio_id", negocio.id)
    .eq("activo", true);

  if (gErr) return NextResponse.json({ error: gErr.message }, { status: 500 });

  const rows = (gastos || []).map((g: any) => {
    const day = clampDay(y, m, Number(g.dia_vencimiento || 10));
    const fecha_vencimiento = `${periodo}-${String(day).padStart(2, "0")}`;

    return {
      negocio_id: negocio.id,
      gasto_fijo_id: g.id,
      periodo,
      monto: Number(g.monto_mensual || 0),
      fecha_vencimiento,
      estado: "pendiente",
    };
  });

  if (rows.length === 0) return NextResponse.json({ ok: true, inserted: 0 });

  const { error: upErr } = await admin
    .from("pagos_gastos")
    .upsert(rows as any, { onConflict: "gasto_fijo_id,periodo", ignoreDuplicates: true });

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, inserted: rows.length });
}
