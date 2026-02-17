'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

type Profesional = {
  id: string
  nombre: string
}

type Servicio = {
  id: string
  nombre: string
  duracion_min: number
  precio: number
}

type Props = {
  negocioId: string
  profesionales: Profesional[]
  initialSlot?: { start: Date; end: Date } | null
  onClose: () => void
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function nowTimeRounded(stepMinutes = 15) {
  const d = new Date()
  const m = d.getMinutes()
  const rounded = Math.ceil(m / stepMinutes) * stepMinutes

  if (rounded === 60) {
    d.setHours(d.getHours() + 1)
    d.setMinutes(0, 0, 0)
  } else {
    d.setMinutes(rounded, 0, 0)
  }

  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function toMinutes(hhmmOrTime: string) {
  const s = String(hhmmOrTime || '').slice(0, 5) // "09:00:00" -> "09:00"
  const [h, m] = s.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function CreateTurnoDialog({ negocioId, profesionales, initialSlot, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [selectedServicio, setSelectedServicio] = useState('')
  const [selectedProfesional, setSelectedProfesional] = useState('')

  // ✅ filtros por día + hora usando horarios_trabajo
  const [fechaSeleccionada, setFechaSeleccionada] = useState('')
  const [horaInicioSeleccionada, setHoraInicioSeleccionada] = useState('')
  const [availableProfesionalIds, setAvailableProfesionalIds] = useState<string[] | null>(null)

  const router = useRouter()
  const { toast } = useToast()

  // Defaults (hora actual si NO hay initialSlot)
  const defaultFecha = useMemo(
    () => (initialSlot ? format(initialSlot.start, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')),
    [initialSlot]
  )
  const defaultHoraInicio = useMemo(
    () => (initialSlot ? format(initialSlot.start, 'HH:mm') : nowTimeRounded(15)),
    [initialSlot]
  )
  const defaultHoraFin = useMemo(
    () => (initialSlot ? format(initialSlot.end, 'HH:mm') : '10:00'),
    [initialSlot]
  )

  // ✅ inicializar estado de fecha/hora (cuando abre el modal)
  useEffect(() => {
    setFechaSeleccionada(defaultFecha)
    setHoraInicioSeleccionada(defaultHoraInicio)
  }, [defaultFecha, defaultHoraInicio])

  // Cargar servicios
  useEffect(() => {
    async function loadServicios() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('servicios')
        .select('id, nombre, duracion_min, precio')
        .eq('negocio_id', negocioId)
        .order('nombre')

      if (error) {
        console.error('loadServicios error:', error)
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
        setServicios([])
        return
      }

      if (data) setServicios(data as Servicio[])
    }
    loadServicios()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [negocioId])

  // ✅ cargar profesionales disponibles por día + hora
  useEffect(() => {
    async function loadDisponibles() {
      if (!fechaSeleccionada || !horaInicioSeleccionada) {
        setAvailableProfesionalIds(null)
        return
      }

      const d = new Date(fechaSeleccionada + 'T00:00:00')
      const diaSemana = d.getDay() // 0..6
      const horaMin = toMinutes(horaInicioSeleccionada)

      const supabase = createClient()
      const { data, error } = await supabase
        .from('horarios_trabajo')
        .select('profesional_id, hora_inicio, hora_fin')
        .eq('dia_semana', diaSemana)

      if (error) {
        console.error('loadDisponibles error:', error)
        // si falla, no bloqueamos: mostramos todos
        setAvailableProfesionalIds(null)
        return
      }

      const ids = Array.from(
        new Set(
          (data || [])
            .filter((r: any) => {
              const ini = toMinutes(r.hora_inicio)
              const fin = toMinutes(r.hora_fin)
              return horaMin >= ini && horaMin < fin
            })
            .map((r: any) => r.profesional_id)
            .filter(Boolean)
        )
      )

      setAvailableProfesionalIds(ids)
    }

    loadDisponibles()
  }, [fechaSeleccionada, horaInicioSeleccionada])

  const profesionalesDisponibles = useMemo(() => {
    if (!availableProfesionalIds) return profesionales
    return profesionales.filter((p) => availableProfesionalIds.includes(p.id))
  }, [profesionales, availableProfesionalIds])

  // si el profesional elegido deja de estar disponible, lo limpiamos
  useEffect(() => {
    if (!selectedProfesional) return
    if (!availableProfesionalIds) return
    if (!availableProfesionalIds.includes(selectedProfesional)) setSelectedProfesional('')
  }, [availableProfesionalIds, selectedProfesional])

  // Auto-calcular hora_fin según duración del servicio
  const handleServicioChange = (servicioId: string) => {
    setSelectedServicio(servicioId)
    const servicio = servicios.find((s) => s.id === servicioId)
    const horaInicioInput = document.getElementById('hora_inicio') as HTMLInputElement | null

    if (servicio && horaInicioInput?.value) {
      const [hora, min] = horaInicioInput.value.split(':')
      const inicio = new Date()
      inicio.setHours(parseInt(hora), parseInt(min), 0, 0)

      const fin = new Date(inicio.getTime() + servicio.duracion_min * 60000)
      const horaFinInput = document.getElementById('hora_fin') as HTMLInputElement | null
      if (horaFinInput) {
        horaFinInput.value = format(fin, 'HH:mm')
      }
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    // 1. Crear cliente
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .insert({
        negocio_id: negocioId,
        nombre: formData.get('cliente_nombre') as string,
        email: (formData.get('cliente_email') as string) || null,
        telefono: (formData.get('cliente_telefono') as string) || null,
      })
      .select('id')
      .single()

    if (clienteError || !cliente) {
      toast({
        title: 'Error',
        description: 'No se pudo crear el cliente',
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    // 2. Crear turno
    const { error: turnoError } = await supabase.from('turnos').insert({
      negocio_id: negocioId,
      profesional_id: selectedProfesional || null,
      cliente_id: cliente.id,
      servicio_id: selectedServicio,
      fecha: formData.get('fecha') as string,
      hora_inicio: formData.get('hora_inicio') as string,
      hora_fin: formData.get('hora_fin') as string,
      estado: 'pendiente',
      pago_estado: 'pendiente',
      notas: (formData.get('notas') as string) || null,
    })

    setLoading(false)

    if (turnoError) {
      await supabase.from('clientes').delete().eq('id', cliente.id)
      toast({
        title: 'Error',
        description: turnoError.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Éxito',
        description: 'Turno creado correctamente',
      })

      // ✅ refrescar onboarding instantáneo
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('getsolo:onboarding-refresh'))
      }
      router.refresh()
      onClose()
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Turno</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Datos del Cliente */}
          <div className="space-y-4 border-b pb-4">
            <h3 className="font-semibold">Datos del Cliente</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliente_nombre">Nombre *</Label>
                <Input id="cliente_nombre" name="cliente_nombre" placeholder="Juan Pérez" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cliente_email">Email</Label>
                <Input id="cliente_email" name="cliente_email" type="email" placeholder="juan@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cliente_telefono">Teléfono</Label>
                <Input id="cliente_telefono" name="cliente_telefono" placeholder="+54 11 1234-5678" />
              </div>
            </div>
          </div>

          {/* Detalles del Turno */}
          <div className="space-y-4">
            <h3 className="font-semibold">Detalles del Turno</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profesional_id">Profesional</Label>
                <Select value={selectedProfesional} onValueChange={setSelectedProfesional}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar profesional" />
                  </SelectTrigger>
                  <SelectContent>
                    {profesionalesDisponibles.map((prof) => (
                      <SelectItem key={prof.id} value={prof.id}>
                        {prof.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {availableProfesionalIds && profesionalesDisponibles.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    No hay profesionales disponibles para ese día y horario.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="servicio_id">Servicio *</Label>
                <Select value={selectedServicio} onValueChange={handleServicioChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicios.map((serv) => (
                      <SelectItem key={serv.id} value={serv.id}>
                        {serv.nombre} ({serv.duracion_min} min - ${serv.precio})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input
                  id="fecha"
                  name="fecha"
                  type="date"
                  defaultValue={defaultFecha}
                  onChange={(e) => setFechaSeleccionada(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hora_inicio">Hora Inicio *</Label>
                <Input
                  id="hora_inicio"
                  name="hora_inicio"
                  type="time"
                  defaultValue={defaultHoraInicio}
                  onChange={(e) => setHoraInicioSeleccionada(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hora_fin">Hora Fin *</Label>
                <Input id="hora_fin" name="hora_fin" type="time" defaultValue={defaultHoraFin} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas">Notas</Label>
              <Textarea id="notas" name="notas" placeholder="Observaciones adicionales..." rows={2} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Turno'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
