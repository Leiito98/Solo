import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const runtime = "nodejs";
const TZ = "America/Argentina/Buenos_Aires";

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
  const periodo = url.searchParams.get("periodo") || format(toZonedTime(new Date(), TZ), "yyyy-MM");

  const { data, error } = await admin
    .from("pagos_gastos")
    .select("*, gastos_fijos(nombre, categoria)")
    .eq("negocio_id", negocio.id)
    .eq("periodo", periodo)
    .order("fecha_vencimiento", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ periodo, items: data || [] });
}
