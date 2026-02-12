import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const runtime = "nodejs";

const TZ = "America/Argentina/Buenos_Aires";

function getPeriodoAR(periodo?: string | null) {
  const nowAR = toZonedTime(new Date(), TZ);

  if (periodo && /^\d{4}-\d{2}$/.test(periodo)) {
    const [y, m] = periodo.split("-").map(Number);
    const d = new Date(Date.UTC(y, m - 1, 1, 12, 0, 0));
    return toZonedTime(d, TZ);
  }
  return nowAR;
}

function arsNumber(n: any) {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

function firstOrSelf<T>(x: any): T | null {
  if (!x) return null;
  return Array.isArray(x) ? (x[0] ?? null) : x;
}

function monthRangeISO(periodoStr: string) {
  const [y, m] = periodoStr.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

function clampDay(y: number, m: number, d: number) {
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Math.min(Math.max(d, 1), last);
}

// ✅ Nueva función para calcular datos de un periodo
async function calcularDatosPeriodo(admin: any, negocioId: string, periodoStr: string) {
  const base = getPeriodoAR(periodoStr);
  const inicioMesStr = format(startOfMonth(base), "yyyy-MM-dd");
  const finMesStr = format(endOfMonth(base), "yyyy-MM-dd");
  const { startISO, endISO } = monthRangeISO(periodoStr);

  // INGRESOS
  const { data: turnosMes } = await admin
    .from("turnos")
    .select(`
      id,
      profesional_id,
      estado,
      pago_estado,
      pago_monto,
      fecha,
      servicios(precio),
      profesionales(comision_pct)
    `)
    .eq("negocio_id", negocioId)
    .in("estado", ["completado", "confirmado"])
    .gte("fecha", inicioMesStr)
    .lte("fecha", finMesStr);

  const ingresos = (turnosMes || []).reduce((sum: number, t: any) => {
    const pagoMonto = arsNumber(t.pago_monto);
    const servicioRow = firstOrSelf<{ precio?: any }>(t.servicios);
    const precioServicio = arsNumber(servicioRow?.precio);

    const esSeña = t.estado === "confirmado" && t.pago_estado === "parcial";
    const esTotal = t.estado === "completado" && t.pago_estado === "pagado";

    if (esSeña) return sum + pagoMonto;
    if (esTotal) return sum + Math.max(pagoMonto, precioServicio);
    return sum;
  }, 0);

  // COMISIONES PAGADAS
  const { data: comPag } = await admin
    .from("comisiones")
    .select("monto_comision")
    .eq("negocio_id", negocioId)
    .eq("estado", "pagada")
    .gte("fecha_pago", startISO)
    .lt("fecha_pago", endISO);

  const comisionesPagadas = (comPag || []).reduce((s: number, r: any) => s + arsNumber(r.monto_comision), 0);

  // GASTOS PAGADOS
  const { data: pagosGastos } = await admin
    .from("pagos_gastos")
    .select("monto, estado")
    .eq("negocio_id", negocioId)
    .eq("periodo", periodoStr);

  const gastosPagados = (pagosGastos || [])
    .filter((g: any) => g.estado === "pagado")
    .reduce((s: number, g: any) => s + arsNumber(g.monto), 0);

  const egresos = comisionesPagadas + gastosPagados;
  const balance = ingresos - egresos;

  return {
    periodo: periodoStr,
    ingresos,
    egresos,
    comisiones: comisionesPagadas,
    gastos: gastosPagados,
    balance,
  };
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: negocio, error: negErr } = await supabase
    .from("negocios")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (negErr || !negocio) {
    return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
  }

  const url = new URL(req.url);
  const periodo = url.searchParams.get("periodo");
  const base = getPeriodoAR(periodo);

  const inicioMesStr = format(startOfMonth(base), "yyyy-MM-dd");
  const finMesStr = format(endOfMonth(base), "yyyy-MM-dd");
  const periodoStr = format(startOfMonth(base), "yyyy-MM");

  const { startISO, endISO } = monthRangeISO(periodoStr);

  // =========================
  // INGRESOS
  // =========================
  const { data: turnosMes, error: turnErr } = await admin
    .from("turnos")
    .select(`
      id,
      profesional_id,
      estado,
      pago_estado,
      pago_monto,
      fecha,
      servicios(precio),
      profesionales(comision_pct)
    `)
    .eq("negocio_id", negocio.id)
    .in("estado", ["completado", "confirmado"])
    .gte("fecha", inicioMesStr)
    .lte("fecha", finMesStr);

  if (turnErr) return NextResponse.json({ error: turnErr.message }, { status: 500 });

  const ingresos = (turnosMes || []).reduce((sum: number, t: any) => {
    const pagoMonto = arsNumber(t.pago_monto);
    const servicioRow = firstOrSelf<{ precio?: any }>(t.servicios);
    const precioServicio = arsNumber(servicioRow?.precio);

    const esSeña = t.estado === "confirmado" && t.pago_estado === "parcial";
    const esTotal = t.estado === "completado" && t.pago_estado === "pagado";

    if (esSeña) return sum + pagoMonto;
    if (esTotal) return sum + Math.max(pagoMonto, precioServicio);
    return sum;
  }, 0);

  // =====================================
  // SYNC COMISIONES (MVP)
  // =====================================
  const turnosComisionables = (turnosMes || []).filter((t: any) => {
    return t.estado === "completado" && t.pago_estado === "pagado" && t.profesional_id;
  });

  if (turnosComisionables.length) {
    const rows = turnosComisionables.map((t: any) => {
      const pagoMonto = arsNumber(t.pago_monto);

      const servicioRow = firstOrSelf<{ precio?: any }>(t.servicios);
      const precioServicio = arsNumber(servicioRow?.precio);

      const montoServicio = Math.max(pagoMonto, precioServicio);

      const profRow = firstOrSelf<{ comision_pct?: any }>(t.profesionales);
      const pct = arsNumber(profRow?.comision_pct);
      const porcentaje = Number.isFinite(pct) ? pct : 40;

      const montoComision = (montoServicio * porcentaje) / 100;

      return {
        negocio_id: negocio.id,
        turno_id: t.id,
        profesional_id: t.profesional_id,
        monto_servicio: montoServicio,
        porcentaje,
        monto_comision: montoComision,
        estado: "pendiente",
      };
    });

    await admin
      .from("comisiones")
      .upsert(rows as any, { onConflict: "turno_id,profesional_id", ignoreDuplicates: true });
  }

  // =========================
  // COMISIONES (totales)
  // =========================
  const { data: comPend } = await admin
    .from("comisiones")
    .select("monto_comision")
    .eq("negocio_id", negocio.id)
    .eq("estado", "pendiente")
    .gte("fecha_generada", startISO)
    .lt("fecha_generada", endISO);

  const comisionesPendientes = (comPend || []).reduce((s: number, r: any) => s + arsNumber(r.monto_comision), 0);

  const { data: comPag } = await admin
    .from("comisiones")
    .select("monto_comision, fecha_pago")
    .eq("negocio_id", negocio.id)
    .eq("estado", "pagada")
    .gte("fecha_pago", startISO)
    .lt("fecha_pago", endISO);

  const comisionesPagadas = (comPag || []).reduce((s: number, r: any) => s + arsNumber(r.monto_comision), 0);

  // =====================================
  // ✅ SYNC PAGOS_GASTOS DEL MES (MVP)
  // =====================================
  const [yy, mm] = periodoStr.split("-").map(Number);

  const { data: gastosActivos } = await admin
    .from("gastos_fijos")
    .select("id, monto_mensual, dia_vencimiento")
    .eq("negocio_id", negocio.id)
    .eq("activo", true);

  if ((gastosActivos || []).length) {
    const rows = (gastosActivos || []).map((g: any) => {
      const day = clampDay(yy, mm, Number(g.dia_vencimiento || 10));
      const fecha_vencimiento = `${periodoStr}-${String(day).padStart(2, "0")}`;

      return {
        negocio_id: negocio.id,
        gasto_fijo_id: g.id,
        periodo: periodoStr,
        monto: arsNumber(g.monto_mensual),
        fecha_vencimiento,
        estado: "pendiente",
      };
    });

    await admin
      .from("pagos_gastos")
      .upsert(rows as any, { onConflict: "gasto_fijo_id,periodo", ignoreDuplicates: true });
  }

  // =========================
  // GASTOS (por período)
  // =========================
  const { data: pagosGastos } = await admin
    .from("pagos_gastos")
    .select("monto, estado, fecha_vencimiento, gastos_fijos(categoria)")
    .eq("negocio_id", negocio.id)
    .eq("periodo", periodoStr);

  const gastosPagados = (pagosGastos || [])
    .filter((g: any) => g.estado === "pagado")
    .reduce((s: number, g: any) => s + arsNumber(g.monto), 0);

  const gastosPendientes = (pagosGastos || [])
    .filter((g: any) => g.estado === "pendiente")
    .reduce((s: number, g: any) => s + arsNumber(g.monto), 0);

  const hoyAR = format(toZonedTime(new Date(), TZ), "yyyy-MM-dd");
  const gastosVencidosCount = (pagosGastos || []).filter((g: any) => {
    return g.estado !== "pagado" && String(g.fecha_vencimiento) < hoyAR;
  }).length;

  // ✅ DISTRIBUCIÓN DE GASTOS POR CATEGORÍA
  const gastosPorCategoria: Record<string, number> = {};
  (pagosGastos || [])
    .filter((g: any) => g.estado === "pagado")
    .forEach((g: any) => {
      const cat = firstOrSelf<{ categoria?: string }>(g.gastos_fijos)?.categoria || "otros";
      gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + arsNumber(g.monto);
    });

  const egresos = comisionesPagadas + gastosPagados;
  const balance = ingresos - egresos;

  // ✅ DATOS HISTÓRICOS (últimos 6 meses)
  const historico = [];
  for (let i = 5; i >= 0; i--) {
    const mesBase = subMonths(base, i);
    const mesStr = format(startOfMonth(mesBase), "yyyy-MM");
    const datos = await calcularDatosPeriodo(admin, negocio.id, mesStr);
    historico.push(datos);
  }

  // ✅ COMPARATIVA CON MES ANTERIOR
  const mesAnteriorBase = subMonths(base, 1);
  const mesAnteriorStr = format(startOfMonth(mesAnteriorBase), "yyyy-MM");
  const mesAnterior = await calcularDatosPeriodo(admin, negocio.id, mesAnteriorStr);

  const cambioIngresos = mesAnterior.ingresos > 0
    ? ((ingresos - mesAnterior.ingresos) / mesAnterior.ingresos) * 100
    : 0;

  const cambioEgresos = mesAnterior.egresos > 0
    ? ((egresos - mesAnterior.egresos) / mesAnterior.egresos) * 100
    : 0;

  const cambioBalance = mesAnterior.balance !== 0
    ? ((balance - mesAnterior.balance) / Math.abs(mesAnterior.balance)) * 100
    : 0;

  return NextResponse.json({
    periodo: periodoStr,
    rango: { inicio: inicioMesStr, fin: finMesStr },
    ingresos,
    egresos,
    balance,
    desglose: {
      comisiones: comisionesPagadas,
      gastos: gastosPagados,
    },
    acciones: {
      comisiones_pendientes: comisionesPendientes,
      gastos_pendientes: gastosPendientes,
      gastos_vencidos_count: gastosVencidosCount,
    },
    comparativa: {
      mes_anterior: mesAnteriorStr,
      cambio_ingresos: Math.round(cambioIngresos * 10) / 10,
      cambio_egresos: Math.round(cambioEgresos * 10) / 10,
      cambio_balance: Math.round(cambioBalance * 10) / 10,
      datos_anterior: mesAnterior,
    },
    gastos_por_categoria: gastosPorCategoria,
    historico,
  });
}