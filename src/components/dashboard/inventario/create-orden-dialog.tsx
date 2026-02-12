'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type Producto = {
  id: string
  nombre: string
  precio_unitario?: number | null
}

type Proveedor = {
  id: string
  nombre: string
}

type Item = {
  producto_id: string
  cantidad: string
  precio_unitario: string
}

function safeNumber(v: any) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

type Props = {
  onClose: () => void
}

export function CreateOrdenDialog({ onClose }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  const [loadingData, setLoadingData] = useState(true)
  const [productos, setProductos] = useState<Producto[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])

  const [proveedorId, setProveedorId] = useState('')
  const [fechaEntrega, setFechaEntrega] = useState('')
  const [notas, setNotas] = useState('')
  const [items, setItems] = useState<Item[]>([{ producto_id: '', cantidad: '1', precio_unitario: '' }])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadingData(true)
      try {
        const [pRes, prRes] = await Promise.all([
          fetch('/api/inventario/productos'),
          fetch('/api/inventario/proveedores'),
        ])
        const pJson = await pRes.json().catch(() => ({}))
        const prJson = await prRes.json().catch(() => ({}))
        if (!cancelled) {
          setProductos(Array.isArray(pJson?.productos) ? pJson.productos : [])
          setProveedores(Array.isArray(prJson?.proveedores) ? prJson.proveedores : [])
        }
      } catch {
        if (!cancelled) {
          setProductos([])
          setProveedores([])
        }
      } finally {
        if (!cancelled) setLoadingData(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const total = useMemo(() => {
    return items.reduce((sum, it) => sum + safeNumber(it.cantidad) * safeNumber(it.precio_unitario), 0)
  }, [items])

  const canSubmit = useMemo(() => {
    if (!proveedorId) return false
    const validItems = items.filter((it) => it.producto_id && safeNumber(it.cantidad) > 0)
    if (validItems.length === 0) return false
    return true
  }, [proveedorId, items])

  function addItem() {
    setItems((prev) => [...prev, { producto_id: '', cantidad: '1', precio_unitario: '' }])
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  function setItem(idx: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }

  function autoFillPrice(idx: number, producto_id: string) {
    const p = productos.find((x) => x.id === producto_id)
    if (!p) return
    const current = items[idx]
    if (String(current?.precio_unitario || '').trim()) return
    setItem(idx, { precio_unitario: String(safeNumber(p.precio_unitario)) })
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    try {
      const payload = {
        proveedor_id: proveedorId,
        fecha_entrega_estimada: fechaEntrega || null,
        notas: notas.trim() || null,
        items: items
          .map((it) => ({
            producto_id: it.producto_id,
            cantidad: safeNumber(it.cantidad),
            precio_unitario: safeNumber(it.precio_unitario),
          }))
          .filter((it) => it.producto_id && it.cantidad > 0),
      }

      const res = await fetch('/api/inventario/ordenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'No se pudo crear la orden')

      toast({ title: 'Orden creada', description: 'La orden quedó en estado pendiente.' })
      router.refresh()
      onClose()
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Ocurrió un error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nueva orden de compra</DialogTitle>
        </DialogHeader>

        {loadingData ? (
          <div className="py-10 text-center text-gray-500">Cargando datos...</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Proveedor *</Label>
                <Select value={proveedorId} onValueChange={setProveedorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Entrega estimada</Label>
                <Input type="date" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Notas</Label>
              <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Observaciones / condiciones" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Items *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Agregar item
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 border rounded-lg">
                    <div className="md:col-span-6">
                      <Label className="text-xs">Producto</Label>
                      <Select
                        value={it.producto_id}
                        onValueChange={(v) => {
                          setItem(idx, { producto_id: v })
                          autoFillPrice(idx, v)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {productos.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2">
                      <Label className="text-xs">Cantidad</Label>
                      <Input value={it.cantidad} onChange={(e) => setItem(idx, { cantidad: e.target.value })} inputMode="numeric" />
                    </div>

                    <div className="md:col-span-3">
                      <Label className="text-xs">Precio unit.</Label>
                      <Input
                        value={it.precio_unitario}
                        onChange={(e) => setItem(idx, { precio_unitario: e.target.value })}
                        inputMode="decimal"
                      />
                    </div>

                    <div className="md:col-span-1 flex md:items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeItem(idx)}
                        disabled={items.length === 1}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="md:col-span-12 text-right text-sm text-gray-700">
                      Subtotal:{' '}
                      <span className="font-semibold">
                        ${(safeNumber(it.cantidad) * safeNumber(it.precio_unitario)).toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end pt-1">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">${total.toLocaleString('es-AR')}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!canSubmit || loading}>
                {loading ? 'Creando...' : 'Crear orden'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
