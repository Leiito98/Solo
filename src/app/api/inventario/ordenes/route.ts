import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

function safeNumber(v: any) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
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

function genNumeroOrden() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `OC-${y}${m}${day}-${rand}`
}

// GET /api/inventario/ordenes
export async function GET() {
  try {
    const { negocioId } = await getNegocio()
    if (!negocioId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabase = await createClient()
    const { data: ordenes, error } = await supabase
      .from('ordenes_compra')
      .select(`
        *,
        proveedores(nombre)
      `)
      .eq('negocio_id', negocioId)
      .order('fecha_orden', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ordenes: ordenes || [] })
  } catch (e) {
    console.error('GET ordenes error', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST /api/inventario/ordenes
// body: { proveedor_id, fecha_entrega_estimada?, notas?, items: [{producto_id, cantidad, precio_unitario}] }
export async function POST(req: Request) {
  try {
    const { user, negocioId } = await getNegocio()
    if (!user || !negocioId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const admin = createAdminClient()
    const body = await req.json().catch(() => ({}))

    const proveedor_id = String(body?.proveedor_id || '')
    const fecha_entrega_estimada = body?.fecha_entrega_estimada ? String(body.fecha_entrega_estimada) : null
    const notas = String(body?.notas || '').trim() || null
    const items = Array.isArray(body?.items) ? body.items : []

    if (!proveedor_id) {
      return NextResponse.json({ error: 'proveedor_id es requerido' }, { status: 400 })
    }
    if (items.length === 0) {
      return NextResponse.json({ error: 'Agregá al menos 1 item' }, { status: 400 })
    }

    const normalizedItems = items
      .map((it: any) => {
        const producto_id = String(it?.producto_id || '')
        const cantidad = safeNumber(it?.cantidad)
        const precio_unitario = safeNumber(it?.precio_unitario)
        return {
          producto_id,
          cantidad,
          precio_unitario,
          subtotal: cantidad * precio_unitario,
        }
      })
      .filter((it: any) => it.producto_id && it.cantidad > 0)

    if (normalizedItems.length === 0) {
      return NextResponse.json({ error: 'Items inválidos' }, { status: 400 })
    }

    const total = normalizedItems.reduce((sum: number, it: any) => sum + safeNumber(it.subtotal), 0)

    // 1) crear orden
    const { data: orden, error: ordenErr } = await admin
      .from('ordenes_compra')
      .insert({
        negocio_id: negocioId,
        proveedor_id,
        numero_orden: genNumeroOrden(),
        fecha_entrega_estimada,
        estado: 'pendiente',
        total,
        notas,
      })
      .select()
      .single()

    if (ordenErr || !orden) {
      return NextResponse.json({ error: ordenErr?.message || 'No se pudo crear la orden' }, { status: 500 })
    }

    // 2) crear items
    const toInsert = normalizedItems.map((it: any) => ({
      orden_compra_id: orden.id,
      producto_id: it.producto_id,
      cantidad: it.cantidad,
      precio_unitario: it.precio_unitario,
      subtotal: it.subtotal,
    }))

    const { error: itemsErr } = await admin
      .from('items_orden_compra')
      .insert(toInsert)

    if (itemsErr) {
      // rollback best-effort
      await admin.from('ordenes_compra').delete().eq('id', orden.id)
      return NextResponse.json({ error: itemsErr.message }, { status: 500 })
    }

    return NextResponse.json({ orden })
  } catch (e) {
    console.error('POST ordenes error', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
