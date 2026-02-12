import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const servicio_id = url.searchParams.get('servicio_id')
  if (!servicio_id) return NextResponse.json({ error: 'Missing servicio_id' }, { status: 400 })

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) return NextResponse.json({ error: 'Negocio not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('servicio_productos')
    .select(`
      id,
      producto_id,
      cantidad_por_uso,
      productos:productos (
        id, nombre, unidad, cantidad, precio_unitario, contenido_por_unidad
      )
    `)
    .eq('negocio_id', negocio.id)
    .eq('servicio_id', servicio_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ items: data || [] })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const servicio_id = body?.servicio_id as string | undefined
  const productos = body?.productos as Array<{ producto_id: string; cantidad_por_uso: number }> | undefined

  if (!servicio_id || !Array.isArray(productos)) {
    return NextResponse.json({ error: 'Missing servicio_id/productos' }, { status: 400 })
  }

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) return NextResponse.json({ error: 'Negocio not found' }, { status: 404 })

  // Validar servicio pertenece al negocio
  const { data: servicio } = await supabase
    .from('servicios')
    .select('id')
    .eq('id', servicio_id)
    .eq('negocio_id', negocio.id)
    .single()

  if (!servicio) return NextResponse.json({ error: 'Servicio not found' }, { status: 404 })

  // Borramos config anterior y reinsertamos (simple y robusto)
  const { error: delErr } = await supabase
    .from('servicio_productos')
    .delete()
    .eq('negocio_id', negocio.id)
    .eq('servicio_id', servicio_id)

  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 400 })

  if (productos.length === 0) {
    return NextResponse.json({ ok: true, items: [] })
  }

  const rows = productos.map((p) => ({
    negocio_id: negocio.id,
    servicio_id,
    producto_id: p.producto_id,
    cantidad_por_uso: Number(p.cantidad_por_uso),
  }))

  const { data: inserted, error: insErr } = await supabase
    .from('servicio_productos')
    .insert(rows)
    .select('id, producto_id, cantidad_por_uso')

  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 })
  return NextResponse.json({ ok: true, items: inserted || [] })
}
