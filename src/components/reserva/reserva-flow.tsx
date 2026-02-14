//app/components/reserva/reserva-flow.tsx
'use client'

import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { StepIndicator } from './step-indicator'
import { ServicioStep } from './servicio-step'
import { ProfesionalStep } from './profesional-step'
import { FechaHoraStep } from './fecha-hora-step'
import { ClienteStep } from './cliente-step'
import { ConfirmacionStep } from './confirmacion-step'

interface Negocio {
  id: string
  nombre: string
  slug: string
}

interface Servicio {
  id: string
  nombre: string
  descripcion?: string | null
  duracion_min: number
  precio: number
}

interface Profesional {
  id: string
  nombre: string
  especialidad?: string | null
  foto_url?: string | null
}

interface ReservaFlowProps {
  negocio: Negocio
  servicios: Servicio[]
  profesionales: Profesional[] // lista total (para fallback / UI)
}

export interface ReservaData {
  servicio?: Servicio
  profesional?: Profesional
  fecha?: string
  hora?: string
  cliente?: {
    nombre: string
    email: string
    telefono: string
  }
}

export function ReservaFlow({ negocio, servicios, profesionales }: ReservaFlowProps) {
  const [step, setStep] = useState(1)
  const [reservaData, setReservaData] = useState<ReservaData>({})
  const [profesDisponibles, setProfesDisponibles] = useState<Profesional[]>([])

  const totalSteps = 5
  const steps = ['Servicio', 'Fecha y Hora', 'Profesional', 'Tus Datos', 'Confirmación']

  function handleNext(data: Partial<ReservaData>) {
    setReservaData((prev) => ({ ...prev, ...data }))
    setStep((prev) => prev + 1)
  }

  function handleBack() {
    setStep((prev) => prev - 1)
  }

  async function fetchProfesionalesDisponibles(fecha: string, hora: string) {
    const duracion = reservaData.servicio?.duracion_min || 30

    const qs =
      `negocio_id=${encodeURIComponent(negocio.id)}` +
      `&fecha=${encodeURIComponent(fecha)}` +
      `&hora=${encodeURIComponent(hora)}` +
      `&duracion=${encodeURIComponent(String(duracion))}`

    const res = await fetch(`/api/booking/profesionales-disponibles?${qs}`)
    if (!res.ok) return []
    const json = await res.json().catch(() => ({}))
    return (json.profesionales || []) as Profesional[]
  }

  return (
    <div className="space-y-6">
      <StepIndicator currentStep={step} totalSteps={totalSteps} steps={steps} />

      <Card className="p-6 sm:p-8">
        {/* 1) Servicio */}
        {step === 1 && (
          <ServicioStep
            servicios={servicios}
            selected={reservaData.servicio}
            onSelect={(servicio) => {
              setReservaData((prev) => ({ ...prev, servicio }))
              setStep(2)
            }}
          />
        )}

        {/* 2) Fecha y Hora */}
        {step === 2 && (
          <FechaHoraStep
            negocioId={negocio.id}
            duracionMin={reservaData.servicio?.duracion_min || 30}
            selectedFecha={reservaData.fecha}
            selectedHora={reservaData.hora}
            onSelect={async (fecha, hora) => {
              // guardar fecha/hora
              setReservaData((prev) => ({ ...prev, fecha, hora, profesional: undefined }))

              // cargar profesionales disponibles para ese slot
              const disponibles = await fetchProfesionalesDisponibles(fecha, hora)
              setProfesDisponibles(disponibles)

              setStep(3)
            }}
            onBack={handleBack}
          />
        )}

        {/* 3) Profesional (filtrado por disponibilidad del slot elegido) */}
        {step === 3 && (
          <ProfesionalStep
            profesionales={profesDisponibles}
            selected={reservaData.profesional}
            onSelect={(profesional) => handleNext({ profesional })}
            onBack={handleBack}
          />
        )}

        {/* 4) Cliente */}
        {step === 4 && (
          <ClienteStep
            cliente={reservaData.cliente}
            onSubmit={(cliente) => handleNext({ cliente })}
            onBack={handleBack}
          />
        )}

        {/* 5) Confirmación */}
        {step === 5 && (
          <ConfirmacionStep
            negocio={negocio}
            reservaData={reservaData}
            onBack={handleBack}
          />
        )}
      </Card>
    </div>
  )
}
