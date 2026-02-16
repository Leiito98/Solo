import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

function clean(v: any) {
  const s = String(v ?? '').trim()
  return s.length ? s : null
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: negocio, error: nErr } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (nErr || !negocio) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

  const { data, error } = await supabase
    .from('negocio_facturacion')
    .select('razon_social,cuit,direccion,ciudad,codigo_postal')
    .eq('negocio_id', negocio.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ negocio_id: negocio.id, facturacion: data ?? null })
}

export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: negocio, error: nErr } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (nErr || !negocio) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

  const body = await req.json().catch(() => ({}))

  const payload = {
    negocio_id: negocio.id,
    razon_social: clean(body.razon_social),
    cuit: clean(body.cuit),
    direccion: clean(body.direccion),
    ciudad: clean(body.ciudad),
    codigo_postal: clean(body.codigo_postal),
  }

  // upsert por negocio_id
  const { data, error } = await supabase
    .from('negocio_facturacion')
    .upsert(payload, { onConflict: 'negocio_id' })
    .select('razon_social,cuit,direccion,ciudad,codigo_postal')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, facturacion: data })
}
