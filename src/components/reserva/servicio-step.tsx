//app/components/reserva/servicio-step.tsx
import { Button } from '@/components/ui/button'
import { Check, Clock, DollarSign } from 'lucide-react'

interface Servicio {
  id: string
  nombre: string
  descripcion?: string | null
  duracion_min: number
  precio: number
}

interface ServicioStepProps {
  servicios: Servicio[]
  selected?: Servicio
  onSelect: (servicio: Servicio) => void
}

export function ServicioStep({ servicios, selected, onSelect }: ServicioStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Selecciona un servicio
        </h2>
        <p className="text-gray-600">
          Elige el servicio que deseas reservar
        </p>
      </div>

      <div className="grid gap-4">
        {servicios.map((servicio) => {
          const isSelected = selected?.id === servicio.id

          return (
            <button
              key={servicio.id}
              onClick={() => onSelect(servicio)}
              className={`
                relative p-6 rounded-lg border-2 text-left transition-all
                hover:border-primary hover:shadow-md
                ${isSelected 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-gray-200'
                }
              `}
            >
              {/* Check Icon */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900">
                  {servicio.nombre}
                </h3>

                {servicio.descripcion && (
                  <p className="text-sm text-gray-600">
                    {servicio.descripcion}
                  </p>
                )}

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4" />
                    <span>{servicio.duracion_min} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <DollarSign className="w-4 h-4" />
                    <span>{Number(servicio.precio).toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}