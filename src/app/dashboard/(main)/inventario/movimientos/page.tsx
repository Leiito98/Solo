import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { redirect } from 'next/navigation'
import { MovimientosList } from '@/components/dashboard/inventario/movimientos-list'

export default async function MovimientosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) redirect('/onboarding')

  const { data: movimientos } = await supabase
    .from('movimientos_inventario')
    .select(`
      *,
      productos(nombre, unidad),
      proveedores(nombre)
    `)
    .eq('negocio_id', negocio.id)
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div>
      <PageHeader
        title="Movimientos"
        description="Historial de entradas, salidas y ajustes de stock"
      />

      <MovimientosList movimientos={(movimientos || []) as any} />
    </div>
  )
}
