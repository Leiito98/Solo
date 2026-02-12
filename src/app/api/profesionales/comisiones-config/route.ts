import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

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
  const profesional_id = url.searchParams.get("profesional_id");
  if (!profesional_id) return NextResponse.json({ error: "profesional_id requerido" }, { status: 400 });

  // servicios del negocio
  const { data: servicios, error: sErr } = await admin
    .from("servicios")
    .select("id,nombre,precio")
    .eq("negocio_id", negocio.id)
    .order("created_at", { ascending: true });

  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  // overrides del profesional
  const { data: overrides, error: oErr } = await admin
    .from("profesional_servicio_comisiones")
    .select("servicio_id,porcentaje")
    .eq("negocio_id", negocio.id)
    .eq("profesional_id", profesional_id);

  if (oErr) return NextResponse.json({ error: oErr.message }, { status: 500 });

  return NextResponse.json({
    servicios: servicios || [],
    overrides: overrides || [],
  });
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
  const profesional_id = String(body?.profesional_id || "").trim();
  const overrides = Array.isArray(body?.overrides) ? body.overrides : [];

  if (!profesional_id) return NextResponse.json({ error: "profesional_id requerido" }, { status: 400 });

  // borrar los null (sin override)
  const toDelete = overrides
    .filter((x: any) => x?.servicio_id && (x?.porcentaje === null || x?.porcentaje === "" || x?.porcentaje === undefined))
    .map((x: any) => x.servicio_id);

  if (toDelete.length) {
    const { error: delErr } = await admin
      .from("profesional_servicio_comisiones")
      .delete()
      .eq("negocio_id", negocio.id)
      .eq("profesional_id", profesional_id)
      .in("servicio_id", toDelete);

    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });
  }

  // upsert los definidos
  const toUpsert = overrides
    .filter((x: any) => x?.servicio_id && x?.porcentaje !== null && x?.porcentaje !== "" && x?.porcentaje !== undefined)
    .map((x: any) => ({
      negocio_id: negocio.id,
      profesional_id,
      servicio_id: x.servicio_id,
      porcentaje: Number(x.porcentaje),
    }));

  if (toUpsert.length) {
    const { error: upErr } = await admin
      .from("profesional_servicio_comisiones")
      .upsert(toUpsert as any, { onConflict: "profesional_id,servicio_id" });

    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
