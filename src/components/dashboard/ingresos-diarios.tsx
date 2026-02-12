import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { es } from 'date-fns/locale'

interface IngresosDiariosProps {
  ingresosDiarios: {
    fecha: string
    monto: number
    turnos: number
  }[]
}

export function IngresosDiarios({ ingresosDiarios }: IngresosDiariosProps) {
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

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Ingresos Últimos 7 Días
          </CardTitle>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              ${totalIngresos.toLocaleString('es-AR')}
            </p>
            <p className="text-xs text-gray-500">
              Promedio: ${promedioIngresos.toLocaleString('es-AR')}/día
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Comparación con ayer */}
          {ingresosDiarios.length >= 2 && (
            <div className={`p-4 rounded-lg ${diferenciaConAyer >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Hoy vs Ayer</p>
                  <p className={`text-2xl font-bold ${diferenciaConAyer >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {diferenciaConAyer >= 0 ? '+' : ''}${Math.abs(diferenciaConAyer).toLocaleString('es-AR')}
                  </p>
                </div>
                <div className={`flex items-center gap-2 ${diferenciaConAyer >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {diferenciaConAyer >= 0 ? (
                    <TrendingUp className="w-8 h-8" />
                  ) : (
                    <TrendingDown className="w-8 h-8" />
                  )}
                  <span className="text-xl font-bold">
                    {porcentajeDiferencia >= 0 ? '+' : ''}{porcentajeDiferencia}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Gráfico de barras simple */}
          <div className="space-y-3">
            {ingresosDiarios.map((dia, index) => {
              const porcentaje = totalIngresos > 0 
                ? (dia.monto / Math.max(...ingresosDiarios.map(d => d.monto))) * 100
                : 0
              
              const esHoy = index === 0
              const fecha = new Date(dia.fecha + 'T00:00:00')

              return (
                <div key={dia.fecha} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${esHoy ? 'text-blue-600' : 'text-gray-700'}`}>
                      {esHoy ? 'Hoy' : format(fecha, 'EEEE d/M', { locale: es })}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500 text-xs">
                        {dia.turnos} turno{dia.turnos !== 1 ? 's' : ''}
                      </span>
                      <span className={`font-bold ${esHoy ? 'text-blue-600' : 'text-gray-900'}`}>
                        ${dia.monto.toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${esHoy ? 'bg-blue-500' : 'bg-green-500'} transition-all rounded-full`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}