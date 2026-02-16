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
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const negocio_id = String(body?.negocio_id || '').trim()
    const plan = String(body?.plan || '').trim()

    // En TEST vamos a permitir que el front mande payer_email (email del comprador de prueba de MP)
    const payerEmailFromBody = String(body?.payer_email || '').trim()

    if (!negocio_id || !(plan in PLANES)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: negocio } = await admin
      .from('negocios')
      .select('id, owner_id')
      .eq('id', negocio_id)
      .single()

    if (!negocio || negocio.owner_id !== user.id) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Falta MERCADOPAGO_ACCESS_TOKEN en el servidor' },
        { status: 500 }
      )
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    const planData = PLANES[plan as keyof typeof PLANES]

    // 👉 Elegimos payer_email correcto:
    // - En dev/test: primero body.payer_email, si no env MP_TEST_PAYER_EMAIL, si no user.email (pero eso normalmente FALLA en sandbox)
    // - En prod: user.email
    const isProd = process.env.NODE_ENV === 'production'

    const payer_email = isProd
      ? (user.email || '')
      : (payerEmailFromBody || process.env.MP_TEST_PAYER_EMAIL || user.email || '')

    if (!payer_email || !isEmail(payer_email)) {
      return NextResponse.json(
        {
          error:
            'Falta payer_email válido. En TEST tenés que mandar el email del comprador de prueba de MercadoPago (o setear MP_TEST_PAYER_EMAIL).',
        },
        { status: 400 }
      )
    }

    // (Opcional) logs útiles
    console.log('[MP] creando preapproval', {
      plan,
      negocio_id,
      payer_email,
      token_prefix: accessToken.slice(0, 6),
      env: process.env.NODE_ENV,
    })

    const client = new MercadoPagoConfig({ accessToken })
    const preapproval = new PreApproval(client)

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
        back_url: `${baseUrl}/suscripcion`,
        // notification_url: MP mandará webhooks acá cada vez que cobre (o intente cobrar).
        // Sin esto, las facturas no se crean automáticamente.
        notification_url: `${baseUrl}/api/suscripcion/webhook`, // eslint-disable-line
        status: 'pending',
        external_reference: `${negocio_id}|${plan}`,
      } as any,
    })

    if (!mp?.init_point || !mp?.id) {
      return NextResponse.json({ error: 'MercadoPago no devolvió init_point' }, { status: 502 })
    }

    await admin
      .from('negocios')
      .update({
        mp_preapproval_id: mp.id,
        mp_preapproval_status: mp.status || 'pending',
      })
      .eq('id', negocio_id)

    return NextResponse.json({ init_point: mp.init_point, preapproval_id: mp.id })
  } catch (e: any) {
    console.error('Error crear suscripción:', e)
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}