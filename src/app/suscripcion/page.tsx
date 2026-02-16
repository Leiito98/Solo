import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SuscripcionClient from './SuscripcionClient'

export const dynamic = 'force-dynamic'

export default async function SuscripcionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id, nombre, plan, trial_ends_at, suscripcion_estado')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) redirect('/register')
  if (negocio.suscripcion_estado === 'activa') redirect('/dashboard')

  return <SuscripcionClient negocio={negocio} />
}
