'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, AlertCircle, TrendingDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Producto {
  id: string
  nombre: string
  unidad: string
  cantidad: number
  alerta_stock_minimo: number
  // opcional (para ml/g); no lo usamos en la proyección, pero puede venir
  contenido_por_unidad?: number | null
}

interface Movimiento {
  tipo: 'entrada' | 'salida' | 'ajuste' | string
  cantidad: number
  producto_id?: string | null
  // puede venir si lo seleccionás
  productos?: { unidad?: string | null; contenido_por_unidad?: number | null } | any
}

interface ProyeccionStockProps {
  productos: Producto[]
  movimientos: Movimiento[] // idealmente movimientos del mes actual
  diasVentana?: number // por defecto 30
}

function n(v: any) {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

function normUnidad(u: any) {
  return String(u ?? '').trim().toLowerCase()
}

function formatDias(d: number) {
  if (!Number.isFinite(d)) return '∞'
  if (d < 0) return '0'
  return String(Math.floor(d))
}

export function ProyeccionStock({ productos, movimientos, diasVentana = 30 }: ProyeccionStockProps) {
  const proyecciones = useMemo(() => {
    // 1) Consumo por producto (solo salidas) dentro de la ventana (ej: mes)
    const consumoPorProducto = new Map<string, number>()

    for (const m of movimientos || []) {
      if (m?.tipo !== 'salida') continue
      const pid = m?.producto_id
      if (!pid) continue
      consumoPorProducto.set(pid, (consumoPorProducto.get(pid) || 0) + n(m.cantidad))
    }

    // 2) Proyección por producto
    const rows = (productos || [])
      .map((p) => {
        const stockActual = n(p.cantidad)
        const consumoTotal = consumoPorProducto.get(p.id) || 0
        const consumoDiario = diasVentana > 0 ? consumoTotal / diasVentana : 0

        // Si no hubo consumo → infinito (no proyectamos agotamiento)
        const diasRestantes =
          consumoDiario > 0 ? stockActual / consumoDiario : Number.POSITIVE_INFINITY

        // flags
        const critico = Number.isFinite(diasRestantes) && diasRestantes < 7
        const advertencia = Number.isFinite(diasRestantes) && diasRestantes >= 7 && diasRestantes < 14
        const bajoMinimo = stockActual <= n(p.alerta_stock_minimo)

        return {
          id: p.id,
          nombre: p.nombre,
          unidad: p.unidad,
          stockActual,
          consumoTotal,
          consumoDiario,
          diasRestantes,
          critico,
          advertencia,
          bajoMinimo,
        }
      })
      // mostramos:
      // - los que se agotan en < 30 días
      // - o los que ya están bajo mínimo
      .filter((p) => p.bajoMinimo || (Number.isFinite(p.diasRestantes) && p.diasRestantes < 30))
      .sort((a, b) => {
        // primero los finitos más cercanos a agotarse, luego infinitos
        const af = Number.isFinite(a.diasRestantes)
        const bf = Number.isFinite(b.diasRestantes)
        if (af && bf) return a.diasRestantes - b.diasRestantes
        if (af && !bf) return -1
        if (!af && bf) return 1
        return 0
      })
      .slice(0, 5)

    return rows
  }, [productos, movimientos, diasVentana])

  if (proyecciones.length === 0) {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Proyección de Stock
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Stock suficiente para más de 30 días</p>
          <p className="text-sm text-gray-500 mt-1">
            No hay productos con proyección crítica en los próximos {diasVentana} días
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Proyección de Stock (Próximos {diasVentana} días)
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-3">
          {proyecciones.map((p) => {
            const bg =
              p.critico || p.bajoMinimo
                ? 'bg-red-50 border-red-200'
                : p.advertencia
                ? 'bg-amber-50 border-amber-200'
                : 'bg-gray-50 border-gray-200'

            const colorDias =
              p.critico || p.bajoMinimo
                ? 'text-red-600'
                : p.advertencia
                ? 'text-amber-600'
                : 'text-gray-900'

            return (
              <div key={p.id} className={`p-4 rounded-lg border-2 ${bg}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{p.nombre}</p>

                      {(p.critico || p.bajoMinimo) && (
                        <Badge variant="destructive" className="text-xs">
                          Crítico
                        </Badge>
                      )}

                      {!p.critico && !p.bajoMinimo && p.advertencia && (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">
                          Advertencia
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-600">
                      Stock actual: <strong>{p.stockActual} {p.unidad}</strong>
                    </p>

                    {p.consumoTotal > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Consumo estimado: {p.consumoTotal.toLocaleString('es-AR')} {p.unidad} / {diasVentana} días
                        {' • '}
                        {p.consumoDiario.toFixed(2)} {p.unidad}/día
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className={`text-2xl font-bold ${colorDias}`}>
                      {formatDias(p.diasRestantes)}
                    </p>
                    <p className="text-xs text-gray-500">días restantes</p>
                  </div>
                </div>

                {(p.critico || p.bajoMinimo) && (
                  <div className="flex items-center gap-2 text-xs text-red-700 mt-2 pt-2 border-t border-red-200">
                    <AlertCircle className="w-3 h-3" />
                    <span>
                      {p.bajoMinimo
                        ? 'Está por debajo del stock mínimo'
                        : 'Se agota en menos de una semana'}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Nota:</strong> La proyección se calcula por producto usando el consumo real (salidas) del período.
            Si un producto no tuvo consumo en el período, no se proyecta agotamiento.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
