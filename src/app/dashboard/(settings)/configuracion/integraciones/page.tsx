import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Calendar, 
  MessageSquare, 
  Mail, 
  Instagram,
  Facebook,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ExternalLink,
  Settings
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function IntegracionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // Simular estado de integraciones
  const integraciones = [
    {
      id: 'mercadopago',
      nombre: 'MercadoPago',
      descripcion: 'Procesá pagos y cobrá señas online de forma segura',
      categoria: 'Pagos',
      icon: CreditCard,
      conectado: true,
      esencial: true,
      color: 'blue',
      href: '/dashboard/configuracion/integraciones/mercadopago',
      detalles: 'Cuenta conectada - últimos 4: 1234'
    },
    {
      id: 'google-calendar',
      nombre: 'Google Calendar',
      descripcion: 'Sincronizá tus turnos automáticamente con Google Calendar',
      categoria: 'Productividad',
      icon: Calendar,
      conectado: false,
      esencial: false,
      color: 'red',
      href: '/dashboard/configuracion/integraciones/google',
      detalles: null,
      proximamente: true
    },
    {
      id: 'whatsapp',
      nombre: 'WhatsApp Business',
      descripcion: 'Enviá confirmaciones y recordatorios por WhatsApp',
      categoria: 'Comunicación',
      icon: MessageSquare,
      conectado: false,
      esencial: false,
      color: 'green',
      href: '/dashboard/configuracion/integraciones/whatsapp',
      detalles: null,
      proximamente: true
    },
    {
      id: 'mailchimp',
      nombre: 'Mailchimp',
      descripcion: 'Sincronizá tu lista de clientes y enviá campañas de email',
      categoria: 'Marketing',
      icon: Mail,
      conectado: false,
      esencial: false,
      color: 'yellow',
      href: '#',
      detalles: null,
      proximamente: true
    },
    {
      id: 'instagram',
      nombre: 'Instagram',
      descripcion: 'Permite que tus clientes reserven desde Instagram',
      categoria: 'Redes Sociales',
      icon: Instagram,
      conectado: false,
      esencial: false,
      color: 'purple',
      href: '#',
      detalles: null,
      proximamente: true
    },
    {
      id: 'facebook',
      nombre: 'Facebook',
      descripcion: 'Integrá tu página de Facebook con tu sistema de reservas',
      categoria: 'Redes Sociales',
      icon: Facebook,
      conectado: false,
      esencial: false,
      color: 'indigo',
      href: '#',
      detalles: null,
      proximamente: true
    },
  ]

  const colorClasses: Record<string, { bg: string; icon: string; badge: string; border: string }> = {
    blue: { bg: 'bg-blue-100', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-700 border-blue-300', border: 'border-blue-200' },
    red: { bg: 'bg-red-100', icon: 'text-red-600', badge: 'bg-red-100 text-red-700 border-red-300', border: 'border-red-200' },
    green: { bg: 'bg-green-100', icon: 'text-green-600', badge: 'bg-green-100 text-green-700 border-green-300', border: 'border-green-200' },
    yellow: { bg: 'bg-yellow-100', icon: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700 border-yellow-300', border: 'border-yellow-200' },
    purple: { bg: 'bg-purple-100', icon: 'text-purple-600', badge: 'bg-purple-100 text-purple-700 border-purple-300', border: 'border-purple-200' },
    indigo: { bg: 'bg-indigo-100', icon: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700 border-indigo-300', border: 'border-indigo-200' },
    orange: { bg: 'bg-orange-100', icon: 'text-orange-600', badge: 'bg-orange-100 text-orange-700 border-orange-300', border: 'border-orange-200' },
  }

  const integradosCount = integraciones.filter(i => i.conectado).length
  const disponiblesCount = integraciones.filter(i => !i.conectado && !i.proximamente).length
  const proximamenteCount = integraciones.filter(i => i.proximamente).length

  const categorias = ['Todos', 'Pagos', 'Productividad', 'Comunicación', 'Marketing', 'Redes Sociales', 'Automatización']

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Integraciones" 
        description="Conectá Solo con tus herramientas favoritas"
      />

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Conectadas</p>
                <p className="text-2xl font-bold text-gray-900">{integradosCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Disponibles</p>
                <p className="text-2xl font-bold text-gray-900">{disponiblesCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Próximamente</p>
                <p className="text-2xl font-bold text-gray-900">{proximamenteCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros por Categoría */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {categorias.map((categoria) => (
              <Button 
                key={categoria}
                variant={categoria === 'Todos' ? 'default' : 'outline'}
                size="sm"
                className={categoria === 'Todos' ? '' : 'hover:bg-gray-100'}
              >
                {categoria}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integraciones Esenciales */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-blue-500 rounded-full" />
          Integraciones Esenciales
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {integraciones.filter(i => i.esencial).map((integracion) => {
            const Icon = integracion.icon
            const colors = colorClasses[integracion.color]

            return (
              <Card 
                key={integracion.id}
                className={`${
                  integracion.conectado 
                    ? `border-2 ${colors.border} bg-gradient-to-r from-${integracion.color}-50 to-white` 
                    : 'border-gray-200'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${colors.icon}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{integracion.nombre}</h4>
                          {integracion.conectado && (
                            <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Conectado
                            </Badge>
                          )}
                          {integracion.proximamente && (
                            <Badge variant="outline" className="text-xs">
                              Próximamente
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{integracion.descripcion}</p>
                        {integracion.detalles && (
                          <p className="text-xs text-gray-400 mt-2">{integracion.detalles}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {integracion.conectado ? (
                      <>
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <Link href={integracion.href}>
                            <Settings className="w-4 h-4 mr-2" />
                            Configurar
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          Desconectar
                        </Button>
                      </>
                    ) : integracion.proximamente ? (
                      <Button variant="outline" size="sm" disabled className="flex-1">
                        Próximamente
                      </Button>
                    ) : (
                      <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90" asChild>
                        <Link href={integracion.href}>
                          Conectar
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Todas las Integraciones */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-purple-500 rounded-full" />
          Todas las Integraciones
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integraciones.filter(i => !i.esencial).map((integracion) => {
            const Icon = integracion.icon
            const colors = colorClasses[integracion.color]

            return (
              <Card 
                key={integracion.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${colors.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{integracion.nombre}</h4>
                        {integracion.proximamente && (
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            Pronto
                          </Badge>
                        )}
                      </div>
                      <Badge className={`${colors.badge} text-xs mb-2`}>
                        {integracion.categoria}
                      </Badge>
                      <p className="text-xs text-gray-500 leading-relaxed">{integracion.descripcion}</p>
                    </div>
                  </div>

                  {integracion.proximamente ? (
                    <Button variant="outline" size="sm" disabled className="w-full">
                      Próximamente
                    </Button>
                  ) : integracion.conectado ? (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={integracion.href}>
                        <Settings className="w-4 h-4 mr-2" />
                        Configurar
                      </Link>
                    </Button>
                  ) : (
                    <Button size="sm" className="w-full" asChild>
                      <Link href={integracion.href}>
                        Conectar
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Solicitar Integración */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <ExternalLink className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">¿Necesitás otra integración?</h4>
              <p className="text-sm text-gray-600 mb-4">
                Estamos constantemente agregando nuevas integraciones. Si necesitás conectar Solo 
                con una herramienta específica, dejanos saber y la evaluamos para las próximas versiones.
              </p>
              <Button variant="outline" className="bg-white hover:bg-gray-50">
                <MessageSquare className="w-4 h-4 mr-2" />
                Solicitar Integración
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info sobre Integraciones */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-blue-900 mb-1">Integraciones Seguras</p>
              <p className="text-sm text-blue-700">
                Todas las integraciones usan autenticación OAuth segura. Solo accede únicamente 
                a los datos que necesita y nunca almacena tus credenciales de terceros.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}