import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RequestIntegrationDialogButton } from '@/components/dashboard/integraciones/request-integration-dialog'
import {
  CreditCard,
  MessageSquare,
  Instagram,
  Facebook,
  Zap,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Settings,
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type ColorKey = 'blue' | 'green' | 'purple' | 'indigo' | 'red' | 'yellow' | 'orange'

const colorClasses: Record<
  ColorKey,
  { bg: string; icon: string; badge: string; border: string; gradient: string }
> = {
  blue: {
    bg: 'bg-blue-100',
    icon: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700 border-blue-300',
    border: 'border-blue-200',
    gradient: 'bg-gradient-to-r from-blue-50 to-white',
  },
  green: {
    bg: 'bg-green-100',
    icon: 'text-green-600',
    badge: 'bg-green-100 text-green-700 border-green-300',
    border: 'border-green-200',
    gradient: 'bg-gradient-to-r from-green-50 to-white',
  },
  purple: {
    bg: 'bg-purple-100',
    icon: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-700 border-purple-300',
    border: 'border-purple-200',
    gradient: 'bg-gradient-to-r from-purple-50 to-white',
  },
  indigo: {
    bg: 'bg-indigo-100',
    icon: 'text-indigo-600',
    badge: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    border: 'border-indigo-200',
    gradient: 'bg-gradient-to-r from-indigo-50 to-white',
  },
  red: {
    bg: 'bg-red-100',
    icon: 'text-red-600',
    badge: 'bg-red-100 text-red-700 border-red-300',
    border: 'border-red-200',
    gradient: 'bg-gradient-to-r from-red-50 to-white',
  },
  yellow: {
    bg: 'bg-yellow-100',
    icon: 'text-yellow-600',
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    border: 'border-yellow-200',
    gradient: 'bg-gradient-to-r from-yellow-50 to-white',
  },
  orange: {
    bg: 'bg-orange-100',
    icon: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-700 border-orange-300',
    border: 'border-orange-200',
    gradient: 'bg-gradient-to-r from-orange-50 to-white',
  },
}

function tokenTipo(token: string | null) {
  if (!token) return null
  if (token.startsWith('TEST-')) return 'test'
  if (token.startsWith('APP_USR-')) return 'produccion'
  return 'desconocido'
}

function tokenPreview(token: string | null) {
  if (!token) return null
  const last4 = token.slice(-4)
  return `****${last4}`
}

function cleanStr(v: unknown) {
  const s = typeof v === 'string' ? v.trim() : ''
  return s.length ? s : null
}

function isValidUrl(u: string) {
  try {
    const url = new URL(u)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function normalizeInstagram(raw: string | null) {
  if (!raw) return null
  const s = raw.trim()
  if (!s) return null
  if (isValidUrl(s)) return s
  if (/instagram\.com/i.test(s)) return `https://${s.replace(/^\/+/, '').replace(/^https?:\/\//, '')}`
  const username = s.replace(/^@/, '').replace(/^\/+/, '')
  return username ? `https://instagram.com/${encodeURIComponent(username)}` : null
}

function normalizeFacebook(raw: string | null) {
  if (!raw) return null
  const s = raw.trim()
  if (!s) return null
  if (isValidUrl(s)) return s
  if (/facebook\.com/i.test(s)) return `https://${s.replace(/^\/+/, '').replace(/^https?:\/\//, '')}`
  const handle = s.replace(/^@/, '').replace(/^\/+/, '')
  return handle ? `https://facebook.com/${encodeURIComponent(handle)}` : null
}

export default async function IntegracionesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  /**
   * ✅ IMPORTANTE (por tu arquitectura):
   * - NO uses negocios.mp_access_token para “conectado” (esa columna es riesgosa y además puede no estar sincronizada).
   * - Usá el flag mp_connected_at (en negocios) que se setea en mp/callback/route.ts
   *   O si preferís: consultar negocio_mp_tokens con admin en un endpoint.
   *
   * Acá lo resolvemos 100% server-side con mp_connected_at.
   */
  const { data: negocio, error: negErr } = await supabase
    .from('negocios')
    .select('id, instagram, facebook, mp_connected_at')
    .eq('owner_id', user.id)
    .single()

  if (negErr || !negocio) redirect('/register')

  const mpConectado = !!negocio.mp_connected_at

  // Redes sociales por URL guardada en negocios
  const instagramUrl = normalizeInstagram(cleanStr(negocio.instagram))
  const facebookUrl = normalizeFacebook(cleanStr(negocio.facebook))
  const igConectado = !!instagramUrl
  const fbConectado = !!facebookUrl

  const integraciones = [
    {
      id: 'mercadopago',
      nombre: 'MercadoPago',
      descripcion: 'Procesá pagos y cobrá señas online de forma segura',
      categoria: 'Pagos',
      icon: CreditCard,
      conectado: mpConectado,
      esencial: true,
      color: 'blue' as ColorKey,
      href: '/dashboard/configuracion/integraciones/mercadopago',
      detalles: mpConectado ? `Cuenta conectada · ${new Date(negocio.mp_connected_at)}` : null,
      disconnectApi: '/api/integraciones/mercadopago/disconnect',
    },

    {
      id: 'whatsapp',
      nombre: 'WhatsApp Business',
      descripcion: 'Enviá confirmaciones y recordatorios por WhatsApp',
      categoria: 'Comunicación',
      icon: MessageSquare,
      conectado: false,
      esencial: false,
      color: 'green' as ColorKey,
      href: '/dashboard/configuracion/integraciones/whatsapp',
      detalles: null,
      proximamente: true,
    },

    {
      id: 'instagram',
      nombre: 'Instagram',
      descripcion: 'Mostrá tu Instagram y llevá clientes a reservar',
      categoria: 'Redes Sociales',
      icon: Instagram,
      conectado: igConectado,
      esencial: false,
      color: 'purple' as ColorKey,
      href: '/dashboard/configuracion/integraciones/redes-sociales',
      detalles: igConectado ? `Vinculado · ${instagramUrl}` : null,
      viewUrl: instagramUrl,
    },

    {
      id: 'facebook',
      nombre: 'Facebook',
      descripcion: 'Mostrá tu Facebook y llevá clientes a reservar',
      categoria: 'Redes Sociales',
      icon: Facebook,
      conectado: fbConectado,
      esencial: false,
      color: 'indigo' as ColorKey,
      href: '/dashboard/configuracion/integraciones/redes-sociales',
      detalles: fbConectado ? `Vinculado · ${facebookUrl}` : null,
      viewUrl: facebookUrl,
    },
  ]

  const integradosCount = integraciones.filter((i: any) => i.conectado).length
  const disponiblesCount = integraciones.filter((i: any) => !i.conectado && !i.proximamente).length
  const proximamenteCount = integraciones.filter((i: any) => i.proximamente).length

  return (
    <div className="space-y-6">
      <PageHeader title="Integraciones" description="Conectá Solo con tus herramientas favoritas" />

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Conectadas</p>
                <p className="text-2xl font-bold text-gray-900">{integradosCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Disponibles</p>
                <p className="text-2xl font-bold text-gray-900">{disponiblesCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Próximamente</p>
                <p className="text-2xl font-bold text-gray-900">{proximamenteCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integraciones Esenciales */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-blue-500 rounded-full" />
          Integraciones Esenciales
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {integraciones
            .filter((i: any) => i.esencial)
            .map((integracion: any) => {
              const Icon = integracion.icon
              const colors = colorClasses[integracion.color as ColorKey]

              return (
                <Card
                  key={integracion.id}
                  className={
                    integracion.conectado ? `border-2 ${colors.border} ${colors.gradient}` : 'border-gray-200'
                  }
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-6 h-6 ${colors.icon}`} />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{integracion.nombre}</h4>

                            {integracion.conectado ? (
                              <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Conectado
                              </Badge>
                            ) : null}
                          </div>

                          <p className="text-sm text-gray-500 mb-2">{integracion.descripcion}</p>
                          {integracion.detalles && <p className="text-xs text-gray-400 mt-2">{integracion.detalles}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {integracion.conectado ? (
                        <>
                          <Button variant="outline" size="sm" asChild className="flex-1">
                            <Link href={integracion.href}>
                              <Settings className="w-4 h-4 mr-2" />
                              Configurar
                            </Link>
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90" asChild>
                          <Link href={integracion.href}>
                            Conectar
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      </div>

      {/* Todas las Integraciones */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-purple-500 rounded-full" />
          Todas las Integraciones
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integraciones
            .filter((i: any) => !i.esencial)
            .map((integracion: any) => {
              const Icon = integracion.icon
              const colors = colorClasses[integracion.color as ColorKey]

              return (
                <Card
                  key={integracion.id}
                  className={
                    integracion.conectado ? `border-2 ${colors.border} ${colors.gradient}` : 'hover:shadow-md transition-shadow'
                  }
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${colors.icon}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">{integracion.nombre}</h4>

                          {integracion.proximamente ? (
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              Pronto
                            </Badge>
                          ) : integracion.conectado ? (
                            <Badge className="bg-green-100 text-green-700 border-green-300 text-xs flex-shrink-0">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Conectado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              Vincular
                            </Badge>
                          )}
                        </div>

                        <Badge className={`${colors.badge} text-xs mb-2`}>{integracion.categoria}</Badge>
                        <p className="text-xs text-gray-500 leading-relaxed">{integracion.descripcion}</p>

                        {integracion.detalles && (
                          <p className="text-[11px] text-gray-400 mt-2 break-all">{integracion.detalles}</p>
                        )}
                      </div>
                    </div>

                    {integracion.proximamente ? (
                      <Button variant="outline" size="sm" disabled className="w-full">
                        Próximamente
                      </Button>
                    ) : integracion.conectado ? (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={integracion.href}>
                            <Settings className="w-4 h-4 mr-2" />
                            Configurar
                          </Link>
                        </Button>

                        {integracion.viewUrl ? (
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <a href={integracion.viewUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Ver
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    ) : (
                      <Button size="sm" className="w-full" asChild>
                        <Link href={integracion.href}>
                          Vincular
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
        </div>
      </div>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-blue-900 mb-1">Integraciones Seguras</p>
              <p className="text-sm text-blue-700">
                Tus integraciones se guardan por negocio. Podés conectar/desconectar cuando quieras.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Solicitar Integración */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <ExternalLink className="w-6 h-6 text-purple-600" />
            </div>

            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">¿Necesitás otra integración?</h4>
              <p className="text-sm text-gray-600 mb-4">
                Si querés conectar Solo con otra herramienta, lo evaluamos para próximas versiones.
              </p>

              <RequestIntegrationDialogButton />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
