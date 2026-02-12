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

  const profesionalId = String(body?.profesional_id || "").trim();
  const periodo = String(body?.periodo || "").trim();

  if (!profesionalId) return NextResponse.json({ error: "profesional_id requerido" }, { status: 400 });
  if (!/^\d{4}-\d{2}$/.test(periodo)) return NextResponse.json({ error: "periodo inválido (YYYY-MM)" }, { status: 400 });

  const { startISO, endISO } = monthRange(periodo);

  // Paga solo pendientes del período (por fecha_generada)
  const { error } = await admin
    .from("comisiones")
    .update({ estado: "pagada", fecha_pago: new Date().toISOString() })
    .eq("negocio_id", negocio.id)
    .eq("profesional_id", profesionalId)
    .eq("estado", "pendiente")
    .gte("fecha_generada", startISO)
    .lt("fecha_generada", endISO);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
