// app/dashboard/servicios/page.tsx
export const dynamic = "force-dynamic"
// o también sirve:
// export const revalidate = 0

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/dashboard/page-header"
import { ServiciosTable } from "@/components/dashboard/servicios/servicios-table"
import { CreateServicioButton } from "@/components/dashboard/servicios/create-servicio-button"
import { redirect } from "next/navigation"

export default async function ServiciosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: negocio } = await supabase
    .from("negocios")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!negocio) redirect("/register")

  const { data: servicios } = await supabase
    .from("servicios")
    .select("*")
    .eq("negocio_id", negocio.id)
    .order("nombre")

  return (
    <div>
      <PageHeader title="Servicios" description="Gestiona los servicios que ofreces" />

      <div className="mb-6">
        <CreateServicioButton negocioId={negocio.id} />
      </div>

      <ServiciosTable servicios={servicios || []} />
    </div>
  )
}