//src/app/dashboard/(settings)/configuracion/plan/facturas/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Calendar, CreditCard, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import { SyncFacturasButton } from './SyncFacturasButton'

export const dynamic = 'force-dynamic'

function formatShort(d: Date) {
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatLong(d: Date) {
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatMetodoPago(raw: string | null | undefined): string {
  if (!raw) return 'MercadoPago'
  const lower = raw.toLowerCase()
  if (lower.startsWith('account_money')) return 'Saldo en cuenta MP'
  if (lower.includes('visa')) return 'Tarjeta Visa'
  if (lower.includes('master')) return 'Tarjeta Mastercard'
  if (lower.includes('amex')) return 'American Express'
  if (lower.includes('debit')) return 'Tarjeta de débito'
  if (lower.includes('rapipago')) return 'Rapipago'
  if (lower.includes('pagofacil')) return 'Pago Fácil'
  return raw.replace(/_/g, ' ').replace(/\s*\(\d+\)$/, '').trim()
}

async function fetchMpNextPayment(preapprovalId: string) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
  if (!accessToken) return null
  try {
    const client = new MercadoPagoConfig({ accessToken })
    const preapproval = new PreApproval(client)
    const mp = (await preapproval.get({ id: preapprovalId })) as any
    const next =
      mp?.next_payment_date ||
      mp?.auto_recurring?.next_payment_date ||
      null
    return next ? new Date(next) : null
  } catch {
    return null
  }
}

export default async function FacturasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id, mp_preapproval_id')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) redirect('/onboarding')

  const { data: rows } = await supabase
    .from('negocio_facturas')
    .select('id, numero, concepto, monto, estado, metodo_pago, emitida_en, pagada_en, pdf_url')
    .eq('negocio_id', negocio.id)
    .order('emitida_en', { ascending: false })
    .limit(50)

  const facturas = (rows || []).map((r) => {
    const emitida = r.emitida_en ? new Date(r.emitida_en) : new Date()
    return {
      id: r.numero || r.id, // si no hay numero, mostramos uuid corto
      fecha: formatShort(emitida),
      fechaCompleta: formatLong(emitida),
      concepto: r.concepto,
      monto: r.monto,
      estado: r.estado, // pagado | pendiente | vencido
      metodoPago: formatMetodoPago(r.metodo_pago),
      pdfUrl: r.pdf_url || null,
      rowId: r.id,
    }
  })

  const getEstadoBadge = (estado: string) => {
    const configs = {
      pagado: { icon: CheckCircle2, className: 'bg-green-100 text-green-700 border-green-300', label: 'Pagado' },
      pendiente: { icon: Clock, className: 'bg-yellow-100 text-yellow-700 border-yellow-300', label: 'Pendiente' },
      vencido: { icon: XCircle, className: 'bg-red-100 text-red-700 border-red-300', label: 'Vencido' },
    }
    const config = (configs as any)[estado] || configs.pendiente
    const Icon = config.icon
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const totalPagado = facturas
    .filter((f) => f.estado === 'pagado')
    .reduce((sum, f) => sum + f.monto, 0)

  const nextPaymentDate = negocio.mp_preapproval_id
    ? await fetchMpNextPayment(negocio.mp_preapproval_id)
    : null

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-start justify-between gap-4 mb-6">
          <PageHeader
            title="Historial de Facturas"
            description="Descargá y revisá todas tus facturas anteriores"
          />
          <div className="flex-shrink-0 pt-1">
            <SyncFacturasButton />
          </div>
        </div>

        {/* Resumen */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Facturas</p>
                  <p className="text-2xl font-bold text-gray-900">{facturas.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Pagado</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${totalPagado.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Próxima Factura</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {nextPaymentDate ? formatShort(nextPaymentDate) : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de Facturas */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Facturas</CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Factura
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Concepto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {facturas.length === 0 ? (
                    <tr>
                      <td className="px-6 py-10 text-sm text-gray-500" colSpan={6}>
                        Todavía no hay facturas. Cuando MercadoPago cobre (o intente cobrar), van a aparecer acá.
                      </td>
                    </tr>
                  ) : (
                    facturas.map((factura) => (
                      <tr key={factura.rowId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {String(factura.id).length > 18 ? String(factura.id).slice(0, 18) + '…' : factura.id}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{factura.fecha}</div>
                          <div className="text-xs text-gray-500">{factura.metodoPago}</div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{factura.concepto}</div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            ${factura.monto.toLocaleString('es-AR')}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {getEstadoBadge(factura.estado)}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {factura.estado === 'pagado' ? (
                              <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <a
                                  href={`/api/suscripcion/facturas/${factura.rowId}/pdf`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Descargar
                                </a>
                              </Button>
                          ) : factura.estado === 'pendiente' ? (
                            <Button
                              asChild
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <a href="/suscripcion">
                                <CreditCard className="w-4 h-4 mr-1" />
                                Pagar
                              </a>
                            </Button>
                          ) : (
                            <Button
                              asChild
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <a href="/suscripcion">
                                <CreditCard className="w-4 h-4 mr-1" />
                                Regularizar
                              </a>
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Info Adicional */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-blue-900 mb-1">Facturas Automáticas</p>
                <p className="text-sm text-blue-700">
                  Cada cobro (o intento de cobro) de MercadoPago se registra automáticamente y aparece en esta lista.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exportar Todo (lo dejamos, pero lo activamos cuando hagamos ZIP real) */}
        <div className="flex justify-end">
          <Button variant="outline" className="gap-2" disabled title="Lo activamos cuando generemos ZIP real">
            <Download className="w-4 h-4" />
            Exportar Todas las Facturas (ZIP)
          </Button>
        </div>
      </div>
    </div>
    
  )
}