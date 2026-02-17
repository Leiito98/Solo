import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Store, 
  User, 
  Clock, 
  Zap, 
  Bell, 
  Shield, 
  CreditCard,
  ChevronRight 
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) redirect('/onboarding')

  const sections = [
    {
      title: 'Mi Negocio',
      description: 'Información, branding y landing page',
      icon: Store,
      href: '/dashboard/configuracion/negocio',
      color: 'blue'
    },
    {
      title: 'Cuenta y Seguridad',
      description: 'Perfil, contraseña y autenticación',
      icon: User,
      href: '/dashboard/configuracion/cuenta',
      color: 'purple'
    },
    {
      title: 'Horarios del local',
      description: 'Días y horarios de atención',
      icon: Clock,
      href: '/dashboard/configuracion/horarios',
      color: 'orange'
    },
    {
      title: 'Integraciones',
      description: 'MercadoPago, Google Calendar, WhatsApp',
      icon: Zap,
      href: '/dashboard/configuracion/integraciones',
      color: 'yellow'
    },
    {
      title: 'Notificaciones',
      description: 'Email, recordatorios y alertas',
      icon: Bell,
      href: '/dashboard/configuracion/notificaciones',
      color: 'green'
    },
    {
      title: 'Políticas y Legal',
      description: 'Cancelaciones, términos y privacidad',
      icon: Shield,
      href: '/dashboard/configuracion/politicas',
      color: 'red'
    },
    {
      title: 'Plan y Facturación',
      description: 'Plan actual, pagos e historial',
      icon: CreditCard,
      href: '/dashboard/configuracion/plan',
      color: 'indigo'
    },
  ]

  const colorClasses: Record<string, { bg: string; icon: string; hover: string }> = {
    blue: { bg: 'bg-blue-100', icon: 'text-blue-600', hover: 'hover:border-blue-300' },
    purple: { bg: 'bg-purple-100', icon: 'text-purple-600', hover: 'hover:border-purple-300' },
    orange: { bg: 'bg-orange-100', icon: 'text-orange-600', hover: 'hover:border-orange-300' },
    yellow: { bg: 'bg-yellow-100', icon: 'text-yellow-600', hover: 'hover:border-yellow-300' },
    green: { bg: 'bg-green-100', icon: 'text-green-600', hover: 'hover:border-green-300' },
    red: { bg: 'bg-red-100', icon: 'text-red-600', hover: 'hover:border-red-300' },
    indigo: { bg: 'bg-indigo-100', icon: 'text-indigo-600', hover: 'hover:border-indigo-300' },
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Configuración" 
        description="Gestioná tu negocio, integraciones y preferencias"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => {
          const Icon = section.icon
          const colors = colorClasses[section.color]

          return (
            <Link key={section.href} href={section.href}>
              <Card className={`cursor-pointer transition-all hover:shadow-md ${colors.hover}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${colors.bg}`}>
                      <Icon className={`w-6 h-6 ${colors.icon}`} />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{section.title}</h3>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información Rápida</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Negocio</span>
            <span className="text-sm font-medium text-gray-900">{negocio.nombre}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">URL Pública</span>
            <a
              href={`https://${negocio.slug}.getsolo.site`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              {negocio.slug}.getsolo.site
            </a>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Email</span>
            <span className="text-sm font-medium text-gray-900">{negocio.email}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-600">Plan</span>
            <span className="text-sm font-medium text-gray-900">{negocio.plan?.charAt(0).toUpperCase() + negocio.plan?.slice(1)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}