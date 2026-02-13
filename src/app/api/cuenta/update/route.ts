import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function PATCH(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const nombrecliente = String(body?.nombrecliente ?? '').trim()
  const telefono = body?.telefono === null ? null : String(body?.telefono ?? '').trim()

  if (!nombrecliente) {
    return NextResponse.json({ error: 'El nombre no puede estar vacío.' }, { status: 400 })
  }

  const { error } = await supabase
    .from('negocios')
    .update({
      nombrecliente,
      telefono,
    })
    .eq('owner_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
