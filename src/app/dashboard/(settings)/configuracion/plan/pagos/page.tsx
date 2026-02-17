import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, CheckCircle2, ExternalLink, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import { BillingInfoForm } from '@/components/dashboard/plan/BillingInfoForm'

export const dynamic = 'force-dynamic'

function formatFechaAR(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function ars(n: number) {
  return `$${Math.round(n).toLocaleString('es-AR')}`
}

async function fetchMpPreapproval(preapprovalId: string) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
  if (!accessToken) return null
  try {
    const client = new MercadoPagoConfig({ accessToken })
    const preapproval = new PreApproval(client)
    const mp = await preapproval.get({ id: preapprovalId })
    return mp as any
  } catch {
    return null
  }
}

function badgeForMpStatus(status: string) {
  const s = status.toLowerCase()
  if (s === 'authorized') return 'bg-green-100 text-green-700 border-green-300'
  if (s === 'pending') return 'bg-yellow-100 text-yellow-700 border-yellow-300'
  if (s === 'cancelled') return 'bg-gray-100 text-gray-700 border-gray-300'
  if (s === 'paused') return 'bg-red-100 text-red-700 border-red-300'
  return 'bg-gray-100 text-gray-700 border-gray-300'
}

export default async function PagosFacturacionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id, plan, suscripcion_estado, mp_preapproval_id, mp_preapproval_status')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) redirect('/onboarding')

  // Facturación guardada en DB
  const { data: facturacion } = await supabase
    .from('negocio_facturacion')
    .select('razon_social,cuit,direccion,ciudad,codigo_postal')
    .eq('negocio_id', negocio.id)
    .maybeSingle()

  // MP en vivo (si hay)
  const mp = negocio.mp_preapproval_id ? await fetchMpPreapproval(negocio.mp_preapproval_id) : null
  const mpStatus = String(mp?.status || negocio.mp_preapproval_status || '—')
  const nextPaymentDate =
    mp?.next_payment_date ||
    mp?.auto_recurring?.next_payment_date ||
    null

  const amount =
    Number(mp?.auto_recurring?.transaction_amount) ||
    (negocio.plan === 'pro' ? 29990 : 20000)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pagos y facturación"
        description="Estado real de tu suscripción en MercadoPago + tus datos de facturación"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Suscripción en MercadoPago
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {!negocio.mp_preapproval_id ? (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
              No tenés una suscripción asociada todavía.
              <div className="mt-3">
                <Button asChild>
                  <Link href="/suscripcion">Activar suscripción</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Estado</p>
                  <Badge className={badgeForMpStatus(mpStatus)}>{negocio.suscripcion_estado
              ? negocio.suscripcion_estado.charAt(0).toUpperCase() +
                negocio.suscripcion_estado.slice(1)
              : '—'}</Badge>
                  <p className="text-xs text-gray-500 mt-2">Preapproval ID: {negocio.mp_preapproval_id}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Próximo cobro</p>
                  <p className="text-lg font-semibold text-gray-900">{formatFechaAR(nextPaymentDate)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Importe</p>
                  <p className="text-lg font-semibold text-gray-900">{ars(amount)}/mes</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button asChild variant="outline" className="gap-2">
                  <Link href="/dashboard/configuracion/plan">
                    <ExternalLink className="w-4 h-4" />
                    Volver a Plan
                  </Link>
                </Button>

                {/* Esto te sirve para “forzar” actualización visual sin depender del webhook */}
                <Button asChild className="gap-2">
                  <Link href={`/suscripcion?return=1&preapproval_id=${encodeURIComponent(negocio.mp_preapproval_id)}`}>
                    <RefreshCw className="w-4 h-4" />
                    Sincronizar (manual)
                  </Link>
                </Button>
              </div>

              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900 mb-1">Pagos 100% seguros</p>
                    <p className="text-sm text-green-700">
                      MercadoPago procesa los pagos. Solo no almacena datos completos de tarjetas.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Form real guardando en DB */}
      <BillingInfoForm initial={(facturacion as any) ?? null} />
    </div>
  )
}
