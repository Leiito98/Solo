'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { CheckCircle2, XCircle, AlertCircle, ExternalLink, Trash2, ShieldCheck } from 'lucide-react'

interface Props {
  configurado: boolean
  token_preview: string | null
  token_tipo: 'test' | 'produccion' | 'desconocido' | null
  mp_sena_pct: number
}

export function MercadoPagoConfig({ configurado, token_preview, token_tipo, mp_sena_pct }: Props) {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [senaPct, setSenaPct] = useState(mp_sena_pct ?? 50)
  const [savingPct, setSavingPct] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    if (!token.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/configuracion/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mp_access_token: token.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: 'Error al guardar',
          description: data.error || 'Ocurrió un error inesperado',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: '¡MercadoPago configurado!',
        description: `Token ${data.token_tipo === 'test' ? 'de prueba' : 'de producción'} guardado correctamente.`,
      })

      // ✅ refrescar onboarding instantáneo
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('getsolo:onboarding-refresh'))
      }

      setToken('')
      router.refresh()
    } catch {
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleDesvincular() {
    setDeleting(true)
    try {
      const res = await fetch('/api/configuracion/mercadopago', {
        method: 'DELETE',
      })

      if (!res.ok) {
        toast({
          title: 'Error',
          description: 'No se pudo desvincular la cuenta.',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Cuenta desvinculada',
        description: 'Se eliminó la configuración de MercadoPago.',
      })
      router.refresh()
    } catch {
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor.',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  async function handleGuardarPct() {
    setSavingPct(true)
    try {
      const res = await fetch('/api/configuracion/mercadopago', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mp_sena_pct: senaPct }),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Porcentaje actualizado', description: `La seña quedó en ${senaPct}%` })
      router.refresh()
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar el porcentaje.', variant: 'destructive' })
    } finally {
      setSavingPct(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Estado actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {configurado ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400" />
            )}
            Estado de la integración
          </CardTitle>
        </CardHeader>
        <CardContent>
          {configurado ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Cuenta conectada
                    </p>
                    <p className="text-xs text-green-600 font-mono">
                      Token: {token_preview}
                      {token_tipo && (
                        <span className={`ml-2 px-1.5 py-0.5 rounded text-xs font-semibold ${
                          token_tipo === 'test'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {token_tipo === 'test' ? 'SANDBOX' : 'PRODUCCIÓN'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    disabled={deleting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleting ? 'Desvinculando...' : 'Desvincular cuenta'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Desvincular MercadoPago?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tus clientes no podrán pagar online hasta que configures un nuevo token.
                      Los turnos y pagos anteriores no se verán afectados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDesvincular}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Sí, desvincular
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <p className="text-sm text-gray-600">
                No hay ninguna cuenta de MercadoPago conectada. Tus clientes solo podrán pagar de forma presencial.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuración de porcentaje de seña — solo visible cuando MP está configurado */}
      {configurado && (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span>💳</span> Porcentaje de seña
          </CardTitle>
          <CardDescription>
            Cuánto paga el cliente al reservar. El resto lo abona en el local.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Seña online</span>
              <span className="text-2xl font-bold text-primary">{senaPct}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={senaPct}
              onChange={(e) => setSenaPct(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>10%</span>
              <span className="relative -left-7">50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 space-y-1">
            <p className="font-medium">Vista previa para el cliente:</p>
            <p>• Paga online: <strong>{senaPct}%</strong> del precio del servicio</p>
            <p>• Resto al llegar al local: <strong>{100 - senaPct}%</strong></p>
          </div>

          <Button
            onClick={handleGuardarPct}
            disabled={savingPct || senaPct === (mp_sena_pct ?? 50)}
            className="w-full"
          >
            {savingPct ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </span>
            ) : 'Guardar porcentaje'}
          </Button>
        </CardContent>
      </Card>
      )}

      {/* Formulario para guardar/actualizar token */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {configurado ? 'Reemplazar token' : 'Conectar MercadoPago'}
          </CardTitle>
          <CardDescription>
            Ingresá tu Access Token de MercadoPago para recibir pagos online directamente en tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGuardar} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mp_token">Access Token</Label>
              <Input
                id="mp_token"
                type="password"
                placeholder="APP_USR-XXXX..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="font-mono text-sm"
                autoComplete="off"
              />
              <p className="text-xs text-gray-500">
                Debe empezar con <code className="bg-gray-100 px-1 rounded">APP_USR-</code> (producción).
              </p>
            </div>

            {/* Instrucciones */}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg space-y-1">
              <p className="text-xs font-semibold text-blue-800">¿Cómo obtengo mi Access Token?</p>
              <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                <li>Entrá a tu cuenta de MercadoPago</li>
                <li>Ir a <strong>Configuración → Integraciones → Tus integraciones → Crear aplicación</strong></li>
                <li><strong> Nombre del local → Pagos online → A través de una plataforma → Otra plataforma: Solo</strong></li>
                <li>Copiá el <strong>Access Token de producción</strong></li>
                <li>Pegas el Access Token aca y Listo!</li>
              </ol>
              <a
                href="https://www.mercadopago.com.ar/developers/panel/app"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline mt-1"
              >
                Ir al panel de desarrolladores
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <Button
              type="submit"
              disabled={loading || !token.trim()}
              className="w-full"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando y guardando...
                </span>
              ) : (
                configurado ? 'Reemplazar token' : 'Conectar cuenta'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

    </div>
  )
}