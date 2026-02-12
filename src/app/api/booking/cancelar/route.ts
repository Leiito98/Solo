import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { token } = await req.json().catch(() => ({}))
    const cancel_token = String(token || '').trim()

    if (!cancel_token) {
      return NextResponse.json({ error: 'Falta token' }, { status: 400 })
    }

    const supabase = await createClient()
    const admin = createAdminClient()

    // Buscar turno por token (y datos mínimos)
    const { data: turno, error } = await supabase
      .from('turnos')
      .select('id, estado, pago_estado, pago_monto, fecha, hora_inicio')
      .eq('cancel_token', cancel_token)
      .single()

    if (error || !turno) {
      return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 })
    }

    // Solo cancelable si está pendiente/confirmado
    if (!['pendiente', 'confirmado'].includes(turno.estado)) {
      return NextResponse.json({ error: 'Este turno ya no se puede cancelar' }, { status: 409 })
    }

    // Regla opcional: no cancelar si faltan menos de X horas
    // (si querés 2 horas: 2 * 60 * 60 * 1000)
    const turnoDate = new Date(`${turno.fecha}T${String(turno.hora_inicio).slice(0, 8)}`)
    const ahora = new Date()
    const limiteMs = 2 * 60 * 60 * 1000
    if (turnoDate.getTime() - ahora.getTime() < limiteMs) {
      return NextResponse.json(
        { error: 'No se puede cancelar con menos de 2 horas de anticipación' },
        { status: 409 }
      )
    }

    // Si había seña parcial y luego se cancela:
    // - NO deberías poner "reembolsado" acá (eso lo confirma MP por webhook)
    // - Lo ideal: marcar "reembolso_pendiente" (si existe en tu enum)
    // Como no sé tu enum final, lo dejo sin inventar valores:
    const patch: any = {
      estado: 'cancelado',
      cancelado_en: new Date().toISOString(),
      cancelado_por: 'cliente',
    }

    // Si querés marcar algo interno:
    // if (turno.pago_estado === 'parcial') patch.pago_estado = 'pendiente'

    const { error: updErr } = await admin
      .from('turnos')
      .update(patch)
      .eq('id', turno.id)

    if (updErr) {
      return NextResponse.json({ error: 'No se pudo cancelar' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('cancelar turno error', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
