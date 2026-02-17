import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function POST() {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (!user) return NextResponse.redirect(new URL('/login', baseUrl))

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

  // 1) borrar tokens (solo service role puede)
  const { error: delErr } = await admin
    .from('negocio_mp_tokens')
    .delete()
    .eq('negocio_id', negocio.id)

  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })

  // 2) limpiar flags (UI)
  const { error: updErr } = await admin
    .from('negocios')
    .update({
      mp_connected_at: null,
      mp_preapproval_id: null,
      mp_preapproval_status: null,
      mp_access_token: null, // por seguridad si existe
      updated_at: new Date().toISOString(),
    })
    .eq('id', negocio.id)

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

  return NextResponse.redirect(new URL('/dashboard/configuracion/integraciones', baseUrl))
}
