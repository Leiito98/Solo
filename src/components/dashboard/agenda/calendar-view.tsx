'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Settings, Plus, Clock } from 'lucide-react'
import { CreateTurnoDialog } from './create-turno-dialog'
import { HorariosConfigDialog } from './horarios-config-dialog'
import { TurnoDetailDialog } from './turno-detail-dialog'

import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import './calendar-styles.css'

type Profesional = { id: string; nombre: string }

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

type NegocioHorario = {
  dia_semana: number
  cerrado: boolean
  hora_inicio: string | null
  hora_fin: string | null
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const run = () => setIsMobile(mq.matches)
    run()
    mq.addEventListener?.('change', run)
    return () => mq.removeEventListener?.('change', run)
  }, [])
  return isMobile
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}
function minutesToHHmm(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${pad2(h)}:${pad2(m)}`
}
function parseTimeToMinutes(t: string) {
  const [h, m] = t.split(':')
  return Number(h) * 60 + Number(m)
}
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}
function normalizeTimeToHHmmss(t: string) {
  if (!t) return '00:00:00'
  return t.length === 5 ? `${t}:00` : t
}
function toISO(fecha: string, hhmmss: string) {
  return `${fecha}T${normalizeTimeToHHmmss(hhmmss)}`
}
function estadoColor(estado: string) {
  switch (estado) {
    case 'confirmado':
      return '#10b981'
    case 'completado':
      return '#6b7280'
    case 'cancelado':
      return '#ef4444'
    case 'pendiente':
      return '#f59e0b'
    default:
      return '#3b82f6'
  }
}

const SLOT_OPTIONS = [5, 10, 15, 20, 30, 40, 45, 60] as const

export function CalendarView({
  negocioId,
  profesionales,
  turnosIniciales,
}: {
  negocioId: string
  profesionales: Profesional[]
  turnosIniciales: Turno[]
}) {
  const supabase = useMemo(() => createClient(), [])
  const isMobile = useIsMobile()

  const calendarRef = useRef<FullCalendar | null>(null)

  const [mounted, setMounted] = useState(false)

  const [selectedProfesional, setSelectedProfesional] = useState<string>('todos')
  const [slotMinutes, setSlotMinutes] = useState<(typeof SLOT_OPTIONS)[number]>(30)

  const [showCreateTurno, setShowCreateTurno] = useState(false)
  const [showHorariosConfig, setShowHorariosConfig] = useState(false)
  const [selectedTurno, setSelectedTurno] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)

  const [horarios, setHorarios] = useState<NegocioHorario[]>([])
  const [horariosLoaded, setHorariosLoaded] = useState(false)

  const [activeView, setActiveView] = useState<'timeGridWeek' | 'timeGridDay'>(
    isMobile ? 'timeGridDay' : 'timeGridWeek'
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setActiveView(isMobile ? 'timeGridDay' : 'timeGridWeek')
  }, [isMobile])

  useEffect(() => {
    const api = calendarRef.current?.getApi()
    if (!api) return
    api.changeView(activeView)
  }, [activeView])

  useEffect(() => {
    let cancelled = false
    async function loadHorarios() {
      setHorariosLoaded(false)
      const { data, error } = await supabase
        .from('negocio_horarios')
        .select('dia_semana,cerrado,hora_inicio,hora_fin')
        .eq('negocio_id', negocioId)

      if (!cancelled) {
        if (!error && data) setHorarios(data as any)
        setHorariosLoaded(true)
      }
    }
    loadHorarios()
    return () => {
      cancelled = true
    }
  }, [supabase, negocioId])

  const turnosFiltrados = useMemo(() => {
    if (selectedProfesional === 'todos') return turnosIniciales
    return turnosIniciales.filter((t) => t.profesional_id === selectedProfesional)
  }, [turnosIniciales, selectedProfesional])

  const fcEvents = useMemo(() => {
    return turnosFiltrados.map((t) => {
      const cliente = t.clientes?.nombre || 'Sin cliente'
      const servicio = t.servicios?.nombre || 'Sin servicio'

      return {
        id: t.id,
        title: `${cliente} • ${servicio}`,
        start: toISO(t.fecha, t.hora_inicio),
        end: toISO(t.fecha, t.hora_fin),
        backgroundColor: estadoColor(t.estado),
        borderColor: 'transparent',
        textColor: '#fff',
        extendedProps: { turnoId: t.id },
      }
    })
  }, [turnosFiltrados])

  const { slotMinTime, slotMaxTime } = useMemo(() => {
    if (!horariosLoaded || horarios.length === 0) {
      return { slotMinTime: '09:00:00', slotMaxTime: '21:00:00' }
    }

    const relevant = horarios.filter((h) => !h.cerrado && h.hora_inicio && h.hora_fin)
    if (relevant.length === 0) {
      return { slotMinTime: '09:00:00', slotMaxTime: '21:00:00' }
    }

    let minM = Infinity
    let maxM = -Infinity
    for (const h of relevant) {
      minM = Math.min(minM, parseTimeToMinutes(h.hora_inicio!))
      maxM = Math.max(maxM, parseTimeToMinutes(h.hora_fin!))
    }

    minM = clamp(minM, 0, 23 * 60 + 59)
    maxM = clamp(maxM + 30, 1, 24 * 60)
    if (maxM >= 24 * 60) maxM = 23 * 60 + 59

    return {
      slotMinTime: `${minutesToHHmm(minM)}:00`,
      slotMaxTime: `${minutesToHHmm(maxM)}:00`,
    }
  }, [horariosLoaded, horarios])

  const nonBusinessBgEvents = useMemo(() => {
    if (!horariosLoaded || horarios.length === 0) return []

    const map = new Map<number, NegocioHorario>()
    for (const h of horarios) map.set(h.dia_semana, h)

    const out: any[] = []
    for (let dow = 0; dow <= 6; dow++) {
      const h = map.get(dow)

      if (!h || h.cerrado || !h.hora_inicio || !h.hora_fin) {
        out.push({
          id: `nb-${dow}-all`,
          daysOfWeek: [dow],
          startTime: slotMinTime,
          endTime: slotMaxTime,
          display: 'background',
          backgroundColor: '#f3f4f6',
        })
        continue
      }

      const openStart = normalizeTimeToHHmmss(h.hora_inicio)
      const openEnd = normalizeTimeToHHmmss(h.hora_fin)

      out.push({
        id: `nb-${dow}-before`,
        daysOfWeek: [dow],
        startTime: slotMinTime,
        endTime: openStart,
        display: 'background',
        backgroundColor: '#f3f4f6',
      })

      out.push({
        id: `nb-${dow}-after`,
        daysOfWeek: [dow],
        startTime: openEnd,
        endTime: slotMaxTime,
        display: 'background',
        backgroundColor: '#f3f4f6',
      })
    }
    return out
  }, [horariosLoaded, horarios, slotMinTime, slotMaxTime])

  function goToday() {
    calendarRef.current?.getApi().today()
  }
  function goPrev() {
    calendarRef.current?.getApi().prev()
  }
  function goNext() {
    calendarRef.current?.getApi().next()
  }

  const slotDuration = `00:${pad2(slotMinutes)}:00`

  // ✅ formateadores estables (solo se usan cuando mounted=true)
  const fmtWeekday = useMemo(
    () => new Intl.DateTimeFormat('es-AR', { weekday: 'short' }),
    []
  )
  const fmtDayMonth = useMemo(
    () => new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit' }),
    []
  )

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="calendar-toolbar">
          <div className="calendar-toolbar-left">
            <Select value={selectedProfesional} onValueChange={setSelectedProfesional}>
              <SelectTrigger className="calendar-prof-select">
                <SelectValue placeholder="Seleccionar profesional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los profesionales</SelectItem>
                {profesionales.map((prof) => (
                  <SelectItem key={prof.id} value={prof.id}>
                    {prof.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="calendar-view-buttons">
              <Button variant="outline" size="sm" onClick={goToday}>
                Hoy
              </Button>
              <Button variant="outline" size="sm" onClick={goPrev}>
                Anterior
              </Button>
              <Button variant="outline" size="sm" onClick={goNext}>
                Siguiente
              </Button>

              <div className="ml-2 flex gap-2">
                <Button
                  variant={activeView === 'timeGridWeek' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveView('timeGridWeek')}
                >
                  Semana
                </Button>
                <Button
                  variant={activeView === 'timeGridDay' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveView('timeGridDay')}
                >
                  Día
                </Button>
              </div>
            </div>
          </div>

          <div className="calendar-toolbar-right">
            <Button
              variant="outline"
              onClick={() => setShowHorariosConfig(true)}
              className="calendar-btn"
            >
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Configurar Horarios Profesionales</span>
              <span className="sm:hidden">Horarios</span>
            </Button>

            <Button
              onClick={() => {
                setSelectedSlot(null)
                setShowCreateTurno(true)
              }}
              className="calendar-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Turno
            </Button>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="calendar-legend">
        <span className="font-medium">Estados:</span>
        <div className="legend-item">
          <span className="legend-dot bg-[#f59e0b]" />
          Pendiente
        </div>
        <div className="legend-item">
          <span className="legend-dot bg-[#10b981]" />
          Confirmado
        </div>
        <div className="legend-item">
          <span className="legend-dot bg-[#6b7280]" />
          Completado
        </div>
        <div className="legend-item">
          <span className="legend-dot bg-[#ef4444]" />
          Cancelado
        </div>
      </div>

      {/* ✅ Calendario */}
      <div className="bg-white rounded-lg border p-3 sm:p-4 calendar-shell-fc">
        {/* ✅ Reloj overlay */}
        <div className="fc-slot-range-button">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Clock className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="bottom">
              {SLOT_OPTIONS.map((m) => (
                <DropdownMenuItem key={m} onClick={() => setSlotMinutes(m)}>
                  {m} minutos
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ✅ Evita hydration mismatch */}
        {mounted ? (
          <FullCalendar
            ref={calendarRef}
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView={activeView}
            headerToolbar={false}
            height="100%"
            expandRows={true}
            stickyHeaderDates={true}
            nowIndicator={true}
            locale="es"
            firstDay={1}
            allDaySlot={false}
            slotMinTime={slotMinTime}
            slotMaxTime={slotMaxTime}
            slotDuration={slotDuration}
            slotLabelInterval={slotDuration}
            slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            selectable={true}
            selectMirror={true}
            events={[...fcEvents, ...nonBusinessBgEvents]}
            eventMinHeight={isMobile ? 22 : undefined}
            dayHeaderContent={(arg) => {
              const d = arg.date
              const weekday = fmtWeekday.format(d).replace('.', '')
              const dayMonth = fmtDayMonth.format(d)
              return (
                <div className="fc-mobile-dayhead">
                  <div className="fc-mobile-dayhead-w">{weekday}</div>
                  <div className="fc-mobile-dayhead-d">{dayMonth}</div>
                </div>
              )
            }}
            eventClick={(info) => {
              const turnoId = info.event.extendedProps?.turnoId as string | undefined
              if (turnoId) setSelectedTurno(turnoId)
            }}
            dateClick={(info) => {
              const start = info.date
              const end = new Date(start.getTime() + slotMinutes * 60 * 1000)
              setSelectedSlot({ start, end })
              setShowCreateTurno(true)
            }}
            select={(info) => {
              setSelectedSlot({ start: info.start, end: info.end })
              setShowCreateTurno(true)
            }}
          />
        ) : (
          <div className="fc-skeleton" />
        )}
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

      {selectedTurno && <TurnoDetailDialog turnoId={selectedTurno} onClose={() => setSelectedTurno(null)} />}
    </div>
  )
}