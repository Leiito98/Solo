'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, AlertTriangle } from 'lucide-react'
import { TurnoDetailDialog } from '@/components/dashboard/agenda/turno-detail-dialog'

type TurnoRow = {
  id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  estado: string
  pago_estado?: string | null
  servicios?: { nombre?: string } | null
  profesionales?: { nombre?: string } | null
  clientes?: { nombre?: string; telefono?: string | null } | null
}

export function TurnosAtrasadosHoy({
  tituloFecha,
  turnos,
  max = 5,
}: {
  tituloFecha: string
  turnos: TurnoRow[]
  max?: number
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const list = useMemo(() => (turnos || []).slice(0, max), [turnos, max])

  const estadoChip = (estado: string) => {
    if (estado === 'confirmado') return 'bg-blue-100 text-blue-800'
    return 'bg-yellow-100 text-yellow-800' // pendiente
  }

  const estadoLabel = (estado: string) => {
    if (estado === 'confirmado') return 'Confirmado'
    return 'Pendiente'
  }

  return (
    <>
      <Card className="border-red-200 shadow-sm">
        <CardHeader className="border-b border-red-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Turnos Atrasados
            </CardTitle>
            <span className="text-sm text-gray-500">{tituloFecha}</span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {list.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium mb-1">No hay turnos atrasados</p>
              <p className="text-sm text-gray-400">Si se atrasa alguno, aparece acá</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {list.map((turno) => (
                <button
                  key={turno.id}
                  type="button"
                  onClick={() => setSelectedId(turno.id)}
                  className="w-full text-left p-4 hover:bg-red-50/40 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Hora */}
                      <div className="text-center min-w-[70px]">
                        <p className="text-lg font-bold text-gray-900">
                          {String(turno.hora_inicio).slice(0, 5)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {String(turno.hora_fin).slice(0, 5)}
                        </p>
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
                        <p className="text-xs text-gray-500 mt-1">
                          con {turno.profesionales?.nombre || 'Profesional'}
                        </p>
                      </div>
                    </div>

                    {/* Chips */}
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Atrasado
                      </span>
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${estadoChip(
                          turno.estado
                        )}`}
                      >
                        {estadoLabel(turno.estado)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedId && (
        <TurnoDetailDialog turnoId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </>
  )
}
