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
  const ids: string[] = Array.isArray(body?.comision_ids) ? body.comision_ids : [];

  if (!ids.length) {
    return NextResponse.json({ error: "comision_ids requerido" }, { status: 400 });
  }

  const { error } = await admin
    .from("comisiones")
    .update({ estado: "pagada", fecha_pago: new Date().toISOString() })
    .eq("negocio_id", negocio.id)
    .in("id", ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, updated: ids.length });
}
