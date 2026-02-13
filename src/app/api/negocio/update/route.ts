import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

function slugify(input: string) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-')
}

const ALLOWED_VERTICALS = new Set([
  'barberia',
  'belleza',
  'nutricion',
  'peluqueria',
  'psicologia',
  'fitness',
  'otros',
])

export async function PATCH(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))

  const negocioId = String(body?.negocioId || '').trim()
  const nombre = String(body?.nombre || '').trim()
  const slug = slugify(body?.slug || '')
  const vertical = String(body?.vertical || 'otros').trim()

  const direccion = body?.direccion === null ? null : String(body?.direccion || '').trim() || null
  const telefono = body?.telefono === null ? null : String(body?.telefono || '').trim() || null
  const email = body?.email === null ? null : String(body?.email || '').trim() || null

  if (!negocioId) return NextResponse.json({ error: 'negocioId requerido' }, { status: 400 })
  if (!nombre) return NextResponse.json({ error: 'El nombre no puede estar vacío.' }, { status: 400 })
  if (!slug) return NextResponse.json({ error: 'Slug inválido.' }, { status: 400 })
  if (!ALLOWED_VERTICALS.has(vertical)) return NextResponse.json({ error: 'Tipo de negocio inválido.' }, { status: 400 })

  // asegurar que el negocio le pertenece al owner
  const { data: myBiz, error: myBizErr } = await supabase
    .from('negocios')
    .select('id, slug')
    .eq('id', negocioId)
    .eq('owner_id', user.id)
    .single()

  if (myBizErr || !myBiz) return NextResponse.json({ error: 'Negocio no encontrado.' }, { status: 404 })

  // si cambia slug, validar que no exista
  if (slug !== myBiz.slug) {
    const { data: exists, error: existsErr } = await supabase
      .from('negocios')
      .select('id')
      .eq('slug', slug)
      .limit(1)

    if (existsErr) return NextResponse.json({ error: existsErr.message }, { status: 400 })
    if ((exists || []).length > 0) return NextResponse.json({ error: 'Ese slug ya está en uso.' }, { status: 409 })
  }

  const { error: updErr } = await supabase
    .from('negocios')
    .update({
      nombre,
      slug,
      vertical,   
      direccion,
      telefono,
      email,
    })
    .eq('id', negocioId)
    .eq('owner_id', user.id)

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
