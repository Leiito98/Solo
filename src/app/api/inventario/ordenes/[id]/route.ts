import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

function safeNumber(v: any) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

type RouteContext = {
  params: Promise<{ id: string }>
}

async function getNegocio() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, negocioId: null }

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  return { user, negocioId: negocio?.id ?? null }
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const { negocioId } = await getNegocio()
    if (!negocioId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabase = await createClient()
    const { data: orden, error } = await supabase
      .from('ordenes_compra')
      .select(`
        *,
        proveedores(nombre, email, telefono),
        items_orden_compra(
          *,
          productos(nombre, unidad)
        )
      `)
      .eq('id', id)
      .eq('negocio_id', negocioId)
      .single()

    if (error || !orden) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ orden })
  } catch (e) {
    console.error('GET orden error', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// PUT /api/inventario/ordenes/:id
// body: { estado: 'pendiente'|'confirmada'|'recibida'|'cancelada' }
// Si pasa a 'recibida' por primera vez, suma stock de cada item y registra movimientos.
export async function PUT(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const { user, negocioId } = await getNegocio()
    if (!user || !negocioId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const estado = String(body?.estado || '')
    if (!['pendiente', 'confirmada', 'recibida', 'cancelada'].includes(estado)) {
      return NextResponse.json({ error: 'estado inválido' }, { status: 400 })
    }

    const admin = createAdminClient()

    // 1) leer orden + items
    const { data: orden, error: ordenErr } = await admin
      .from('ordenes_compra')
      .select('*')
      .eq('id', id)
      .eq('negocio_id', negocioId)
      .single()

    if (ordenErr || !orden) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    const prevEstado = String(orden.estado)

    // 2) actualizar estado
    const { data: updated, error: updErr } = await admin
      .from('ordenes_compra')
      .update({ estado, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('negocio_id', negocioId)
      .select()
      .single()

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 })
    }

    // 3) si pasa a recibida (y antes no lo era) => sumar stock + registrar movimientos
    if (estado === 'recibida' && prevEstado !== 'recibida') {
      const { data: items, error: itemsErr } = await admin
        .from('items_orden_compra')
        .select('producto_id, cantidad, precio_unitario')
        .eq('orden_compra_id', id)

      if (itemsErr) {
        return NextResponse.json({ error: itemsErr.message }, { status: 500 })
      }

      for (const it of items || []) {
        const producto_id = String(it.producto_id)
        const cantidad = safeNumber(it.cantidad)
        if (!(cantidad > 0)) continue

        const { data: prod } = await admin
          .from('productos')
          .select('id, cantidad')
          .eq('id', producto_id)
          .eq('negocio_id', negocioId)
          .single()

        const anterior = safeNumber(prod?.cantidad)
        const nueva = anterior + cantidad

        await admin
          .from('productos')
          .update({ cantidad: nueva })
          .eq('id', producto_id)
          .eq('negocio_id', negocioId)

        await admin
          .from('movimientos_inventario')
          .insert({
            negocio_id: negocioId,
            producto_id,
            tipo: 'entrada',
            cantidad,
            cantidad_anterior: anterior,
            cantidad_nueva: nueva,
            motivo: `Ingreso por orden ${orden.numero_orden || id}`,
            proveedor_id: orden.proveedor_id,
            precio_unitario: safeNumber(it.precio_unitario),
            usuario: user.email,
          })
      }
    }

    return NextResponse.json({ orden: updated })
  } catch (e) {
    console.error('PUT orden error', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
