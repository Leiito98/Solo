import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CuentaForm from '@/components/dashboard/cuenta/CuentaForm'

export const dynamic = 'force-dynamic'

export default async function CuentaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('nombrecliente,email,telefono')
    .eq('owner_id', user.id)
    .single()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi Perfil"
        description="Gestioná tu información personal"
      />

      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent>
          <CuentaForm
            initialNombre={negocio?.nombrecliente || ''}
            initialEmail={negocio?.email || ''}
            initialTelefono={negocio?.telefono || ''}
          />
        </CardContent>
      </Card>
    </div>
  )
}
