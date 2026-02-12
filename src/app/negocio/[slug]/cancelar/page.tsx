import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CancelarTurnoClient from './ui'

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function CancelarTurnoPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { token } = await searchParams

  if (!token) redirect(`/negocio/${slug}`)

  const supabase = await createClient()

  // Validar negocio por slug
  const { data: negocio } = await supabase
    .from('negocios')
    .select('id, nombre, slug')
    .eq('slug', slug)
    .single()

  if (!negocio) redirect('/')

  // Buscar turno por token y negocio
  const { data: turno } = await supabase
    .from('turnos')
    .select('id, estado, fecha, hora_inicio, hora_fin')
    .eq('negocio_id', negocio.id)
    .eq('cancel_token', token)
    .single()

  if (!turno) redirect(`/negocio/${slug}`)

  return <CancelarTurnoClient negocioNombre={negocio.nombre} token={token} turno={turno} />
}
