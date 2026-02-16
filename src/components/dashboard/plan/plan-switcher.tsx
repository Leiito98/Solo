'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { ChangePlanDialog } from './change-plan-dialog'

type PlanKey = 'solo' | 'pro'

export function PlanSwitcher({
  negocioId,
  currentPlan,
  currentEstado,
  planes,
  requirePayerEmail,
}: {
  negocioId: string
  currentPlan: PlanKey
  currentEstado: string
  requirePayerEmail: boolean
  planes: Array<{
    key: PlanKey
    nombre: string
    precio: number
    descripcion: string
    caracteristicas: string[]
  }>
}) {
  const [open, setOpen] = useState(false)
  const [target, setTarget] = useState<PlanKey>('solo')

  const puedeCambiar =
    currentEstado === 'activa' || currentEstado === 'trial'

  const targetPlan = useMemo(() => planes.find(p => p.key === target)!, [planes, target])

  return (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        {planes.map((plan) => (
          <Card
            key={plan.key}
            className={`${plan.key === currentPlan ? 'border-2 border-blue-500 shadow-lg' : 'border-gray-200'}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-xl">{plan.nombre}</CardTitle>
                {plan.key === currentPlan && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-300">Plan actual</Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">{plan.descripcion}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  ${plan.precio.toLocaleString('es-AR')}
                </span>
                <span className="text-gray-500">/mes</span>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.caracteristicas.map((c, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{c}</span>
                  </li>
                ))}
              </ul>

              {plan.key === currentPlan ? (
                <Button variant="outline" className="w-full" disabled>Plan actual</Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full hover:bg-blue-50 hover:border-blue-300"
                  disabled={!puedeCambiar}
                  onClick={() => {
                    setTarget(plan.key)
                    setOpen(true)
                  }}
                >
                  Cambiar a {plan.nombre}
                </Button>
              )}

              {!puedeCambiar && (
                <p className="text-xs text-gray-500">
                  Para cambiar de plan, primero reactivá tu suscripción.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <ChangePlanDialog
        open={open}
        onOpenChange={setOpen}
        negocioId={negocioId}
        currentPlan={currentPlan}
        targetPlan={targetPlan.key}
        targetPrice={targetPlan.precio}
        requirePayerEmail={requirePayerEmail}
      />
    </>
  )
}
