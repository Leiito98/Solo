import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { redirect } from 'next/navigation'
import { ProveedorForm } from '@/components/dashboard/inventario/proveedor-form'

export default async function NuevoProveedorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) redirect('/onboarding')

  return (
    <div>
      <PageHeader title="Nuevo Proveedor" description="Agrega un proveedor para tus compras" />

      <div className="max-w-2xl">
        <ProveedorForm negocioId={negocio.id} mode="create" />
      </div>
    </div>
  )
}
