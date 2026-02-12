import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function monthRange(periodo: string) {
  // periodo "YYYY-MM"
  const [y, m] = periodo.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0)); // mes siguiente
  return { startISO: start.toISOString(), endISO: end.toISOString() };
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
  const estado = url.searchParams.get("estado"); // pendiente|pagada|adelantada
  const periodo = url.searchParams.get("periodo") || new Date().toISOString().slice(0, 7);

  if (!/^\d{4}-\d{2}$/.test(periodo)) {
    return NextResponse.json({ error: "periodo inválido, formato YYYY-MM" }, { status: 400 });
  }

  const { startISO, endISO } = monthRange(periodo);

  let q = admin
    .from("comisiones")
    .select(`
      id,
      turno_id,
      profesional_id,
      monto_servicio,
      porcentaje,
      monto_comision,
      estado,
      fecha_generada,
      fecha_pago,
      profesionales(nombre),
      turnos!comisiones_turno_id_fkey(fecha, hora_inicio, hora_fin)
    `)
    .eq("negocio_id", negocio.id);

  if (estado) q = q.eq("estado", estado);

  // ✅ rango seguro
  q = q.gte("fecha_generada", startISO).lt("fecha_generada", endISO);

  const { data, error } = await q.order("fecha_generada", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ periodo, items: data || [] });
}
