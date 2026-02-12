import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function safeNumber(v: any) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function normStr(v: any) {
  return String(v ?? '').trim()
}

function isConsumible(unidad: string) {
  const u = normStr(unidad).toLowerCase()
  return u === 'ml' || u === 'g'
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: negocio } = await supabase
      .from('negocios')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!negocio) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    const { data: productos, error } = await supabase
      .from('productos')
      .select('*')
      .eq('negocio_id', negocio.id)
      .order('nombre')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ productos })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const admin = createAdminClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: negocio } = await supabase
      .from('negocios')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!negocio) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    const body = await req.json().catch(() => ({} as any))

    const nombre = normStr(body?.nombre)
    const unidad = normStr(body?.unidad || 'unidades')
    const cantidad = safeNumber(body?.cantidad)
    const precio_unitario = safeNumber(body?.precio_unitario)
    const alerta_stock_minimo = safeNumber(body?.alerta_stock_minimo)

    // ✅ nuevo
    const consumible = isConsumible(unidad)
    const contenido_por_unidad_raw = body?.contenido_por_unidad
    const contenido_por_unidad = consumible ? safeNumber(contenido_por_unidad_raw) : null

    if (!nombre) {
      return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 })
    }

    // Si es ml/g, requerimos contenido_por_unidad > 0
    if (consumible && (!contenido_por_unidad || contenido_por_unidad <= 0)) {
      return NextResponse.json(
        { error: 'contenido_por_unidad es requerido y debe ser > 0 para unidad ml/g' },
        { status: 400 }
      )
    }

    const { data: producto, error } = await admin
      .from('productos')
      .insert({
        negocio_id: negocio.id,
        nombre,
        cantidad: cantidad || 0,
        unidad: unidad || 'unidades',
        precio_unitario: precio_unitario || 0,
        alerta_stock_minimo: alerta_stock_minimo || 5,
        contenido_por_unidad, // ✅ GUARDAR
        aplica_a_vertical: ['barberia', 'belleza'],
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Registrar movimiento inicial si hay cantidad
    if (cantidad > 0) {
      await admin.from('movimientos_inventario').insert({
        negocio_id: negocio.id,
        producto_id: producto.id,
        tipo: 'entrada',
        cantidad,
        cantidad_anterior: 0,
        cantidad_nueva: cantidad,
        motivo: 'Stock inicial',
        precio_unitario: precio_unitario || 0,
      })
    }

    return NextResponse.json({ producto })
  } catch (error) {
    console.error('Error creating producto:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
