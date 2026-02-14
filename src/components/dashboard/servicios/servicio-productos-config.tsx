//components/dashboard/servicios/servicio-productos-config
'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Save, Package, AlertCircle, DollarSign, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface Producto {
  id: string
  nombre: string
  unidad: string // 'unidades' | 'ml' | 'g'
  cantidad: number // stock total en unidad de consumo (ml/g/unidades)
  precio_unitario: number // precio por envase si es ml/g, por unidad si es unidades
  contenido_por_unidad?: number | string | null // ml/g por envase
}

interface ProductoAsociado {
  id: string
  producto_id: string
  cantidad_por_uso: number
  productos: Producto
}

interface ServicioProductosConfigProps {
  servicioId: string
  negocioId: string
  productos: Producto[]
  productosAsociados: ProductoAsociado[]
  onCancel?: () => void // ✅ si lo abrís en modal, pasás cerrarModal acá
  onSavingChange?: (saving: boolean) => void // ✅ NUEVO: para que el dialog bloquee cerrar mientras guarda
}

function toNum(v: any) {
  if (v === null || v === undefined || v === '') return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function normUnidad(u: string) {
  return String(u ?? '').trim().toLowerCase()
}

function isVolumetrico(unidad: string) {
  const u = normUnidad(unidad)
  return u === 'ml' || u === 'g'
}

// ✅ costo por uso:
// - unidades: precio_unitario * cantidad_por_uso
// - ml/g: (precio_unitario / contenido_por_unidad) * cantidad_por_uso
function costoPorUso(producto: Producto, cantidadPorUso: number) {
  const usar = toNum(cantidadPorUso)
  if (usar <= 0) return 0

  const precioUnidadCompra = toNum(producto.precio_unitario)

  if (!isVolumetrico(producto.unidad)) {
    return precioUnidadCompra * usar
  }

  const cont = toNum(producto.contenido_por_unidad)
  if (cont <= 0) return 0

  const precioPorUnidadConsumo = precioUnidadCompra / cont // $/ml o $/g
  return precioPorUnidadConsumo * usar
}

export function ServicioProductosConfig({
  servicioId,
  negocioId,
  productos,
  productosAsociados,
  onCancel,
  onSavingChange,
}: ServicioProductosConfigProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [items, setItems] = useState<
    Array<{ id?: string; producto_id: string; cantidad_por_uso: number }>
  >(
    (productosAsociados || []).map((pa) => ({
      id: pa.id,
      producto_id: pa.producto_id,
      cantidad_por_uso: toNum(pa.cantidad_por_uso),
    }))
  )

  // ✅ si el dialog vuelve a abrir y llegan props nuevas, sincronizamos items
  useEffect(() => {
    setItems(
      (productosAsociados || []).map((pa) => ({
        id: pa.id,
        producto_id: pa.producto_id,
        cantidad_por_uso: toNum(pa.cantidad_por_uso),
      }))
    )
  }, [productosAsociados])

  const [newItem, setNewItem] = useState({
    producto_id: '',
    cantidad_por_uso: 0,
  })

  // ✅ Map rápido por id (evita find repetido) + fallback desde asociados
  const productosById = useMemo(() => {
    const m = new Map<string, Producto>()
    for (const p of productos || []) m.set(p.id, p)
    for (const pa of productosAsociados || []) {
      if (pa?.productos?.id && !m.has(pa.productos.id)) m.set(pa.productos.id, pa.productos)
    }
    return m
  }, [productos, productosAsociados])

  const getProducto = (id: string) => productosById.get(id)

  const productosDisponibles = useMemo(() => {
    const usados = new Set(items.map((i) => i.producto_id))
    return (productos || []).filter((p) => !usados.has(p.id))
  }, [productos, items])

  const selectedProducto = newItem.producto_id ? getProducto(newItem.producto_id) : null
  const unidadSelected = selectedProducto?.unidad ? normUnidad(selectedProducto.unidad) : ''

  const agregarItem = () => {
    const usar = toNum(newItem.cantidad_por_uso)
    if (!newItem.producto_id || usar <= 0) {
      toast({
        variant: 'destructive',
        title: 'Falta completar',
        description: 'Seleccioná un producto y poné una cantidad por uso válida.',
      })
      return
    }

    if (items.some((i) => i.producto_id === newItem.producto_id)) {
      toast({
        variant: 'destructive',
        title: 'Ya agregado',
        description: 'Ese producto ya está asociado a este servicio.',
      })
      return
    }

    setItems([...items, { producto_id: newItem.producto_id, cantidad_por_uso: usar }])
    setNewItem({ producto_id: '', cantidad_por_uso: 0 })
  }

  const eliminarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setLoading(true)
    onSavingChange?.(true)

    try {
      const response = await fetch('/api/servicios/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servicio_id: servicioId,
          negocio_id: negocioId,
          productos: items,
        }),
      })

      const json = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(json?.error || 'Error al guardar')

      toast({
        title: 'Guardado',
        description: 'Productos asociados correctamente.',
      })

      router.refresh()
      // ✅ si está en modal, cerralo; si no, no toques navegación
      onCancel?.()
    } catch (error: any) {
      console.error(error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message || 'Error al guardar los productos',
      })
    } finally {
      setLoading(false)
      onSavingChange?.(false)
    }
  }

  // ✅ Calcular costo total de insumos
  const costoTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const p = getProducto(item.producto_id)
      if (!p) return sum
      return sum + costoPorUso(p, item.cantidad_por_uso)
    }, 0)
  }, [items, productosById])

  // ✅ Cancelar “inteligente”:
  // - si estás en modal: onCancel cierra el modal (NO router.back)
  // - si estás en página: vuelve atrás
  const handleCancel = () => {
    if (loading) return
    if (onCancel) return onCancel()
    return router.back()
  }

  return (
    <div className="space-y-6">
      {items.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Costo de Insumos por Servicio
                </p>
                <p className="text-xs text-blue-700">
                  Costo estimado según consumo (ml/g/unidades) y precio del producto.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold text-blue-900">
                  ${costoTotal.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Productos Asociados ({items.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">No hay productos asociados</p>
              <p className="text-sm text-gray-500">
                Agrega productos para que se descuenten automáticamente del inventario
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => {
                const producto = getProducto(item.producto_id)
                if (!producto) return null

                const u = normUnidad(producto.unidad)
                const volumetrico = isVolumetrico(u)

                const cont = toNum(producto.contenido_por_unidad)
                const costo = costoPorUso(producto, item.cantidad_por_uso)

                const stockActual = toNum(producto.cantidad)
                const usar = toNum(item.cantidad_por_uso)
                const stockSuficiente = stockActual >= usar

                const precioEnvase = toNum(producto.precio_unitario)
                const precioPorUnidadConsumo = volumetrico && cont > 0 ? precioEnvase / cont : 0

                return (
                  <div
                    key={`${item.producto_id}-${index}`}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{producto.nombre}</p>

                        {!stockSuficiente && (
                          <Badge variant="destructive" className="text-xs">
                            Stock insuficiente
                          </Badge>
                        )}

                        {volumetrico && cont > 0 && (
                          <Badge className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100">
                            ${precioPorUnidadConsumo.toFixed(2)}/{u}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                        <span>
                          Consumo: <strong>{usar} {u}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Costo: <strong>${costo.toLocaleString('es-AR')}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Stock: <strong>{stockActual} {u}</strong>
                        </span>
                      </div>

                      {volumetrico && cont <= 0 && (
                        <p className="text-xs text-amber-700 mt-1">
                          ⚠️ Este producto es {u} pero no tiene “contenido por unidad”. Editalo para calcular costos correctos.
                        </p>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarItem(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Quitar"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Agregar Producto
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {productosDisponibles.length === 0 ? (
            <div className="text-center py-4">
              <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No hay más productos disponibles</p>
              <p className="text-sm text-gray-500 mt-1">
                Todos los productos ya están asociados o no tienes productos creados
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label>Producto</Label>
                <Select
                  value={newItem.producto_id}
                  onValueChange={(value) => setNewItem({ ...newItem, producto_id: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {productosDisponibles.map((p) => {
                      const u = normUnidad(p.unidad)
                      return (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nombre} (Stock: {toNum(p.cantidad)} {u})
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cantidad por Uso</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItem.cantidad_por_uso || ''}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        cantidad_por_uso: toNum(e.target.value),
                      })
                    }
                    placeholder="0"
                    disabled={loading}
                  />
                  {!!newItem.producto_id && (
                    <span className="flex items-center text-sm text-gray-600 whitespace-nowrap">
                      {unidadSelected || 'unidades'}
                    </span>
                  )}
                </div>

                {selectedProducto && isVolumetrico(selectedProducto.unidad) && (
                  <p className="text-xs text-gray-500">
                    Ej: si usás 50 {unidadSelected} por turno, escribí 50.
                  </p>
                )}
              </div>

              <div className="md:col-span-3">
                <Button onClick={agregarItem} className="w-full gap-2" disabled={loading}>
                  <Plus className="w-4 h-4" />
                  Agregar Producto
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-medium mb-1">¿Cómo funciona el descuento automático?</p>
              <ul className="list-disc list-inside space-y-1 text-amber-800">
                <li>Cuando completes un turno, se descuenta el consumo configurado (ml/g/unidades).</li>
                <li>Se crea un movimiento “Salida” vinculado al turno.</li>
                <li>Si no hay stock suficiente, el turno se completa pero no se descuenta.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={loading} className="flex-1 gap-2">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar Configuración
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
