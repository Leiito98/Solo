'use client'

import { useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

type PlanKey = 'solo' | 'pro'

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export function ChangePlanDialog({
  open,
  onOpenChange,
  negocioId,
  currentPlan,
  targetPlan,
  targetPrice,
  requirePayerEmail,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  negocioId: string
  currentPlan: PlanKey
  targetPlan: PlanKey
  targetPrice: number
  requirePayerEmail: boolean
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [payerEmail, setPayerEmail] = useState('')

  const title = useMemo(() => {
    if (currentPlan === targetPlan) return 'Tu plan actual'
    return `Cambiar a ${targetPlan.toUpperCase()}`
  }, [currentPlan, targetPlan])

  async function startCheckout() {
    try {
      setLoading(true)

      if (requirePayerEmail) {
        const v = payerEmail.trim()
        if (!v || !isEmail(v)) {
          toast({ title: 'Email inválido', description: 'Ingresá el email del comprador de MercadoPago (usuario de prueba).', variant: 'destructive' })
          setLoading(false)
          return
        }
      }

      const res = await fetch('/api/suscripcion/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          negocio_id: negocioId,
          plan: targetPlan,
          payer_email: requirePayerEmail ? payerEmail.trim() : undefined,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'No se pudo crear la suscripción')
      }

      const initPoint = data?.init_point as string | undefined
      if (!initPoint) throw new Error('MercadoPago no devolvió init_point')

      // redirige a MP
      window.location.href = initPoint
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Error', variant: 'destructive' })
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Vas a ser redirigido a MercadoPago para completar el cambio de plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Nuevo plan</span>
              <span className="font-semibold">{targetPlan.toUpperCase()}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-muted-foreground">Precio</span>
              <span className="font-semibold">${targetPrice.toLocaleString('es-AR')}/mes</span>
            </div>
          </div>

          {requirePayerEmail && (
            <div className="space-y-2">
              <Label>Email del comprador (MercadoPago test)</Label>
              <Input
                placeholder="test_user_xxx@testuser.com"
                value={payerEmail}
                onChange={(e) => setPayerEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                En modo TEST, el comprador también debe ser usuario de prueba de MercadoPago.
              </p>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Si ya tenés una suscripción activa, lo normal es que MercadoPago cree una nueva.
            (Si querés “cambio real” sin duplicados, se maneja cancelando la anterior antes de crear la nueva).
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={startCheckout} disabled={loading || currentPlan === targetPlan}>
            {loading ? 'Redirigiendo…' : 'Ir a pagar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
