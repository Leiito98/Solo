import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Plus, Trash2, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MetodosPagoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // Simular métodos de pago guardados
  const metodosPago = [
    {
      id: '1',
      tipo: 'visa',
      ultimos4: '4242',
      vencimiento: '12/2027',
      titular: 'Juan Pérez',
      predeterminado: true
    },
    {
      id: '2',
      tipo: 'mastercard',
      ultimos4: '5555',
      vencimiento: '08/2026',
      titular: 'Juan Pérez',
      predeterminado: false
    }
  ]

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      debito: '💳'
    }
    return icons[tipo] || '💳'
  }

  const getTipoNombre = (tipo: string) => {
    const nombres: Record<string, string> = {
      visa: 'Visa',
      mastercard: 'Mastercard',
      amex: 'American Express',
      debito: 'Débito'
    }
    return nombres[tipo] || 'Tarjeta'
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Métodos de Pago" 
        description="Gestioná las tarjetas y formas de pago para tu suscripción"
      />

      {/* Botón Agregar */}
      <div className="flex justify-end">
        <Button className="bg-blue-500 hover:bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Método de Pago
        </Button>
      </div>

      {/* Lista de Métodos de Pago */}
      <div className="space-y-3">
        {metodosPago.map((metodo) => (
          <Card 
            key={metodo.id}
            className={`${
              metodo.predeterminado 
                ? 'border-2 border-blue-500 bg-blue-50/30' 
                : 'border-gray-200'
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Icono de tarjeta */}
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-2xl">
                    {getTipoIcon(metodo.tipo)}
                  </div>

                  {/* Detalles */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">
                        {getTipoNombre(metodo.tipo)} •••• {metodo.ultimos4}
                      </p>
                      {metodo.predeterminado && (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Predeterminada
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Vence {metodo.vencimiento} • {metodo.titular}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                  {!metodo.predeterminado && (
                    <Button variant="outline" size="sm">
                      Hacer Predeterminada
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Seguridad */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-900 mb-1">Pagos 100% Seguros</p>
              <p className="text-sm text-green-700">
                Todos los pagos son procesados de forma segura a través de MercadoPago. 
                No almacenamos información completa de tus tarjetas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Facturación */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información de Facturación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre o Razón Social
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CUIT/CUIL (opcional)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="20-12345678-9"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección de Facturación
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Av. Corrientes 1234, CABA"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Buenos Aires"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Postal
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="1001"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button className="bg-primary hover:bg-primary/90">
              Guardar Información de Facturación
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Nota sobre próximo cobro */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">
            💡 <strong>Próximo cobro:</strong> El 15 de marzo, 2026 se cobrará 
            $28.000 a tu método de pago predeterminado. Recibirás una factura por email.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}