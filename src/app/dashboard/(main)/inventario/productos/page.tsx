import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { redirect } from 'next/navigation'
import { InventarioTable } from '@/components/dashboard/inventario/inventario-table'
import { CreateProductoButton } from '@/components/dashboard/inventario/create-producto-button'

export default async function ProductosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) redirect('/onboarding')

  const { data: productos } = await supabase
    .from('productos')
    .select('*')
    .eq('negocio_id', negocio.id)
    .order('nombre')

  return (
    <div>
      <PageHeader 
        title="Productos" 
        description="Gestiona tu inventario de productos e insumos"
      />
      
      <div className="mb-6">
        <CreateProductoButton negocioId={negocio.id} />
      </div>

      <InventarioTable productos={productos || []} />
    </div>
  )
}