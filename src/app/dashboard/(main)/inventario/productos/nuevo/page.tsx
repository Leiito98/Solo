import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { redirect } from 'next/navigation'
import { ProductoForm } from '@/components/dashboard/inventario/producto-form'

export default async function NuevoProductoPage() {
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
      <PageHeader title="Nuevo Producto" description="Agrega un insumo o producto a tu inventario" />

      <div className="max-w-2xl">
        <ProductoForm negocioId={negocio.id} mode="create" />
      </div>
    </div>
  )
}
