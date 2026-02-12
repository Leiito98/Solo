'use client'

import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState, useMemo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Settings, Plus } from 'lucide-react'
import { CreateTurnoDialog } from './create-turno-dialog'
import { HorariosConfigDialog } from './horarios-config-dialog'
import { TurnoDetailDialog } from './turno-detail-dialog'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar-styles.css'

const locales = {
  'es': es,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales,
})

type Profesional = {
  id: string
  nombre: string
}

type Turno = {
  id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  estado: string
  profesional_id: string | null
  profesionales: { nombre: string } | null
  servicios: { nombre: string } | null
  clientes: { nombre: string } | null
}

type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  resource: {
    turnoId: string
    estado: string
    cliente: string
    servicio: string
  }
}

export function CalendarView({ 
  negocioId, 
  profesionales, 
  turnosIniciales 
}: { 
  negocioId: string
  profesionales: Profesional[]
  turnosIniciales: Turno[]
}) {
  const [selectedProfesional, setSelectedProfesional] = useState<string>('todos')

  const [view, setView] = useState<View>('week')
  const [date, setDate] = useState(new Date())
  const [showCreateTurno, setShowCreateTurno] = useState(false)
  const [showHorariosConfig, setShowHorariosConfig] = useState(false)
  const [selectedTurno, setSelectedTurno] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)

  // Convertir turnos a eventos del calendario
  const events: CalendarEvent[] = useMemo(() => {
    let turnosFiltrados = turnosIniciales

    if (selectedProfesional !== 'todos') {
      turnosFiltrados = turnosIniciales.filter(
        t => t.profesional_id === selectedProfesional
      )
    }

    return turnosFiltrados.map(turno => {
      const fecha = new Date(turno.fecha + 'T00:00:00')
      const [horaI, minI] = turno.hora_inicio.split(':')
      const [horaF, minF] = turno.hora_fin.split(':')
      
      const start = new Date(fecha)
      start.setHours(parseInt(horaI), parseInt(minI))
      
      const end = new Date(fecha)
      end.setHours(parseInt(horaF), parseInt(minF))

      return {
        id: turno.id,
        title: `${turno.clientes?.nombre || 'Sin cliente'} - ${turno.servicios?.nombre || 'Sin servicio'}`,
        start,
        end,
        resource: {
          turnoId: turno.id,
          estado: turno.estado,
          cliente: turno.clientes?.nombre || 'Sin cliente',
          servicio: turno.servicios?.nombre || 'Sin servicio',
        }
      }
    })
  }, [turnosIniciales, selectedProfesional])

  // Estilos por estado
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3b82f6' // azul por defecto
    
    switch (event.resource.estado) {
      case 'confirmado':
        backgroundColor = '#10b981' // verde
        break
      case 'completado':
        backgroundColor = '#6b7280' // gris
        break
      case 'cancelado':
        backgroundColor = '#ef4444' // rojo
        break
      case 'pendiente':
        backgroundColor = '#f59e0b' // naranja
        break
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
      }
    }
  }

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end })
    setShowCreateTurno(true)
  }

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedTurno(event.resource.turnoId)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-4">
          <Select value={selectedProfesional} onValueChange={setSelectedProfesional}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleccionar profesional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los profesionales</SelectItem>
              {profesionales.map(prof => (
                <SelectItem key={prof.id} value={prof.id}>
                  {prof.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={view === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('day')}
            >
              Día
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('week')}
            >
              Semana
            </Button>
            <Button
              variant={view === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('month')}
            >
              Mes
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowHorariosConfig(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurar Horarios Profesionales
          </Button>
          <Button onClick={() => setShowCreateTurno(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Turno
          </Button>
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="flex items-center gap-4 bg-white p-3 rounded-lg border text-sm">
        <span className="font-medium">Estados:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#f59e0b]" />
          <span>Pendiente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#10b981]" />
          <span>Confirmado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#6b7280]" />
          <span>Completado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#ef4444]" />
          <span>Cancelado</span>
        </div>
      </div>

      {/* Calendario */}
      <div className="bg-white p-4 rounded-lg border" style={{ height: 'calc(100vh - 350px)' }}>
        <Calendar
          culture="es"
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          eventPropGetter={eventStyleGetter}
          step={15}
          timeslots={4}
          min={new Date(0, 0, 0, 8, 0, 0)} // 8 AM
          max={new Date(0, 0, 0, 22, 0, 0)} // 10 PM
          messages={{
            next: 'Siguiente',
            previous: 'Anterior',
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            agenda: 'Agenda',
            date: 'Fecha',
            time: 'Hora',
            event: 'Turno',
            noEventsInRange: 'No hay turnos en este rango',
          }}
        />
      </div>

      {/* Diálogos */}
      {showCreateTurno && (
        <CreateTurnoDialog
          negocioId={negocioId}
          profesionales={profesionales}
          initialSlot={selectedSlot}
          onClose={() => {
            setShowCreateTurno(false)
            setSelectedSlot(null)
          }}
        />
      )}

      {showHorariosConfig && (
        <HorariosConfigDialog
          profesionales={profesionales}
          onClose={() => setShowHorariosConfig(false)}
        />
      )}

      {selectedTurno && (
        <TurnoDetailDialog
          turnoId={selectedTurno}
          onClose={() => setSelectedTurno(null)}
        />
      )}
    </div>
  )
}