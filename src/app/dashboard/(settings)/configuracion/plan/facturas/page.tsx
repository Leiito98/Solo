import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Calendar, CreditCard, CheckCircle2, XCircle, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FacturasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // Simular historial de facturas
  const facturas = [
    {
      id: 'FAC-2026-002',
      fecha: '15 Feb 2026',
      fechaCompleta: '15 de febrero, 2026',
      concepto: 'Plan Pro - Febrero 2026',
      monto: 28000,
      estado: 'pagado',
      metodoPago: 'Visa •••• 4242',
      pdfUrl: '#'
    },
    {
      id: 'FAC-2026-001',
      fecha: '15 Ene 2026',
      fechaCompleta: '15 de enero, 2026',
      concepto: 'Plan Pro - Enero 2026',
      monto: 28000,
      estado: 'pagado',
      metodoPago: 'Visa •••• 4242',
      pdfUrl: '#'
    },
    {
      id: 'FAC-2025-012',
      fecha: '15 Dic 2025',
      fechaCompleta: '15 de diciembre, 2025',
      concepto: 'Plan Solo - Diciembre 2025',
      monto: 20000,
      estado: 'pagado',
      metodoPago: 'Mastercard •••• 5555',
      pdfUrl: '#'
    },
    {
      id: 'FAC-2025-011',
      fecha: '15 Nov 2025',
      fechaCompleta: '15 de noviembre, 2025',
      concepto: 'Plan Solo - Noviembre 2025',
      monto: 20000,
      estado: 'pagado',
      metodoPago: 'Mastercard •••• 5555',
      pdfUrl: '#'
    },
    {
      id: 'FAC-2025-010',
      fecha: '15 Oct 2025',
      fechaCompleta: '15 de octubre, 2025',
      concepto: 'Plan Solo - Octubre 2025',
      monto: 20000,
      estado: 'pendiente',
      metodoPago: 'Mastercard •••• 5555',
      pdfUrl: '#'
    }
  ]

  const getEstadoBadge = (estado: string) => {
    const configs = {
      pagado: {
        icon: CheckCircle2,
        className: 'bg-green-100 text-green-700 border-green-300',
        label: 'Pagado'
      },
      pendiente: {
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        label: 'Pendiente'
      },
      vencido: {
        icon: XCircle,
        className: 'bg-red-100 text-red-700 border-red-300',
        label: 'Vencido'
      }
    }

    const config = configs[estado as keyof typeof configs] || configs.pendiente
    const Icon = config.icon

    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const totalPagado = facturas
    .filter(f => f.estado === 'pagado')
    .reduce((sum, f) => sum + f.monto, 0)

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Historial de Facturas" 
        description="Descargá y revisá todas tus facturas anteriores"
      />

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
                <p className="text-lg font-semibold text-gray-900">15 Mar 2026</p>
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
                {facturas.map((factura) => (
                  <tr key={factura.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {factura.id}
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
                          variant="ghost" 
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Descargar
                        </Button>
                      ) : factura.estado === 'pendiente' ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Pagar
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Regularizar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
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
                Cada factura se genera automáticamente el día 15 de cada mes y se envía a tu email. 
                Podés descargarla en formato PDF desde esta página.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exportar Todo */}
      <div className="flex justify-end">
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar Todas las Facturas (ZIP)
        </Button>
      </div>
    </div>
  )
}