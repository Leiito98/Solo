import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { redirect } from 'next/navigation'
import { StockForm } from '@/components/dashboard/inventario/stock-form'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function AgregarStockPage({ params }: PageProps) {
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
    .select('id, nombre')
    .eq('id', id)
    .eq('negocio_id', negocio.id)
    .single()

  if (!producto) redirect('/dashboard/inventario/productos')

  const { data: proveedores } = await supabase
    .from('proveedores')
    .select('id, nombre')
    .eq('negocio_id', negocio.id)
    .order('nombre')

  return (
    <div>
      <PageHeader title="Movimiento de Stock" description={producto.nombre} />

      <div className="max-w-2xl">
        <StockForm
          productoId={producto.id}
          productoNombre={producto.nombre}
          proveedores={(proveedores || []) as any}
        />
      </div>
    </div>
  )
}
