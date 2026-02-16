//app/components/reserva/confirmacion-step.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Scissors,
  DollarSign,
  Loader2,
  CheckCircle2,
  XCircle,
  CreditCard,
  Wallet,
  Info
} from 'lucide-react'
import { parse, format } from 'date-fns'
import { es } from 'date-fns/locale'
import confetti from 'canvas-confetti'

interface Negocio {
  id: string
  nombre: string
  slug: string
  tiene_mp?: boolean
  mp_sena_pct?: number
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

interface ClienteData {
  nombre: string
  email: string
  telefono: string
}

interface ReservaData {
  servicio?: Servicio
  profesional?: Profesional
  fecha?: string
  hora?: string
  cliente?: ClienteData
}

interface ConfirmacionStepProps {
  negocio: Negocio
  reservaData: ReservaData
  onBack: () => void
}

export function ConfirmacionStep({ negocio, reservaData, onBack }: ConfirmacionStepProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [turnoCreado, setTurnoCreado] = useState<any>(null)
  const [metodoPago, setMetodoPago] = useState<'online' | 'local'>(negocio.tiene_mp ? 'online' : 'local')

  const { servicio, profesional, fecha, hora, cliente } = reservaData

  // Calcular seña según porcentaje configurado (default 50%)
  const precioTotal = servicio?.precio || 0
  const senaPct = (negocio.mp_sena_pct ?? 50) / 100
  const seña = Math.round(precioTotal * senaPct)
  const resto = precioTotal - seña
  const esPagoCompleto = (negocio.mp_sena_pct ?? 50) === 100

  // Formatear fecha
  const fechaFormateada = fecha
    ? format(parse(fecha, "yyyy-MM-dd", new Date()), "EEEE d 'de' MMMM", { locale: es })
    : ''

  // Iniciales del profesional
  const initials = profesional?.nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'

  // Confetti cuando se confirma
  useEffect(() => {
    if (success) {
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [success])

  const handleConfirmar = async () => {
    if (!servicio) return setError('Seleccioná un servicio')
    if (!fecha || !hora) return setError('Seleccioná una fecha y horario')
    if (!profesional) return setError('Seleccioná un profesional disponible')
    if (!cliente) return setError('Completá tus datos')

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/booking/turno', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          negocio_id: negocio.id,
          servicio_id: servicio.id,
          profesional_id: profesional.id,
          fecha,
          hora_inicio: hora,
          cliente: {
            nombre: cliente.nombre,
            email: cliente.email,
            telefono: cliente.telefono,
          },
          metodo_pago: metodoPago,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
      
        if (response.status === 409) {
          throw new Error('Ese horario se acaba de ocupar. Volvé y elegí otro horario.')
        }
      
        throw new Error(data.error || 'Error al crear la reserva')
      }

      const data = await response.json()
      setTurnoCreado(data.turno)

      // Si eligió pagar online y hay link de MP, redirigir
      if (metodoPago === 'online' && data.payment_url) {
        window.location.href = data.payment_url
      } else {
        setSuccess(true)
      }
    } catch (err) {
      console.error('Error al confirmar reserva:', err)
      setError(err instanceof Error ? err.message : 'Error al confirmar la reserva')
    } finally {
      setLoading(false)
    }
  }

  // Estado de éxito (solo para pago en local)
  if (success && turnoCreado) {
    return (
      <div className="text-center space-y-6 py-8 animate-in fade-in duration-500">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-300">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="space-y-2 animate-in slide-in-from-bottom-4 duration-500 delay-100">
          <h2 className="text-3xl font-bold text-gray-900">
            ¡Reserva Confirmada!
          </h2>
          <p className="text-lg text-gray-600">
            Tu turno ha sido agendado exitosamente
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-left max-w-md mx-auto shadow-sm animate-in slide-in-from-bottom-4 duration-500 delay-200">
          <h3 className="font-semibold text-gray-900 mb-4 text-center text-lg">
            Detalles de tu reserva
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-blue-100">
              <span className="text-gray-600">Negocio:</span>
              <span className="font-medium text-gray-900">{negocio.nombre}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-blue-100">
              <span className="text-gray-600">Servicio:</span>
              <span className="font-medium text-gray-900">{servicio?.nombre || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-blue-100">
              <span className="text-gray-600">Profesional:</span>
              <span className="font-medium text-gray-900">{profesional?.nombre || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-blue-100">
              <span className="text-gray-600">Fecha:</span>
              <span className="font-medium text-gray-900 capitalize">{fechaFormateada}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Hora:</span>
              <span className="font-medium text-gray-900 text-lg">{hora}</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-500 delay-300">
          <p className="text-sm text-amber-900">
            💰 <strong>Recordatorio:</strong> Abonás el servicio completo ({' '}
            <strong>${precioTotal.toLocaleString('es-AR')}</strong>) en el local.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-500 delay-400">
          <p className="text-sm text-blue-800">
            📧 Hemos enviado un email de confirmación a <strong>{cliente?.email || 'tu correo'}</strong>
          </p>
        </div>

        <div className="max-w-md mx-auto text-left bg-gray-50 rounded-lg p-5 animate-in slide-in-from-bottom-4 duration-500 delay-500">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <span className="text-xl mr-2">📋</span>
            Próximos pasos
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-green-600 mr-2 mt-0.5">✓</span>
              <span>Revisa tu email para más detalles</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2 mt-0.5">✓</span>
              <span>Recibirás un recordatorio 24 horas antes</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2 mt-0.5">✓</span>
              <span>Traé efectivo o tarjeta para abonar en el local</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2 mt-0.5">✓</span>
              <span>Por favor llega 5 minutos antes de tu turno</span>
            </li>
          </ul>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center animate-in slide-in-from-bottom-4 duration-500 delay-600">
          <Button
            size="lg"
            onClick={() => {
              const host = window.location.host
              const isSubdomain = host.includes('.') && !host.includes('localhost') && !host.includes('ngrok')
              if (isSubdomain) {
                window.location.href = `/`
              } else {
                window.location.href = `/?slug=${negocio.slug}`
              }
            }}
            className="px-8"
          >
            Volver al Inicio
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.location.reload()}
            className="px-8"
          >
            Hacer otra Reserva
          </Button>
        </div>

        <p className="text-sm text-gray-500 pt-4 animate-in fade-in duration-500 delay-700">
          ¡Gracias por usar {negocio.nombre}! 🎉
        </p>
      </div>
    )
  }

  // Estado de confirmación
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Confirmá tu reserva
        </h2>
        <p className="text-gray-600">
          Verificá que todos los datos sean correctos
        </p>
      </div>

      {/* Resumen de la reserva */}
      <div className="space-y-4">
        {/* Servicio */}
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Scissors className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500 mb-1">Servicio</p>
            <p className="font-semibold text-gray-900">{servicio?.nombre}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {servicio?.duracion_min} min
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                ${precioTotal.toLocaleString('es-AR')}
              </span>
            </div>
          </div>
        </div>

        {/* Profesional */}
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
          <Avatar className="w-10 h-10 border-2 border-white">
            <AvatarImage src={profesional?.foto_url || undefined} />
            <AvatarFallback className="bg-primary text-white text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500 mb-1">Profesional</p>
            <p className="font-semibold text-gray-900">{profesional?.nombre}</p>
            {profesional?.especialidad && (
              <p className="text-sm text-gray-600 mt-1">{profesional.especialidad}</p>
            )}
          </div>
        </div>

        {/* Fecha y hora */}
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500 mb-1">Fecha y hora</p>
            <p className="font-semibold text-gray-900 capitalize">{fechaFormateada}</p>
            <p className="text-sm text-gray-600 mt-1">{hora} hs</p>
          </div>
        </div>

        {/* Datos del cliente */}
        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          <p className="text-sm font-medium text-gray-500">Tus datos</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900">{cliente?.nombre}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900">{cliente?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900">{cliente?.telefono}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selección de método de pago */}
      <div className="border-2 border-primary/20 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900 text-lg">
            ¿Cómo querés abonar?
          </h3>
        </div>

        <RadioGroup value={metodoPago} onValueChange={(v) => setMetodoPago(v as 'online' | 'local')}>
          {/* Opción 1: Pagar online — solo si el negocio tiene MP configurado */}
          {negocio.tiene_mp && (
            <div className="relative">
              <label
                htmlFor="online"
                className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  metodoPago === 'online'
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="online" id="online" className="mt-1" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-gray-900">
                      {esPagoCompleto ? 'Pagar Online (Recomendado)' : 'Pagar Seña Online (Recomendado)'}
                    </span>
                    {!esPagoCompleto && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        -{negocio.mp_sena_pct ?? 50}% HOY
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    {esPagoCompleto ? (
                      <p className="text-gray-600">
                        • Pagás el total <strong className="text-primary">${precioTotal.toLocaleString('es-AR')}</strong> ahora online
                      </p>
                    ) : (
                      <>
                        <p className="text-gray-600">
                          • Pagás solo <strong className="text-primary">${seña.toLocaleString('es-AR')}</strong> ahora
                        </p>
                        <p className="text-gray-600">
                          • Resto <strong>${resto.toLocaleString('es-AR')}</strong> en el local
                        </p>
                      </>
                    )}
                    <p className="text-gray-600">
                      • ✅ Tu turno queda <strong>confirmado</strong> instantáneamente
                    </p>
                    <p className="text-xs text-primary font-medium mt-2">
                      💳 Pagás seguro con MercadoPago
                    </p>
                  </div>
                </div>
              </label>
            </div>
          )}

          {/* Opción 2: Pagar en local */}
          <div className="relative">
            <label
              htmlFor="local"
              className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                metodoPago === 'local'
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-200 hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value="local" id="local" className="mt-1" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">
                    Pagar en el Local
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    • Pagás <strong>${precioTotal.toLocaleString('es-AR')}</strong> completo en el local
                  </p>
                  <p className="text-gray-600">
                    • Aceptamos efectivo y tarjeta
                  </p>
                  <p className="text-amber-600 font-medium mt-2">
                    ⚠️ Tu turno queda como <strong>pendiente de confirmación</strong>
                  </p>
                </div>
              </div>
            </label>
          </div>
        </RadioGroup>
      </div>

      {/* Info adicional según método elegido */}
      {metodoPago === 'online' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Con pago online garantizás tu turno</p>
            <p>Serás redirigido a MercadoPago para completar el pago de forma segura.</p>
          </div>
        </div>
      )}

      {metodoPago === 'local' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-medium mb-1">Importante</p>
            <p>El negocio confirmará tu turno. Si no te llega confirmación, comunicate con ellos.</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900 text-sm mb-1">Error al confirmar</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver
        </Button>
        <Button
          onClick={handleConfirmar}
          disabled={loading}
          className="flex-1 gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Procesando...
            </>
          ) : metodoPago === 'online' ? (
            <>
              <CreditCard className="w-4 h-4" />
              {esPagoCompleto
                ? `Pagar $${precioTotal.toLocaleString('es-AR')}`
                : `Pagar Seña $${seña.toLocaleString('es-AR')}`
              }
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Confirmar Reserva
            </>
          )}
        </Button>
      </div>

      {/* Nota legal */}
      <p className="text-xs text-center text-gray-500">
        Al confirmar aceptás las políticas de reserva y cancelación del negocio
      </p>
    </div>
  )
}