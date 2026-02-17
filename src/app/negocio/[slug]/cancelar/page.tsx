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

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id, nombre, slug, logo_url, color_primario, color_secundario')
    .eq('slug', slug)
    .single()

  if (!negocio) redirect('/')

  const { data: turno } = await supabase
    .from('turnos')
    .select(`
      id, estado, fecha, hora_inicio, hora_fin,
      servicios ( nombre ),
      profesionales ( nombre )
    `)
    .eq('negocio_id', negocio.id)
    .eq('cancel_token', token)
    .single()

  if (!turno) redirect(`/negocio/${slug}`)

  const servicio    = Array.isArray(turno.servicios)     ? turno.servicios[0]     : turno.servicios
  const profesional = Array.isArray(turno.profesionales) ? turno.profesionales[0] : turno.profesionales

  return (
    <CancelarTurnoClient
      negocioNombre={negocio.nombre}
      negocioSlug={negocio.slug}
      logoUrl={(negocio as any).logo_url ?? null}
      colorPrimario={(negocio as any).color_primario ?? null}
      colorSecundario={(negocio as any).color_secundario ?? null}
      token={token}
      turno={{
        id:          turno.id,
        estado:      turno.estado,
        fecha:       turno.fecha,
        hora_inicio: turno.hora_inicio,
        hora_fin:    turno.hora_fin,
        servicio:    (servicio as any)?.nombre    ?? null,
        profesional: (profesional as any)?.nombre ?? null,
      }}
    />
  )
}