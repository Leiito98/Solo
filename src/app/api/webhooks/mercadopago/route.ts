import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import crypto from 'crypto'

export const runtime = 'nodejs'

function pickPaymentId(body: any) {
  const raw = body?.data?.id ?? body?.id ?? body?.resource
  if (!raw) return null
  return String(raw)
}

function isPaymentTopic(body: any) {
  const t = body?.type || body?.topic
  return t === 'payment'
}

function verifySig(turno_id: string, negocio_id: string, sig: string) {
  const secret = process.env.MP_WEBHOOK_SECRET || ''
  if (!secret) return false
  const payload = `${turno_id}.${negocio_id}`
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
  } catch {
    return false
  }
}

function mapPago(status: string) {
  // Ajustalo si manejás más estados en tu enum
  if (status === 'approved') {
    return { estado: 'confirmado', pago_estado: 'parcial' } as const
  }
  if (status === 'pending' || status === 'in_process') {
    return { estado: 'pendiente', pago_estado: 'pendiente' } as const
  }
  if (status === 'refunded' || status === 'charged_back') {
    return { estado: 'cancelado', pago_estado: 'reembolsado' } as const
  }
  // default conservador
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

    // Solo nos interesan pagos
    if (!isPaymentTopic(body)) return NextResponse.json({ received: true })

    const paymentId = pickPaymentId(body)
    if (!paymentId) return NextResponse.json({ error: 'No payment ID' }, { status: 400 })

    // Para multi-tenant: exigimos turno_id + negocio_id firmados (vienen de notification_url)
    if (!turno_id || !negocio_id || !sig) {
      console.error('Webhook missing query params', { turno_id, negocio_id, hasSig: !!sig })
      return NextResponse.json({ error: 'Missing tenant params' }, { status: 400 })
    }
    if (!verifySig(turno_id, negocio_id, sig)) {
      console.error('Webhook invalid signature', { turno_id, negocio_id })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const admin = createAdminClient()

    // 1) Traer el token del negocio
    const { data: negocio, error: negErr } = await admin
      .from('negocios')
      .select('mp_access_token')
      .eq('id', negocio_id)
      .single()

    if (negErr || !negocio?.mp_access_token) {
      console.error('Negocio sin MP token', { negocio_id, negErr })
      return NextResponse.json({ error: 'Business missing MP token' }, { status: 422 })
    }

    const accessToken = String(negocio.mp_access_token)

    // 2) Consultar el pago con el token correcto
    const client = new MercadoPagoConfig({ accessToken })
    const payment = new Payment(client)
    const paymentData: any = await payment.get({ id: paymentId })

    // Verificación extra: el pago debe pertenecer al turno
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

    // 3) Idempotencia: si ya tenemos ese payment approved, no re-escribimos al pedo
    const { data: turnoPrev } = await admin
      .from('turnos')
      .select('id, mp_payment_id, mp_status, pago_estado')
      .eq('id', turno_id)
      .maybeSingle()

    if (!turnoPrev?.id) {
      return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 })
    }

    // si ya está aprobado con el mismo payment, OK
    if (turnoPrev.mp_payment_id === paymentId && turnoPrev.mp_status === status && status === 'approved') {
      return NextResponse.json({ received: true, dedup: true })
    }

    // 4) Update DB con columnas nuevas
    const { error: updateErr } = await admin
      .from('turnos')
      .update({
        estado: mapped.estado,
        pago_estado: mapped.pago_estado,
        pago_monto: paidAmount,
        // “pago_id” lo podés seguir usando si querés, pero ya tenés mp_payment_id
        pago_id: paymentId,

        mp_payment_id: paymentId,
        mp_status: status,
        mp_status_detail: statusDetail,
        mp_paid_at: mpPaidAt,
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
