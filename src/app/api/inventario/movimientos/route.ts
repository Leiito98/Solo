import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

function safeNumber(v: any) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

async function getNegocioId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { supabase, user: null, negocioId: null }

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  return { supabase, user, negocioId: negocio?.id ?? null }
}

// GET /api/inventario/movimientos?producto_id=...&limit=...
export async function GET(req: Request) {
  try {
    const { negocioId } = await getNegocioId()

    if (!negocioId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const url = new URL(req.url)
    const productoId = url.searchParams.get('producto_id')
    const limit = Math.min(Math.max(safeNumber(url.searchParams.get('limit')) || 50, 1), 200)

    const supabase = await createClient()
    let q = supabase
      .from('movimientos_inventario')
      .select(`
        *,
        productos(nombre, unidad),
        proveedores(nombre)
      `)
      .eq('negocio_id', negocioId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (productoId) q = q.eq('producto_id', productoId)

    const { data: movimientos, error } = await q

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ movimientos: movimientos || [] })
  } catch (e) {
    console.error('GET movimientos error', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST /api/inventario/movimientos
// body: { producto_id, tipo: 'entrada'|'salida'|'ajuste', cantidad, motivo?, proveedor_id?, precio_unitario? }
export async function POST(req: Request) {
  try {
    const { supabase, user, negocioId } = await getNegocioId()

    if (!user || !negocioId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = createAdminClient()
    const body = await req.json().catch(() => ({}))
    const producto_id = String(body?.producto_id || '')
    const tipo = String(body?.tipo || '')
    const motivo = String(body?.motivo || '').trim() || null
    const proveedor_id = body?.proveedor_id ? String(body?.proveedor_id) : null
    const precio_unitario = safeNumber(body?.precio_unitario)
    const cantidadInput = safeNumber(body?.cantidad)

    if (!producto_id) {
      return NextResponse.json({ error: 'producto_id es requerido' }, { status: 400 })
    }
    if (!['entrada', 'salida', 'ajuste'].includes(tipo)) {
      return NextResponse.json({ error: 'tipo inválido' }, { status: 400 })
    }
    if (!(cantidadInput > 0)) {
      return NextResponse.json({ error: 'cantidad debe ser mayor a 0' }, { status: 400 })
    }

    // 1) leer stock actual
    const { data: producto, error: prodErr } = await admin
      .from('productos')
      .select('id, cantidad')
      .eq('id', producto_id)
      .eq('negocio_id', negocioId)
      .single()

    if (prodErr || !producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    const anterior = safeNumber(producto.cantidad)
    let nueva = anterior
    let cantidadMovimiento = cantidadInput

    if (tipo === 'entrada') {
      nueva = anterior + cantidadInput
    } else if (tipo === 'salida') {
      nueva = anterior - cantidadInput
      if (nueva < 0) {
        return NextResponse.json({ error: 'No hay stock suficiente' }, { status: 400 })
      }
    } else {
      // ajuste => cantidad = nuevo stock
      nueva = cantidadInput
      // para dejar trazabilidad clara, guardamos la diferencia absoluta como 'cantidad'
      cantidadMovimiento = Math.abs(nueva - anterior)
    }

    // 2) actualizar producto
    const { error: updErr } = await admin
      .from('productos')
      .update({ cantidad: nueva })
      .eq('id', producto_id)
      .eq('negocio_id', negocioId)

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 })
    }

    // 3) insertar movimiento
    const { data: movimiento, error: movErr } = await admin
      .from('movimientos_inventario')
      .insert({
        negocio_id: negocioId,
        producto_id,
        tipo,
        cantidad: cantidadMovimiento,
        cantidad_anterior: anterior,
        cantidad_nueva: nueva,
        motivo,
        proveedor_id,
        precio_unitario,
        usuario: user.email,
      })
      .select()
      .single()

    if (movErr) {
      return NextResponse.json({ error: movErr.message }, { status: 500 })
    }

    // si es ajuste y no cambió nada, igual dejamos el registro (por auditoría)
    return NextResponse.json({ movimiento })
  } catch (e) {
    console.error('POST movimientos error', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
