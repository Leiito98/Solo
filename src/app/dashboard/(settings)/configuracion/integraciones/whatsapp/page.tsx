import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Rocket, 
  Bell, 
  Calendar, 
  ArrowLeft,
  Sparkles,
  Clock
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ProximamentePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Próximamente" 
        description="Esta funcionalidad estará disponible pronto"
      />

      {/* Main Card */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <CardContent className="p-12 text-center">
          {/* Icon animado */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-purple-200 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Rocket className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Texto principal */}
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Estamos trabajando en esto
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Esta funcionalidad está en desarrollo y estará disponible muy pronto.
          </p>

          {/* Features que vienen */}
          <div className="grid md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
            <div className="p-4 rounded-lg bg-white border border-purple-100">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Nuevas funcionalidades</p>
            </div>

            <div className="p-4 rounded-lg bg-white border border-blue-100">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Más eficiencia</p>
            </div>

            <div className="p-4 rounded-lg bg-white border border-green-100">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Rocket className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Mejor experiencia</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              asChild 
              className="bg-primary hover:bg-primary/90"
            >
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Dashboard
              </Link>
            </Button>
            <Button 
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notificarme cuando esté listo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sugerencias */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  ¿Necesitás esta funcionalidad ahora?
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Contactanos y te contamos más sobre nuestro roadmap de desarrollo.
                </p>
                <Button variant="link" className="p-0 h-auto text-blue-600">
                  Contactar Soporte →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Otras funcionalidades disponibles
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Explorá todas las herramientas que ya tenés disponibles en GetSolo.
                </p>
                <Button variant="link" className="p-0 h-auto text-purple-600" asChild>
                  <Link href="/dashboard/configuracion">
                    Ver Configuración →
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline estimado (opcional) */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">
                Estimamos lanzar esta funcionalidad en los próximos meses
              </p>
              <p className="text-sm text-gray-600">
                Seguí nuestras actualizaciones por email o desde el dashboard para enterarte cuando esté lista.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}