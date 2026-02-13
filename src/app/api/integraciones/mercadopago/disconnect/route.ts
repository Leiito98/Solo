import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

  const { error } = await supabase
    .from('negocios')
    .update({ mp_access_token: null })
    .eq('id', negocio.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // volver a integraciones
  return NextResponse.redirect(new URL('/dashboard/configuracion/integraciones', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
}
