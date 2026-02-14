import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProDashboardPollRefresh } from '@/components/pro/pro-dashboard-poll-refresh'
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { format, startOfMonth, endOfMonth, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { IngresosDiariosConGrafico } from '@/components/dashboard/ingresos-diarios-grafico'
import { ProximosTurnosHoy } from '@/components/dashboard/proximos-turnos-hoy'
import { RefreshButton } from '@/components/dashboard/refresh-button'
import { toZonedTime } from 'date-fns-tz'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const TZ = 'America/Argentina/Buenos_Aires'

function ars(n: number) {
  return `$${Math.round(n).toLocaleString('es-AR')}`
}

export default async function ProDashboardHome() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Profesional logueado (policy self)
  const { data: profesional } = await supabase
    .from('profesionales')
    .select('id, nombre, negocio_id, comision_pct')
    .eq('auth_user_id', user.id)
    .single()

  if (!profesional) redirect('/login')

  const hoyAR = toZonedTime(new Date(), TZ)
  const hoyStr = format(hoyAR, 'yyyy-MM-dd')
  const inicioMesStr = format(startOfMonth(hoyAR), 'yyyy-MM-dd')
  const finMesStr = format(endOfMonth(hoyAR), 'yyyy-MM-dd')

  const firstName = (profesional.nombre || '').trim().split(' ')[0] || ''
  const tituloHeader = firstName ? `¡Hola ${firstName}! 👋` : `¡Hola! 👋`

  // ==================== CAJA DE HOY (MIS GANANCIAS) ====================
  const { data: comisionesHoy } = await supabase
    .from('comisiones')
    .select('monto_comision, estado, fecha_generada')
    .gte('fecha_generada', `${hoyStr}T00:00:00`)
    .lte('fecha_generada', `${hoyStr}T23:59:59`)

  const gananciasHoy = (comisionesHoy || []).reduce(
    (sum: number, c: any) => sum + (Number(c.monto_comision) || 0),
    0
  )

  const comisionesPendientesHoy =
    (comisionesHoy || []).filter((c: any) => c.estado === 'pendiente').length
  const comisionesPagadasHoy =
    (comisionesHoy || []).filter((c: any) => c.estado === 'pagada').length

  // ==================== TURNOS HOY (solo los míos) ====================
  const { data: turnosHoy } = await supabase
    .from('turnos')
    .select(
      'id, fecha, hora_inicio, hora_fin, estado, pago_estado, pago_monto, servicios(nombre, precio), clientes(nombre, telefono)'
    )
    .eq('profesional_id', profesional.id)
    .order('hora_inicio', { ascending: true })

  const turnosTotalesHoy = turnosHoy?.length || 0
  const turnosCompletadosHoy =
    turnosHoy?.filter((t: any) => t.estado === 'completado').length || 0
  const turnosPendientesHoy =
    turnosHoy?.filter(
      (t: any) => t.estado === 'pendiente' || t.estado === 'confirmado'
    ).length || 0

  // ==================== MIS GANANCIAS DEL MES ====================
  const { data: comisionesMes } = await supabase
    .from('comisiones')
    .select('monto_comision, estado, fecha_generada')
    .gte('fecha_generada', `${inicioMesStr}T00:00:00`)
    .lte('fecha_generada', `${finMesStr}T23:59:59`)

  const gananciasMes = (comisionesMes || []).reduce(
    (sum: number, c: any) => sum + (Number(c.monto_comision) || 0),
    0
  )

  const gananciasPendientesMes = (comisionesMes || [])
    .filter((c: any) => c.estado === 'pendiente')
    .reduce((sum: number, c: any) => sum + (Number(c.monto_comision) || 0), 0)

  // ==================== RANKING DEL MES (SEGURO: SERVICE ROLE) ====================
  const admin = createAdminClient()

  const { data: comisionesNegocioMes, error: rankErr } = await admin
    .from('comisiones')
    .select('profesional_id, monto_comision')
    .eq('negocio_id', profesional.negocio_id)
    .gte('fecha_generada', `${inicioMesStr}T00:00:00`)
    .lte('fecha_generada', `${finMesStr}T23:59:59`)

  if (rankErr) {
    // No rompemos el dashboard
    console.error('RANKING_ERR', rankErr)
  }

  const totalsByProf = new Map<string, number>()
  for (const c of comisionesNegocioMes || []) {
    const pid = String((c as any).profesional_id || '')
    if (!pid) continue
    totalsByProf.set(
      pid,
      (totalsByProf.get(pid) || 0) + (Number((c as any).monto_comision) || 0)
    )
  }

  const sorted = Array.from(totalsByProf.entries()).sort((a, b) => b[1] - a[1])
  const totalProfesionalesRank = Math.max(sorted.length, 1)
  const myIndex = sorted.findIndex(([pid]) => pid === profesional.id)
  const miPuesto = myIndex >= 0 ? myIndex + 1 : totalProfesionalesRank
  const miTotalRank = myIndex >= 0 ? sorted[myIndex][1] : 0

  const getRankLabel = (pos: number) => {
    if (pos === 1) return '🥇 #1'
    if (pos === 2) return '🥈 #2'
    if (pos === 3) return '🥉 #3'
    return `#${pos}`
  }

  // ==================== PRÓXIMO TURNO + ATRASADOS ====================
  const ahoraAR = toZonedTime(new Date(), TZ)
  const horaActualStr = format(ahoraAR, 'HH:mm:ss')

  const norm = (x: any) => (Array.isArray(x) ? x[0] : x)

  const normalizados = (turnosHoy || []).map((t: any) => ({
    ...t,
    servicios: norm(t.servicios),
    clientes: norm(t.clientes),
  }))

  const atrasados = normalizados.filter(
    (t: any) =>
      String(t.hora_inicio) < horaActualStr &&
      (t.estado === 'pendiente' || t.estado === 'confirmado')
  )
  const proximos = normalizados.filter(
    (t: any) =>
      String(t.hora_inicio) >= horaActualStr &&
      (t.estado === 'pendiente' || t.estado === 'confirmado')
  )

  const proximoTurno = proximos.length > 0 ? proximos[0] : null
  const atrasadosCount = atrasados.length

  const tiempoParaProximo = proximoTurno
    ? (() => {
        const [h, m] = String(proximoTurno.hora_inicio).split(':').map(Number)
        const turnoFecha = new Date(hoyAR)
        turnoFecha.setHours(h, m, 0, 0)
        const diffMinutos = Math.floor(
          (turnoFecha.getTime() - ahoraAR.getTime()) / 60000
        )

        if (diffMinutos < 0) return 'Ahora'
        if (diffMinutos < 60) return `En ${diffMinutos} min`
        const horas = Math.floor(diffMinutos / 60)
        const mins = diffMinutos % 60
        return `En ${horas}h ${mins}m`
      })()
    : null

  const turnosAdaptados = [...atrasados, ...proximos].slice(0, 5)

  // ==================== INGRESOS DIARIOS (MIS COMISIONES ÚLTIMOS 7 DÍAS) ====================
  const ingresosDiarios = await Promise.all(
    Array.from({ length: 7 }).map(async (_, i) => {
      const fechaAR = subDays(hoyAR, i)
      const fechaStr = format(fechaAR, 'yyyy-MM-dd')

      const { data: comisionesDia } = await supabase
        .from('comisiones')
        .select('monto_comision, fecha_generada')
        .gte('fecha_generada', `${fechaStr}T00:00:00`)
        .lte('fecha_generada', `${fechaStr}T23:59:59`)

      const monto = (comisionesDia || []).reduce(
        (sum: number, c: any) => sum + (Number(c.monto_comision) || 0),
        0
      )

      return {
        fecha: fechaStr,
        monto,
        turnos: (comisionesDia || []).length,
      }
    })
  )

  return (
    <>
    <ProDashboardPollRefresh
      fecha={hoyStr}
      intervalMs={60000}
      profesionalId={profesional.id}
    />
    <div className="space-y-6">
      <PageHeader
        title={tituloHeader}
        description={format(hoyAR, "EEEE d 'de' MMMM", { locale: es })}
      />

      <div className="flex justify-end">
        <RefreshButton />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GANANCIAS DE HOY */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-green-100">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Mis Ganancias Hoy
              </p>
              <p className="text-3xl font-bold text-green-600 mb-1">
                {ars(gananciasHoy)}
              </p>
              <p className="text-xs text-gray-500">
                {comisionesPagadasHoy} pagadas · {comisionesPendientesHoy}{' '}
                pendientes
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
              <p className="text-sm font-medium text-gray-600 mb-1">
                Mis Turnos Hoy
              </p>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {turnosTotalesHoy}
              </p>
              <div className="flex gap-2 text-xs">
                <span className="text-green-600 font-medium">
                  ✓ {turnosCompletadosHoy}
                </span>
                <span className="text-blue-600 font-medium">
                  ⏱ {turnosPendientesHoy}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ganancias del Mes */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-purple-100">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Mis Ganancias del Mes
              </p>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {ars(gananciasMes)}
              </p>
              <p className="text-xs text-gray-500">
                {format(hoyAR, 'MMMM yyyy', { locale: es })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mi Puesto */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-orange-100">
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
              <Badge variant="secondary" className="text-xs">
                {format(hoyAR, 'MMMM yyyy', { locale: es })}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Mi Puesto (Mes)
              </p>

              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-900">
                  {getRankLabel(miPuesto)}
                </p>
                <p className="text-sm text-gray-500">de {totalProfesionalesRank}</p>
              </div>

              <p className="text-xs text-gray-500 mt-1">
                Mis comisiones este mes:{' '}
                <span className="font-semibold text-gray-700">
                  {ars(miTotalRank)}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximo Turno + Pendientes */}
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
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-700 border-blue-300"
                >
                  {tiempoParaProximo}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[80px]">
                  <p className="text-2xl font-bold text-blue-600">
                    {String(proximoTurno.hora_inicio).slice(0, 5)}
                  </p>
                  <p className="text-xs text-gray-500">
                    hasta {String(proximoTurno.hora_fin).slice(0, 5)}
                  </p>
                </div>
                <div className="h-16 w-px bg-blue-200" />
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">
                    {proximoTurno.clientes?.nombre || 'Cliente'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {proximoTurno.servicios?.nombre || 'Servicio'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Estado: {proximoTurno.estado} · Pago: {proximoTurno.pago_estado}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="lg:col-span-2 border-gray-200">
            <CardContent className="p-8 text-center">
              {atrasadosCount > 0 ? (
                <>
                  <XCircle className="w-12 h-12 mx-auto text-red-500 mb-3" />
                  <p className="font-semibold text-gray-700 mb-1">
                    Tenés {atrasadosCount} turnos atrasados
                  </p>
                  <p className="text-sm text-gray-500">
                    Hay turnos pendientes/confirmados antes de la hora actual.
                  </p>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-3" />
                  <p className="font-semibold text-gray-700 mb-1">
                    ¡Todo listo por hoy!
                  </p>
                  <p className="text-sm text-gray-500">
                    No hay más turnos pendientes
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pendientes del profesional */}
        {gananciasPendientesMes > 0 && (
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
            <CardHeader className="border-b border-amber-100 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Pendiente de Cobro
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Link href="/pro/ganancias">
                <div className="p-3 rounded-lg bg-white border border-amber-200 hover:border-amber-300 transition-colors cursor-pointer">
                  <p className="text-xs text-gray-600 mb-1">
                    Comisiones pendientes
                  </p>
                  <p className="text-lg font-bold text-amber-700">
                    {ars(gananciasPendientesMes)}
                  </p>
                </div>
              </Link>
              <p className="text-xs text-gray-500">
                Esto depende de cuándo el dueño marque/compute pagos.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Gráfico + Próximos turnos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IngresosDiariosConGrafico ingresosDiarios={ingresosDiarios} />
        <div className="pointer-events-none">
            <ProximosTurnosHoy
            tituloFecha={format(hoyAR, "EEEE d 'de' MMMM", { locale: es })}
            turnos={turnosAdaptados}
            />
        </div>
      </div>
    </div>
  </>
  )
}
