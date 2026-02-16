//components/dashboard/agenda/horarios-config-dialog.tsx
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

type Profesional = {
  id: string
  nombre: string
}

type Horario = {
  dia_semana: number
  hora_inicio: string
  hora_fin: string
  activo: boolean
}

const DIAS_SEMANA = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
]

export function HorariosConfigDialog({ 
  profesionales, 
  onClose 
}: { 
  profesionales: Profesional[]
  onClose: () => void 
}) {
  const [selectedProfesional, setSelectedProfesional] = useState(profesionales[0]?.id || '')
  const [horarios, setHorarios] = useState<Horario[]>(
    DIAS_SEMANA.map(d => ({
      dia_semana: d.value,
      hora_inicio: '09:00',
      hora_fin: '18:00',
      activo: d.value >= 1 && d.value <= 5, // Lunes a Viernes por defecto
    }))
  )
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Cargar horarios existentes
  useEffect(() => {
    if (!selectedProfesional) return

    async function loadHorarios() {
      const supabase = createClient()
      const { data } = await supabase
        .from('horarios_trabajo')
        .select('*')
        .eq('profesional_id', selectedProfesional)

      if (data && data.length > 0) {
        const horariosMap = new Map(data.map(h => [h.dia_semana, h]))
        
        setHorarios(DIAS_SEMANA.map(d => {
          const existing = horariosMap.get(d.value)
          return existing ? {
            dia_semana: existing.dia_semana,
            hora_inicio: existing.hora_inicio,
            hora_fin: existing.hora_fin,
            activo: existing.activo,
          } : {
            dia_semana: d.value,
            hora_inicio: '09:00',
            hora_fin: '18:00',
            activo: false,
          }
        }))
      }
    }

    loadHorarios()
  }, [selectedProfesional])

  const updateHorario = (dia: number, field: keyof Horario, value: any) => {
    setHorarios(prev => prev.map(h => 
      h.dia_semana === dia ? { ...h, [field]: value } : h
    ))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    // Eliminar horarios existentes
    await supabase
      .from('horarios_trabajo')
      .delete()
      .eq('profesional_id', selectedProfesional)

    // Insertar nuevos horarios (solo los activos)
    const horariosActivos = horarios.filter(h => h.activo).map(h => ({
      profesional_id: selectedProfesional,
      dia_semana: h.dia_semana,
      hora_inicio: h.hora_inicio,
      hora_fin: h.hora_fin,
      activo: true,
    }))

    const { error } = await supabase
      .from('horarios_trabajo')
      .insert(horariosActivos)

    setLoading(false)

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Éxito',
        description: 'Horarios configurados correctamente',
      })
      router.refresh()
      onClose()
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Horarios de Trabajo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Profesional</Label>
            <Select value={selectedProfesional} onValueChange={setSelectedProfesional}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {profesionales.map(prof => (
                  <SelectItem key={prof.id} value={prof.id}>
                    {prof.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">
              Configura los días y horarios de trabajo
            </p>
            
            {DIAS_SEMANA.map(dia => {
              const horario = horarios.find(h => h.dia_semana === dia.value)!
              
              return (
                <div key={dia.value} className="flex items-center gap-4 py-2 border-b last:border-0">
                  <div className="w-32 flex items-center">
                    <Checkbox
                      id={`dia-${dia.value}`}
                      checked={horario.activo}
                      onCheckedChange={(checked) => 
                        updateHorario(dia.value, 'activo', checked)
                      }
                    />
                    <Label htmlFor={`dia-${dia.value}`} className="ml-2 cursor-pointer">
                      {dia.label}
                    </Label>
                  </div>

                  {horario.activo && (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={horario.hora_inicio}
                        onChange={(e) => 
                          updateHorario(dia.value, 'hora_inicio', e.target.value)
                        }
                        className="w-32"
                      />
                      <span className="text-gray-500">a</span>
                      <Input
                        type="time"
                        value={horario.hora_fin}
                        onChange={(e) => 
                          updateHorario(dia.value, 'hora_fin', e.target.value)
                        }
                        className="w-32"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Horarios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}