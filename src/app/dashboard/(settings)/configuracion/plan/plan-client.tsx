// src/app/dashboard/(settings)/configuracion/plan/plan-client.tsx
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, CreditCard, Calendar, TrendingUp } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

type PlanKey = 'solo' | 'pro'

function ars(n: number) {
  return `$${Math.round(n).toLocaleString('es-AR')}`
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export default function PlanClient(props: {
  negocioId: string
  planKey: PlanKey
  planNombre: string
  planPrecio: number
  suscripcionEstado: string
  trialEndsAt: string | null
  trialVencido: boolean
  mpPreapprovalId: string | null
  mpStatus: string
  proximaFacturacion: string
  statusUi: { label: string; dot: string; text: string; badge: string }
  planes: Array<{
    key: PlanKey
    nombre: string
    precio: number
    descripcion: string
    caracteristicas: string[]
    actual: boolean
  }>
  puedeCambiarPlan: boolean
  requirePayerEmail: boolean
}) {
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [targetPlan, setTargetPlan] = useState<PlanKey>('solo')
  const [payerEmail, setPayerEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const target = useMemo(() => props.planes.find(p => p.key === targetPlan)!, [props.planes, targetPlan])

  async function cambiarPlan() {
    try {
      setLoading(true)

      if (props.requirePayerEmail) {
        const v = payerEmail.trim()
        if (!v || !isEmail(v)) {
          toast({
            title: 'Email inválido',
            description: 'En TEST ingresá el email del comprador de prueba de MercadoPago (test_user…@testuser.com).',
            variant: 'destructive',
          })
          setLoading(false)
          return
        }
      }

      const res = await fetch('/api/suscripcion/cambiar-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          negocio_id: props.negocioId,
          plan: targetPlan,
          payer_email: props.requirePayerEmail ? payerEmail.trim() : undefined,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'No se pudo iniciar el cambio de plan')

      const initPoint = data?.init_point as string | undefined
      if (!initPoint) throw new Error('MercadoPago no devolvió init_point')

      window.location.href = initPoint
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Error', variant: 'destructive' })
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plan y Suscripción"
        description="Gestioná tu plan, facturación y métodos de pago"
      />

      {/* Plan Actual */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Plan actual
            </CardTitle>

            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                {props.planNombre}
              </Badge>
              <Badge className={props.statusUi.badge}>
                {String(props.suscripcionEstado || '').toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Precio mensual</p>
              <p className="text-2xl font-bold text-gray-900">{ars(props.planPrecio)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Estado MercadoPago</p>
              <p className="text-lg font-semibold text-gray-900">
                {props.suscripcionEstado
                    ? props.suscripcionEstado.charAt(0).toUpperCase() +
                    props.suscripcionEstado.slice(1)
                    : '—'}
              </p>
              {props.mpPreapprovalId && (
                <p className="text-xs text-gray-500 mt-1">ID: {props.mpPreapprovalId}</p>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">
                {String(props.suscripcionEstado).toLowerCase() === 'trial'
                  ? 'Fin de prueba'
                  : 'Próxima facturación'}
              </p>
              <p className="text-lg font-semibold text-gray-900">{props.proximaFacturacion}</p>
              {String(props.suscripcionEstado).toLowerCase() === 'trial' && props.trialVencido && (
                <p className="text-xs text-red-600 mt-1">La prueba venció</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <div className={`w-2 h-2 rounded-full ${props.statusUi.dot} animate-pulse`} />
            <span className={`text-sm font-medium ${props.statusUi.text}`}>{props.statusUi.label}</span>
          </div>

          {String(props.suscripcionEstado).toLowerCase() === 'bloqueada' && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Tu acceso está bloqueado. Activá o reactivá tu suscripción para seguir usando el dashboard.
              <div className="mt-2">
                <Button asChild className="h-9">
                  <Link href="/suscripcion">Ir a suscripción</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cambiar Plan */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cambiar plan</h3>

        <div className="grid md:grid-cols-2 gap-4">
          {props.planes.map((plan) => (
            <Card
              key={plan.key}
              className={`${plan.actual ? 'border-2 border-blue-500 shadow-lg' : 'border-gray-200'}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl">{plan.nombre}</CardTitle>
                  {plan.actual && (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                      Plan actual
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">{plan.descripcion}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{ars(plan.precio)}</span>
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

                {plan.actual ? (
                  <Button variant="outline" className="w-full" disabled>
                    Plan actual
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full hover:bg-blue-50 hover:border-blue-300"
                    disabled={!props.puedeCambiarPlan}
                    onClick={() => {
                      setTargetPlan(plan.key)
                      setOpen(true)
                    }}
                  >
                    Cambiar a {plan.nombre}
                  </Button>
                )}

                {!props.puedeCambiarPlan && (
                  <p className="text-xs text-gray-500">
                    Para cambiar de plan, primero reactivá tu suscripción.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Accesos rápidos (igual a lo tuyo) */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Métodos de pago</h4>
            </div>
            <p className="text-sm text-gray-500 mb-3">Gestioná tus formas de pago</p>
            <Button variant="link" className="p-0 h-auto text-blue-600" asChild>
              <Link href="/dashboard/configuracion/plan/pagos">Ver métodos →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Facturas</h4>
            </div>
            <p className="text-sm text-gray-500 mb-3">Historial de facturación</p>
            <Button variant="link" className="p-0 h-auto text-blue-600" asChild>
              <Link href="/dashboard/configuracion/plan/facturas">Ver historial →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-red-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Cancelar plan</h4>
            </div>
            <p className="text-sm text-gray-500 mb-3">Cancelá tu suscripción cuando quieras</p>

            <Button variant="link" className="p-0 h-auto text-red-600" asChild>
              <Link href="/suscripcion?accion=cancelar">Cancelar suscripción →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal cambiar plan */}
      <Dialog open={open} onOpenChange={(v) => !loading && setOpen(v)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Cambiar a {target.nombre}</DialogTitle>
            <DialogDescription>
              Te vamos a redirigir a MercadoPago para completar el cambio.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Nuevo plan</span>
                <span className="font-semibold">{target.nombre}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-muted-foreground">Precio</span>
                <span className="font-semibold">{ars(target.precio)}/mes</span>
              </div>
            </div>

            {props.requirePayerEmail && (
              <div className="space-y-2">
                <Label>Email del comprador (MercadoPago test)</Label>
                <Input
                  placeholder="test_user_xxx@testuser.com"
                  value={payerEmail}
                  onChange={(e) => setPayerEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  En TEST, el comprador también debe ser usuario de prueba.
                </p>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Si tenés una suscripción activa, primero la cancelamos en MercadoPago y luego creamos la nueva.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={cambiarPlan} disabled={loading}>
              {loading ? 'Redirigiendo…' : 'Ir a pagar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
