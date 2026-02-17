'use client'

import { useMemo, useState } from 'react'
import { CreditCard, Shield, Zap, Users, Check, Lock } from 'lucide-react'

type PlanKey = 'solo' | 'pro'

type Props = {
  negocio: {
    id: string
    nombre: string
    plan: string
    trial_ends_at: string | null
    suscripcion_estado: string
  }
}

const PLANES: Record<
  PlanKey,
  { nombre: string; precio: number; subtitle: string; features: string[] }
> = {
  solo: {
    nombre: 'Solo',
    precio: 20000,
    subtitle: 'Para profesionales independientes',
    features: [
      'Hasta 2 profesionales',
      'Agenda online 24/7',
      'Landing page personalizada',
      'Pagos con MercadoPago',
      'Recordatorios automáticos',
    ],
  },
  pro: {
    nombre: 'Pro',
    precio: 29990,
    subtitle: 'Para negocios con equipo',
    features: [
      'Profesionales ilimitados',
      'Agenda online 24/7',
      'Sistema de comisiones',
      'Control de gastos fijos',
      'Analytics avanzados',
      'Soporte prioritario',
    ],
  },
}

function normalizePlan(p: string): PlanKey {
  return p === 'pro' ? 'pro' : 'solo'
}

export default function SuscripcionClient({ negocio }: Props) {
  const currentPlan = useMemo(() => normalizePlan(negocio.plan), [negocio.plan])
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>(currentPlan)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const planData = PLANES[selectedPlan]

  const isSamePlan = selectedPlan === currentPlan

  async function handleSuscribirse() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/suscripcion/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ negocio_id: negocio.id, plan: selectedPlan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear suscripción')

      window.location.href = data.init_point
    } catch (e: any) {
      setError(e?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-5"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Cabinet+Grotesk:wght@700;800;900&display=swap');
        .heading-font { font-family: 'Cabinet Grotesk', 'DM Sans', system-ui, sans-serif; }
      `}</style>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="heading-font text-3xl font-black text-white mb-2">
            Tu prueba gratuita terminó
          </h1>
          <p className="text-white/50 text-sm">
            Activá tu suscripción para seguir usando <span className="text-white/70">{negocio.nombre}</span>
          </p>
        </div>

        {/* Selector de plan */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 mb-4">
          <p className="text-xs text-white/35 mb-3">
            Elegí el plan que querés activar (podés pasar a Pro acá mismo).
          </p>

          <div className="grid grid-cols-2 gap-2">
            {(['solo', 'pro'] as PlanKey[]).map((p) => {
              const active = selectedPlan === p
              const isCurrent = currentPlan === p
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPlan(p)}
                  className={[
                    'rounded-xl border px-3 py-3 text-left transition-all',
                    active
                      ? 'border-blue-500/40 bg-blue-500/[0.08]'
                      : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="heading-font text-base font-extrabold text-white">
                        Plan {PLANES[p].nombre}
                      </div>
                      <div className="text-[11px] text-white/35 mt-0.5">
                        ${PLANES[p].precio.toLocaleString('es-AR')}/mes
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="text-[10px] px-2 py-1 rounded-full border border-white/10 bg-white/[0.03] text-white/50">
                        Actual
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Card del plan seleccionado */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="heading-font text-xl font-extrabold text-white">
                Plan {planData.nombre}
              </h2>
              <p className="text-white/40 text-xs mt-0.5">{planData.subtitle}</p>
              {!isSamePlan && currentPlan === 'solo' && selectedPlan === 'pro' && (
                <p className="text-[11px] text-blue-300/80 mt-2">
                  Estás por actualizar a Pro (recomendado para equipos).
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="heading-font text-2xl font-black text-white">
                ${planData.precio.toLocaleString('es-AR')}
              </div>
              <div className="text-white/30 text-xs">/mes</div>
            </div>
          </div>

          <ul className="space-y-2 mb-5">
            {planData.features.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 mb-4">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={handleSuscribirse}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                {isSamePlan ? 'Activar con MercadoPago' : `Activar Plan ${planData.nombre} con MercadoPago`}
              </>
            )}
          </button>

          <p className="text-[11px] text-white/25 mt-3">
            Al continuar vas a MercadoPago para autorizar el cobro mensual.
          </p>
        </div>

        {/* Garantías */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { icon: Shield, text: 'Pago seguro' },
            { icon: Zap, text: 'Activa al instante' },
            { icon: Users, text: 'Cancelá cuando quieras' },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
            >
              <Icon className="w-4 h-4 text-white/30 mx-auto mb-1" />
              <p className="text-[10px] text-white/30">{text}</p>
            </div>
          ))}
        </div>

        {/* Contacto */}
        <p className="text-center text-xs text-white/25 mt-6">
          ¿Necesitás ayuda?{' '}
          <a
            href="mailto:support@getsolo.site"
            className="text-white/40 underline hover:text-white/60"
          >
            support@getsolo.site
          </a>
        </p>
      </div>
    </div>
  )
}
