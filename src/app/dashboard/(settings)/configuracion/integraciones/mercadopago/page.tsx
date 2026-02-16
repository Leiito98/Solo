import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { MercadoPagoConfig } from '@/components/dashboard/configuracion/mercadopago-config'
import { CreditCard } from 'lucide-react'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id, mp_access_token, mp_sena_pct')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) redirect('/register')

  const token = negocio.mp_access_token as string | null
  const senaPct = (negocio as any).mp_sena_pct ?? 50

  return (
    <div>
      <PageHeader
        title="Configuración"
        description="Administrá las integraciones de tu negocio"
      />

      <div className="space-y-8">
        {/* Sección MercadoPago */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">MercadoPago</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Conectá tu cuenta de MercadoPago para que tus clientes puedan pagar la seña online al reservar un turno.
            Cada cobro va directamente a tu cuenta.
          </p>

          <MercadoPagoConfig
            configurado={!!token}
            token_preview={token ? `****${token.slice(-4)}` : null}
            token_tipo={
              token
                ? token.startsWith('TEST-')
                  ? 'test'
                  : token.startsWith('APP_USR-')
                  ? 'produccion'
                  : 'desconocido'
                : null
            }
            mp_sena_pct={senaPct}
          />
        </div>
      </div>
    </div>
  )
}