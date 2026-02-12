import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { CalendarView } from '@/components/dashboard/agenda/calendar-view'
import { redirect } from 'next/navigation'

export default async function AgendaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) redirect('/register')

  // Cargar profesionales activos
  const { data: profesionales } = await supabase
    .from('profesionales')
    .select('id, nombre, activo')
    .eq('negocio_id', negocio.id)
    .eq('activo', true)
    .order('nombre')

  // Cargar turnos del mes actual
  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)

  const finMes = new Date()
  finMes.setMonth(finMes.getMonth() + 1)
  finMes.setDate(0)
  finMes.setHours(23, 59, 59, 999)

  const { data: turnos, error: turnosError } = await supabase
    .from('turnos')
    .select(`
      id,
      fecha,
      hora_inicio,
      hora_fin,
      estado,
      profesional_id,
      profesionales(nombre),
      servicios(nombre),
      clientes(nombre)
    `)
    .eq('negocio_id', negocio.id)
    .gte('fecha', inicioMes.toISOString().split('T')[0])
    .lte('fecha', finMes.toISOString().split('T')[0])

  if (turnosError) {
    // Opcional: log para debug en server
    console.error('Error cargando turnos:', turnosError)
  }

  // ✅ Adaptar: si supabase devuelve arrays, nos quedamos con el primer item (o null)
  const turnosAdaptados = (turnos || []).map((t: any) => ({
    ...t,
    profesionales: Array.isArray(t.profesionales) ? (t.profesionales[0] ?? null) : (t.profesionales ?? null),
    servicios: Array.isArray(t.servicios) ? (t.servicios[0] ?? null) : (t.servicios ?? null),
    clientes: Array.isArray(t.clientes) ? (t.clientes[0] ?? null) : (t.clientes ?? null),
  }))

  return (
    <div>
      <PageHeader
        title="Agenda"
        description="Gestiona los turnos y horarios de tu equipo"
      />

      <CalendarView
        negocioId={negocio.id}
        profesionales={profesionales || []}
        turnosIniciales={turnosAdaptados}
      />
    </div>
  )
}
