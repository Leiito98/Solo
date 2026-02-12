import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { ClientesTable } from '@/components/dashboard/clientes/clientes-table'
import { CreateClienteButton } from '@/components/dashboard/clientes/create-cliente-button'
import { redirect } from 'next/navigation'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) redirect('/register')

  const { data: clientes } = await supabase
    .from('clientes')
    .select('*')
    .eq('negocio_id', negocio.id)
    .order('nombre')

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Gestiona tu base de clientes"
      />

      <div className="mb-6">
        <CreateClienteButton negocioId={negocio.id} />
      </div>

      <ClientesTable clientes={clientes || []} />
    </div>
  )
}
