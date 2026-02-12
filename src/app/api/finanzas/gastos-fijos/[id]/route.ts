import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function safeNumber(x: any) {
  const v = Number(x);
  return Number.isFinite(v) ? v : 0;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

  const id = String(params?.id || "").trim();
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  const body = await req.json().catch(() => ({}));

  const patch: any = {};
  if (body?.nombre != null) patch.nombre = String(body.nombre || "").trim();
  if (body?.categoria != null) patch.categoria = String(body.categoria || "otros").trim();
  if (body?.monto_mensual != null) patch.monto_mensual = safeNumber(body.monto_mensual);
  if (body?.dia_vencimiento != null)
    patch.dia_vencimiento = Math.max(1, Math.min(31, Math.floor(safeNumber(body.dia_vencimiento))));

  if (body?.activo != null) patch.activo = Boolean(body.activo);

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("gastos_fijos")
    .update(patch)
    .eq("id", id)
    .eq("negocio_id", negocio.id)
    .select("id, nombre, categoria, monto_mensual, dia_vencimiento, activo")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, item: data });
}
