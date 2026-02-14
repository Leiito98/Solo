//app/components/reserva/profesional-step.tsx
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Check, ChevronLeft, Users } from 'lucide-react'

interface Profesional {
  id: string
  nombre: string
  especialidad?: string | null
  foto_url?: string | null
}

interface ProfesionalStepProps {
  profesionales: Profesional[]
  selected?: Profesional
  onSelect: (profesional: Profesional) => void
  onBack: () => void
}

export function ProfesionalStep({ profesionales, selected, onSelect, onBack }: ProfesionalStepProps) {
  const empty = !profesionales || profesionales.length === 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecciona un profesional</h2>
        <p className="text-gray-600">
          {empty
            ? 'No hay profesionales disponibles para ese día y horario.'
            : 'Elige con quién prefieres tu turno'}
        </p>
      </div>

      {empty ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white border">
            <Users className="h-6 w-6 text-gray-600" />
          </div>

          <p className="font-medium text-gray-900 mb-1">Sin disponibilidad</p>
          <p className="text-sm text-gray-600">
            Probá con otro horario y te mostramos quién está libre.
          </p>

          <div className="mt-5 flex justify-center">
            <Button type="button" onClick={onBack} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Cambiar horario
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {profesionales.map((profesional) => {
            const isSelected = selected?.id === profesional.id
            const initials = profesional.nombre
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)

            return (
              <button
                key={profesional.id}
                onClick={() => onSelect(profesional)}
                className={`
                  relative p-6 rounded-lg border-2 text-center transition-all
                  hover:border-primary hover:shadow-md
                  ${isSelected ? 'border-primary bg-primary/5 shadow-md' : 'border-gray-200'}
                `}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}

                <Avatar className="w-20 h-20 mx-auto mb-3 border-4 border-gray-100">
                  <AvatarImage src={profesional.foto_url || undefined} />
                  <AvatarFallback className="bg-primary text-white text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <h3 className="font-bold text-gray-900 mb-1">{profesional.nombre}</h3>

                {profesional.especialidad && (
                  <p className="text-sm text-gray-600">{profesional.especialidad}</p>
                )}
              </button>
            )
          })}
        </div>
      )}

      {!empty && (
        <div className="flex justify-start pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Button>
        </div>
      )}
    </div>
  )
}
