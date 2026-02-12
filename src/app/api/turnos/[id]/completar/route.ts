import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Params = Promise<{ id: string }>;

function formatARDateTime(fecha?: string | null, hora?: string | null) {
  // fecha puede venir "2026-02-06" o ISO. Lo dejamos robusto.
  try {
    if (!fecha) return "";
    const d = new Date(fecha);
    const dateStr = d.toLocaleDateString("es-AR");
    return hora ? `${dateStr} ${hora}` : dateStr;
  } catch {
    return hora ? `${fecha} ${hora}` : `${fecha ?? ""}`;
  }
}

export async function POST(req: Request, { params }: { params: Params }) {
  const { id: turnoId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1) Negocio
  const { data: negocio } = await supabase
    .from("negocios")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!negocio) {
    return NextResponse.json({ error: "Negocio not found" }, { status: 404 });
  }

  // 2) Traer info del turno (para el motivo)
  // Ajustá los campos si en tu DB se llaman distinto:
  // - fecha
  // - hora_inicio
  // - profesional_id
  const { data: turnoInfo } = await supabase
    .from("turnos")
    .select(
      `
      id,
      negocio_id,
      servicio_id,
      fecha,
      hora_inicio,
      profesionales:profesional_id (
        nombre
      )
    `
    )
    .eq("id", turnoId)
    .eq("negocio_id", negocio.id)
    .single();

  if (!turnoInfo) {
    return NextResponse.json({ error: "Turno not found" }, { status: 404 });
  }

  const profesional = Array.isArray((turnoInfo as any).profesionales)
  ? (turnoInfo as any).profesionales[0]
  : (turnoInfo as any).profesionales;

  const barberoNombre = profesional?.nombre || "Profesional";

  const fechaHora = formatARDateTime(turnoInfo.fecha, turnoInfo.hora_inicio);

  // 3) Completar turno
  const { data: turno } = await supabase
    .from("turnos")
    .update({ estado: "completado" })
    .eq("id", turnoId)
    .eq("negocio_id", negocio.id)
    .select("id, servicio_id")
    .single();

  if (!turno) {
    return NextResponse.json({ error: "Turno not found" }, { status: 404 });
  }

  // 4) Productos del servicio
  const { data: productosServicio } = await supabase
    .from("servicio_productos")
    .select("producto_id, cantidad_por_uso")
    .eq("servicio_id", turno.servicio_id)
    .eq("negocio_id", negocio.id);

  if (!productosServicio || productosServicio.length === 0) {
    return NextResponse.json({
      ok: true,
      message: "Turno completado (sin productos configurados)",
    });
  }

  const motivoMovimiento = `Uso automático - ${barberoNombre}${fechaHora ? ` • ${fechaHora}` : ""}`;

  const descontados: any[] = [];

  // 5) Descuento + movimientos
  for (const item of productosServicio) {
    const { data: producto } = await supabase
      .from("productos")
      .select("id, nombre, cantidad, precio_unitario")
      .eq("id", item.producto_id)
      .single();

    if (!producto) continue;

    const stockAnterior = Number(producto.cantidad);
    const usar = Number(item.cantidad_por_uso);

    if (stockAnterior < usar) continue;

    const stockNuevo = stockAnterior - usar;

    await supabase
      .from("productos")
      .update({ cantidad: stockNuevo })
      .eq("id", producto.id);

    await supabase.from("movimientos_inventario").insert({
      negocio_id: negocio.id,
      producto_id: producto.id,
      turno_id: turnoId,
      tipo: "salida",
      cantidad: usar,
      cantidad_anterior: stockAnterior,
      cantidad_nueva: stockNuevo,
      precio_unitario: producto.precio_unitario ?? null,
      motivo: motivoMovimiento,
    });

    descontados.push({
      producto_id: producto.id,
      nombre: producto.nombre,
      cantidad: usar,
    });
  }

  return NextResponse.json({ ok: true, descontados });
}
