'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Calendar, Clock, User, DollarSign, FileText, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type TurnoDetalle = {
  id: string
  negocio_id: string
  profesional_id: string | null
  servicio_id: string | null
  cliente_id: string | null

  fecha: string
  hora_inicio: string
  hora_fin: string
  estado: string
  pago_estado: string
  pago_monto: number | null
  notas: string | null

  profesionales: { nombre: string } | null
  servicios: { nombre: string; precio: number } | null
  clientes: { nombre: string; email: string | null; telefono: string | null } | null
}

const ESTADOS = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-500' },
  confirmado: { label: 'Confirmado', color: 'bg-green-500' },
  completado: { label: 'Completado', color: 'bg-gray-500' },
  cancelado: { label: 'Cancelado', color: 'bg-red-500' },
} as const

function formatArs(n: number) {
  return `$${Math.round(n).toLocaleString('es-AR')}`
}

function pagoLabel(estado: string) {
  switch (estado) {
    case 'pendiente':
      return { text: 'Pago pendiente', variant: 'outline' as const }
    case 'parcial':
      return { text: 'Seña abonada', variant: 'outline' as const }
    case 'pagado':
      return { text: 'Pagado', variant: 'outline' as const }
    case 'reembolsado':
      return { text: 'Reembolsado', variant: 'outline' as const }
    default:
      return { text: `Pago: ${estado}`, variant: 'outline' as const }
  }
}

export function TurnoDetailDialog({ turnoId, onClose }: { turnoId: string; onClose: () => void }) {
  const [turno, setTurno] = useState<TurnoDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // ✅ dialogs lindos
  const [confirmPayOpen, setConfirmPayOpen] = useState(false)
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  const loadTurno = useCallback(async (): Promise<TurnoDetalle | null> => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('turnos')
      .select(
        `
          *,
          profesionales(nombre),
          servicios(nombre, precio),
          clientes(nombre, email, telefono)
        `
      )
      .eq('id', turnoId)
      .single()

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
      setTurno(null)
      setLoading(false)
      return null
    }

    const t = data as TurnoDetalle
    setTurno(t)
    setLoading(false)
    return t
  }, [turnoId, toast])

  useEffect(() => {
    loadTurno()
  }, [loadTurno])

  const total = useMemo(() => Number(turno?.servicios?.precio || 0), [turno?.servicios?.precio])
  const abonado = useMemo(() => Number(turno?.pago_monto || 0), [turno?.pago_monto])
  const resto = useMemo(() => Math.max(total - abonado, 0), [total, abonado])

  const isPaid = useMemo(() => {
    return turno?.pago_estado === 'pagado' || resto === 0
  }, [turno?.pago_estado, resto])

  async function syncComisionIfNeeded(t?: TurnoDetalle | null) {
    const x = t || turno
    if (!x) return

    const isComisionable =
      x.estado === 'completado' &&
      x.pago_estado === 'pagado' &&
      Boolean(x.profesional_id)

    if (!isComisionable) return

    // best-effort: no rompemos UX si falla
    await fetch('/api/finanzas/comisiones/sync-turno', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ turno_id: x.id }),
    }).catch(() => {})
  }

  async function updateTurno(
    patch: Partial<Pick<TurnoDetalle, 'estado' | 'pago_estado' | 'pago_monto' | 'notas'>>
  ) {
    const supabase = createClient()
    setSaving(true)

    const { error } = await supabase.from('turnos').update(patch).eq('id', turnoId)

    setSaving(false)

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
      return false
    }

    toast({ title: 'Éxito', description: 'Actualizado correctamente' })
    router.refresh()

    const refreshed = await loadTurno() // ✅ refresca el dialog sin cerrarlo
    await syncComisionIfNeeded(refreshed) // ✅ genera comisión si quedó completado+pagado

    return true
  }

  async function updateEstado(nuevoEstado: string) {
    const ok = await updateTurno({ estado: nuevoEstado })
    if (ok) onClose()
  }

  function openConfirmPago() {
    if (!turno) return
    if (total <= 0) {
      toast({ title: 'Error', description: 'El servicio no tiene precio.', variant: 'destructive' })
      return
    }
    setConfirmPayOpen(true)
  }

  async function confirmarPagoRestante() {
    const ok = await updateTurno({
      pago_estado: 'pagado',
      pago_monto: total,
    })
    if (ok) setConfirmPayOpen(false)
  }

  function openConfirmCompletar() {
    if (!turno) return

    if (isPaid) {
      completarTurnoDirecto()
      return
    }

    setConfirmCompleteOpen(true)
  }

  async function completarTurnoApi() {
    setSaving(true)
    try {
      const res = await fetch(`/api/turnos/${turnoId}/completar`, { method: 'POST' })
      const json = await res.json().catch(() => ({}))
  
      if (!res.ok) {
        toast({ title: 'Error', description: json?.error || 'No se pudo completar', variant: 'destructive' })
        return false
      }
  
      // inventario.ok === true => descontó
      // inventario.ok === false => faltantes o error
      const inv = json?.inventario
      if (inv && inv.ok === false) {
        // faltantes (stock insuficiente)
        if (Array.isArray(inv.faltantes) && inv.faltantes.length > 0) {
          toast({
            title: 'Turno completado',
            description: 'Se completó el turno pero no se descontó inventario por stock insuficiente.',
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Turno completado',
            description: 'Se completó el turno, pero no se pudo descontar inventario (revisá SQL/función).',
            variant: 'destructive',
          })
        }
      } else {
        toast({ title: 'Éxito', description: 'Turno completado y stock descontado.' })
      }
  
      router.refresh()
      const refreshed = await loadTurno()
      await syncComisionIfNeeded(refreshed)
      return true
    } finally {
      setSaving(false)
    }
  }
  
  async function completarTurnoDirecto() {
    const ok = await completarTurnoApi()
    if (ok) onClose()
  }
  
  async function confirmarCompletarIgual() {
    const ok = await completarTurnoApi()
    if (ok) {
      setConfirmCompleteOpen(false)
      onClose()
    }
  }
  

  if (loading || !turno) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center py-8">Cargando...</div>
        </DialogContent>
      </Dialog>
    )
  }

  const estadoUi = ESTADOS[turno.estado as keyof typeof ESTADOS]
  const pagoUi = pagoLabel(turno.pago_estado)

  const fechaFormateada = format(new Date(`${turno.fecha}T00:00:00`), "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: es,
  })

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles del Turno</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Estado + Pago */}
            <div className="flex items-center justify-between gap-2">
              <Badge className={estadoUi?.color || 'bg-gray-400'}>{estadoUi?.label || turno.estado}</Badge>
              <Badge variant={pagoUi.variant}>{pagoUi.text}</Badge>
            </div>

            {/* Resumen de pago */}
            <div className="rounded-lg border bg-white p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-semibold">{formatArs(total)}</span>
              </div>

              <div className="flex items-center justify-between mt-1">
                <span className="text-gray-600">Abonado</span>
                <span className="font-semibold">{formatArs(abonado)}</span>
              </div>

              <div className="flex items-center justify-between mt-1">
                <span className="text-gray-600">Resta</span>
                <span className={`font-semibold ${resto > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatArs(resto)}
                </span>
              </div>
            </div>

            {/* Cliente */}
            <div className="space-y-2 border-b pb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span className="font-semibold">Cliente</span>
              </div>
              <p className="font-medium">{turno.clientes?.nombre}</p>
              {turno.clientes?.email && <p className="text-sm text-gray-600">{turno.clientes.email}</p>}
              {turno.clientes?.telefono && <p className="text-sm text-gray-600">{turno.clientes.telefono}</p>}
            </div>

            {/* Servicio */}
            <div className="space-y-2 border-b pb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span className="font-semibold">Servicio</span>
              </div>
              <p className="font-medium">{turno.servicios?.nombre}</p>
              {turno.profesionales && <p className="text-sm text-gray-600">Con: {turno.profesionales.nombre}</p>}
            </div>

            {/* Fecha y Hora */}
            <div className="space-y-2 border-b pb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="font-semibold">Fecha y Hora</span>
              </div>
              <p className="capitalize">{fechaFormateada}</p>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>
                  {turno.hora_inicio} - {turno.hora_fin}
                </span>
              </div>
            </div>

            {/* Precio */}
            <div className="space-y-2 border-b pb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">Precio</span>
              </div>
              <p className="text-2xl font-bold">{formatArs(total)}</p>
            </div>

            {/* Notas */}
            {turno.notas && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-600">Notas</p>
                <p className="text-sm">{turno.notas}</p>
              </div>
            )}

            {/* Acciones */}
            <div className="flex flex-col gap-2 pt-4">
              {turno.estado === 'pendiente' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => updateEstado('confirmado')}
                    className="flex-1"
                    disabled={saving}
                  >
                    Confirmar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => updateEstado('cancelado')}
                    className="flex-1 text-red-600"
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                </div>
              )}

              {turno.estado === 'confirmado' && (
                <>
                  {resto > 0 && turno.pago_estado !== 'pagado' && (
                    <Button variant="outline" onClick={openConfirmPago} disabled={saving}>
                      Registrar pago restante ({formatArs(resto)})
                    </Button>
                  )}

                  <Button onClick={openConfirmCompletar} className="w-full" disabled={saving}>
                    Marcar como Completado
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ Dialog: Confirmar pago restante */}
      <Dialog open={confirmPayOpen} onOpenChange={setConfirmPayOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar pago restante</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Esto va a marcar el turno como <span className="font-semibold">pagado</span> y dejar el abonado en el total
              del servicio.
            </p>

            <div className="rounded-lg border p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-semibold">{formatArs(total)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-600">Abonado</span>
                <span className="font-semibold">{formatArs(abonado)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-600">Resta</span>
                <span className="font-semibold text-red-600">{formatArs(resto)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmPayOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={confirmarPagoRestante} disabled={saving}>
                {saving ? 'Guardando…' : 'Confirmar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ Dialog: Completar turno sin pago completo */}
      <Dialog open={confirmCompleteOpen} onOpenChange={setConfirmCompleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Falta cobrar
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Todavía falta cobrar <span className="font-semibold">{formatArs(resto)}</span>. ¿Querés marcar el turno como
              <span className="font-semibold"> completado</span> igual?
            </p>

            <div className="rounded-lg border p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-semibold">{formatArs(total)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-600">Abonado</span>
                <span className="font-semibold">{formatArs(abonado)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-600">Resta</span>
                <span className="font-semibold text-red-600">{formatArs(resto)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmCompleteOpen(false)} disabled={saving}>
                Volver
              </Button>
              <Button className="flex-1" onClick={confirmarCompletarIgual} disabled={saving}>
                {saving ? 'Guardando…' : 'Completar igual'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
