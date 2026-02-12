import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function monthRange(periodo: string) {
  const [y, m] = periodo.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

function safeNumber(x: any) {
  const v = Number(x);
  return Number.isFinite(v) ? v : 0;
}

function firstOrSelf<T>(x: any): T | null {
  if (!x) return null;
  return Array.isArray(x) ? (x[0] ?? null) : x;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: negocio } = await supabase
    .from("negocios")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!negocio) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  // ✅ body robusto
  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  // ✅ si no viene periodo, usamos el mes actual (YYYY-MM)
  const periodo =
    String(body?.periodo || "").trim() || new Date().toISOString().slice(0, 7);

  if (!/^\d{4}-\d{2}$/.test(periodo)) {
    return NextResponse.json(
      { error: "periodo inválido (YYYY-MM)", got: body },
      { status: 400 }
    );
  }

  const { startISO, endISO } = monthRange(periodo);

  // ✅ Traemos turnos comisionables del mes (por fecha del turno)
  const { data: turnos, error: tErr } = await admin
    .from("turnos")
    .select(
      `
      id,
      negocio_id,
      profesional_id,
      servicio_id,
      estado,
      pago_estado,
      pago_monto,
      fecha,
      servicios(precio),
      profesionales(comision_pct)
    `
    )
    .eq("negocio_id", negocio.id)
    .eq("estado", "completado")
    .eq("pago_estado", "pagado")
    .not("profesional_id", "is", null)
    .gte("fecha", startISO.slice(0, 10))
    .lt("fecha", endISO.slice(0, 10));

  if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 });

  let updated = 0;
  let skipped_paid = 0;
  const errors: { turno_id: string; error: string }[] = [];

  for (const turno of turnos || []) {
    try {
      const servicioRow = firstOrSelf<{ precio?: any }>((turno as any).servicios);
      const profRow = firstOrSelf<{ comision_pct?: any }>((turno as any).profesionales);

      const pagoMonto = safeNumber((turno as any).pago_monto);
      const precioServicio = safeNumber(servicioRow?.precio);
      const montoServicio = Math.max(pagoMonto, precioServicio);

      // fallback global
      let porcentaje = safeNumber(profRow?.comision_pct);
      if (!Number.isFinite(porcentaje)) porcentaje = 40;

      // override por servicio
      if ((turno as any).servicio_id) {
        const { data: ov, error: ovErr } = await admin
          .from("profesional_servicio_comisiones")
          .select("porcentaje")
          .eq("negocio_id", negocio.id)
          .eq("profesional_id", (turno as any).profesional_id)
          .eq("servicio_id", (turno as any).servicio_id)
          .maybeSingle();

        if (!ovErr && ov?.porcentaje !== null && ov?.porcentaje !== undefined) {
          const v = safeNumber(ov.porcentaje);
          if (Number.isFinite(v) && v >= 0 && v <= 100) porcentaje = v;
        }
      }

      const montoComision = (montoServicio * porcentaje) / 100;

      // ✅ si ya estaba pagada, no la pisamos (evita tocar histórico)
      const { data: existing, error: exErr } = await admin
        .from("comisiones")
        .select("id, estado")
        .eq("negocio_id", negocio.id)
        .eq("turno_id", (turno as any).id)
        .eq("profesional_id", (turno as any).profesional_id)
        .maybeSingle();

      if (!exErr && existing?.estado === "pagada") {
        skipped_paid += 1;
        continue;
      }

      const row = {
        negocio_id: negocio.id,
        turno_id: (turno as any).id,
        profesional_id: (turno as any).profesional_id,
        monto_servicio: montoServicio,
        porcentaje,
        monto_comision: montoComision,
        estado: "pendiente" as const,
      };

      const { error: upErr } = await admin
        .from("comisiones")
        .upsert(row as any, { onConflict: "turno_id,profesional_id" });

      if (upErr) throw upErr;
      updated += 1;
    } catch (e: any) {
      errors.push({
        turno_id: String((turno as any)?.id || ""),
        error: e?.message || "Error",
      });
    }
  }

  return NextResponse.json({ ok: true, periodo, updated, skipped_paid, errors });
}