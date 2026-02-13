import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { ProfesionalesTable } from '@/components/dashboard/profesionales/profesionales-table'
import { CreateProfesionalButton } from '@/components/dashboard/profesionales/create-profesional-button'
import { redirect } from 'next/navigation'

export default async function ProfesionalesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) redirect('/register')

  const { data: profesionales } = await supabase
    .from('profesionales')
    .select('id,nombre,email,telefono,especialidad,foto_url,bio,activo,auth_user_id')
    .eq('negocio_id', negocio.id)
    .order('nombre')

  return (
    <div>
      <PageHeader 
        title="Profesionales" 
        description="Gestiona tu equipo de trabajo"
      />
      
      <div className="mb-6">
        <CreateProfesionalButton negocioId={negocio.id} />
      </div>

      <ProfesionalesTable profesionales={profesionales || []} />
    </div>
  )
}