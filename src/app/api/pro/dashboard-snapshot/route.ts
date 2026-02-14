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

  // Obtener profesional logueado (RLS self)
  const { data: profesional, error: profErr } = await supabase
    .from('profesionales')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (profErr || !profesional) {
    return NextResponse.json({ error: 'Profesional no encontrado' }, { status: 404 })
  }

  const url = new URL(req.url)
  const fecha =
    url.searchParams.get('fecha') ||
    format(toZonedTime(new Date(), TZ), 'yyyy-MM-dd')

  // -------- TURNOS DEL DÍA (solo los del profesional)
  // IMPORTANTE: acá asumo que existe profesional_id en turnos.
  // Si tu columna se llama distinto, cambiala.
  const { data: turnos, error: turnErr } = await supabase
    .from('turnos')
    .select('estado, pago_estado, updated_at')
    .eq('fecha', fecha)
    .eq('profesional_id', profesional.id)

  if (turnErr) return NextResponse.json({ error: turnErr.message }, { status: 500 })

  const total = (turnos || []).length
  const pendientes = (turnos || []).filter((t: any) => t.estado === 'pendiente').length
  const confirmados = (turnos || []).filter((t: any) => t.estado === 'confirmado').length
  const completados = (turnos || []).filter((t: any) => t.estado === 'completado').length
  const cancelados = (turnos || []).filter((t: any) => t.estado === 'cancelado').length

  const pagosPendientes = (turnos || []).filter((t: any) => t.pago_estado === 'pendiente' || t.pago_estado === 'parcial').length
  const pagosPagados = (turnos || []).filter((t: any) => t.pago_estado === 'pagado').length

  const lastTurnoUpdatedAt =
    (turnos || [])
      .map((t: any) => (t.updated_at ? String(t.updated_at) : ''))
      .sort()
      .at(-1) || ''

  // -------- COMISIONES DEL DÍA (solo del profesional)
  const { data: comisiones, error: comErr } = await supabase
    .from('comisiones')
    .select('estado, updated_at, fecha_generada')
    .eq('profesional_id', profesional.id)
    .gte('fecha_generada', `${fecha}T00:00:00`)
    .lte('fecha_generada', `${fecha}T23:59:59`)

  if (comErr) return NextResponse.json({ error: comErr.message }, { status: 500 })

  const comPend = (comisiones || []).filter((c: any) => c.estado === 'pendiente').length
  const comPag = (comisiones || []).filter((c: any) => c.estado === 'pagada').length

  const lastComUpdatedAt =
    (comisiones || [])
      .map((c: any) => (c.updated_at ? String(c.updated_at) : ''))
      .sort()
      .at(-1) || ''

  // Fingerprint: si cambia algo relevante, cambia este string
  const fingerprint =
    `${fecha}|t:${total},${pendientes},${confirmados},${completados},${cancelados}|` +
    `p:${pagosPendientes},${pagosPagados}|tu:${lastTurnoUpdatedAt}|` +
    `c:${comPend},${comPag}|cu:${lastComUpdatedAt}`

  return NextResponse.json({
    fecha,
    fingerprint,
  })
}
