import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { redirect } from 'next/navigation'
import { ProductoForm } from '@/components/dashboard/inventario/producto-form'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditarProductoPage({ params }: PageProps) {
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

  const { data: producto } = await supabase
    .from('productos')
    .select('*')
    .eq('id', id)
    .eq('negocio_id', negocio.id)
    .single()

  if (!producto) redirect('/dashboard/inventario/productos')

  return (
    <div>
      <PageHeader 
        title="Editar Producto" 
        description={producto.nombre}
      />

      <div className="max-w-2xl">
        <ProductoForm 
          producto={producto} 
          negocioId={negocio.id} 
          mode="edit" 
        />
      </div>
    </div>
  )
}