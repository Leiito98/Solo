'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface IngresosDiariosProps {
  ingresosDiarios: {
    fecha: string
    monto: number
    turnos: number
  }[]
}

export function IngresosDiariosConGrafico({ ingresosDiarios }: IngresosDiariosProps) {
  // Calcular totales
  const totalIngresos = ingresosDiarios.reduce((sum, dia) => sum + dia.monto, 0)
  const promedioIngresos = ingresosDiarios.length > 0 
    ? Math.round(totalIngresos / ingresosDiarios.length)
    : 0

  // Obtener ingresos de hoy y ayer para comparar
  const hoy = ingresosDiarios[0]?.monto || 0
  const ayer = ingresosDiarios[1]?.monto || 0
  const diferenciaConAyer = hoy - ayer
  const porcentajeDiferencia = ayer > 0 ? Math.round((diferenciaConAyer / ayer) * 100) : 0

  // Preparar datos para el gráfico
  const datosGrafico = ingresosDiarios.map((dia, index) => {
    const esHoy = index === 0
    const fecha = new Date(dia.fecha + 'T00:00:00')
    
    return {
      dia: esHoy ? 'HOY' : format(fecha, 'EEE', { locale: es }).toUpperCase(),
      monto: dia.monto,
      esHoy,
    }
  }).reverse() // Invertir para que quede cronológico

  const maxMonto = Math.max(...ingresosDiarios.map(d => d.monto))

  const TrendIcon = diferenciaConAyer > 0 
    ? TrendingUp 
    : diferenciaConAyer < 0 
    ? TrendingDown 
    : Minus

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Últimos 7 Días
          </CardTitle>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              ${totalIngresos.toLocaleString('es-AR')}
            </p>
            <p className="text-xs text-gray-500">
              Prom: ${promedioIngresos.toLocaleString('es-AR')}/día
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Comparación con ayer */}
          {ingresosDiarios.length >= 2 && (
            <div 
              className={`p-4 rounded-lg border-2 ${
                diferenciaConAyer >= 0 
                  ? 'bg-green-50 border-green-200' 
                  : diferenciaConAyer < 0
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Hoy vs Ayer</p>
                  <p className={`text-3xl font-bold ${
                    diferenciaConAyer >= 0 
                      ? 'text-green-700' 
                      : diferenciaConAyer < 0
                      ? 'text-red-700'
                      : 'text-gray-700'
                  }`}>
                    {diferenciaConAyer >= 0 ? '+' : ''}
                    ${Math.abs(diferenciaConAyer).toLocaleString('es-AR')}
                  </p>
                </div>
                <div className={`flex items-center gap-2 ${
                  diferenciaConAyer >= 0 
                    ? 'text-green-600' 
                    : diferenciaConAyer < 0
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}>
                  <TrendIcon className="w-8 h-8" />
                  <span className="text-2xl font-bold">
                    {porcentajeDiferencia >= 0 ? '+' : ''}{porcentajeDiferencia}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Gráfico de barras */}
          <div className="w-full" style={{ minHeight: '180px', height: '180px' }}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={datosGrafico}>
                <XAxis 
                  dataKey="dia" 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px',
                  }}
                  formatter={(value?: number) => value !== undefined ? [`$${value.toLocaleString('es-AR')}`, 'Ingreso'] : ['Sin datos', 'Ingreso']}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Bar 
                  dataKey="monto" 
                  radius={[8, 8, 0, 0]}
                >
                  {datosGrafico.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.esHoy ? '#3b82f6' : '#10b981'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detalle de hoy */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Caja de Hoy</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {ingresosDiarios[0]?.turnos || 0} turno{ingresosDiarios[0]?.turnos !== 1 ? 's' : ''} completado{ingresosDiarios[0]?.turnos !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  ${(ingresosDiarios[0]?.monto || 0).toLocaleString('es-AR')}
                </p>
                {ingresosDiarios[0]?.turnos > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Prom: ${Math.round((ingresosDiarios[0]?.monto || 0) / ingresosDiarios[0]?.turnos).toLocaleString('es-AR')}/turno
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}