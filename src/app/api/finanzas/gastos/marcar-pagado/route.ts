import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

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
  const pagoId = String(body?.pago_id || "").trim();
  if (!pagoId) return NextResponse.json({ error: "pago_id requerido" }, { status: 400 });

  const { data: row, error: rErr } = await admin
    .from("pagos_gastos")
    .select("id, estado")
    .eq("id", pagoId)
    .eq("negocio_id", negocio.id)
    .single();

  if (rErr || !row) return NextResponse.json({ error: rErr?.message || "Pago no encontrado" }, { status: 404 });

  if (row.estado === "pagado") return NextResponse.json({ ok: true, already: true });

  const { error } = await admin
    .from("pagos_gastos")
    .update({ estado: "pagado", fecha_pago: new Date().toISOString() })
    .eq("id", pagoId)
    .eq("negocio_id", negocio.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
