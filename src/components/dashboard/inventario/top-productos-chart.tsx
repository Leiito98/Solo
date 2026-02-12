'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Package } from 'lucide-react'

interface TopProducto {
  nombre: string
  unidad: string
  cantidad: number
  usos: number
}

interface TopProductosChartProps {
  productos: TopProducto[]
}

export function TopProductosChart({ productos }: TopProductosChartProps) {
  if (!productos || productos.length === 0) {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top 5 Productos Más Usados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No hay datos de consumo este mes</p>
          <p className="text-sm text-gray-500 mt-1">
            Los datos aparecerán cuando completes servicios
          </p>
        </CardContent>
      </Card>
    )
  }

  const maxUsos = Math.max(...productos.map(p => p.usos))

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Top 5 Productos Más Usados (Este Mes)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {productos.map((producto, index) => {
            const percentage = (producto.usos / maxUsos) * 100
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-400 w-6">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">{producto.nombre}</p>
                      <p className="text-xs text-gray-500">
                        {producto.cantidad.toFixed(2)} {producto.unidad} consumidos
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{producto.usos}</p>
                    <p className="text-xs text-gray-500">usos</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}