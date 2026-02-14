import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { toZonedTime } from 'date-fns-tz'
import { format } from 'date-fns'

export const runtime = 'nodejs'

const TZ = 'America/Argentina/Buenos_Aires'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

  const url = new URL(req.url)
  const fecha = url.searchParams.get('fecha') || format(toZonedTime(new Date(), TZ), 'yyyy-MM-dd')

  // 👇 IMPORTANTE: esto requiere que tu tabla turnos tenga updated_at (recomendado)
  // Si no lo tenés, te explico más abajo cómo agregarlo.
  const { data, error } = await supabase
    .from('turnos')
    .select('estado, updated_at')
    .eq('negocio_id', negocio.id)
    .eq('fecha', fecha)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const total = data?.length || 0
  const pendientes = (data || []).filter((t: any) => t.estado === 'pendiente').length
  const confirmados = (data || []).filter((t: any) => t.estado === 'confirmado').length
  const completados = (data || []).filter((t: any) => t.estado === 'completado').length
  const cancelados = (data || []).filter((t: any) => t.estado === 'cancelado').length

  // última actualización del día (para detectar cambios)
  const lastUpdatedAt =
    (data || [])
      .map((t: any) => (t.updated_at ? String(t.updated_at) : ''))
      .sort()
      .at(-1) || ''

  // fingerprint (si cambia -> refrescamos)
  const fingerprint = `${fecha}|${total}|${pendientes}|${confirmados}|${completados}|${cancelados}|${lastUpdatedAt}`

  return NextResponse.json({
    fecha,
    fingerprint,
    totals: { total, pendientes, confirmados, completados, cancelados },
    lastUpdatedAt,
  })
}
