import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

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
    const { data: proveedor, error } = await supabase
      .from('proveedores')
      .select('*')
      .eq('id', id)
      .eq('negocio_id', negocioId)
      .single()

    if (error || !proveedor) return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 })
    return NextResponse.json({ proveedor })
  } catch (e) {
    console.error('GET proveedor error', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const { user, negocioId } = await getNegocio()
    if (!user || !negocioId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const { nombre, contacto, email, telefono, direccion, notas, activo } = body || {}

    if (!String(nombre || '').trim()) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: proveedor, error } = await admin
      .from('proveedores')
      .update({
        nombre: String(nombre).trim(),
        contacto: contacto ?? null,
        email: email ?? null,
        telefono: telefono ?? null,
        direccion: direccion ?? null,
        notas: notas ?? null,
        activo: typeof activo === 'boolean' ? activo : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('negocio_id', negocioId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ proveedor })
  } catch (e) {
    console.error('PUT proveedor error', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const { user, negocioId } = await getNegocio()
    if (!user || !negocioId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const admin = createAdminClient()
    const { error } = await admin
      .from('proveedores')
      .delete()
      .eq('id', id)
      .eq('negocio_id', negocioId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE proveedor error', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
