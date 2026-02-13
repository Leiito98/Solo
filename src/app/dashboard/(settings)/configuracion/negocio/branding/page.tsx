import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Image as ImageIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BrandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Branding y Logo" 
        description="Personalizá la identidad visual de tu negocio"
      />

      <Card>
        <CardHeader>
          <CardTitle>Logo del Negocio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-2">Arrastrá tu logo acá o hacé click para subir</p>
            <p className="text-xs text-gray-500">PNG, JPG o SVG (máx. 2MB)</p>
            <Button variant="outline" className="mt-4">
              Seleccionar Archivo
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Este logo aparecerá en tu página pública y en los emails enviados a tus clientes.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Colores del Negocio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Principal
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                defaultValue="#3b82f6"
                className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                defaultValue="#3b82f6"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="#3b82f6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Secundario
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                defaultValue="#8b5cf6"
                className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                defaultValue="#8b5cf6"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="#8b5cf6"
              />
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