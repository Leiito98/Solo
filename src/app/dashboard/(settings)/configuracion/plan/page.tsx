// src/app/dashboard/(settings)/configuracion/plan/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import PlanClient from './plan-client'

export const dynamic = 'force-dynamic'

const PLANES = {
  solo: {
    nombre: 'Solo',
    precio: 20000,
    descripcion: 'Para emprendedores y profesionales independientes',
    caracteristicas: [
      '1-2 profesionales',
      'Agenda online ilimitada',
      'Landing page personalizada',
      'Pagos con MercadoPago',
      'Recordatorios automáticos',
      'Soporte por WhatsApp',
    ],
  },
  pro: {
    nombre: 'Pro',
    precio: 28000,
    descripcion: 'Para negocios con equipo',
    caracteristicas: [
      'Profesionales ilimitados',
      'Todo lo del plan Solo',
      'Sistema de comisiones',
      'Control de gastos fijos',
      'Analytics avanzados',
      'Exportar a Excel/PDF',
      'Soporte prioritario',
    ],
  },
} as const

type PlanKey = keyof typeof PLANES

function ars(n: number) {
  return `$${Math.round(n).toLocaleString('es-AR')}`
}

function formatFechaAR(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function addFrequency(startISO: string, frequency: number, frequencyType: string) {
  const d = new Date(startISO)
  if (Number.isNaN(d.getTime())) return null

  if (frequencyType === 'months') {
    const nd = new Date(d)
    nd.setMonth(nd.getMonth() + frequency)
    return nd.toISOString()
  }
  if (frequencyType === 'days') {
    const nd = new Date(d)
    nd.setDate(nd.getDate() + frequency)
    return nd.toISOString()
  }
  return null
}

// Mapea tus estados internos a UI (sin tocar DB)
function statusUI(s: string | null | undefined) {
  const v = String(s || '').toLowerCase()
  if (v === 'activa') return { label: 'Suscripción activa', dot: 'bg-green-500', text: 'text-green-700', badge: 'bg-green-100 text-green-700 border-green-300' }
  if (v === 'trial') return { label: 'En prueba', dot: 'bg-blue-500', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700 border-blue-300' }
  if (v === 'bloqueada') return { label: 'Bloqueada', dot: 'bg-red-500', text: 'text-red-700', badge: 'bg-red-100 text-red-700 border-red-300' }
  if (v === 'cancelada') return { label: 'Cancelada', dot: 'bg-gray-400', text: 'text-gray-600', badge: 'bg-gray-100 text-gray-700 border-gray-300' }
  return { label: 'Estado desconocido', dot: 'bg-gray-400', text: 'text-gray-600', badge: 'bg-gray-100 text-gray-700 border-gray-300' }
}

async function fetchMpPreapproval(preapprovalId: string) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
  if (!accessToken) return null

  try {
    const client = new MercadoPagoConfig({ accessToken })
    const preapproval = new PreApproval(client)
    const mp = await preapproval.get({ id: preapprovalId })
    return mp as any
  } catch {
    return null
  }
}

export default async function PlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id, owner_id, plan, suscripcion_estado, trial_ends_at, mp_preapproval_id, mp_preapproval_status')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) redirect('/onboarding')

  const planKey = (negocio.plan === 'pro' ? 'pro' : 'solo') as PlanKey
  const planInfo = PLANES[planKey]
  const st = statusUI(negocio.suscripcion_estado)

  // Datos en vivo desde MP (si hay preapproval)
  const mp = negocio.mp_preapproval_id ? await fetchMpPreapproval(negocio.mp_preapproval_id) : null

  const mpStatus = String(mp?.status || negocio.mp_preapproval_status || '')
  const nextPaymentDate =
    mp?.next_payment_date ||
    mp?.auto_recurring?.next_payment_date ||
    null

  const fallbackNext =
    !nextPaymentDate &&
    mp?.auto_recurring?.start_date &&
    mp?.auto_recurring?.frequency &&
    mp?.auto_recurring?.frequency_type
      ? addFrequency(
          String(mp.auto_recurring.start_date),
          Number(mp.auto_recurring.frequency),
          String(mp.auto_recurring.frequency_type)
        )
      : null

  // Trial vencido
  const ahora = new Date()
  const trialEnds = negocio.trial_ends_at ? new Date(negocio.trial_ends_at) : null
  const trialVencido = Boolean(trialEnds && trialEnds.getTime() < ahora.getTime())

  // Próxima facturación UI
  let proximaFacturacion = '—'
  if (String(negocio.suscripcion_estado).toLowerCase() === 'activa') {
    proximaFacturacion = formatFechaAR(nextPaymentDate || fallbackNext)
  } else if (String(negocio.suscripcion_estado).toLowerCase() === 'trial') {
    proximaFacturacion = negocio.trial_ends_at ? formatFechaAR(negocio.trial_ends_at) : '—'
  }

  const planes = (['solo', 'pro'] as const).map((k) => ({
    key: k,
    nombre: PLANES[k].nombre,
    precio: PLANES[k].precio,
    descripcion: PLANES[k].descripcion,
    caracteristicas: [...PLANES[k].caracteristicas],
    actual: k === planKey,
  }))

  const puedeCambiarPlan =
    String(negocio.suscripcion_estado).toLowerCase() === 'activa' ||
    String(negocio.suscripcion_estado).toLowerCase() === 'trial'

  return (
    <PlanClient
      negocioId={negocio.id}
      planKey={planKey}
      planNombre={planInfo.nombre}
      planPrecio={planInfo.precio}
      suscripcionEstado={String(negocio.suscripcion_estado || '')}
      trialEndsAt={negocio.trial_ends_at}
      trialVencido={trialVencido}
      mpPreapprovalId={negocio.mp_preapproval_id}
      mpStatus={mpStatus}
      proximaFacturacion={proximaFacturacion}
      statusUi={st}
      planes={planes}
      puedeCambiarPlan={puedeCambiarPlan}
      requirePayerEmail={process.env.NODE_ENV !== 'production'}
    />
  )
}
