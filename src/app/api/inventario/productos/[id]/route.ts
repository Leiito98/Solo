import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ✅ AGREGAMOS LA FUNCIÓN HELPER
function safeNumber(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function isConsumible(unidad: string) {
  const u = String(unidad ?? '').trim().toLowerCase();
  return u === 'ml' || u === 'g';
}

async function getNegocioIdOrThrow(supabase: any) {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return { user: null, negocioId: null, res: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  }

  const { data: negocio, error: negocioErr } = await supabase
    .from("negocios")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (negocioErr || !negocio) {
    return { user, negocioId: null, res: NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 }) };
  }

  return { user, negocioId: negocio.id, res: null };
}

// GET - Obtener producto por ID
export async function GET(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const supabase = await createClient();
    const auth = await getNegocioIdOrThrow(supabase);
    if (auth.res) return auth.res;

    const { data: producto, error } = await supabase
      .from("productos")
      .select("*")
      .eq("id", id)
      .eq("negocio_id", auth.negocioId)
      .single();

    if (error || !producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ producto });
  } catch (e) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// PUT - Actualizar producto
export async function PUT(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const supabase = await createClient();
    const admin = createAdminClient();

    const auth = await getNegocioIdOrThrow(supabase);
    if (auth.res) return auth.res;

    const body = await req.json().catch(() => ({}));
    const { nombre, unidad, precio_unitario, alerta_stock_minimo, contenido_por_unidad } = body;

    // Validación mínima
    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
    }

    // ✅ CORRECCIÓN: Usar la misma lógica que al crear
    const consumible = isConsumible(unidad);
    const contenido_por_unidad_final = consumible ? safeNumber(contenido_por_unidad) : null;

    // ✅ Validación adicional: si es ml/g, debe tener contenido_por_unidad > 0
    if (consumible && (!contenido_por_unidad_final || contenido_por_unidad_final <= 0)) {
      return NextResponse.json(
        { error: "contenido_por_unidad es requerido y debe ser > 0 para unidad ml/g" },
        { status: 400 }
      );
    }

    const { data: producto, error } = await admin
      .from("productos")
      .update({
        nombre,
        unidad: unidad ?? null,
        precio_unitario: precio_unitario ?? null,
        alerta_stock_minimo: alerta_stock_minimo ?? null,
        contenido_por_unidad: contenido_por_unidad_final, // ✅ AHORA GUARDA CORRECTAMENTE
      })
      .eq("id", id)
      .eq("negocio_id", auth.negocioId)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ producto });
  } catch (e) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// DELETE - Eliminar producto
export async function DELETE(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const supabase = await createClient();
    const admin = createAdminClient();

    const auth = await getNegocioIdOrThrow(supabase);
    if (auth.res) return auth.res;

    // ✅ Bloquear si está asociado a servicios (evita romper configuraciones)
    const { count, error: countErr } = await supabase
      .from("servicio_productos")
      .select("id", { count: "exact", head: true })
      .eq("negocio_id", auth.negocioId)
      .eq("producto_id", id);

    if (!countErr && (count ?? 0) > 0) {
      return NextResponse.json(
        { error: "Este producto está asociado a uno o más servicios. Quitalo del servicio primero." },
        { status: 409 }
      );
    }

    const { error } = await admin
      .from("productos")
      .delete()
      .eq("id", id)
      .eq("negocio_id", auth.negocioId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}