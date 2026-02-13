import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/dashboard/nav'
import { Toaster } from '@/components/ui/toaster'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 1) Intentar como OWNER
  const { data: negocioOwner } = await supabase
    .from('negocios')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (negocioOwner) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DashboardNav negocio={negocioOwner} user={user} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-8 py-8">{children}</div>
        </main>
        <Toaster />
      </div>
    )
  }

  // 2) Si no es owner, ver si es PROFESIONAL
  const { data: prof } = await supabase
    .from('profesionales')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (prof) {
    redirect('/pro/dashboard')
  }

  // 3) Nadie conocido
  redirect('/register')
}
