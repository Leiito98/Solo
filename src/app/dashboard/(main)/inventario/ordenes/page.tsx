import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { redirect } from 'next/navigation'
import { FileText } from 'lucide-react'
import { CreateOrdenButton } from '@/components/dashboard/inventario/create-orden-button'
import { OrdenesTableClient } from '@/components/dashboard/inventario/ordenes-table-client'

export default async function OrdenesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) redirect('/onboarding')

  const { data: ordenes } = await supabase
    .from('ordenes_compra')
    .select(`*, proveedores(nombre)`)
    .eq('negocio_id', negocio.id)
    .order('fecha_orden', { ascending: false })

  return (
    <div>
      <PageHeader title="Órdenes de compra" description="Controlá tus compras a proveedores" />

      <div className="mb-6">
        <CreateOrdenButton />
      </div>

      {!ordenes || ordenes.length === 0 ? (
        <div className="p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 font-medium mb-2">No hay órdenes todavía</p>
          <p className="text-sm text-gray-400">Creá una orden para registrar tus compras</p>
        </div>
      ) : (
        <OrdenesTableClient ordenes={ordenes as any[]} />
      )}
    </div>
  )
}
