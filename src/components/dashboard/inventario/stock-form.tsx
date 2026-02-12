'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

type Proveedor = { id: string; nombre: string }

function safeNumber(v: any) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function StockForm({
  productoId,
  productoNombre,
  proveedores,
}: {
  productoId: string
  productoNombre: string
  proveedores: Proveedor[]
}) {
  const router = useRouter()
  const { toast } = useToast()

  const [tipo, setTipo] = useState<'entrada' | 'salida' | 'ajuste'>('entrada')
  const [cantidad, setCantidad] = useState('')
  const [proveedorId, setProveedorId] = useState<string>('')
  const [motivo, setMotivo] = useState('')
  const [precioUnitario, setPrecioUnitario] = useState('')
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => {
    return safeNumber(cantidad) > 0
  }, [cantidad])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    try {
      const payload = {
        producto_id: productoId,
        tipo,
        cantidad: safeNumber(cantidad),
        proveedor_id: proveedorId || null,
        motivo: motivo.trim() || null,
        precio_unitario: safeNumber(precioUnitario),
      }

      const res = await fetch('/api/inventario/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'No se pudo registrar el movimiento')

      toast({ title: 'Stock actualizado', description: 'Se registró el movimiento correctamente.' })
      router.push('/dashboard/inventario/productos')
      router.refresh()
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Ocurrió un error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold">Movimiento de stock</CardTitle>
        <p className="text-sm text-gray-500">Producto: {productoNombre}</p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="salida">Salida</SelectItem>
                  <SelectItem value="ajuste">Ajuste (setear stock)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>
                {tipo === 'ajuste' ? 'Nuevo stock' : 'Cantidad'}
              </Label>
              <Input value={cantidad} onChange={(e) => setCantidad(e.target.value)} inputMode="numeric" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Proveedor (opcional)</Label>
              <Select value={proveedorId} onValueChange={setProveedorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin proveedor" />
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
              <Label>Precio unitario (opcional)</Label>
              <Input value={precioUnitario} onChange={(e) => setPrecioUnitario(e.target.value)} inputMode="decimal" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Motivo (opcional)</Label>
            <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej: Compra, rotura, consumo en servicio..." />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={!canSubmit || loading}>
              {loading ? 'Guardando...' : 'Registrar'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
