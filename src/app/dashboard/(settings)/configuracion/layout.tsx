import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SettingsSidebar } from "@/components/dashboard/configuracion/settings-sidebar"
import { Toaster } from "@/components/ui/toaster"
import Image from "next/image"

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
    .select("id, nombre, slug, logo_url")
    .eq("owner_id", user.id)
    .single()

  if (!negocio) redirect("/register")

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Settings */}
      <aside className="w-[280px] border-r bg-white">
        {/* ✅ HEADER ARRIBA: Solo + Configuración + Nombre */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-gray-200">
          <div className="relative w-9 h-9 flex-shrink-0">
            <Image
              src="/logo/solo.png"
              alt="Solo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="min-w-0">
            <p className="text-xs text-gray-500 leading-none">Configuración</p>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {negocio.nombre}
            </p>
          </div>
        </div>

        {/* ✅ Sidebar: sin header "Solo" interno */}
        <SettingsSidebar
          negocio={{
            nombre: negocio.nombre,
            slug: negocio.slug,
            logo_url: negocio.logo_url,
          }}
          hideSoloHeader
        />
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </main>

      <Toaster />
    </div>
  )
}
