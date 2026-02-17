'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronLeft, Loader2, Search } from 'lucide-react'

interface ClienteData {
  dni: string
  nombre: string
  email: string
  telefono: string
}

interface ClienteStepProps {
  negocioId: string
  cliente?: Partial<ClienteData>
  onSubmit: (cliente: ClienteData) => void
  onBack: () => void
}

function normalizeDni(dni: string) {
  return String(dni || '').replace(/\D/g, '').trim()
}

export function ClienteStep({ negocioId, cliente, onSubmit, onBack }: ClienteStepProps) {
  // modo: primero DNI, después datos
  const [mode, setMode] = useState<'dni' | 'datos'>('dni')

  const [dni, setDni] = useState<string>(cliente?.dni || '')
  const [dniLocked, setDniLocked] = useState(false)

  const [loadingLookup, setLoadingLookup] = useState(false)
  const [lookupMsg, setLookupMsg] = useState<string | null>(null)

  const [formData, setFormData] = useState<ClienteData>({
    dni: cliente?.dni || '',
    nombre: cliente?.nombre || '',
    email: cliente?.email || '',
    telefono: cliente?.telefono || '',
  })

  const [errors, setErrors] = useState<Partial<ClienteData>>({})

  // si viene cliente ya pre-cargado, salto a datos
  useEffect(() => {
    if (cliente?.dni) {
      setMode('datos')
      setDniLocked(true)
    }
  }, [cliente?.dni])

  const handleChange = (field: keyof ClienteData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validateDni = () => {
    const d = normalizeDni(dni)
    if (!d) return 'El DNI es requerido'
    if (d.length < 7 || d.length > 9) return 'DNI inválido (7 a 9 dígitos)'
    return null
  }

  const buscarPorDni = async () => {
    const dniErr = validateDni()
    if (dniErr) {
      setLookupMsg(dniErr)
      return
    }

    setLoadingLookup(true)
    setLookupMsg(null)

    try {
      const dniNorm = normalizeDni(dni)

      const res = await fetch('/api/booking/cliente-por-dni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ negocio_id: negocioId, dni: dniNorm }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'No se pudo buscar el cliente')

      if (json?.found && json?.cliente) {
        // encontrado -> autocompleto y bloqueo DNI
        setFormData({
          dni: dniNorm,
          nombre: json.cliente.nombre || '',
          email: json.cliente.email || '',
          telefono: json.cliente.telefono || '',
        })
        setDni(dniNorm)
        setDniLocked(true)
        setLookupMsg('Cliente encontrado ✅ Completamos tus datos.')
      } else {
        // no encontrado -> paso a completar manual
        setFormData((p) => ({ ...p, dni: dniNorm }))
        setDni(dniNorm)
        setDniLocked(false)
        setLookupMsg('No encontramos tu DNI. Completá tus datos para registrarte.')
      }

      setMode('datos')
    } catch (e: any) {
      setLookupMsg(e?.message || 'Error buscando cliente')
    } finally {
      setLoadingLookup(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ClienteData> = {}

    const dniErr = validateDni()
    if (dniErr) newErrors.dni = dniErr

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    else if (formData.nombre.trim().length < 2) newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) newErrors.email = 'El email es requerido'
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Ingresa un email válido'

    const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido'
    else if (!phoneRegex.test(formData.telefono.trim())) newErrors.telefono = 'Ingresa un teléfono válido (ej: 11 1234-5678)'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const dniNorm = normalizeDni(formData.dni || dni)
    const payload = { ...formData, dni: dniNorm }

    if (validateForm()) {
      onSubmit(payload)
    }
  }

  // ─────────────────────────────────────────────────────────────

  if (mode === 'dni') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ingresá tu DNI</h2>
          <p className="text-gray-600">Así podemos autocompletar tus datos si ya reservaste antes.</p>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="dni" className="text-sm font-medium text-gray-700">
              DNI <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dni"
              inputMode="numeric"
              placeholder="12345678"
              value={dni}
              onChange={(e) => {
                setDni(e.target.value)
                setLookupMsg(null)
              }}
            />
            <p className="text-xs text-gray-500">Sin puntos ni espacios.</p>
          </div>

          {lookupMsg && (
            <p className="text-sm text-gray-600">{lookupMsg}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onBack} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Volver
            </Button>

            <Button type="button" className="flex-1 gap-2" onClick={buscarPorDni} disabled={loadingLookup}>
              {loadingLookup ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Continuar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tus datos</h2>
        <p className="text-gray-600">Revisá tus datos para confirmar la reserva</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* DNI */}
        <div className="space-y-2">
          <Label htmlFor="dni" className="text-sm font-medium text-gray-700">
            DNI <span className="text-red-500">*</span>
          </Label>
          <Input
            id="dni"
            inputMode="numeric"
            value={dniLocked ? dni : formData.dni}
            onChange={(e) => {
              const v = e.target.value
              setDni(v)
              handleChange('dni', v)
            }}
            disabled={dniLocked}
            className={errors.dni ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {errors.dni && <p className="text-sm text-red-500">{errors.dni}</p>}

          {!dniLocked && (
            <Button
              type="button"
              variant="outline"
              className="mt-2"
              onClick={() => {
                setMode('dni')
                setLookupMsg(null)
              }}
            >
              Cambiar DNI
            </Button>
          )}
        </div>

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
          {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
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
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
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
          {errors.telefono && <p className="text-sm text-red-500">{errors.telefono}</p>}
          <p className="text-xs text-gray-500">Recibirás un WhatsApp de confirmación</p>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Button>
          <Button type="submit" className="flex-1">
            Continuar
          </Button>
        </div>
      </form>
    </div>
  )
}
