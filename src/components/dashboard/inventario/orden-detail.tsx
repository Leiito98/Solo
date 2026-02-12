'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type Orden = {
  id: string
  numero_orden?: string | null
  estado: 'pendiente' | 'confirmada' | 'recibida' | 'cancelada'
  total: number
  fecha_orden: string
  fecha_entrega_estimada?: string | null
  notas?: string | null
  proveedores?: { nombre?: string | null; email?: string | null; telefono?: string | null } | any
  items_orden_compra?: any[]
}

function estadoBadge(estado: string) {
  const e = String(estado || 'pendiente')
  if (e === 'recibida') return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Recibida</Badge>
  if (e === 'confirmada') return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Confirmada</Badge>
  if (e === 'cancelada') return <Badge variant="destructive">Cancelada</Badge>
  return <Badge variant="secondary">Pendiente</Badge>
}

export function OrdenDetail({ orden }: { orden: Orden }) {
  const router = useRouter()
  const { toast } = useToast()

  const [estado, setEstado] = useState<string>(orden.estado)
  const [saving, setSaving] = useState(false)

  // ✅ modal confirmación
  const [confirmOpen, setConfirmOpen] = useState(false)

  // cuando el usuario elige "recibida", guardamos el estado "pendiente de confirmar"
  const [pendingEstado, setPendingEstado] = useState<string | null>(null)

  const canSave = useMemo(() => estado && estado !== orden.estado, [estado, orden.estado])

  async function doSaveEstado(nextEstado: string) {
    setSaving(true)
    try {
      const res = await fetch(`/api/inventario/ordenes/${orden.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nextEstado }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'No se pudo actualizar')

      toast({ title: 'Estado actualizado' })
      router.refresh()
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Ocurrió un error', variant: 'destructive' })
      // volvemos al estado original si falla
      setEstado(orden.estado)
    } finally {
      setSaving(false)
    }
  }

  async function saveEstado() {
    if (!canSave) return

    // ✅ si el usuario intenta marcar "recibida", abrimos modal
    if (estado === 'recibida') {
      setPendingEstado('recibida')
      setConfirmOpen(true)
      return
    }

    await doSaveEstado(estado)
  }

  const items = Array.isArray(orden.items_orden_compra) ? orden.items_orden_compra : []

  return (
    <>
      <div className="space-y-6">
        <div className="border rounded-lg bg-white p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900">{orden.numero_orden || orden.id.slice(0, 8)}</h2>
                {estadoBadge(orden.estado)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Proveedor: <span className="font-medium text-gray-900">{orden.proveedores?.nombre || '—'}</span>
                {' • '}Fecha: {new Date(orden.fecha_orden).toLocaleDateString('es-AR')}
                {orden.fecha_entrega_estimada ? ` • Entrega: ${new Date(orden.fecha_entrega_estimada).toLocaleDateString('es-AR')}` : ''}
              </p>
              {orden.notas ? <p className="text-sm text-gray-600 mt-2">{orden.notas}</p> : null}
            </div>

            <div className="flex items-center gap-3">
              <div className="min-w-[220px]">
                <Select
                  value={estado}
                  onValueChange={(v) => {
                    // si selecciona recibida, NO abrimos el modal acá,
                    // lo abrimos recién cuando toque "Guardar"
                    setEstado(v)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="confirmada">Confirmada</SelectItem>
                    <SelectItem value="recibida">Recibida</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={saveEstado} disabled={!canSave || saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>

        <div className="border rounded-lg bg-white overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio unit.</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {items.map((it: any) => (
                <tr key={it.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{it.productos?.nombre || '—'}</td>
                  <td className="px-6 py-4 text-gray-800">
                    {Number(it.cantidad).toLocaleString('es-AR')} {it.productos?.unidad || ''}
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    ${Number(it.precio_unitario || 0).toLocaleString('es-AR')}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">
                    ${Number(it.subtotal || 0).toLocaleString('es-AR')}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="border-t">
                <td colSpan={3} className="px-6 py-4 text-right text-sm text-gray-600">Total</td>
                <td className="px-6 py-4 text-right text-xl font-bold">
                  ${Number(orden.total || 0).toLocaleString('es-AR')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ✅ Confirmación bonita para "Recibida" */}
      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open)
          // si cancela cerrando, no guardamos nada
          if (!open) setPendingEstado(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como “Recibida”</AlertDialogTitle>
            <AlertDialogDescription>
              Esto va a <span className="font-medium">sumar stock</span> de cada item automáticamente y registrar los movimientos.
              ¿Querés continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setConfirmOpen(false)
                setPendingEstado(null)
              }}
            >
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={async () => {
                const next = pendingEstado || 'recibida'
                setConfirmOpen(false)
                setPendingEstado(null)
                await doSaveEstado(next)
              }}
            >
              Sí, marcar recibida
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
