import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { redirect } from 'next/navigation'
import { OrdenCompraForm } from '@/components/dashboard/inventario/orden-compra-form'

export default async function NuevaOrdenPage() {
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
    .select('id, nombre, unidad, precio_unitario')
    .eq('negocio_id', negocio.id)
    .order('nombre')

  const { data: proveedores } = await supabase
    .from('proveedores')
    .select('id, nombre')
    .eq('negocio_id', negocio.id)
    .order('nombre')

  return (
    <div>
      <PageHeader title="Nueva Orden" description="Crea una orden de compra a un proveedor" />

      <div className="max-w-4xl">
        <OrdenCompraForm productos={(productos || []) as any} proveedores={(proveedores || []) as any} />
      </div>
    </div>
  )
}
