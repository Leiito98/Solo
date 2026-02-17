import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import crypto from 'crypto'

export const runtime = 'nodejs'

function pickPaymentId(body: any) {
  // MP puede mandar: body.data.id, body.id, body.resource
  const raw = body?.data?.id ?? body?.id ?? body?.resource
  if (!raw) return null
  return String(raw)
}

function isRelevantTopic(body: any) {
  // MP suele mandar: type="payment"
  // A veces: topic="payment" o incluso merchant_order / order.
  const t = String(body?.type || body?.topic || '').toLowerCase()
  return t === 'payment' || t === 'merchant_order' || t === 'order'
}

function verifySig(turno_id: string, negocio_id: string, sig: string) {
  const secret = process.env.MP_WEBHOOK_SECRET || ''
  if (!secret) return false
  const payload = `${turno_id}.${negocio_id}`
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  try {
    // timing safe compare
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
  } catch {
    return false
  }
}

function mapPago(status: string) {
  // Ajustalo si tu enum real difiere
  if (status === 'approved') {
    return { estado: 'confirmado', pago_estado: 'parcial' } as const
  }
  if (status === 'pending' || status === 'in_process') {
    return { estado: 'pendiente', pago_estado: 'pendiente' } as const
  }
  if (status === 'rejected' || status === 'cancelled') {
    return { estado: 'pendiente', pago_estado: 'pendiente' } as const
  }
  if (status === 'refunded' || status === 'charged_back') {
    return { estado: 'cancelado', pago_estado: 'reembolsado' } as const
  }
  return { estado: 'pendiente', pago_estado: 'pendiente' } as const
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const turno_id = url.searchParams.get('turno_id') || ''
    const negocio_id = url.searchParams.get('negocio_id') || ''
    const sig = url.searchParams.get('sig') || ''

    const body = await req.json().catch(() => ({}))
    console.log('🔔 MP Webhook:', body)

    // Solo procesamos eventos relevantes (payment / merchant_order / order)
    if (!isRelevantTopic(body)) return NextResponse.json({ received: true, ignored: true })

    const paymentId = pickPaymentId(body)
    if (!paymentId) return NextResponse.json({ error: 'No payment ID' }, { status: 400 })

    // Multi-tenant: exigimos turno_id + negocio_id + firma desde notification_url
    if (!turno_id || !negocio_id || !sig) {
      console.error('Webhook missing query params', { turno_id, negocio_id, hasSig: !!sig })
      return NextResponse.json({ error: 'Missing tenant params' }, { status: 400 })
    }
    if (!verifySig(turno_id, negocio_id, sig)) {
      console.error('Webhook invalid signature', { turno_id, negocio_id })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const admin = createAdminClient()

    // 0) Validar que el turno exista y pertenezca a ese negocio (evita cross-tenant)
    const { data: turnoPrev, error: turnoPrevErr } = await admin
      .from('turnos')
      .select('id, negocio_id, mp_payment_id, mp_status, pago_estado')
      .eq('id', turno_id)
      .maybeSingle()

    if (turnoPrevErr) {
      console.error('Error leyendo turno:', turnoPrevErr)
      return NextResponse.json({ error: 'DB read error' }, { status: 500 })
    }
    if (!turnoPrev?.id) {
      return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 })
    }
    if (String(turnoPrev.negocio_id) !== String(negocio_id)) {
      console.error('Cross-tenant attempt', { turno_id, negocio_id, turno_negocio: turnoPrev.negocio_id })
      return NextResponse.json({ error: 'Turno mismatch' }, { status: 409 })
    }

    // 1) Traer el token del negocio (SEGURO) desde negocio_mp_tokens
    const { data: tokenRow, error: tokErr } = await admin
      .from('negocio_mp_tokens')
      .select('mp_access_token')
      .eq('negocio_id', negocio_id)
      .maybeSingle()

    if (tokErr) {
      console.error('Error leyendo negocio_mp_tokens', { negocio_id, tokErr })
      return NextResponse.json({ error: 'Error reading MP token' }, { status: 500 })
    }
    if (!tokenRow?.mp_access_token) {
      console.error('Negocio sin MP token', { negocio_id })
      return NextResponse.json({ error: 'Business missing MP token' }, { status: 422 })
    }

    const accessToken = String(tokenRow.mp_access_token)

    // 2) Consultar el pago con el token correcto
    const client = new MercadoPagoConfig({ accessToken })
    const payment = new Payment(client)
    const paymentData: any = await payment.get({ id: paymentId })

    // Verificación extra: si external_reference viene, debe coincidir con turno_id
    const extRef = paymentData?.external_reference ? String(paymentData.external_reference) : ''
    if (extRef && extRef !== turno_id) {
      console.error('Payment external_reference mismatch', { paymentId, extRef, turno_id })
      return NextResponse.json({ error: 'Payment mismatch' }, { status: 409 })
    }

    const status = String(paymentData?.status || '')
    const statusDetail = String(paymentData?.status_detail || '')
    const paidAmount = Number(paymentData?.transaction_amount || 0)
    const approvedAtRaw = paymentData?.date_approved || null
    const mpPaidAt = approvedAtRaw ? new Date(String(approvedAtRaw)).toISOString() : null

    const mapped = mapPago(status)

    // 3) Idempotencia: si ya está aprobado con el mismo payment, no re-escribimos
    if (turnoPrev.mp_payment_id === paymentId && turnoPrev.mp_status === status && status === 'approved') {
      return NextResponse.json({ received: true, dedup: true })
    }

    // 4) Update DB
    const { error: updateErr } = await admin
      .from('turnos')
      .update({
        estado: mapped.estado,
        pago_estado: mapped.pago_estado,
        pago_monto: paidAmount,
        pago_id: paymentId, // opcional, lo dejás por compat
        mp_payment_id: paymentId,
        mp_status: status,
        mp_status_detail: statusDetail,
        mp_paid_at: mpPaidAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', turno_id)

    if (updateErr) {
      console.error('Error update turno:', updateErr)
      return NextResponse.json({ error: 'DB update error' }, { status: 500 })
    }

    console.log('✅ Turno actualizado', {
      turno_id,
      negocio_id,
      paymentId,
      status,
      paidAmount,
      estado: mapped.estado,
      pago_estado: mapped.pago_estado,
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
