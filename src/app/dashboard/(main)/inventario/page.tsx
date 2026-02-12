import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import {
  Package,
  AlertTriangle,
  TrendingDown,
  ShoppingCart,
  DollarSign,
} from 'lucide-react'
import Link from 'next/link'
import { InventarioTable } from '@/components/dashboard/inventario/inventario-table'
import { CreateProductoButton } from '@/components/dashboard/inventario/create-producto-button'
import { TopProductosChart } from '@/components/dashboard/inventario/top-productos-chart'
import { ProyeccionStock } from '@/components/dashboard/inventario/proyeccion-stock'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

function normUnidad(u: any) {
  return String(u ?? '').trim().toLowerCase()
}
function isConsumible(u: any) {
  const x = normUnidad(u)
  return x === 'ml' || x === 'g'
}
function n(v: any) {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

// 💡 Valor inventario consistente:
// - unidades: cantidad * precio_unitario
// - ml/g: (cantidad / contenido_por_unidad) * precio_unitario   (precio_unitario = precio por envase)
function valorProducto(p: any) {
  const cantidad = n(p.cantidad)
  const precioEnvase = n(p.precio_unitario)

  if (!isConsumible(p.unidad)) {
    return cantidad * precioEnvase
  }

  const contenido = n(p.contenido_por_unidad)
  if (contenido <= 0) return 0

  const envases = cantidad / contenido
  return envases * precioEnvase
}

export default async function InventarioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id, nombre, vertical')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) redirect('/onboarding')

  const hoy = new Date()
  const inicioMes = startOfMonth(hoy)
  const finMes = endOfMonth(hoy)

  // ==========================================
  // PRODUCTOS
  // ==========================================
  const { data: productos } = await supabase
    .from('productos')
    .select('*')
    .eq('negocio_id', negocio.id)
    .order('nombre')

  const productosList = productos || []

  const productosStockBajo =
    productosList.filter((p) => n(p.cantidad) <= n(p.alerta_stock_minimo)) || []

  // ✅ Valor inventario corregido
  const valorTotal = productosList.reduce((sum, p) => sum + valorProducto(p), 0)

  // ==========================================
  // MOVIMIENTOS DEL MES (salidas/entradas)
  // ==========================================
  const { data: movimientosMes } = await supabase
    .from('movimientos_inventario')
    .select(`
      tipo,
      cantidad,
      precio_unitario,
      producto_id,
      productos (unidad, contenido_por_unidad)
    `)
    .eq('negocio_id', negocio.id)
    .gte('created_at', inicioMes.toISOString())
    .lte('created_at', finMes.toISOString())

  const movs = movimientosMes || []

  // ✅ Consumo del mes:
  // - unidades: cantidad * precio_unitario
  // - ml/g: cantidad(ml) * (precio_envase / contenido_por_unidad)
  const consumoMes = movs
    .filter((m: any) => m.tipo === 'salida')
    .reduce((sum, m: any) => {
      const cantidad = n(m.cantidad)
      const precioEnvase = n(m.precio_unitario)

      const prod = Array.isArray(m.productos) ? m.productos[0] : m.productos
      const unidad = prod?.unidad
      const contenido = n(prod?.contenido_por_unidad)

      if (!isConsumible(unidad)) return sum + cantidad * precioEnvase

      if (contenido <= 0) return sum
      const costoPorMlOg = precioEnvase / contenido
      return sum + cantidad * costoPorMlOg
    }, 0)

  // ✅ Compras del mes (entradas):
  // - unidades: cantidad * precio_unitario
  // - ml/g: (cantidad(ml) / contenido_por_unidad) * precio_envase
  const totalComprasMes = movs
    .filter((m: any) => m.tipo === 'entrada')
    .reduce((sum, m: any) => {
      const cantidad = n(m.cantidad)
      const precioEnvase = n(m.precio_unitario)

      const prod = Array.isArray(m.productos) ? m.productos[0] : m.productos
      const unidad = prod?.unidad
      const contenido = n(prod?.contenido_por_unidad)

      if (!isConsumible(unidad)) return sum + cantidad * precioEnvase

      if (contenido <= 0) return sum
      const envases = cantidad / contenido
      return sum + envases * precioEnvase
    }, 0)

  // ==========================================
  // TOP PRODUCTOS MÁS USADOS
  // ==========================================
  const { data: topProductos } = await supabase
    .from('movimientos_inventario')
    .select(`
      producto_id,
      cantidad,
      productos (nombre, unidad)
    `)
    .eq('negocio_id', negocio.id)
    .eq('tipo', 'salida')
    .not('turno_id', 'is', null)
    .gte('created_at', inicioMes.toISOString())
    .lte('created_at', finMes.toISOString())

  const productosAgrupados = (topProductos || []).reduce((acc: any, mov: any) => {
    const producto = Array.isArray(mov.productos) ? mov.productos[0] : mov.productos
    if (!producto) return acc

    if (!acc[mov.producto_id]) {
      acc[mov.producto_id] = {
        nombre: producto.nombre,
        unidad: producto.unidad,
        cantidad: 0,
        usos: 0,
      }
    }
    acc[mov.producto_id].cantidad += n(mov.cantidad)
    acc[mov.producto_id].usos += 1
    return acc
  }, {})

  const top5Productos = Object.values(productosAgrupados || {})
    .sort((a: any, b: any) => b.usos - a.usos)
    .slice(0, 5)

  // ==========================================
  // STATS
  // ==========================================
  const stats = [
    {
      title: 'Total Productos',
      value: productosList.length,
      icon: Package,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Alertas de Stock',
      value: productosStockBajo.length,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-100',
    },
    {
      title: 'Valor del Inventario',
      value: `$${valorTotal.toLocaleString('es-AR')}`,
      icon: DollarSign,
      color: 'text-green-600 bg-green-100',
    },
    {
      title: 'Consumo del Mes',
      value: `$${consumoMes.toLocaleString('es-AR')}`,
      icon: TrendingDown,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      title: 'Compras del Mes',
      value: `$${totalComprasMes.toLocaleString('es-AR')}`,
      icon: ShoppingCart,
      color: 'text-orange-600 bg-orange-100',
    },
  ]

  return (
    <div>
      <PageHeader
        title="Inventario"
        description="Gestiona productos, stock y analiza el consumo"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Alertas de Stock Bajo */}
      {productosStockBajo.length > 0 && (
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardHeader className="border-b border-red-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Productos con Stock Bajo ({productosStockBajo.length})
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/inventario/ordenes/nueva">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Crear Orden de Compra
                </Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {productosStockBajo.slice(0, 4).map((producto: any) => (
                <div
                  key={producto.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{producto.nombre}</p>
                    <p className="text-sm text-gray-600">
                      Stock:{' '}
                      <span className="text-red-600 font-medium">
                        {producto.cantidad} {producto.unidad}
                      </span>
                      {' • '}
                      Mínimo: {producto.alerta_stock_minimo}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/inventario/productos/${producto.id}/agregar-stock`}>
                      + Stock
                    </Link>
                  </Button>
                </div>
              ))}
            </div>

            {productosStockBajo.length > 4 && (
              <div className="mt-2 text-center">
                <Button asChild variant="link" size="sm">
                  <Link href="/dashboard/inventario/productos">
                    Ver todos los {productosStockBajo.length} productos con stock bajo
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Gráficos de Análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TopProductosChart productos={top5Productos as any} />
        <ProyeccionStock productos={productosList as any} movimientos={movs as any} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Button asChild variant="outline" className="h-auto py-4">
          <Link href="/dashboard/inventario/productos" className="flex flex-col items-center gap-2">
            <Package className="w-6 h-6" />
            <span>Productos</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4">
          <Link href="/dashboard/inventario/proveedores" className="flex flex-col items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            <span>Proveedores</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4">
          <Link href="/dashboard/inventario/movimientos" className="flex flex-col items-center gap-2">
            <TrendingDown className="w-6 h-6" />
            <span>Movimientos</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4">
          <Link href="/dashboard/inventario/ordenes" className="flex flex-col items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            <span>Órdenes</span>
          </Link>
        </Button>
      </div>

      {/* Tabla de Productos */}
      <Card className="border-gray-200 shadow-sm mb-6">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Todos los Productos</CardTitle>
            <CreateProductoButton negocioId={negocio.id} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <InventarioTable productos={productosList as any} />
        </CardContent>
      </Card>
    </div>
  )
}
