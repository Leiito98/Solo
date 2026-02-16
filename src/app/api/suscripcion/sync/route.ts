import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'

export const runtime = 'nodejs'

function mapSuscripcionEstadoMP(status: string): 'trial' | 'activa' | 'bloqueada' | 'cancelada' {
  // MP: pending, authorized, paused, cancelled
  if (status === 'authorized') return 'activa'
  if (status === 'cancelled') return 'cancelada'
  if (status === 'paused') return 'bloqueada'
  // pending u otros -> mantenemos trial (o bloqueada si querés)
  return 'trial'
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const preapprovalId = String(body?.preapproval_id || '').trim()
    if (!preapprovalId) return NextResponse.json({ error: 'Falta preapproval_id' }, { status: 400 })

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
    if (!accessToken) return NextResponse.json({ error: 'Falta MERCADOPAGO_ACCESS_TOKEN' }, { status: 500 })

    const client = new MercadoPagoConfig({ accessToken })
    const preapproval = new PreApproval(client)

    const mp = await preapproval.get({ id: preapprovalId })

    const external = String((mp as any)?.external_reference || '')
    const [negocioId, plan] = external.split('|').map((s) => s?.trim())
    const status = String((mp as any)?.status || 'pending')

    if (!negocioId) {
      return NextResponse.json({ error: 'external_reference inválido' }, { status: 400 })
    }

    const admin = createAdminClient()

    const suscripcion_estado = mapSuscripcionEstadoMP(status)

    const update: any = {
      mp_preapproval_id: preapprovalId,
      mp_preapproval_status: status || 'pending',
      suscripcion_estado, // ✅ ahora coincide con tu DB
    }

    // Si está autorizado, seteamos plan y terminamos trial
    if (status === 'authorized' && (plan === 'solo' || plan === 'pro')) {
      update.plan = plan
      update.trial_ends_at = null
    }

    const { error } = await admin.from('negocios').update(update).eq('id', negocioId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, status, suscripcion_estado }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}
