import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

function estadoFacturaFromMpStatus(status: string) {
  const s = (status || '').toLowerCase()
  if (s === 'approved') return 'pagado'
  if (s === 'pending' || s === 'in_process' || s === 'scheduled') return 'pendiente'
  if (s === 'rejected' || s === 'cancelled' || s === 'refunded' || s === 'charged_back') return 'vencido'
  return 'pendiente'
}

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
 * Busca pagos de UN external_reference específico (negocioId|plan).
 */
async function fetchByExternalRef(
  externalRef: string,
  headers: Record<string, string>
): Promise<any[]> {
  const url = new URL('https://api.mercadopago.com/v1/payments/search')
  url.searchParams.set('external_reference', externalRef)
  url.searchParams.set('sort', 'date_created')
  url.searchParams.set('criteria', 'desc')
  url.searchParams.set('limit', '50')

  const resp = await fetch(url.toString(), { headers, cache: 'no-store' })
  const json = await resp.json().catch(() => null)
  const results: any[] = Array.isArray(json?.results) ? json.results : []

  console.log('[facturas/sync] external_reference búsqueda', {
    externalRef,
    httpStatus: resp.status,
    found: results.length,
  })

  return results
}

async function fetchSubscriptionPayments(
  negocioId: string,
  accessToken: string
): Promise<{ results: any[]; error: string | null }> {
  const headers = { Authorization: `Bearer ${accessToken}` }

  // Busca por TODOS los planes posibles en paralelo para no perder historial
  // cuando el usuario cambió de plan (solo → pro o viceversa)
  const planes = ['solo', 'pro', 'otros'] as const
  const searches = await Promise.all(
    planes.map((p) => fetchByExternalRef(`${negocioId}|${p}`, headers))
  )

  // Combinar resultados y deduplicar por id de pago
  const seen = new Set<string>()
  const combined: any[] = []
  for (const results of searches) {
    for (const item of results) {
      const id = String(item?.id || '')
      if (id && !seen.has(id)) {
        seen.add(id)
        combined.push(item)
      }
    }
  }

  // Ordenar por fecha descendente
  combined.sort((a, b) => {
    const da = new Date(a?.date_created || 0).getTime()
    const db = new Date(b?.date_created || 0).getTime()
    return db - da
  })

  console.log('[facturas/sync] total pagos encontrados (todos los planes)', {
    solo: searches[0].length,
    pro: searches[1].length,
    otros: searches[2].length,
    total: combined.length,
  })

  if (combined.length > 0) {
    return { results: combined, error: null }
  }

  // Fallback: operation_type=recurring_payment del último año
  // (para cuentas creadas antes de que seteáramos el external_reference)
  const url2 = new URL('https://api.mercadopago.com/v1/payments/search')
  url2.searchParams.set('operation_type', 'recurring_payment')
  url2.searchParams.set('sort', 'date_created')
  url2.searchParams.set('criteria', 'desc')
  url2.searchParams.set('limit', '50')
  url2.searchParams.set('range', 'date_created')
  url2.searchParams.set('begin_date', 'NOW-365DAYS')
  url2.searchParams.set('end_date', 'NOW')

  const resp2 = await fetch(url2.toString(), { headers, cache: 'no-store' })

  if (!resp2.ok) {
    const text = await resp2.text().catch(() => '')
    console.error('[facturas/sync] fallback error', resp2.status, text)
    return { results: [], error: `MP error ${resp2.status}: ${text}` }
  }

  const json2 = await resp2.json().catch(() => null)
  const fallbackResults: any[] = Array.isArray(json2?.results) ? json2.results : []

  console.log('[facturas/sync] fallback por operation_type', {
    httpStatus: resp2.status,
    found: fallbackResults.length,
  })

  return { results: fallbackResults, error: null }
}

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const admin = createAdminClient()

    const { data: negocio } = await admin
      .from('negocios')
      .select('id, owner_id, plan, mp_preapproval_id')
      .eq('owner_id', user.id)
      .single()

    if (!negocio) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    if (!negocio.mp_preapproval_id) {
      return NextResponse.json({ ok: true, inserted: 0, reason: 'no_preapproval' }, { status: 200 })
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
    if (!accessToken) return NextResponse.json({ error: 'Falta MERCADOPAGO_ACCESS_TOKEN' }, { status: 500 })

    const { results, error: fetchError } = await fetchSubscriptionPayments(
      negocio.id,
      accessToken
    )

    if (fetchError && results.length === 0) {
      return NextResponse.json({ error: fetchError }, { status: 200 })
    }

    let inserted = 0

    for (const p of results) {
      const mpPaymentId = String(p?.id || '').trim()
      if (!mpPaymentId) continue

      const { data: existing } = await admin
        .from('negocio_facturas')
        .select('id, numero')
        .eq('mp_payment_id', mpPaymentId)
        .maybeSingle()

      const status = String(p?.status || '')
      const amount = Number(p?.transaction_amount ?? 0)
      const currency = String(p?.currency_id ?? 'ARS')
      const createdAt = p?.date_created ?? null
      const approvedAt = p?.date_approved ?? null

      const estado = estadoFacturaFromMpStatus(status)
      const numero = existing?.numero || (await nextNumeroFactura(admin, negocio.id))

      const planLabel = negocio.plan === 'pro' ? 'Pro' : 'Solo'
      const fechaLabel = new Date(createdAt || Date.now()).toLocaleDateString('es-AR', {
        month: 'long',
        year: 'numeric',
      })
      const concepto = `Plan ${planLabel} - ${fechaLabel}`

      const metodoPago = (() => {
        const pm = p?.payment_method_id || ''
        const issuer = p?.issuer_id ? ` (${p.issuer_id})` : ''
        return pm ? `${pm}${issuer}` : 'MercadoPago'
      })()

      const payload = {
        negocio_id: negocio.id,
        mp_payment_id: mpPaymentId,
        mp_preapproval_id: negocio.mp_preapproval_id,
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
        console.error('[facturas/sync] upsert error', upsertError.message, { mpPaymentId })
      } else {
        inserted++
      }
    }

    return NextResponse.json({ ok: true, inserted, scanned: results.length }, { status: 200 })
  } catch (e: any) {
    console.error('[facturas/sync] unexpected error', e?.message || e)
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 200 })
  }
}