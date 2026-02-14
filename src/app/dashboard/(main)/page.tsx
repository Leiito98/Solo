import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TurnosPollRefresh } from '@/components/dashboard/turnos-realtime-refresh'
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Scissors,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { format, startOfMonth, endOfMonth, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { IngresosDiariosConGrafico } from '@/components/dashboard/ingresos-diarios-grafico'
import { ProximosTurnosHoy } from '@/components/dashboard/proximos-turnos-hoy'
import { TurnosAtrasadosHoy } from '@/components/dashboard/turnos-atrasados-hoy'
import { RefreshButton } from '@/components/dashboard/refresh-button'
import { toZonedTime } from 'date-fns-tz'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const TZ = 'America/Argentina/Buenos_Aires'

function ars(n: number) {
  return `$${Math.round(n).toLocaleString('es-AR')}`
}

function firstNameFromMeta(user: any) {
  const first = String(user?.user_metadata?.first_name || '').trim()
  if (first) return first

  const full = String(user?.user_metadata?.full_name || '').trim().replace(/\s+/g, ' ')
  if (!full) return ''
  return full.split(' ')[0] || ''
}

export default async function DashboardHome() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id, nombre, nombrecliente')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) redirect('/onboarding')

  const firstName =
  (negocio.nombrecliente || '').trim().replace(/\s+/g, ' ').split(' ')[0] || ''

  const hoyAR = toZonedTime(new Date(), TZ)
  const hoyStr = format(hoyAR, 'yyyy-MM-dd')
  const inicioMesStr = format(startOfMonth(hoyAR), 'yyyy-MM-dd')
  const finMesStr = format(endOfMonth(hoyAR), 'yyyy-MM-dd')

  const tituloHeader = firstName ? `¡Hola ${firstName}! 👋` : `¡Hola! 👋`

  // ==================== CAJA DE HOY ====================
  const { data: turnosHoyCompletos } = await supabase
    .from('turnos')
    .select('pago_monto, pago_estado, estado, servicios(precio), cliente_id')
    .eq('negocio_id', negocio.id)
    .eq('fecha', hoyStr)

  const cajaDiaTotal = (turnosHoyCompletos || []).reduce((sum, t: any) => {
    const pagoMonto = Number(t.pago_monto) || 0
    const precioServicio = Number(t.servicios?.precio) || 0
    const esTotal = t.estado === 'completado' && t.pago_estado === 'pagado'
    const esSeña = t.estado === 'confirmado' && t.pago_estado === 'parcial'

    if (esTotal) return sum + Math.max(pagoMonto, precioServicio)
    if (esSeña) return sum + pagoMonto
    return sum
  }, 0)

  const turnosCompletadosHoy =
    turnosHoyCompletos?.filter((t: any) => t.estado === 'completado').length || 0

  const turnosCanceladosHoy =
    turnosHoyCompletos?.filter((t: any) => t.estado === 'cancelado').length || 0

  const turnosPendientesHoy =
    turnosHoyCompletos?.filter((t: any) => t.estado === 'pendiente' || t.estado === 'confirmado').length || 0

  const turnosTotalesHoy = turnosHoyCompletos?.length || 0

  // ==================== INGRESOS DEL MES ====================
  const { data: turnosMes } = await supabase
    .from('turnos')
    .select('pago_monto, estado, pago_estado, servicios(precio)')
    .eq('negocio_id', negocio.id)
    .in('estado', ['completado', 'confirmado'])
    .gte('fecha', inicioMesStr)
    .lte('fecha', finMesStr)

  const ingresosMes = (turnosMes || []).reduce((sum, t: any) => {
    const pagoMonto = Number(t.pago_monto) || 0
    const precioServicio = Number(t.servicios?.precio) || 0
    const esSeña = t.estado === 'confirmado' && t.pago_estado === 'parcial'
    const esTotal = t.estado === 'completado' && t.pago_estado === 'pagado'

    if (esSeña) return sum + pagoMonto
    if (esTotal) return sum + Math.max(pagoMonto, precioServicio)
    return sum
  }, 0)

  // ==================== CLIENTES ATENDIDOS HOY ====================
  const clientesHoyUnicos = new Set(
    (turnosHoyCompletos || [])
      .filter((t: any) => t.estado === 'completado')
      .map((t: any) => t.cliente_id)
  ).size

  // ==================== PRÓXIMO TURNO + ATRASADOS ====================
  const ahoraAR = toZonedTime(new Date(), TZ)
  const horaActualStr = format(ahoraAR, 'HH:mm:ss')

  const { data: proximoTurno } = await supabase
    .from('turnos')
    .select(
      `
      id,
      hora_inicio,
      hora_fin,
      estado,
      servicios(nombre),
      profesionales(nombre),
      clientes(nombre, telefono)
    `
    )
    .eq('negocio_id', negocio.id)
    .eq('fecha', hoyStr)
    .in('estado', ['pendiente', 'confirmado'])
    .gte('hora_inicio', horaActualStr)
    .order('hora_inicio', { ascending: true })
    .limit(1)
    .maybeSingle()

  const { count: atrasadosCount } = await supabase
    .from('turnos')
    .select('id', { count: 'exact', head: true })
    .eq('negocio_id', negocio.id)
    .eq('fecha', hoyStr)
    .in('estado', ['pendiente', 'confirmado'])
    .lt('hora_inicio', horaActualStr)

  const tiempoParaProximo = proximoTurno
    ? (() => {
        const [h, m] = String((proximoTurno as any).hora_inicio).split(':').map(Number)
        const turnoFecha = new Date(hoyAR)
        turnoFecha.setHours(h, m, 0, 0)
        const diffMinutos = Math.floor((turnoFecha.getTime() - ahoraAR.getTime()) / 60000)

        if (diffMinutos < 0) return 'Ahora'
        if (diffMinutos < 60) return `En ${diffMinutos} min`
        const horas = Math.floor(diffMinutos / 60)
        const mins = diffMinutos % 60
        return `En ${horas}h ${mins}m`
      })()
    : null

  // ==================== INGRESOS DIARIOS (ÚLTIMOS 7 DÍAS) ====================
  const ingresosDiarios = await Promise.all(
    Array.from({ length: 7 }).map(async (_, i) => {
      const fechaAR = subDays(hoyAR, i)
      const fechaStr = format(fechaAR, 'yyyy-MM-dd')

      const { data: turnosDia } = await supabase
        .from('turnos')
        .select('pago_monto, pago_estado, estado, servicios(precio)')
        .eq('negocio_id', negocio.id)
        .in('estado', ['completado', 'confirmado'])
        .eq('fecha', fechaStr)

      const monto = (turnosDia || []).reduce((sum, t: any) => {
        const pagoMonto = Number(t.pago_monto) || 0
        const precioServicio = Number(t.servicios?.precio) || 0
        const esSeña = t.estado === 'confirmado' && t.pago_estado === 'parcial'
        const esTotal = t.estado === 'completado' && t.pago_estado === 'pagado'

        if (esSeña) return sum + pagoMonto
        if (esTotal) return sum + Math.max(pagoMonto, precioServicio)
        return sum
      }, 0)

      return {
        fecha: fechaStr,
        monto,
        turnos: turnosDia?.filter((t: any) => t.estado === 'completado').length || 0,
      }
    })
  )

  // ==================== TOP PROFESIONALES DEL MES ====================
  const { data: turnosMesDetalle } = await supabase
    .from('turnos')
    .select(
      `
      estado,
      pago_estado,
      pago_monto,
      profesionales(id, nombre),
      servicios(precio)
    `
    )
    .eq('negocio_id', negocio.id)
    .eq('estado', 'completado')
    .eq('pago_estado', 'pagado')
    .gte('fecha', inicioMesStr)
    .lte('fecha', finMesStr)

  const mapProf = new Map<string, { id: string; nombre: string; turnos: number; total: number }>()

  for (const t of turnosMesDetalle || []) {
    const prof = Array.isArray((t as any).profesionales) ? (t as any).profesionales[0] : (t as any).profesionales
    if (!prof?.id) continue

    const pagoMonto = Number((t as any).pago_monto) || 0
    const precioServicio = Number((t as any).servicios?.precio) || 0
    const monto = Math.max(pagoMonto, precioServicio)

    const prev = mapProf.get(prof.id) || {
      id: prof.id,
      nombre: prof.nombre || 'Profesional',
      turnos: 0,
      total: 0,
    }

    prev.turnos += 1
    prev.total += monto
    mapProf.set(prof.id, prev)
  }

  const topProfesionales = Array.from(mapProf.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)

  // ==================== PRÓXIMOS TURNOS DE HOY ====================
  const { data: turnosActivosHoy } = await supabase
    .from('turnos')
    .select(
      `
    id,
    fecha,
    hora_inicio,
    hora_fin,
    estado,
    servicios(nombre),
    profesionales(nombre),
    clientes(nombre, telefono)
  `
    )
    .eq('negocio_id', negocio.id)
    .eq('fecha', hoyStr)
    .in('estado', ['pendiente', 'confirmado'])
    .order('hora_inicio', { ascending: true })

  const normalizados = (turnosActivosHoy || []).map((t: any) => ({
    ...t,
    servicios: Array.isArray(t.servicios) ? t.servicios[0] : t.servicios,
    profesionales: Array.isArray(t.profesionales) ? t.profesionales[0] : t.profesionales,
    clientes: Array.isArray(t.clientes) ? t.clientes[0] : t.clientes,
  }))

  const atrasados = normalizados.filter((t: any) => String(t.hora_inicio) < horaActualStr)
  const proximos = normalizados.filter((t: any) => String(t.hora_inicio) >= horaActualStr)
  const turnosAdaptados = [...atrasados, ...proximos].slice(0, 5)

  // ==================== ALERTAS / ACCIONES PENDIENTES ====================
  const { data: comisionesPendientes } = await supabase
    .from('comisiones')
    .select('monto_comision')
    .eq('negocio_id', negocio.id)
    .eq('estado', 'pendiente')

  const totalComisionesPendientes = (comisionesPendientes || []).reduce(
    (sum, c: any) => sum + (Number(c.monto_comision) || 0),
    0
  )

  const { data: gastosPendientes } = await supabase
    .from('pagos_gastos')
    .select('monto')
    .eq('negocio_id', negocio.id)
    .eq('estado', 'pendiente')

  const totalGastosPendientes = (gastosPendientes || []).reduce((sum, g: any) => sum + (Number(g.monto) || 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader title={tituloHeader} description={format(hoyAR, "EEEE d 'de' MMMM", { locale: es })} />

      <div className="flex justify-end">
        <RefreshButton autoIntervalMs={60000} />
      </div>

      {/* KPIs Principales - Enfoque en CAJA DE HOY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CAJA DE HOY - LO MÁS IMPORTANTE */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-green-100">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Caja de Hoy</p>
              <p className="text-3xl font-bold text-green-600 mb-1">{ars(cajaDiaTotal)}</p>
              <p className="text-xs text-gray-500">
                {turnosCompletadosHoy} completados de {turnosTotalesHoy}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Turnos de Hoy */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-100">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Turnos Hoy</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{turnosTotalesHoy}</p>
              <div className="flex gap-2 text-xs">
                <span className="text-green-600 font-medium">✔️ {turnosCompletadosHoy}</span>
                <span className="text-blue-600 font-medium">⏱ {turnosPendientesHoy}</span>
                <span className="text-red-600 font-medium">❌ {turnosCanceladosHoy}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ingresos del Mes */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-purple-100">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Ingresos del Mes</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{ars(ingresosMes)}</p>
              <p className="text-xs text-gray-500">{format(hoyAR, 'MMMM yyyy', { locale: es })}</p>
            </div>
          </CardContent>
        </Card>

        {/* Clientes Atendidos Hoy */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-orange-100">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Clientes Hoy</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{clientesHoyUnicos}</p>
              <p className="text-xs text-gray-500">atendidos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximo Turno + Acciones Pendientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Próximo Turno */}
        {proximoTurno ? (
          <Card className="lg:col-span-2 border-blue-200 bg-gradient-to-r from-blue-50 to-white">
            <CardHeader className="border-b border-blue-100 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Próximo Turno
                </CardTitle>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                  {tiempoParaProximo}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[80px]">
                  <p className="text-2xl font-bold text-blue-600">
                    {String((proximoTurno as any).hora_inicio).slice(0, 5)}
                  </p>
                  <p className="text-xs text-gray-500">hasta {String((proximoTurno as any).hora_fin).slice(0, 5)}</p>
                </div>
                <div className="h-16 w-px bg-blue-200" />
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">{(proximoTurno as any).clientes?.nombre || 'Cliente'}</p>
                  <p className="text-sm text-gray-600">{(proximoTurno as any).servicios?.nombre || 'Servicio'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    con {(proximoTurno as any).profesionales?.nombre || 'Profesional'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="lg:col-span-2 border-gray-200">
            <CardContent className="p-8 text-center">
              {(atrasadosCount ?? 0) > 0 ? (
                <>
                  <XCircle className="w-12 h-12 mx-auto text-red-500 mb-3" />
                  <p className="font-semibold text-gray-700 mb-1">Tenés {(atrasadosCount ?? 0)} turnos atrasados</p>
                  <p className="text-sm text-gray-500">Hay turnos pendientes/confirmados antes de la hora actual.</p>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-3" />
                  <p className="font-semibold text-gray-700 mb-1">¡Todo listo por hoy!</p>
                  <p className="text-sm text-gray-500">No hay más turnos pendientes</p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Acciones Pendientes */}
        {(totalComisionesPendientes > 0 || totalGastosPendientes > 0) && (
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
            <CardHeader className="border-b border-amber-100 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {totalComisionesPendientes > 0 && (
                <Link href="/dashboard/finanzas/comisiones">
                  <div className="p-3 rounded-lg bg-white border border-amber-200 hover:border-amber-300 transition-colors cursor-pointer">
                    <p className="text-xs text-gray-600 mb-1">Comisiones a pagar</p>
                    <p className="text-lg font-bold text-amber-700">{ars(totalComisionesPendientes)}</p>
                  </div>
                </Link>
              )}
              {totalGastosPendientes > 0 && (
                <Link href="/dashboard/finanzas/gastos">
                  <div className="p-3 rounded-lg bg-white border border-amber-200 hover:border-amber-300 transition-colors cursor-pointer">
                    <p className="text-xs text-gray-600 mb-1">Gastos pendientes</p>
                    <p className="text-lg font-bold text-amber-700">{ars(totalGastosPendientes)}</p>
                  </div>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Ingresos Diarios + Próximos Turnos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IngresosDiariosConGrafico ingresosDiarios={ingresosDiarios} />
        <ProximosTurnosHoy tituloFecha={format(hoyAR, "EEEE d 'de' MMMM", { locale: es })} turnos={turnosAdaptados} />
      </div>

      {/* Top Profesionales del Mes */}
      {topProfesionales.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Scissors className="w-5 h-5 text-gray-600" />
              Top Profesionales del Mes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topProfesionales.map((p, idx) => {
                const colores = [
                  'from-yellow-50 to-yellow-100 border-yellow-300',
                  'from-gray-50 to-gray-100 border-gray-300',
                  'from-orange-50 to-orange-100 border-orange-300',
                ]
                const iconos = ['🥇', '🥈', '🥉']

                return (
                  <div key={p.id} className={`p-4 rounded-lg border-2 bg-gradient-to-br ${colores[idx]}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{iconos[idx]}</span>
                      <Badge variant="secondary" className="text-xs">
                        {p.turnos} turnos
                      </Badge>
                    </div>
                    <p className="font-bold text-gray-900 text-lg mb-1">{p.nombre}</p>
                    <p className="text-2xl font-bold text-gray-700">{ars(p.total)}</p>
                    <p className="text-xs text-gray-600 mt-1">facturado este mes</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}