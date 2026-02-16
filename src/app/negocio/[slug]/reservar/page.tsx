//app/negocio/[slug]/reservar/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReservaFlow } from '@/components/reserva/reserva-flow'

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function ReservarPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch negocio
  const { data: negocio } = await supabase
    .from('negocios')
    .select('id, nombre, slug, mp_access_token, mp_sena_pct')
    .eq('slug', slug)
    .single()

  if (!negocio) {
    redirect('/')
  }

  // Fetch servicios
  const { data: servicios } = await supabase
    .from('servicios')
    .select('id, nombre, descripcion, duracion_min, precio')
    .eq('negocio_id', negocio.id)
    .order('nombre')

  // Fetch profesionales activos
  const { data: profesionales } = await supabase
    .from('profesionales')
    .select('id, nombre, especialidad, foto_url')
    .eq('negocio_id', negocio.id)
    .eq('activo', true)
    .order('nombre')

  if (!servicios || servicios.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">
            No hay servicios disponibles
          </h1>
          <p className="text-gray-600">
            Este negocio aún no ha configurado servicios para reservar.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reservar Turno
          </h1>
          <p className="text-gray-600">
            {negocio.nombre}
          </p>
        </div>

        {/* Flow Component */}
        <ReservaFlow
          negocio={{
            ...negocio,
            tiene_mp: !!negocio.mp_access_token,
            mp_sena_pct: negocio.mp_sena_pct ?? 50,
          }}
          servicios={servicios}
          profesionales={profesionales || []}
        />
      </div>
    </div>
  )
}