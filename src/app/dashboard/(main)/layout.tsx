// app/dashboard/layout.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/nav"
import { Toaster } from "@/components/ui/toaster"
import { OnboardingPanel } from "@/components/dashboard/onboarding/onboarding-panel"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: negocioOwner } = await supabase
    .from("negocios")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (negocioOwner) {
    const firstName =
      (String(negocioOwner.nombrecliente || "")
        .trim()
        .replace(/\s+/g, " ")
        .split(" ")[0] || "") ||
      (String(user.user_metadata?.first_name || "").trim() || "") ||
      "Usuario"

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="md:flex md:h-screen md:overflow-hidden">
          {/* Sidebar (desktop fijo) */}
          <div className="hidden md:block md:sticky md:top-0 md:h-screen md:shrink-0">
            <DashboardNav negocio={negocioOwner} user={user} />
          </div>

          {/* Main (desktop scrollea) */}
          <main className="flex-1 min-w-0 md:h-screen md:overflow-y-auto">
            {/* Mobile topbar + drawer */}
            <div className="md:hidden">
              <DashboardNav negocio={negocioOwner} user={user} />
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8">
              {children}
            </div>
          </main>

          {/* ✅ Onboarding SIEMPRE (el componente define mobile/desktop) */}
          <OnboardingPanel negocioId={negocioOwner.id} userFirstName={firstName} />
        </div>

        <Toaster />
      </div>
    )
  }

  const { data: prof } = await supabase
    .from("profesionales")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  if (prof) redirect("/pro/dashboard")

  redirect("/register")
}