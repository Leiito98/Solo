import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('slug')
    .eq('owner_id', user.id)
    .single()

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Landing Page" 
        description="Personalizá tu página pública de reservas"
      />

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">Tu Página Pública</p>
              <p className="text-sm text-blue-700">https://{negocio?.slug}.getsolo.site</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={`https://${negocio?.slug}.getsolo.site`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Página
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contenido de la Página</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título Principal
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Ej: Reservá tu turno online"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Describe tu negocio y tus servicios..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imágenes de la Galería
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-600">Subí fotos de tu local o trabajos realizados</p>
              <Button variant="outline" className="mt-3">
                Agregar Imágenes
              </Button>
            </div>
          </div>

          <div className="pt-4">
            <Button className="bg-primary hover:bg-primary/90">
              Guardar Cambios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}