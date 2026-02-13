import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PasswordPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Cambiar Contraseña" 
        description="Actualizá tu contraseña de acceso"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Nueva Contraseña
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña Actual
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-gray-500">
              Mínimo 8 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-4">
            <Button className="bg-primary hover:bg-primary/90">
              Cambiar Contraseña
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}