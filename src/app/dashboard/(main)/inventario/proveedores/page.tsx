import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { redirect } from 'next/navigation'
import { ProveedoresTable } from '@/components/dashboard/inventario/proveedores-table'
import { CreateProveedorButton } from '@/components/dashboard/inventario/create-proveedor-button'

export default async function ProveedoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) redirect('/onboarding')

  const { data: proveedores } = await supabase
    .from('proveedores')
    .select('*')
    .eq('negocio_id', negocio.id)
    .order('nombre')

  return (
    <div>
      <PageHeader
        title="Proveedores"
        description="Gestiona tus proveedores para reposición de stock"
      />

      <div className="mb-6">
        <CreateProveedorButton negocioId={negocio.id} />
      </div>

      <ProveedoresTable proveedores={(proveedores || []) as any} />
    </div>
  )
}
