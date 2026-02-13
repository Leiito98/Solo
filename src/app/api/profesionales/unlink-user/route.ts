import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const profesionalId = String(body?.profesionalId || '').trim()
  const deleteUser = !!body?.deleteUser

  if (!profesionalId) return NextResponse.json({ error: 'profesionalId requerido' }, { status: 400 })

  // negocio del owner
  const { data: negocio, error: negErr } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (negErr || !negocio) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

  // buscar profesional y validar que sea del negocio del owner
  const { data: prof, error: profErr } = await supabase
    .from('profesionales')
    .select('id, negocio_id, auth_user_id')
    .eq('id', profesionalId)
    .single()

  if (profErr || !prof) return NextResponse.json({ error: 'Profesional no encontrado' }, { status: 404 })
  if (prof.negocio_id !== negocio.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const authUserId = prof.auth_user_id

  // 1) desvincular
  const { error: upErr } = await supabase
    .from('profesionales')
    .update({ auth_user_id: null })
    .eq('id', profesionalId)

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 })

  // 2) eliminar user de Auth (opcional)
  if (deleteUser && authUserId) {
    const { error: delErr } = await admin.auth.admin.deleteUser(authUserId)
    if (delErr) {
      // ya desvinculamos, devolvemos aviso pero no rompemos
      return NextResponse.json({ ok: true, warning: delErr.message })
    }
  }

  return NextResponse.json({ ok: true })
}
