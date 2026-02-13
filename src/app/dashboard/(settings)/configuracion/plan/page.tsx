import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, CreditCard, Calendar, Users, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) redirect('/onboarding')

  // Simular plan actual (después conectar con tu DB)
  const planActual = {
    nombre: 'Pro',
    precio: 28000,
    profesionales: 'Ilimitados',
    proximaFacturacion: '15 de marzo, 2026',
    estadoPago: 'activo' // activo | vencido | cancelado
  }

  const planes = [
    {
      nombre: 'Solo',
      precio: 20000,
      descripcion: 'Para emprendedores y profesionales independientes',
      caracteristicas: [
        '1-2 profesionales',
        'Agenda online ilimitada',
        'Landing page personalizada',
        'Pagos con MercadoPago',
        'Recordatorios automáticos',
        'Soporte por WhatsApp'
      ],
      actual: false,
      color: 'gray'
    },
    {
      nombre: 'Pro',
      precio: 28000,
      descripcion: 'Para negocios con equipo',
      caracteristicas: [
        'Profesionales ilimitados',
        'Todo lo del plan Solo',
        'Sistema de comisiones',
        'Control de gastos fijos',
        'Analytics avanzados',
        'Exportar a Excel/PDF',
        'Soporte prioritario'
      ],
      actual: true,
      color: 'blue'
    }
  ]

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Plan y Suscripción" 
        description="Gestioná tu plan, facturación y métodos de pago"
      />

      {/* Plan Actual */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Plan Actual
            </CardTitle>
            <Badge className="bg-blue-100 text-blue-700 border-blue-300">
              {planActual.nombre}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Precio Mensual</p>
              <p className="text-2xl font-bold text-gray-900">
                ${planActual.precio.toLocaleString('es-AR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Profesionales</p>
              <p className="text-lg font-semibold text-gray-900">
                {planActual.profesionales}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Próxima Facturación</p>
              <p className="text-lg font-semibold text-gray-900">
                {planActual.proximaFacturacion}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-green-700 font-medium">Suscripción activa</span>
          </div>
        </CardContent>
      </Card>

      {/* Comparación de Planes */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cambiar Plan</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {planes.map((plan) => (
            <Card 
              key={plan.nombre} 
              className={`${
                plan.actual 
                  ? 'border-2 border-blue-500 shadow-lg' 
                  : 'border-gray-200'
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl">{plan.nombre}</CardTitle>
                  {plan.actual && (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                      Plan Actual
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">{plan.descripcion}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.precio.toLocaleString('es-AR')}
                  </span>
                  <span className="text-gray-500">/mes</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.caracteristicas.map((caracteristica, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{caracteristica}</span>
                    </li>
                  ))}
                </ul>

                {plan.actual ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled
                  >
                    Plan Actual
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-blue-50 hover:border-blue-300"
                  >
                    Cambiar a {plan.nombre}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Métodos de Pago</h4>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Gestioná tus tarjetas y formas de pago
            </p>
            <Button variant="link" className="p-0 h-auto text-blue-600" asChild>
              <a href="/dashboard/configuracion/plan/pagos">
                Ver métodos →
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Facturas</h4>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Descargá tus facturas anteriores
            </p>
            <Button variant="link" className="p-0 h-auto text-blue-600" asChild>
              <a href="/dashboard/configuracion/plan/facturas">
                Ver historial →
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-red-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Cancelar Plan</h4>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Cancelá tu suscripción cuando quieras
            </p>
            <Button variant="link" className="p-0 h-auto text-red-600">
              Cancelar suscripción →
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Adicional */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">
            💡 <strong>Recordá:</strong> Podés cambiar de plan en cualquier momento. 
            Si bajás de plan, el cambio se aplica en la próxima facturación. 
            Si subís de plan, se prorratea la diferencia inmediatamente.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}