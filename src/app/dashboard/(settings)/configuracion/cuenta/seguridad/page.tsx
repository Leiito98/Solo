import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Smartphone } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SeguridadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Seguridad" 
        description="Protegé tu cuenta con medidas adicionales"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Autenticación de Dos Factores (2FA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium text-gray-900">Autenticación de Dos Factores</p>
              <p className="text-sm text-gray-500">Agregá una capa extra de seguridad</p>
            </div>
            <Button variant="outline">
              Activar 2FA
            </Button>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Próximamente: Usá una app de autenticación para generar códigos de verificación.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Sesiones Activas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 px-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Sesión Actual</p>
                <p className="text-sm text-gray-500">Chrome • Buenos Aires, Argentina</p>
              </div>
              <span className="text-sm text-green-600 font-medium">Activa ahora</span>
            </div>
          </div>
          <Button variant="outline" className="mt-4 w-full">
            Cerrar Todas las Sesiones
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}