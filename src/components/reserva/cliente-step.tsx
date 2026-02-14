//app/components/reserva/cliente-step.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronLeft } from 'lucide-react'

interface ClienteData {
  nombre: string
  email: string
  telefono: string
}

interface ClienteStepProps {
  cliente?: ClienteData
  onSubmit: (cliente: ClienteData) => void
  onBack: () => void
}

export function ClienteStep({ cliente, onSubmit, onBack }: ClienteStepProps) {
  const [formData, setFormData] = useState<ClienteData>({
    nombre: cliente?.nombre || '',
    email: cliente?.email || '',
    telefono: cliente?.telefono || '',
  })

  const [errors, setErrors] = useState<Partial<ClienteData>>({})

  const handleChange = (field: keyof ClienteData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ClienteData> = {}

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Ingresa un email válido'
    }

    // Validar teléfono (Argentina: 10-13 dígitos)
    const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido'
    } else if (!phoneRegex.test(formData.telefono.trim())) {
      newErrors.telefono = 'Ingresa un teléfono válido (ej: 11 1234-5678)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tus datos
        </h2>
        <p className="text-gray-600">
          Ingresa tus datos para confirmar la reserva
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">
            Nombre completo <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nombre"
            type="text"
            placeholder="Juan Pérez"
            value={formData.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            className={errors.nombre ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {errors.nombre && (
            <p className="text-sm text-red-500">{errors.nombre}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="telefono" className="text-sm font-medium text-gray-700">
            Teléfono <span className="text-red-500">*</span>
          </Label>
          <Input
            id="telefono"
            type="tel"
            placeholder="11 1234-5678"
            value={formData.telefono}
            onChange={(e) => handleChange('telefono', e.target.value)}
            className={errors.telefono ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {errors.telefono && (
            <p className="text-sm text-red-500">{errors.telefono}</p>
          )}
          <p className="text-xs text-gray-500">
            Recibirás un WhatsApp de confirmación
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Button>
          <Button
            type="submit"
            className="flex-1"
          >
            Continuar
          </Button>
        </div>
      </form>
    </div>
  )
}