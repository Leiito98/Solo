import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckCircle2, Calendar, Clock, User, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ turno_id?: string }>
}

export default async function ReservaExitosaPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { turno_id } = await searchParams

  if (!turno_id) {
    redirect(`/negocio/${slug}`)
  }

  const supabase = await createClient()

  // Obtener datos del negocio
  const { data: negocio } = await supabase
    .from('negocios')
    .select('id, nombre, slug')
    .eq('slug', slug)
    .single()

  if (!negocio) {
    redirect('/')
  }

  // Obtener datos del turno
  const { data: turno } = await supabase
    .from('turnos')
    .select(`
      id,
      fecha,
      hora_inicio,
      hora_fin,
      pago_monto,
      servicios(nombre, precio),
      profesionales(nombre),
      clientes(nombre, email)
    `)
    .eq('id', turno_id)
    .eq('negocio_id', negocio.id)
    .single()

  if (!turno) {
    redirect(`/negocio/${slug}`)
  }

  const servicio = Array.isArray(turno.servicios) ? turno.servicios[0] : turno.servicios
  const profesional = Array.isArray(turno.profesionales) ? turno.profesionales[0] : turno.profesionales
  const cliente = Array.isArray(turno.clientes) ? turno.clientes[0] : turno.clientes

  const fechaFormateada = format(new Date(turno.fecha + 'T00:00:00'), "EEEE d 'de' MMMM", { locale: es })
  const seña = turno.pago_monto || 0
  const precioTotal = servicio?.precio || 0
  const resto = precioTotal - seña

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6 animate-in fade-in duration-500">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-300 shadow-lg">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl border-0">
          <CardContent className="p-8 space-y-6">
            {/* Title */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                ¡Pago Exitoso!
              </h1>
              <p className="text-lg text-gray-600">
                Tu turno ha sido confirmado
              </p>
            </div>

            {/* Payment Summary */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total del servicio</span>
                <span className="text-2xl font-bold text-green-600">
                  ${precioTotal.toLocaleString('es-AR')}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Seña abonada</span>
                <span className="font-semibold text-gray-700">
                  ${seña.toLocaleString('es-AR')}               
                </span>
              </div>
              <div className="pt-3 border-t border-green-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Resto a abonar en el local</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${resto.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Reservation Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg">
                Detalles de tu turno
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {fechaFormateada}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Horario</p>
                    <p className="font-semibold text-gray-900">
                      {turno.hora_inicio.slice(0, 5)} - {turno.hora_fin.slice(0, 5)} hs
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Profesional</p>
                    <p className="font-semibold text-gray-900">
                      {profesional?.nombre || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 text-center">
                📧 Enviamos los detalles a{' '}
                <strong>{cliente?.email || 'tu email'}</strong>
              </p>
            </div>

            {/* Important Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
              <p className="font-semibold text-amber-900 text-sm">
                📋 Recordá:
              </p>
              <ul className="text-sm text-amber-800 space-y-1 ml-4 list-disc">
                <li>Llevá efectivo o tarjeta para abonar ${resto.toLocaleString('es-AR')}</li>
                <li>Llegá 5 minutos antes de tu turno</li>
                <li>Recibirás un recordatorio 24hs antes</li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild className="flex-1" size="lg">
                <Link href={`/negocio/${slug}`}>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Volver al Inicio
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1" size="lg">
                <Link href={`/negocio/${slug}/reservar`}>
                  Hacer otra Reserva
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600">
          ¡Gracias por elegir <strong>{negocio.nombre}</strong>! 🎉
        </p>
      </div>
    </div>
  )
}