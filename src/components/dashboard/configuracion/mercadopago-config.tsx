'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Trash2,
  ShieldCheck,
  ChevronDown,
  Link2,
  KeyRound,
  RefreshCw,
} from 'lucide-react'

interface Props {
  // ✅ Nuevo: estado seguro para UI
  mp_connected_at: string | null
  mp_sena_pct: number
}

export function MercadoPagoConfig({ mp_connected_at, mp_sena_pct }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const configurado = !!mp_connected_at

  // UI state
  const [deleting, setDeleting] = useState(false)
  const [senaPct, setSenaPct] = useState(mp_sena_pct ?? 50)
  const [savingPct, setSavingPct] = useState(false)

  // Avanzado (manual token)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [token, setToken] = useState('')
  const [savingManual, setSavingManual] = useState(false)

  const connectedMsg = useMemo(() => {
    if (!mp_connected_at) return null
    const d = new Date(mp_connected_at)
    // Formato simple (local)
    return isNaN(d.getTime()) ? null : d.toLocaleString()
  }, [mp_connected_at])

  // Mostrar toasts por query params (callback OAuth)
  // /dashboard/.../mercadopago?connected=1 o ?error=...
  useMemo(() => {
    const ok = searchParams.get('connected')
    const err = searchParams.get('error')
    const errDesc = searchParams.get('error_description')

    if (ok === '1') {
      toast({
        title: '¡MercadoPago conectado!',
        description: 'Tu cuenta quedó vinculada correctamente.',
      })
      // refrescar onboarding instantáneo
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('getsolo:onboarding-refresh'))
      }
      // limpiar query para que no se repita el toast
      router.replace('/dashboard/configuracion/integraciones/mercadopago')
      router.refresh()
    }

    if (err) {
      toast({
        title: 'No se pudo conectar MercadoPago',
        description: errDesc || decodeURIComponent(err),
        variant: 'destructive',
      })
      router.replace('/dashboard/configuracion/integraciones/mercadopago')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleDesvincular() {
    setDeleting(true)
    try {
      const res = await fetch('/api/configuracion/mercadopago', { method: 'DELETE' })
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
        description: 'Se eliminó la conexión de MercadoPago.',
      })

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('getsolo:onboarding-refresh'))
      }

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

      toast({
        title: 'Porcentaje actualizado',
        description: `La seña quedó en ${senaPct}%`,
      })
      router.refresh()
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el porcentaje.',
        variant: 'destructive',
      })
    } finally {
      setSavingPct(false)
    }
  }

  async function handleGuardarManual(e: React.FormEvent) {
    e.preventDefault()
    if (!token.trim()) return

    setSavingManual(true)
    try {
      const res = await fetch('/api/configuracion/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mp_access_token: token.trim() }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast({
          title: 'Error al guardar',
          description: data.error || 'Ocurrió un error inesperado',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'MercadoPago configurado',
        description: 'Se guardó correctamente (modo avanzado).',
      })

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
      setSavingManual(false)
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
            MercadoPago
          </CardTitle>
          <CardDescription>
            Conectá tu cuenta para cobrar señas online y reducir cancelaciones.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Badge de estado */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              {configurado ? (
                <ShieldCheck className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-500" />
              )}

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {configurado ? 'Cuenta conectada' : 'No conectado'}
                  </p>
                  {configurado ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Conectado
                    </Badge>
                  ) : (
                    <Badge variant="secondary">No conectado</Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  {configurado
                    ? `Conectado el ${connectedMsg ?? '—'}`
                    : 'Tus clientes solo podrán pagar presencialmente hasta que conectes MercadoPago.'}
                </p>
              </div>
            </div>
          </div>

          {/* Botón OAuth */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="w-full sm:w-auto">
              <a href="/api/mp/connect">
                <Link2 className="w-4 h-4 mr-2" />
                {configurado ? 'Reconectar MercadoPago' : 'Conectar MercadoPago'}
              </a>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => router.refresh()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar estado
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Conexión rápida: no pedimos claves ni tokens. Solo autorizás tu cuenta y listo.
          </p>

          {/* Desvincular */}
          {configurado && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  disabled={deleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleting ? 'Desvinculando...' : 'Desvincular'}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Desvincular MercadoPago?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tus clientes no podrán pagar online hasta que vuelvas a conectar MercadoPago.
                    Los turnos anteriores no se verán afectados.
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
          )}
        </CardContent>
      </Card>

      {/* Porcentaje de seña — solo visible cuando MP está configurado */}
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
              <p>
                • Paga online: <strong>{senaPct}%</strong> del precio del servicio
              </p>
              <p>
                • Resto al llegar al local: <strong>{100 - senaPct}%</strong>
              </p>
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
              ) : (
                'Guardar porcentaje'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Avanzado: modo manual (fallback) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <KeyRound className="w-4 h-4" />
              Avanzado (opcional)
            </span>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced((v) => !v)}
              className="gap-1"
            >
              {showAdvanced ? 'Ocultar' : 'Mostrar'}
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </Button>
          </CardTitle>

          <CardDescription>
            Si tenés un caso especial, podés configurar manualmente un Access Token. Recomendado: usar el botón “Conectar”.
          </CardDescription>
        </CardHeader>

        {showAdvanced && (
          <CardContent>
            <form onSubmit={handleGuardarManual} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mp_token">Access Token (manual)</Label>
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
                  Idealmente no uses esto. Pero si lo necesitás, el token de producción suele empezar con{' '}
                  <code className="bg-gray-100 px-1 rounded">APP_USR-</code>.
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
                disabled={savingManual || !token.trim()}
                className="w-full"
                variant="outline"
              >
                {savingManual ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    Guardando...
                  </span>
                ) : (
                  'Guardar token manual'
                )}
              </Button>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
