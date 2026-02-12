import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { redirect } from 'next/navigation'
import { ProveedorForm } from '@/components/dashboard/inventario/proveedor-form'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditarProveedorPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) redirect('/onboarding')

  const { data: proveedor } = await supabase
    .from('proveedores')
    .select('*')
    .eq('id', id)
    .eq('negocio_id', negocio.id)
    .single()

  if (!proveedor) redirect('/dashboard/inventario/proveedores')

  return (
    <div>
      <PageHeader title="Editar Proveedor" description={proveedor.nombre} />

      <div className="max-w-2xl">
        <ProveedorForm negocioId={negocio.id} mode="edit" proveedor={proveedor as any} />
      </div>
    </div>
  )
}
