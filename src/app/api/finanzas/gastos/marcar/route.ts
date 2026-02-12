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
  const estado = String(body?.estado || "").trim(); // "pagado" | "pendiente"

  if (!pagoId) return NextResponse.json({ error: "pago_id requerido" }, { status: 400 });
  if (estado !== "pagado" && estado !== "pendiente") {
    return NextResponse.json({ error: "estado inválido (pagado|pendiente)" }, { status: 400 });
  }

  const patch =
    estado === "pagado"
      ? { estado: "pagado", fecha_pago: new Date().toISOString() }
      : { estado: "pendiente", fecha_pago: null };

  const { error } = await admin
    .from("pagos_gastos")
    .update(patch)
    .eq("id", pagoId)
    .eq("negocio_id", negocio.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
