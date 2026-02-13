import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function NegocioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) redirect('/onboarding')

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Información del Negocio" 
        description="Editá los datos principales de tu negocio"
      />

      <Card>
        <CardHeader>
          <CardTitle>Datos Generales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Negocio
            </label>
            <input
              type="text"
              defaultValue={negocio.nombre}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ej: Barbería Elite"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug (URL personalizada)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                defaultValue={negocio.slug}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <span className="text-sm text-gray-500">.getsolo.site</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              URL pública: https://{negocio.slug}.getsolo.site
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Negocio
            </label>
            <select 
              defaultValue={negocio.tipo}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="barberia">Barbería</option>
              <option value="peluqueria">Peluquería</option>
              <option value="spa">Spa & Masajes</option>
              <option value="belleza">Belleza & Estética</option>
              <option value="nutricion">Nutrición</option>
              <option value="psicologia">Psicología</option>
              <option value="fitness">Fitness & Gym</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <input
              type="text"
              defaultValue={negocio.direccion}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ej: Av. Corrientes 1234, CABA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              defaultValue={negocio.telefono}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="+54 9 11 1234-5678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de contacto
            </label>
            <input
              type="email"
              defaultValue={negocio.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="contacto@tunegocio.com"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button className="bg-primary hover:bg-primary/90">
              Guardar Cambios
            </Button>
            <Button variant="outline">
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}