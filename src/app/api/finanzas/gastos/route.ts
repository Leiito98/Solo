import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function monthRangeISO(periodoStr: string) {
  const [y, m] = periodoStr.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

function safeNumber(x: any) {
  const v = Number(x);
  return Number.isFinite(v) ? v : 0;
}

function clampDay(y: number, m: number, d: number) {
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Math.min(Math.max(d, 1), last);
}

export async function GET(req: Request) {
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

  const url = new URL(req.url);
  const periodo = url.searchParams.get("periodo") || new Date().toISOString().slice(0, 7);
  const estado = (url.searchParams.get("estado") || "pendiente").toLowerCase(); // pendiente|pagado|todos

  if (!/^\d{4}-\d{2}$/.test(periodo)) {
    return NextResponse.json({ error: "periodo inválido, formato YYYY-MM" }, { status: 400 });
  }

  const { startISO, endISO } = monthRangeISO(periodo);

  // ✅ sync pagos_gastos para el período
  const [yy, mm] = periodo.split("-").map(Number);

  const { data: gastosActivos } = await admin
    .from("gastos_fijos")
    .select("id, monto_mensual, dia_vencimiento")
    .eq("negocio_id", negocio.id)
    .eq("activo", true);

  if ((gastosActivos || []).length) {
    const rows = (gastosActivos || []).map((g: any) => {
      const day = clampDay(yy, mm, Number(g.dia_vencimiento || 10));
      const fecha_vencimiento = `${periodo}-${String(day).padStart(2, "0")}`;

      return {
        negocio_id: negocio.id,
        gasto_fijo_id: g.id,
        periodo,
        monto: safeNumber(g.monto_mensual),
        fecha_vencimiento,
        estado: "pendiente",
      };
    });

    await admin
      .from("pagos_gastos")
      .upsert(rows as any, { onConflict: "gasto_fijo_id,periodo", ignoreDuplicates: true });
  }

  let q = admin
    .from("pagos_gastos")
    .select(`
      id,
      periodo,
      monto,
      fecha_vencimiento,
      estado,
      fecha_pago,
      nota,
      gastos_fijos(id, nombre, categoria, dia_vencimiento, monto_mensual, activo)
    `)
    .eq("negocio_id", negocio.id)
    .eq("periodo", periodo)
    .order("fecha_vencimiento", { ascending: true });

  if (estado === "pendiente" || estado === "pagado") q = q.eq("estado", estado);

  const { data, error } = await q;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    periodo,
    rango: { startISO, endISO },
    items: data || [],
  });
}
