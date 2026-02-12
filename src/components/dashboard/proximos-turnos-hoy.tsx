'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { TurnoDetailDialog } from '@/components/dashboard/agenda/turno-detail-dialog'

type TurnoRow = {
  id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  estado: string
  servicios?: { nombre?: string } | null
  profesionales?: { nombre?: string } | null
  clientes?: { nombre?: string; telefono?: string | null } | null
}

export function ProximosTurnosHoy({
  tituloFecha,
  turnos,
  horaActualStr, // ✅ "HH:mm:ss" desde el server (Dashboard). Opcional.
}: {
  tituloFecha: string
  turnos: TurnoRow[]
  horaActualStr?: string
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const estadoConfig = {
    pendiente: {
      label: 'Pendiente',
      color: 'bg-yellow-100 text-yellow-800',
      icon: Clock,
    },
    confirmado: {
      label: 'Confirmado',
      color: 'bg-blue-100 text-blue-800',
      icon: CheckCircle2,
    },
    completado: {
      label: 'Completado',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle2,
    },
    cancelado: {
      label: 'Cancelado',
      color: 'bg-red-100 text-red-800',
      icon: XCircle,
    },
  } as const

  // ✅ Hora "ahora" segura (preferimos la del server).
  const nowStr = useMemo(() => {
    if (horaActualStr && /^\d{2}:\d{2}:\d{2}$/.test(horaActualStr)) return horaActualStr
    const d = new Date()
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    const ss = String(d.getSeconds()).padStart(2, '0')
    return `${hh}:${mm}:${ss}`
  }, [horaActualStr])

  // ✅ Solo turnos activos + orden: atrasados primero, luego próximos. Cupo 5.
  const turnosActivos = useMemo(() => {
    const activos = (turnos || []).filter((t) => t.estado === 'pendiente' || t.estado === 'confirmado')

    // importante: comparación lexicográfica funciona porque es "HH:mm:ss" con 2 dígitos.
    const atrasados = activos.filter((t) => String(t.hora_inicio) < nowStr)
    const proximos = activos.filter((t) => String(t.hora_inicio) >= nowStr)

    return [...atrasados, ...proximos].slice(0, 5)
  }, [turnos, nowStr])

  return (
    <>
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Próximos Turnos de Hoy</CardTitle>
            <span className="text-sm text-gray-500">{tituloFecha}</span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {turnosActivos.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 font-medium mb-1">No hay turnos pendientes para hoy</p>
              <p className="text-sm text-gray-400">Cuando haya nuevos turnos, aparecerán aquí</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {turnosActivos.map((turno) => {
                const estado =
                  estadoConfig[turno.estado as keyof typeof estadoConfig] || estadoConfig.pendiente
                const EstadoIcon = estado.icon

                const isAtrasado = String(turno.hora_inicio) < nowStr

                return (
                  <button
                    key={turno.id}
                    type="button"
                    onClick={() => setSelectedId(turno.id)}
                    className="w-full text-left p-4 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Hora */}
                        <div className="text-center min-w-[70px]">
                          <p className="text-lg font-bold text-gray-900">
                            {String(turno.hora_inicio).slice(0, 5)}
                          </p>
                          <p className="text-xs text-gray-500">{String(turno.hora_fin).slice(0, 5)}</p>
                        </div>

                        <div className="h-12 w-px bg-gray-200" />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {turno.clientes?.nombre || 'Cliente'}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {turno.servicios?.nombre || 'Servicio'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            con {turno.profesionales?.nombre || 'Profesional'}
                          </p>
                        </div>
                      </div>

                      {/* Chips */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isAtrasado && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Atrasado
                          </div>
                        )}

                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${estado.color}`}
                        >
                          <EstadoIcon className="w-3.5 h-3.5" />
                          {estado.label}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedId && <TurnoDetailDialog turnoId={selectedId} onClose={() => setSelectedId(null)} />}
    </>
  )
}
