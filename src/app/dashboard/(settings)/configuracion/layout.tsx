import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsSidebar } from '@/components/dashboard/configuracion/settings-sidebar'
import { Toaster } from '@/components/ui/toaster'

export default async function ConfiguracionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id, nombre, slug')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) redirect('/register')

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Settings */}
      <aside className="w-[280px] border-r bg-white">
        <div className="p-6">
          <div className="mb-6">
            <p className="text-xs text-gray-500">Configuración</p>
            <p className="text-lg font-semibold text-gray-900">{negocio.nombre}</p>
          </div>
          <SettingsSidebar negocio={{ nombre: negocio.nombre, slug: negocio.slug }} />
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </main>

      <Toaster />
    </div>
  )
}
