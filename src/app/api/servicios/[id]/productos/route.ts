import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Params = Promise<{ id: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  const { id: servicioId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // negocio del owner
  const { data: negocio } = await supabase
    .from("negocios")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!negocio) return NextResponse.json({ error: "Negocio not found" }, { status: 404 });

  // validar servicio pertenece al negocio + traer nombre
  const { data: servicio, error: servicioErr } = await supabase
    .from("servicios")
    .select("id, nombre")
    .eq("id", servicioId)
    .eq("negocio_id", negocio.id)
    .single();

  if (servicioErr || !servicio) {
    return NextResponse.json({ error: "Servicio not found" }, { status: 404 });
  }

  // ✅ CORRECCIÓN: Agregar contenido_por_unidad a la consulta
  const { data: productos, error: prodErr } = await supabase
    .from("productos")
    .select("id, nombre, unidad, cantidad, precio_unitario, contenido_por_unidad")
    .eq("negocio_id", negocio.id)
    .order("nombre");

  if (prodErr) return NextResponse.json({ error: prodErr.message }, { status: 500 });

  // productos asociados al servicio (con join a productos)
  const { data: asociados, error: asocErr } = await supabase
    .from("servicio_productos")
    .select(`
      id,
      producto_id,
      cantidad_por_uso,
      productos:productos (
        id,
        nombre,
        unidad,
        cantidad,
        precio_unitario,
        contenido_por_unidad
      )
    `)
    .eq("negocio_id", negocio.id)
    .eq("servicio_id", servicioId);

  if (asocErr) return NextResponse.json({ error: asocErr.message }, { status: 500 });

  return NextResponse.json({
    negocioId: negocio.id,
    servicio: { id: servicio.id, nombre: servicio.nombre },
    productos: productos || [],
    productosAsociados: asociados || [],
  });
}