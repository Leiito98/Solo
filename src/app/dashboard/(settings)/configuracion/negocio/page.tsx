import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import NegocioForm from '@/components/dashboard/negocio/NegocioForm'

export const dynamic = 'force-dynamic'

export default async function NegocioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id, nombre, slug, vertical, direccion, telefono, email')
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
        <CardContent>
          <NegocioForm
            negocioId={negocio.id}
            initialNombre={negocio.nombre || ''}
            initialSlug={negocio.slug || ''}
            initialVertical={negocio.vertical || 'otros'}
            initialDireccion={negocio.direccion || ''}
            initialTelefono={negocio.telefono || ''}
            initialEmail={negocio.email || ''}
          />
        </CardContent>
      </Card>
    </div>
  )
}
