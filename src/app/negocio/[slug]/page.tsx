import { createClient } from "@/lib/supabase/server"
import { LandingNavbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { ServiciosSection } from "@/components/landing/servicios"
import { ProfesionalesSection } from "@/components/landing/profesionales"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function NegocioPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch negocio
  const { data: negocio, error: nErr } = await supabase
    .from("negocios")
    .select("*")
    .eq("slug", slug)
    .single()

  if (nErr || !negocio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">404</h1>
          <p className="text-gray-600">Negocio no encontrado</p>
        </div>
      </div>
    )
  }

  // Fetch servicios
  const { data: servicios } = await supabase
    .from("servicios")
    .select("id, nombre, descripcion, duracion_min, precio")
    .eq("negocio_id", negocio.id)
    .order("nombre")

  // Fetch profesionales activos
  const { data: profesionales } = await supabase
    .from("profesionales")
    .select("id, nombre, especialidad, foto_url, bio")
    .eq("negocio_id", negocio.id)
    .eq("activo", true)
    .order("nombre")

  return (
    <div className="min-h-screen">
      <LandingNavbar negocio={negocio} />
      <Hero negocio={negocio} />
      {servicios && servicios.length > 0 && (
        <ServiciosSection servicios={servicios} negocioSlug={negocio.slug} />
      )}
      {profesionales && profesionales.length > 0 && (
        <ProfesionalesSection profesionales={profesionales} />
      )}
      <CTASection negocioSlug={negocio.slug} />
      <Footer negocio={negocio} />
    </div>
  )
}