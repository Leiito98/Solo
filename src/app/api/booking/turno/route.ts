import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const {
    negocio_id,
    profesional_id,
    servicio_id,
    fecha,        // "YYYY-MM-DD"
    hora_inicio,  // "HH:MM:SS" (o "HH:MM")
    hora_fin,
    cliente: { nombre, email, telefono } = {},
    notas,
  } = body;

  if (!negocio_id || !servicio_id || !fecha || !hora_inicio || !hora_fin || !nombre) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = await createClient();

  // 1) negocio existe
  const { data: negocio } = await supabase.from("negocios").select("id").eq("id", negocio_id).single();
  if (!negocio) return NextResponse.json({ error: "Negocio not found" }, { status: 404 });

  // 2) servicio pertenece al negocio
  const { data: servicio } = await supabase
    .from("servicios")
    .select("id,negocio_id")
    .eq("id", servicio_id)
    .single();

  if (!servicio || servicio.negocio_id !== negocio_id) {
    return NextResponse.json({ error: "Servicio inválido" }, { status: 400 });
  }

  // 3) evitar solapamiento (mismo profesional + fecha, horarios que se pisan)
  if (profesional_id) {
    const { data: overlaps } = await supabase
      .from("turnos")
      .select("id")
      .eq("negocio_id", negocio_id)
      .eq("profesional_id", profesional_id)
      .eq("fecha", fecha)
      .in("estado", ["pendiente", "confirmado"]) // no cuenta cancelado/completado
      .or(`and(hora_inicio.lt.${hora_fin},hora_fin.gt.${hora_inicio})`);

    if ((overlaps ?? []).length > 0) {
      return NextResponse.json({ error: "Horario no disponible" }, { status: 409 });
    }
  }

  // 4) crear cliente (siempre nuevo por simplicidad; luego optimizás por email/telefono)
  const { data: clienteRow, error: cErr } = await supabase
    .from("clientes")
    .insert({
      negocio_id,
      nombre,
      email: email || null,
      telefono: telefono || null,
    })
    .select("id")
    .single();

  if (cErr || !clienteRow) {
    return NextResponse.json({ error: "No se pudo crear cliente" }, { status: 500 });
  }

  // 5) crear turno
  const { data: turno, error: tErr } = await supabase
    .from("turnos")
    .insert({
      negocio_id,
      profesional_id: profesional_id || null,
      cliente_id: clienteRow.id,
      servicio_id,
      fecha,
      hora_inicio,
      hora_fin,
      estado: "pendiente",
      pago_estado: "pendiente",
      notas: notas || null,
    })
    .select("*")
    .single();

  if (tErr || !turno) {
    return NextResponse.json({ error: "No se pudo crear turno" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, turno });
}
