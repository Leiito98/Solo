// app/dashboard/configuracion/layout.tsx (o donde lo tengas)
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SettingsSidebar } from "@/components/dashboard/configuracion/settings-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { OnboardingPanel } from "@/components/dashboard/onboarding/onboarding-panel"

export default async function ConfiguracionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: negocio } = await supabase
    .from("negocios")
    .select("id, nombre, slug, logo_url, nombrecliente")
    .eq("owner_id", user.id)
    .single()

  if (!negocio) redirect("/register")

  const firstName =
    (String(negocio.nombrecliente || "")
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")[0] || "") ||
    (String(user?.user_metadata?.first_name || "").trim() || "") ||
    "Usuario"

  const negocioForSidebar = {
    nombre: negocio.nombre,
    slug: negocio.slug,
    logo_url: negocio.logo_url,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="md:flex md:h-screen md:overflow-hidden">
        {/* Sidebar (desktop fijo) */}
        <div className="hidden md:block md:sticky md:top-0 md:h-screen md:shrink-0">
          <SettingsSidebar
            negocio={negocioForSidebar}
            userEmail={user.email}
            hideSoloHeader={false}
          />
        </div>

        {/* Main (desktop scrollea) */}
        <main className="flex-1 min-w-0 md:h-screen md:overflow-y-auto">
          {/* Mobile topbar + drawer */}
          <div className="md:hidden">
            <SettingsSidebar
              negocio={negocioForSidebar}
              userEmail={user.email}
              hideSoloHeader={false}
            />
          </div>

          <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>

        {/* ✅ Onboarding SIEMPRE (el componente define mobile/desktop) */}
        <OnboardingPanel negocioId={negocio.id} userFirstName={firstName} />
      </div>

      <Toaster />
    </div>
  )
}