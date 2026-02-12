'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

interface FechaHoraStepProps {
  negocioId: string
  duracionMin: number
  selectedFecha?: string
  selectedHora?: string
  onSelect: (fecha: string, hora: string) => void
  onBack: () => void
}

export function FechaHoraStep({
  negocioId,
  duracionMin,
  selectedFecha,
  selectedHora,
  onSelect,
  onBack,
}: FechaHoraStepProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    selectedFecha ? new Date(selectedFecha) : null
  )
  const [slotsDisponibles, setSlotsDisponibles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Generar días de la semana actual
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))

  // Cargar slots disponibles cuando se selecciona una fecha
  useEffect(() => {
    if (selectedDate) {
      loadSlotsDisponibles()
    }
  }, [selectedDate])

  async function loadSlotsDisponibles() {
    if (!selectedDate) return

    setLoading(true)
    try {
      const fecha = format(selectedDate, 'yyyy-MM-dd')
      
      const response = await fetch(
        `/api/booking/slots-disponibles?` +
        `negocio_id=${negocioId}&` +
        `fecha=${fecha}&` +
        `duracion=${duracionMin}`
      )

      if (response.ok) {
        const data = await response.json()
        setSlotsDisponibles(data.slots || [])
      } else {
        setSlotsDisponibles([])
      }
    } catch (error) {
      console.error('Error cargando slots:', error)
      setSlotsDisponibles([])
    } finally {
      setLoading(false)
    }
  }

  function handleDateSelect(date: Date) {
    setSelectedDate(date)
  }

  function handleTimeSelect(hora: string) {
    if (selectedDate) {
      const fecha = format(selectedDate, 'yyyy-MM-dd')
      onSelect(fecha, hora)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Selecciona fecha y hora
        </h2>
        <p className="text-gray-600">
          Elige el día y horario que prefieras
        </p>
      </div>

      {/* Week Navigator */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <span className="font-medium text-gray-700">
          {format(currentWeekStart, 'MMMM yyyy', { locale: es })}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isPast = day < new Date() && !isSameDay(day, new Date())

          return (
            <button
              key={day.toISOString()}
              onClick={() => !isPast && handleDateSelect(day)}
              disabled={isPast}
              className={`
                p-3 rounded-lg text-center transition-all
                ${isPast ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100'}
                ${isSelected ? 'bg-primary text-white hover:bg-primary' : ''}
              `}
            >
              <div className="text-xs font-medium mb-1">
                {format(day, 'EEE', { locale: es })}
              </div>
              <div className="text-lg font-bold">
                {format(day, 'd')}
              </div>
            </button>
          )
        })}
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            Horarios disponibles para {format(selectedDate, "d 'de' MMMM", { locale: es })}
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : slotsDisponibles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No hay horarios disponibles para esta fecha
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {slotsDisponibles.map((hora) => {
                const isSelected = selectedHora === hora

                return (
                  <button
                    key={hora}
                    onClick={() => handleTimeSelect(hora)}
                    className={`
                      px-4 py-3 rounded-lg font-medium transition-all
                      ${isSelected 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }
                    `}
                  >
                    {hora.slice(0, 5)} {/* HH:MM */}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-start pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver
        </Button>
      </div>
    </div>
  )
}