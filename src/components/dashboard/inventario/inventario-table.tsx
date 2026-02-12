'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Package,
  AlertTriangle,
  Edit,
  Trash2,
  Search,
  ArrowUpDown,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EditProductoDialog } from '@/components/dashboard/inventario/edit-producto-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

type UnidadBase = 'unidades' | 'ml' | 'g'

interface Producto {
  id: string
  nombre: string
  // cantidad = stock (si unidades: unidades; si ml/g: stock total en ml/g)
  cantidad: number
  // unidad legacy (tu input libre) - la seguimos mostrando
  unidad: string
  // precio por unidad (unidades) o precio por envase (ml/g)
  precio_unitario: number
  alerta_stock_minimo: number

  // ✅ nuevos (si no existen, quedan undefined y no rompe)
  unidad_base?: UnidadBase | null
  contenido_por_unidad?: number | null // ej 250 (ml o g) si es consumible
}

interface InventarioTableProps {
  productos: Producto[]
}

function n(v: any) {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

function isConsumible(p: Producto) {
  const u = (p.unidad_base || p.unidad || '').toLowerCase()
  return u === 'ml' || u === 'g'
}

function unidadConsumible(p: Producto) {
  const u = (p.unidad_base || p.unidad || '').toLowerCase()
  return (u === 'ml' ? 'ml' : u === 'g' ? 'g' : 'unidades') as UnidadBase
}

function formatARS(v: number) {
  return `$${Math.round(v).toLocaleString('es-AR')}`
}

export function InventarioTable({ productos }: InventarioTableProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<'nombre' | 'cantidad'>('nombre')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const [editProducto, setEditProducto] = useState<Producto | null>(null)

  // ✅ delete flow
  const [deleteProducto, setDeleteProducto] = useState<Producto | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filteredProductos = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return productos
    return productos.filter((p) => p.nombre.toLowerCase().includes(q))
  }, [productos, searchTerm])

  const sortedProductos = useMemo(() => {
    return [...filteredProductos].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (sortField === 'nombre') {
        return sortDirection === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue))
      } else {
        return sortDirection === 'asc'
          ? n(aValue) - n(bValue)
          : n(bValue) - n(aValue)
      }
    })
  }, [filteredProductos, sortField, sortDirection])

  const toggleSort = (field: 'nombre' | 'cantidad') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  async function confirmDelete() {
    if (!deleteProducto) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/inventario/productos/${deleteProducto.id}`, {
        method: 'DELETE',
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast({
          variant: 'destructive',
          title: 'No se pudo eliminar',
          description:
            json?.error || 'El producto no se pudo eliminar. Probá de nuevo.',
        })
        return
      }

      toast({
        title: 'Producto eliminado',
        description: deleteProducto.nombre,
      })

      setDeleteProducto(null)
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  if (productos.length === 0) {
    return (
      <div className="p-8 text-center">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 font-medium mb-2">
          No hay productos en el inventario
        </p>
        <p className="text-sm text-gray-400">
          Agrega tu primer producto para empezar
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => toggleSort('nombre')}
                  className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  Producto
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => toggleSort('cantidad')}
                  className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  Stock
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio Unit.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {sortedProductos.map((producto) => {
              const consumible = isConsumible(producto)
              const unidadBase = unidadConsumible(producto)

              // ✅ stock mostrado: si consumible mostramos ml/g, si no, unidades
              const stock = n(producto.cantidad)

              // ✅ precio mostrado:
              // - si consumible y hay contenido_por_unidad: mostramos $/ml o $/g (además del $/envase como tooltip mental)
              // - si no: mostramos precio_unitario tal cual
              const contenido = n(producto.contenido_por_unidad)
              const precioEnvase = n(producto.precio_unitario)
              const precioPorUnidadBase =
                consumible && contenido > 0 ? precioEnvase / contenido : precioEnvase

              // ✅ stock mínimo:
              // - si consumible: idealmente stockMin también en ml/g (guardarlo así)
              // - si no: en unidades
              const stockMin = n(producto.alerta_stock_minimo)
              const stockBajo = stock <= stockMin

              // ✅ valor total:
              // - si consumible: valor = stock * ($/ml)
              // - si no: valor = stock * ($/unidad)
              const valorTotal = stock * precioPorUnidadBase

              return (
                <tr key={producto.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{producto.nombre}</p>
                        <p className="text-sm text-gray-500">
                          {consumible
                            ? `${unidadBase}${contenido > 0 ? ` • envase ${contenido}${unidadBase}` : ''}`
                            : producto.unidad}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {stockBajo && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      <span className={`font-medium ${stockBajo ? 'text-red-600' : 'text-gray-900'}`}>
                        {stock.toLocaleString('es-AR')}
                        {consumible ? ` ${unidadBase}` : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Mín: {stockMin.toLocaleString('es-AR')}
                      {consumible ? ` ${unidadBase}` : ''}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-gray-900">
                    {consumible && contenido > 0 ? (
                      <div>
                        <div className="font-medium">{formatARS(precioPorUnidadBase)} / {unidadBase}</div>
                        <div className="text-xs text-gray-500">Envase: {formatARS(precioEnvase)}</div>
                      </div>
                    ) : (
                      <span>{formatARS(precioEnvase)}</span>
                    )}
                  </td>

                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {formatARS(valorTotal)}
                  </td>

                  <td className="px-6 py-4">
                    {stockBajo ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Stock Bajo
                      </Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                        Stock OK
                      </Badge>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditProducto(producto)} title="Editar">
                      <Edit className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteProducto(producto)}
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editProducto && (
        <EditProductoDialog
          producto={editProducto as any}
          onClose={() => setEditProducto(null)}
        />
      )}

      {/* Delete dialog */}
      <Dialog open={!!deleteProducto} onOpenChange={(open) => !open && setDeleteProducto(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar producto</DialogTitle>
          </DialogHeader>

          <div className="text-sm text-gray-600">
            ¿Seguro que querés eliminar{' '}
            <span className="font-semibold text-gray-900">{deleteProducto?.nombre}</span>?
            <br />
            Esta acción no se puede deshacer.
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteProducto(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
