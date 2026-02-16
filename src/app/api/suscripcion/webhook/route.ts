// src/app/api/suscripcion/webhook/route.ts
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MercadoPagoConfig, PreApproval, Payment } from 'mercadopago'

export const runtime = 'nodejs'

type WebhookType =
  | 'subscription_preapproval'
  | 'payment'
  | 'subscription_authorized_payment'
  | 'unknown'

function normalizeType(t: string) {
  const v = (t || '').toLowerCase()

  // ⚠️ ORDEN IMPORTA: subscription_authorized_payment contiene "preapproval",
  // por eso va PRIMERO antes del check genérico de preapproval.
  if (v.includes('subscription_authorized_payment')) return 'subscription_authorized_payment'

  // Suscripción (preapproval)
  if (v.includes('subscription_preapproval')) return 'subscription_preapproval'
  if (v.includes('preapproval')) return 'subscription_preapproval'

  // Pago normal
  if (v.includes('payment')) return 'payment'

  return 'unknown'
}

function estadoFacturaFromMpPaymentStatus(status: string) {
  const s = (status || '').toLowerCase()
  if (s === 'approved') return 'pagado'
  if (s === 'pending' || s === 'in_process') return 'pendiente'
  if (s === 'rejected' || s === 'cancelled' || s === 'refunded' || s === 'charged_back') return 'vencido'
  return 'pendiente'
}

async function safeJson(req: Request) {
  try {
    return await req.json()
  } catch {
    return null
  }
}

// genera FAC-YYYY-NNN (por negocio)
async function nextNumeroFactura(admin: ReturnType<typeof createAdminClient>, negocioId: string) {
  const year = new Date().getFullYear()
  const prefix = `FAC-${year}-`

  const { data } = await admin
    .from('negocio_facturas')
    .select('numero, emitida_en')
    .eq('negocio_id', negocioId)
    .like('numero', `${prefix}%`)
    .order('emitida_en', { ascending: false })
    .limit(1)

  const last = data?.[0]?.numero || ''
  const lastN = Number(String(last).replace(prefix, '')) || 0
  const nextN = String(lastN + 1).padStart(3, '0')
  return `${prefix}${nextN}`
}

/**
 * MP puede pegarte así:
 * - /webhook?type=payment&data.id=123
 * - /webhook?type=subscription_authorized_payment&id=123
 * - body: { type: "...", data: { id: "..." } }
 * - body: { topic: "...", id: "..." }
 */
function extractEvent(url: URL, body: any): { type: WebhookType; dataId: string } {
  // query
  const qType = url.searchParams.get('type') || url.searchParams.get('topic') || ''
  const qId = url.searchParams.get('data.id') || url.searchParams.get('id') || ''

  // body
  const bType = body?.type || body?.topic || body?.action || body?.resource || body?.entity || ''
  const bId = body?.data?.id || body?.['data.id'] || body?.id || body?.resource_id || ''

  const typeRaw = String(qType || bType || '')
  const idRaw = String(qId || bId || '').trim()

  const norm = normalizeType(typeRaw) as WebhookType
  return { type: norm, dataId: idRaw }
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const body = await safeJson(req)

    const { type, dataId } = extractEvent(url, body)

    console.log('[MP webhook] received', {
      type,
      dataId,
      query: {
        type: url.searchParams.get('type'),
        id: url.searchParams.get('data.id') || url.searchParams.get('id'),
      },
      bodyKeys: body ? Object.keys(body) : null,
    })

    // Siempre 200 para evitar reintentos infinitos
    if (!dataId || type === 'unknown') {
      return NextResponse.json({ ok: true, ignored: true }, { status: 200 })
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
    if (!accessToken) {
      console.error('[MP webhook] Missing MERCADOPAGO_ACCESS_TOKEN')
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    const admin = createAdminClient()
    const client = new MercadoPagoConfig({ accessToken })

    // ─────────────────────────────────────────────
    // 0) subscription_authorized_payment
    // ─────────────────────────────────────────────
    // Este evento llega cuando MP cobra (o intenta cobrar) una cuota de suscripción.
    // El id NO es un /v1/payments/:id sino un authorized_payment.
    // Endpoint correcto: GET /v1/preapproval/:preapproval_id/authorized_payments/:id
    //
    // El body del webhook trae: { type, data: { id: "<authorized_payment_id>" } }
    // y también necesitamos el preapproval_id — MP lo incluye en el objeto del authorized_payment.
    if (type === 'subscription_authorized_payment') {
      console.log('[MP webhook] subscription_authorized_payment received', { dataId })

      // En este evento el dataId es el ID de un pago normal en /v1/payments.
      // operation_type=recurring_payment. Se obtiene con el SDK Payment estándar.
      const payment = new Payment(client)
      let apData: any = null
      try {
        apData = await payment.get({ id: dataId })
      } catch (e: any) {
        console.warn('[MP webhook] subscription_authorized_payment: payment.get failed', {
          id: dataId,
          message: e?.message,
        })
        return NextResponse.json({ ok: true }, { status: 200 })
      }

      console.log('[MP webhook] authorized_payment data', {
        id: dataId,
        status: (apData as any)?.status,
        operation_type: (apData as any)?.operation_type,
        preapproval_id: (apData as any)?.preapproval_id,
        external_reference: (apData as any)?.external_reference,
        amount: (apData as any)?.transaction_amount,
      })

      // Buscar negocio: primero por preapproval_id, luego por external_reference
      let neg: { id: string; plan: string } | null = null
      const apPreapprovalId = String((apData as any)?.preapproval_id || '').trim()

      if (apPreapprovalId) {
        const { data: n } = await admin
          .from('negocios')
          .select('id, plan')
          .eq('mp_preapproval_id', apPreapprovalId)
          .maybeSingle()
        neg = n as any
      }

      if (!neg && (apData as any)?.external_reference) {
        const [refId] = String((apData as any).external_reference).split('|').map((s: string) => s.trim())
        if (refId) {
          const { data: n } = await admin
            .from('negocios')
            .select('id, plan')
            .eq('id', refId)
            .maybeSingle()
          neg = n as any
        }
      }

      if (!neg) {
        console.warn('[MP webhook] authorized_payment: no se encontró negocio', { apPreapprovalId, dataId })
        return NextResponse.json({ ok: true }, { status: 200 })
      }

      const preapprovalId = apPreapprovalId || null
      const mpPaymentId = String((apData as any)?.id ?? dataId)
      const status = String(apData?.status || '')
      const amount = Number(apData?.transaction_amount ?? 0)
      const currency = String(apData?.currency_id ?? 'ARS')
      const createdAt = apData?.date_created ?? null
      const approvedAt = apData?.date_approved ?? null

      const { data: existing } = await admin
        .from('negocio_facturas')
        .select('id, numero')
        .eq('mp_payment_id', mpPaymentId)
        .maybeSingle()

      const estado = estadoFacturaFromMpPaymentStatus(status)
      const numero = existing?.numero || (await nextNumeroFactura(admin, neg.id))

      const planLabel = neg.plan === 'pro' ? 'Pro' : 'Solo'
      const fechaLabel = new Date(createdAt || Date.now()).toLocaleDateString('es-AR', {
        month: 'long',
        year: 'numeric',
      })
      const concepto = `Plan ${planLabel} - ${fechaLabel}`

      const metodoPago = (() => {
        const pm = apData?.payment_method_id || ''
        const issuer = apData?.issuer_id ? ` (${apData.issuer_id})` : ''
        return pm ? `${pm}${issuer}` : 'MercadoPago'
      })()

      const payload = {
        negocio_id: neg.id,
        mp_payment_id: mpPaymentId,
        mp_preapproval_id: preapprovalId,
        numero,
        concepto,
        monto: Math.round(amount),
        moneda: currency,
        metodo_pago: metodoPago,
        estado,
        emitida_en: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
        pagada_en: approvedAt ? new Date(approvedAt).toISOString() : null,
      }

      const { error: upsertError } = await admin
        .from('negocio_facturas')
        .upsert(payload, { onConflict: 'mp_payment_id' })

      if (upsertError) {
        console.error('[MP webhook] authorized_payment upsert error', upsertError.message)
      } else {
        console.log('[MP webhook] authorized_payment factura guardada', { negocioId: neg.id, mpPaymentId, estado, numero })
      }

      return NextResponse.json({ ok: true }, { status: 200 })
    }

    // ─────────────────────────────────────────────
    // 1) SUSCRIPCIÓN (subscription_preapproval)
    // ─────────────────────────────────────────────
    if (type === 'subscription_preapproval') {
      const preapproval = new PreApproval(client)
      const mp = await preapproval.get({ id: dataId })

      const external = String((mp as any)?.external_reference || '')
      const [negocioId, plan] = external.split('|').map((s) => s?.trim())
      const status = String((mp as any)?.status || '')

      console.log('[MP webhook] fetched preapproval', {
        id: dataId,
        status,
        external_reference: external,
        reason: String((mp as any)?.reason || ''),
      })

      if (!negocioId) return NextResponse.json({ ok: true }, { status: 200 })

      // Tu constraint permite: trial | activa | bloqueada | cancelada
      let suscripcion_estado: 'trial' | 'activa' | 'bloqueada' | 'cancelada' = 'trial'
      if (status === 'authorized') suscripcion_estado = 'activa'
      else if (status === 'cancelled') suscripcion_estado = 'cancelada'
      else if (status === 'paused') suscripcion_estado = 'bloqueada'
      else if (status === 'pending') suscripcion_estado = 'trial'

      const update: any = {
        mp_preapproval_id: dataId,
        mp_preapproval_status: status || null,
        suscripcion_estado,
      }

      if (status === 'authorized' && (plan === 'solo' || plan === 'pro')) {
        update.plan = plan
        update.trial_ends_at = null
      }

      const { error } = await admin.from('negocios').update(update).eq('id', negocioId)
      if (error) console.error('[MP webhook] DB update error', error)
      else console.log('[MP webhook] DB updated', { negocioId, update })

      return NextResponse.json({ ok: true }, { status: 200 })
    }

    // ─────────────────────────────────────────────
    // 2) PAYMENT (facturas)
    // ─────────────────────────────────────────────
    if (type === 'payment') {
      const payment = new Payment(client)

      let mpPay: any
      try {
        mpPay = await payment.get({ id: dataId })
      } catch (e: any) {
        // Esto evita el spam de logs si MP te manda algún evento que no vive en /payments
        console.warn('[MP webhook] payment.get failed (ignored)', { id: dataId, message: e?.message || e })
        return NextResponse.json({ ok: true }, { status: 200 })
      }

      const mpPaymentId = String(mpPay?.id || dataId)
      const status = String(mpPay?.status || '')
      const amount = Number(mpPay?.transaction_amount || 0)
      const currency = String(mpPay?.currency_id || 'ARS')
      const approvedAt = mpPay?.date_approved || null
      const createdAt = mpPay?.date_created || null

      // PreapprovalId puede venir en distintos lugares según flujo
      const preapprovalId =
        String(
          mpPay?.preapproval_id ||
            mpPay?.metadata?.preapproval_id ||
            mpPay?.order?.id ||
            ''
        ).trim() || null

      console.log('[MP webhook] fetched payment', {
        mpPaymentId,
        status,
        amount,
        currency,
        preapprovalId,
        external_reference: mpPay?.external_reference,
      })

      // Buscar negocio: primero por mp_preapproval_id, luego por external_reference como fallback
      let negocioId: string | null = null
      let negocioPlan: string = 'solo'

      if (preapprovalId) {
        const { data: neg } = await admin
          .from('negocios')
          .select('id, plan')
          .eq('mp_preapproval_id', preapprovalId)
          .maybeSingle()
        negocioId = neg?.id || null
        negocioPlan = neg?.plan || 'solo'
      }

      // fallback: external_reference puede ser "negocioId|plan"
      if (!negocioId && mpPay?.external_reference) {
        const [refNegocioId, refPlan] = String(mpPay.external_reference).split('|').map((s: string) => s?.trim())
        if (refNegocioId) {
          const { data: neg } = await admin
            .from('negocios')
            .select('id, plan')
            .eq('id', refNegocioId)
            .maybeSingle()
          negocioId = neg?.id || null
          negocioPlan = refPlan || neg?.plan || 'solo'
        }
      }

      if (!negocioId) {
        console.warn('[MP webhook] payment without negocio match', { mpPaymentId, preapprovalId })
        return NextResponse.json({ ok: true }, { status: 200 })
      }

      // Si ya existe factura, no regenerar número
      const { data: existing } = await admin
        .from('negocio_facturas')
        .select('id, numero')
        .eq('mp_payment_id', mpPaymentId)
        .maybeSingle()

      const estado = estadoFacturaFromMpPaymentStatus(status)
      const numero = existing?.numero || (await nextNumeroFactura(admin, negocioId))

      // Concepto según plan actual (ya lo tenemos de la búsqueda de negocio)
      const planLabel = negocioPlan === 'pro' ? 'Pro' : 'Solo'
      const fechaLabel = new Date(createdAt || Date.now()).toLocaleDateString('es-AR', {
        month: 'long',
        year: 'numeric',
      })
      const concepto = `Plan ${planLabel} - ${fechaLabel}`

      const metodoPago = (() => {
        const pm = mpPay?.payment_method_id || ''
        const issuer = mpPay?.issuer_id ? ` (${mpPay.issuer_id})` : ''
        return pm ? `${pm}${issuer}` : 'MercadoPago'
      })()

      const payload = {
        negocio_id: negocioId,
        mp_payment_id: mpPaymentId,
        mp_preapproval_id: preapprovalId,
        numero,
        concepto,
        monto: Math.round(amount),
        moneda: currency,
        metodo_pago: metodoPago,
        estado,
        emitida_en: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
        pagada_en: approvedAt ? new Date(approvedAt).toISOString() : null,
      }

      const { error } = await admin.from('negocio_facturas').upsert(payload, { onConflict: 'mp_payment_id' })

      if (error) console.error('[MP webhook] factura upsert error', error)
      else console.log('[MP webhook] factura upsert ok', { negocioId, mpPaymentId, estado, numero })

      return NextResponse.json({ ok: true }, { status: 200 })
    }

    return NextResponse.json({ ok: true, ignored: true }, { status: 200 })
  } catch (e: any) {
    console.error('[MP webhook] error', e?.message || e)
    return NextResponse.json({ ok: true }, { status: 200 })
  }
}

// MP a veces manda GET en pruebas
export async function GET(req: Request) {
  return POST(req)
}