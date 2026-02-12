'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Producto = {
  id: string
  nombre: string
  cantidad: number // ✅ stock en unidad de consumo (unidades/ml/g)
  unidad: string   // 'unidades' | 'ml' | 'g'
  precio_unitario: number // ✅ precio por unidad comprada (pote/botella) cuando unidad = ml/g
  alerta_stock_minimo: number
  contenido_por_unidad?: number | null // ✅ solo para ml/g (ej: 250)
}

type Props = {
  negocioId?: string
  mode: 'create' | 'edit'
  producto?: Partial<Producto> | null
  onSuccess?: () => void
  onCancel?: () => void
}

function safeNumber(v: any) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function normUnidad(u: string) {
  return (u || '').trim().toLowerCase()
}

function isVolumetrico(u: string) {
  const x = normUnidad(u)
  return x === 'ml' || x === 'g'
}

export function ProductoForm({ mode, producto, onSuccess, onCancel }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  const isEdit = mode === 'edit'

  const [nombre, setNombre] = useState(producto?.nombre || '')
  const [unidad, setUnidad] = useState(producto?.unidad || 'unidades')

  // ✅ Para ml/g: precio por pote/botella (1 unidad comprada)
  const [precio, setPrecio] = useState(String(producto?.precio_unitario ?? 0))
  const [stockMin, setStockMin] = useState(String(producto?.alerta_stock_minimo ?? 5))

  // ✅ Nuevo: contenido por unidad (solo ml/g)
  const [contenidoPorUnidad, setContenidoPorUnidad] = useState(
    String((producto as any)?.contenido_por_unidad ?? '')
  )

  // ✅ Para crear:
  // - si unidades: cantidad inicial (unidades)
  // - si ml/g: unidades compradas inicialmente (potes/botellas)
  const [cantidadInicial, setCantidadInicial] = useState(String(producto?.cantidad ?? 0))

  const [loading, setLoading] = useState(false)

  const volumetrico = isVolumetrico(unidad)

  const cantidadPreview = useMemo(() => {
    if (isEdit) return null
    const base = safeNumber(cantidadInicial)

    if (!volumetrico) return base // unidades

    const cont = safeNumber(contenidoPorUnidad)
    if (cont <= 0) return 0
    // base = unidades compradas
    return base * cont // stock total en ml/g
  }, [cantidadInicial, contenidoPorUnidad, volumetrico, isEdit])

  const canSubmit = useMemo(() => {
    if (!nombre.trim()) return false
    if (safeNumber(precio) < 0) return false
    if (safeNumber(stockMin) < 0) return false

    if (volumetrico) {
      // contenido por unidad requerido
      if (safeNumber(contenidoPorUnidad) <= 0) return false
    }

    if (!isEdit) {
      if (safeNumber(cantidadInicial) < 0) return false
      if (volumetrico && safeNumber(cantidadInicial) === 0) return false // 0 potes no tiene sentido
    }

    return true
  }, [nombre, precio, stockMin, cantidadInicial, isEdit, volumetrico, contenidoPorUnidad])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    try {
      const payload: any = {
        nombre: nombre.trim(),
        unidad: normUnidad(unidad) || 'unidades',
        precio_unitario: safeNumber(precio),
        alerta_stock_minimo: safeNumber(stockMin),
        contenido_por_unidad: volumetrico ? safeNumber(contenidoPorUnidad) : null,
      }

      // ✅ cantidad se guarda SIEMPRE en unidad de consumo:
      // - unidades => cantidadInicial
      // - ml/g => (unidades compradas * contenido_por_unidad)
      if (!isEdit) {
        payload.cantidad = volumetrico ? safeNumber(cantidadPreview) : safeNumber(cantidadInicial)
      }

      const res = await fetch(
        isEdit ? `/api/inventario/productos/${producto?.id}` : '/api/inventario/productos',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'No se pudo guardar')

      toast({
        title: isEdit ? 'Producto actualizado' : 'Producto creado',
        description: isEdit ? 'Los cambios se guardaron correctamente.' : 'Ya está en tu inventario.',
      })

      router.refresh()

      if (onSuccess) return onSuccess()
      router.push('/dashboard/inventario/productos')
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Ocurrió un error',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold">
          {isEdit ? 'Datos del producto' : 'Nuevo producto'}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-2">
            <Label>Nombre</Label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Shampoo, Cera, Peines"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Unidad (consumo)</Label>
              <Input
                value={unidad}
                onChange={(e) => setUnidad(e.target.value)}
                placeholder="unidades, ml, g"
              />
              <p className="text-xs text-gray-500">
                Para cremas/shampoo usá <b>ml</b> (o <b>g</b>).
              </p>
            </div>

            <div className="grid gap-2">
              <Label>Stock mínimo (alerta)</Label>
              <Input value={stockMin} onChange={(e) => setStockMin(e.target.value)} inputMode="numeric" />
              <p className="text-xs text-gray-500">
                {volumetrico ? 'Ej: 200 (ml/g)' : 'Ej: 5 (unidades)'}
              </p>
            </div>
          </div>

          {/* ✅ SOLO ml/g: contenido por unidad comprada */}
          {volumetrico && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Contenido por unidad</Label>
                <Input
                  value={contenidoPorUnidad}
                  onChange={(e) => setContenidoPorUnidad(e.target.value)}
                  inputMode="decimal"
                  placeholder="Ej: 250"
                />
                <p className="text-xs text-gray-500">
                  Ej: un pote trae 250 {normUnidad(unidad)}.
                </p>
              </div>

              {!isEdit && (
                <div className="grid gap-2">
                  <Label>Unidades compradas (stock inicial)</Label>
                  <Input
                    value={cantidadInicial}
                    onChange={(e) => setCantidadInicial(e.target.value)}
                    inputMode="numeric"
                    placeholder="Ej: 3"
                  />
                  <p className="text-xs text-gray-500">
                    Stock total: <b>{Number(cantidadPreview || 0).toLocaleString('es-AR')}</b> {normUnidad(unidad)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ✅ unidades: cantidad inicial normal */}
          {!isEdit && !volumetrico && (
            <div className="grid gap-2">
              <Label>Cantidad inicial</Label>
              <Input
                value={cantidadInicial}
                onChange={(e) => setCantidadInicial(e.target.value)}
                inputMode="numeric"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label>Precio unitario</Label>
            <Input value={precio} onChange={(e) => setPrecio(e.target.value)} inputMode="decimal" />
            <p className="text-xs text-gray-500">
              {volumetrico
                ? 'Precio del pote/botella (1 unidad comprada).'
                : 'Precio por unidad.'}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={!canSubmit || loading}>
              {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (onCancel) return onCancel()
                return router.back()
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
