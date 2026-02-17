"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  X,
  CheckCircle2,
  Circle,
  Store,
  Scissors,
  Users,
  Calendar,
  ChevronRight,
  Palette,
  DollarSign,
  Package,
  Share2,
  UserPlus,
  Clock,
  ChevronUp,
  ChevronDown,
  Sparkles,
  CreditCard,
  MessageSquare,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import confetti from "canvas-confetti"
import Link from "next/link"

type Priority = "essential" | "recommended" | "optional"

type OnboardingTask = {
  id: string
  title: string
  description: string
  route: string
  icon: any
  completed: boolean
  priority: Priority
}

type OnboardingPanelProps = {
  negocioId: string
  userFirstName: string
}

function fireConfetti() {
  const duration = 1400
  const end = Date.now() + duration

  const frame = () => {
    confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 } })
    confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 } })
    if (Date.now() < end) requestAnimationFrame(frame)
  }

  frame()
}

function daysLeftFromISO(trialEndsAtISO: string | null) {
  if (!trialEndsAtISO) return null
  const end = new Date(trialEndsAtISO).getTime()
  if (!Number.isFinite(end)) return null
  const now = Date.now()
  const diff = end - now
  // ceil para que si queda 1.2 días muestre "2 días"
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function OnboardingPanel({ negocioId }: OnboardingPanelProps) {
  const pathname = usePathname()
  const supabase = useMemo(() => createClient(), [])

  // UI state
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  // data
  const [tasks, setTasks] = useState<OnboardingTask[]>([])
  const [hasLoaded, setHasLoaded] = useState(false)

  // negocio meta para banners/whatsapp
  const [negocioSlug, setNegocioSlug] = useState<string | null>(null)
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null)
  const [suscripcionEstado, setSuscripcionEstado] = useState<string | null>(null)
  const [plan, setPlan] = useState<string | null>(null)

  // done overlay
  const [showDone, setShowDone] = useState(false)

  // avoid overlapping refresh
  const refreshingRef = useRef(false)

  // used to detect "a step completed now" (auto-minimize)
  const prevCompletedIdsRef = useRef<Set<string>>(new Set())

  // prevent confetti / dismiss loop
  const doneHandledRef = useRef(false)

  const LS_DISMISSED = `onboarding_panel_dismissed_${negocioId}`
  const LS_MINIMIZED = `onboarding_panel_minimized_${negocioId}`
  const LS_DONE = `onboarding_panel_done_${negocioId}`

  // 📌 WhatsApp (poné tu número con código país, sin + ni espacios)
  // Ej: "5491123456789"
  const WHATSAPP_NUMBER = "5491164613750"

  useEffect(() => {
    const dismissed = localStorage.getItem(LS_DISMISSED) === "true"
    if (dismissed) {
      setIsOpen(false)
      setHasLoaded(true)
      return
    }

    setIsOpen(true)

    const minimized = localStorage.getItem(LS_MINIMIZED) === "true"
    setIsMinimized(minimized)

    const done = localStorage.getItem(LS_DONE) === "true"
    doneHandledRef.current = done

    void checkOnboardingStatus(true)

    // ✅ Menos “parpadeo”: refresh más lento como backup
    const interval = setInterval(() => void checkOnboardingStatus(false), 90000)

    // al volver al tab
    const onVis = () => {
      if (document.visibilityState === "visible") void checkOnboardingStatus(false)
    }
    document.addEventListener("visibilitychange", onVis)

    // ✅ Refresh instantáneo por eventos (para que los flujos disparen update sin esperar)
    const onEventRefresh = () => void checkOnboardingStatus(false)
    window.addEventListener("getsolo:onboarding-refresh" as any, onEventRefresh)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVis)
      window.removeEventListener("getsolo:onboarding-refresh" as any, onEventRefresh)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [negocioId])

  async function checkOnboardingStatus(isFirstLoad: boolean) {
    if (refreshingRef.current) return
    refreshingRef.current = true

    try {
      const dismissed = localStorage.getItem(LS_DISMISSED) === "true"
      if (dismissed) {
        setIsOpen(false)
        setHasLoaded(true)
        return
      }

      const [
        negocioRes,
        serviciosRes,
        profesionalesRes,
        profesionalesConCuentaRes,
        clientesRes,
        turnosRes,
        turnosPublicosRes,
        horariosRes,
        gastosRes,
        productosRes,
      ] = await Promise.all([
        supabase
          .from("negocios")
          .select(
            "direccion, telefono, email, logo_url, color_primario, slug, public_preview_seen_at, mp_access_token, trial_ends_at, suscripcion_estado, plan"
          )
          .eq("id", negocioId)
          .maybeSingle(),

        supabase.from("servicios").select("id").eq("negocio_id", negocioId).limit(1),
        supabase.from("profesionales").select("id").eq("negocio_id", negocioId).limit(1),

        supabase
          .from("profesionales")
          .select("id")
          .eq("negocio_id", negocioId)
          .not("auth_user_id", "is", null)
          .limit(1),

        supabase.from("clientes").select("id").eq("negocio_id", negocioId).limit(1),
        supabase.from("turnos").select("id").eq("negocio_id", negocioId).limit(1),

        // ✅ “turno desde la página”: los turnos del booking público setean cancel_token
        supabase
          .from("turnos")
          .select("id")
          .eq("negocio_id", negocioId)
          .not("cancel_token", "is", null)
          .limit(1),

        supabase
          .from("negocio_horarios")
          .select("id")
          .eq("negocio_id", negocioId)
          .eq("cerrado", false)
          .limit(1),

        supabase.from("gastos_fijos").select("id").eq("negocio_id", negocioId).limit(1),
        supabase.from("productos").select("id").eq("negocio_id", negocioId).limit(1),
      ])

      const negocio = negocioRes.data

      // guardar meta para banner y whatsapp
      setNegocioSlug(negocio?.slug || null)
      setTrialEndsAt((negocio as any)?.trial_ends_at || null)
      setSuscripcionEstado((negocio as any)?.suscripcion_estado || null)
      setPlan((negocio as any)?.plan || null)

      const hasContactInfo = !!(negocio?.direccion && negocio?.telefono && negocio?.email)
      const hasBranding = !!(negocio?.logo_url || negocio?.color_primario)
      const hasHorarios = (horariosRes.data?.length || 0) > 0
      const hasServicios = (serviciosRes.data?.length || 0) > 0
      const hasProfesionales = (profesionalesRes.data?.length || 0) > 0
      const hasProfesionalesConCuenta = (profesionalesConCuentaRes.data?.length || 0) > 0
      const hasClientes = (clientesRes.data?.length || 0) > 0
      const hasTurnos = (turnosRes.data?.length || 0) > 0
      const hasTurnosPublicos = (turnosPublicosRes.data?.length || 0) > 0
      const hasGastos = (gastosRes.data?.length || 0) > 0
      const hasProductos = (productosRes.data?.length || 0) > 0

      // ✅ MercadoPago conectado
      const hasMercadoPago = !!(negocio as any)?.mp_access_token

      const slug = negocio?.slug || null
      const previewSeen = !!negocio?.public_preview_seen_at

      // 1) ESSENTIAL: agregar MP y primer turno público
      const baseTasks: OnboardingTask[] = [
        {
          id: "negocio-info",
          title: "Completá información del negocio",
          description: "Dirección, teléfono y email",
          route: "/dashboard/configuracion/negocio",
          icon: Store,
          completed: hasContactInfo,
          priority: "essential",
        },
        {
          id: "horarios",
          title: "Configurá horarios de atención",
          description: "Define cuándo atendés",
          route: "/dashboard/configuracion/negocio",
          icon: Clock,
          completed: hasHorarios,
          priority: "essential",
        },
        {
          id: "primer-servicio",
          title: "Agregá tu primer servicio",
          description: "Qué ofrecés a tus clientes",
          route: "/dashboard/servicios",
          icon: Scissors,
          completed: hasServicios,
          priority: "essential",
        },
        {
          id: "primer-profesional",
          title: "Agregá profesionales",
          description: "Tu equipo o vos mismo",
          route: "/dashboard/profesionales",
          icon: Users,
          completed: hasProfesionales,
          priority: "essential",
        },

        // ✅ NUEVO ESENCIAL: MP
        {
          id: "mercadopago",
          title: "Conectá MercadoPago",
          description: "Para cobrar señas y pagos",
          route: "/dashboard/configuracion/integraciones/mercadopago",
          icon: CreditCard,
          completed: hasMercadoPago,
          priority: "essential",
        },

        // ✅ NUEVO ESENCIAL: wow moment real
        {
          id: "turno-publico",
          title: "Recibí tu primer turno desde tu página",
          description: "Probá reservas online reales",
          route: "/dashboard/agenda",
          icon: Calendar,
          completed: hasTurnosPublicos,
          priority: "essential",
        },

        {
          id: "branding",
          title: "Personalizá tu marca",
          description: "Logo y colores",
          route: "/dashboard/configuracion/negocio/branding",
          icon: Palette,
          completed: hasBranding,
          priority: "recommended",
        },
        {
          id: "profesional-cuenta",
          title: "Creá cuentas para profesionales",
          description: "Dashboard para tu equipo",
          route: "/dashboard/profesionales",
          icon: UserPlus,
          completed: hasProfesionalesConCuenta,
          priority: "recommended",
        },
        {
          id: "primer-turno",
          title: "Creá tu primer turno (manual)",
          description: "Probá la agenda",
          route: "/dashboard/agenda",
          icon: Calendar,
          completed: hasTurnos,
          priority: "recommended",
        },
        {
          id: "primer-cliente",
          title: "Agregá un cliente",
          description: "Tu base de datos",
          route: "/dashboard/clientes",
          icon: Users,
          completed: hasClientes,
          priority: "recommended",
        },

        {
          id: "gastos",
          title: "Registrá tus gastos",
          description: "Control financiero completo",
          route: "/dashboard/finanzas/gastos",
          icon: DollarSign,
          completed: hasGastos,
          priority: "optional",
        },
        {
          id: "inventario",
          title: "Configurá tu inventario",
          description: "Control de productos y stock",
          route: "/dashboard/inventario",
          icon: Package,
          completed: hasProductos,
          priority: "optional",
        },
      ]

      const essentialOnly = baseTasks.filter((t) => t.priority === "essential")
      const allEssentialCompleted = essentialOnly.every((t) => t.completed)

      // ✅ Página pública pasa a RECOMMENDED (y no se completa solo por visitarla si faltan esenciales)
      const paginaPublicaTask: OnboardingTask = {
        id: "pagina-publica",
        title: "Revisá tu página y compartila",
        description: slug ? `${slug}.getsolo.site` : "Configurá tu link público",
        route: slug
          ? process.env.NODE_ENV === "development"
            ? `/negocio/${slug}`
            : `https://${slug}.getsolo.site`
          : "/dashboard/configuracion/negocio",
        icon: Share2,
        completed: !!slug && allEssentialCompleted && previewSeen,
        priority: "recommended",
      }

      const tasksData: OnboardingTask[] = [...baseTasks, paginaPublicaTask]

      // ✅ Detectar “nuevo completado” para minimizar
      const completedNow = new Set(tasksData.filter((t) => t.completed).map((t) => t.id))
      const prevCompleted = prevCompletedIdsRef.current

      if (isFirstLoad && prevCompleted.size === 0) {
        prevCompletedIdsRef.current = completedNow
      }

      const newlyCompleted = !isFirstLoad && [...completedNow].some((id) => !prevCompleted.has(id))
      prevCompletedIdsRef.current = completedNow

      setTasks(tasksData)
      setHasLoaded(true)
      setIsOpen(true)

      const allDone = tasksData.every((t) => t.completed)

      if (newlyCompleted && !allDone) minimize()

      // ✅ Done once
      if (allDone && !doneHandledRef.current) {
        doneHandledRef.current = true
        localStorage.setItem(LS_DONE, "true")

        setShowDone(true)
        fireConfetti()

        setTimeout(() => {
          dismissForever()
          setShowDone(false)
        }, 2500)

        return
      }

      if (allDone && localStorage.getItem(LS_DONE) === "true") {
        dismissForever()
        return
      }
    } catch (err) {
      console.error("Error checking onboarding:", err)
      setHasLoaded(true)
    } finally {
      refreshingRef.current = false
    }
  }

  function minimize() {
    setIsMinimized(true)
    localStorage.setItem(LS_MINIMIZED, "true")
  }

  function expand() {
    setIsMinimized(false)
    localStorage.setItem(LS_MINIMIZED, "false")
  }

  function handleX() {
    minimize()
  }

  function dismissForever() {
    localStorage.setItem(LS_DISMISSED, "true")
    setIsOpen(false)
  }

  if (!isOpen) return null
  if (!hasLoaded) return null

  const completedCount = tasks.filter((t) => t.completed).length
  const totalCount = tasks.length
  const progressPercentage = totalCount ? (completedCount / totalCount) * 100 : 0

  const essentialTasks = tasks.filter((t) => t.priority === "essential")
  const recommendedTasks = tasks.filter((t) => t.priority === "recommended")
  const optionalTasks = tasks.filter((t) => t.priority === "optional")

  const essentialCompleted = essentialTasks.filter((t) => t.completed).length
  const allEssentialCompleted = essentialTasks.every((t) => t.completed)
  const allDone = tasks.every((t) => t.completed)

  // ✅ Trial banner data
  const isTrial = (suscripcionEstado || "").toLowerCase() === "trial"
  const daysLeft = isTrial ? daysLeftFromISO(trialEndsAt) : null

  const showTrialBanner = isTrial && daysLeft !== null
  const trialVariant =
    daysLeft === null
      ? "neutral"
      : daysLeft <= 0
      ? "expired"
      : daysLeft === 1
      ? "strong"
      : daysLeft <= 2
      ? "soft"
      : "neutral"

  const trialLabel =
    daysLeft === null
      ? null
      : daysLeft <= 0
      ? "Tu prueba terminó"
      : daysLeft === 1
      ? "Te queda 1 día de prueba"
      : `Te quedan ${daysLeft} días de prueba`

  const payRoute = "/dashboard/configuracion/plan/pagos"

  const waMsg = encodeURIComponent(
    `Hola! Estoy configurando Solo. Mi negocio es ${negocioSlug || "(sin slug)"}.\nNecesito ayuda con: `
  )
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`

  // ✅ overlay “Listo!”
  if (showDone) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl px-10 py-8 shadow-2xl text-center animate-in zoom-in duration-300">
          <div className="mx-auto mb-2 w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-3xl font-black mb-2">¡Listo!</h2>
          <p className="text-gray-600 text-sm">Tu negocio ya está completamente configurado.</p>
        </div>
      </div>
    )
  }

  // ✅ Minimized chip
  if (isMinimized) {
    return (
      <div className="fixed top-16 right-4 z-40">
        <button
          onClick={expand}
          className="flex items-center gap-2 rounded-full bg-white border border-gray-200 shadow-lg px-3 py-2 hover:shadow-xl transition"
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-900">Tutorial</span>
          <span className="text-xs font-bold text-gray-600">
            {completedCount}/{totalCount}
          </span>
          <ChevronUp className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed top-16 right-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-40 max-h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="#E5E7EB" strokeWidth="3" fill="none" />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#3B82F6"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - progressPercentage / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700">
                {completedCount}/{totalCount}
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Primeros pasos</h3>
            <p className="text-xs text-gray-600">
              {allEssentialCompleted
                ? allDone
                  ? "¡Todo listo! 🎉"
                  : "¡Esenciales listos! 🎉"
                : `${essentialCompleted}/${essentialTasks.length} esenciales`}
            </p>
            {plan ? <p className="text-[11px] text-gray-500 mt-0.5">Plan: {plan}</p> : null}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={minimize} className="p-1 hover:bg-gray-100 rounded transition-colors" title="Minimizar">
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          <button onClick={handleX} className="p-1 hover:bg-gray-100 rounded transition-colors" title="Cerrar">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Trial Banner + WhatsApp */}
      <div className="px-4 pt-3 bg-white space-y-2">
        {showTrialBanner && trialLabel && (
          <div
            className={[
              "rounded-lg border px-3 py-2 flex items-center justify-between gap-2",
              trialVariant === "expired"
                ? "bg-red-50 border-red-200"
                : trialVariant === "strong"
                ? "bg-orange-50 border-orange-200"
                : trialVariant === "soft"
                ? "bg-yellow-50 border-yellow-200"
                : "bg-gray-50 border-gray-200",
            ].join(" ")}
          >
            <div className="min-w-0">
              <p
                className={[
                  "text-xs font-semibold",
                  trialVariant === "expired"
                    ? "text-red-700"
                    : trialVariant === "strong"
                    ? "text-orange-700"
                    : trialVariant === "soft"
                    ? "text-yellow-700"
                    : "text-gray-700",
                ].join(" ")}
              >
                {trialLabel}
              </p>
              <p className="text-[11px] text-gray-600 truncate">
                Activá tu plan para seguir usando todo sin cortes.
              </p>
            </div>

            <Button asChild size="sm" className="h-8 text-xs">
              <Link href={payRoute}>Activar plan</Link>
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="h-8 text-xs w-full">
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <MessageSquare className="w-4 h-4 mr-2" />
              Necesito ayuda
            </a>
          </Button>

          {negocioSlug ? (
            <Button asChild variant="outline" size="sm" className="h-8 text-xs w-full">
              <a
                href={process.env.NODE_ENV === "development" ? `/negocio/${negocioSlug}` : `https://${negocioSlug}.getsolo.site`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Ver página
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 py-2 bg-gray-50">
        <Progress value={progressPercentage} className="h-1.5" />
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {essentialTasks.length > 0 && (
          <Section title="Pasos Esenciales" dotClass="bg-red-500">
            {essentialTasks.map((task) => (
              <TaskCard key={task.id} task={task} pathname={pathname} />
            ))}
          </Section>
        )}

        {recommendedTasks.length > 0 && (
          <Section title="Recomendados" dotClass="bg-blue-500">
            {recommendedTasks.map((task) => (
              <TaskCard key={task.id} task={task} pathname={pathname} />
            ))}
          </Section>
        )}

        {optionalTasks.length > 0 && allEssentialCompleted && (
          <Section title="Funciones Avanzadas" dotClass="bg-gray-400">
            {optionalTasks.map((task) => (
              <TaskCard key={task.id} task={task} pathname={pathname} />
            ))}
          </Section>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
        {!allEssentialCompleted ? (
          <p className="text-xs text-center text-gray-600">💡 Completá los pasos esenciales para empezar a operar</p>
        ) : (
          <p className="text-xs text-center text-green-700 font-medium">
            🎉 ¡Perfecto! Ahora conseguí tu primer turno desde la página y activá tu plan antes de que termine la prueba.
          </p>
        )}

        <div className="flex justify-center">
          <button
            onClick={dismissForever}
            className="text-[11px] text-gray-400 hover:text-gray-600 underline underline-offset-2"
          >
            No mostrar más
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  dotClass,
  children,
}: {
  title: string
  dotClass: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${dotClass}`} />
        <h4 className="text-xs font-semibold text-gray-700 uppercase">{title}</h4>
      </div>
      {children}
    </div>
  )
}

function TaskCard({ task, pathname }: { task: OnboardingTask; pathname: string }) {
  const isActive = pathname === task.route
  const isExternal = task.route.startsWith("http")

  const card = (
    <div
      className={`
        relative rounded-lg border-2 transition-all cursor-pointer
        ${
          task.completed
            ? "bg-green-50 border-green-200 hover:border-green-300"
            : isActive
            ? "bg-blue-50 border-blue-300 shadow-md"
            : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
        }
      `}
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              task.completed ? "bg-green-100" : "bg-gray-100"
            }`}
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold mb-0.5 ${task.completed ? "text-green-900 line-through" : "text-gray-900"}`}>
              {task.title}
            </h4>
            <p className="text-xs text-gray-600 mb-2">{task.description}</p>

            {!task.completed && (
              <Button
                size="sm"
                variant={isActive ? "default" : "outline"}
                className="w-full text-xs h-7"
                asChild={!isExternal}
              >
                {isExternal ? (
                  <a href={task.route} target="_blank" rel="noopener noreferrer">
                    Ver página
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </a>
                ) : (
                  <span>
                    {isActive ? "Completar ahora" : "Iniciar"}
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  if (isExternal) return card
  return <Link href={task.route}>{card}</Link>
}
