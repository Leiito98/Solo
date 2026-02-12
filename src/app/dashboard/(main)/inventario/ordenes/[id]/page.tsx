import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { redirect } from 'next/navigation'
import { OrdenDetail } from '@/components/dashboard/inventario/orden-detail'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function OrdenPage({ params }: PageProps) {
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

  const { data: orden } = await supabase
    .from('ordenes_compra')
    .select(`
      *,
      proveedores(nombre, email, telefono),
      items_orden_compra(*, productos(nombre, unidad))
    `)
    .eq('id', id)
    .eq('negocio_id', negocio.id)
    .single()

  if (!orden) redirect('/dashboard/inventario/ordenes')

  return (
    <div>
      <PageHeader title="Orden" description={orden.numero_orden || orden.id.slice(0, 8)} />
      <OrdenDetail orden={orden as any} />
    </div>
  )
}
