// src/app/api/suscripcion/cambiar-plan/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'

export const runtime = 'nodejs'

const PLANES = {
  solo: { nombre: 'GetSolo — Plan Solo', precio: 15 },
  pro: { nombre: 'GetSolo — Plan Pro', precio: 20 },
} as const

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const negocio_id = String(body?.negocio_id || '').trim()
    const plan = String(body?.plan || '').trim() as keyof typeof PLANES
    const payerEmailFromBody = String(body?.payer_email || '').trim()

    if (!negocio_id || !(plan in PLANES)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
    if (!accessToken) return NextResponse.json({ error: 'Falta MERCADOPAGO_ACCESS_TOKEN' }, { status: 500 })

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    const admin = createAdminClient()
    const { data: negocio } = await admin
      .from('negocios')
      .select('id, owner_id, mp_preapproval_id, mp_preapproval_status')
      .eq('id', negocio_id)
      .single()

    if (!negocio || negocio.owner_id !== user.id) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    const isProd = process.env.NODE_ENV === 'production'
    const payer_email = isProd
      ? (user.email || '')
      : (payerEmailFromBody || process.env.MP_TEST_PAYER_EMAIL || user.email || '')

    if (!payer_email || !isEmail(payer_email)) {
      return NextResponse.json(
        { error: 'Falta payer_email válido (en TEST usá test_user…@testuser.com o MP_TEST_PAYER_EMAIL)' },
        { status: 400 }
      )
    }

    const client = new MercadoPagoConfig({ accessToken })
    const preapproval = new PreApproval(client)

    // 1) Cancelar suscripción actual si existe y si parece activa
    // (No rompemos si falla: hay cuentas donde el estado ya está cancelado o no permite)
    if (negocio.mp_preapproval_id) {
      try {
        const current = await preapproval.get({ id: negocio.mp_preapproval_id })
        const currentStatus = String((current as any)?.status || '')
        if (currentStatus === 'authorized' || currentStatus === 'pending') {
          // En MP Node SDK suele funcionar update status=cancelled
          await preapproval.update({
            id: negocio.mp_preapproval_id,
            body: { status: 'cancelled' } as any,
          } as any)
        }
      } catch (e) {
        console.warn('[MP cambiar-plan] no se pudo cancelar la actual (seguimos igual)', e)
      }
    }

    // 2) Crear la nueva suscripción
    const planData = PLANES[plan]
    const mp = await preapproval.create({
      body: {
        reason: planData.nombre,
        payer_email,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: planData.precio,
          currency_id: 'ARS',
        },
        back_url: `${baseUrl}/suscripcion?return=1`,
        notification_url: `${baseUrl}/api/suscripcion/webhook`, // eslint-disable-line
        status: 'pending',
        external_reference: `${negocio_id}|${plan}`,
      } as any,
    })

    if (!mp?.init_point || !mp?.id) {
      return NextResponse.json({ error: 'MercadoPago no devolvió init_point' }, { status: 502 })
    }

    // 3) Guardamos el nuevo preapproval en DB
    // OJO: NO tocamos suscripcion_estado acá (por constraints y porque lo debe mandar webhook/sync)
    await admin
      .from('negocios')
      .update({
        mp_preapproval_id: mp.id,
        mp_preapproval_status: mp.status || 'pending',
      })
      .eq('id', negocio_id)

    return NextResponse.json({ init_point: mp.init_point, preapproval_id: mp.id })
  } catch (e: any) {
    console.error('[cambiar-plan] error', e)
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}