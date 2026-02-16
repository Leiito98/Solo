'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import {
  Calendar,
  Users,
  TrendingUp,
  Check,
  ArrowRight,
  BarChart3,
  Smartphone,
  Star,
  CreditCard,
  Bell,
  Globe,
  Shield,
  Scissors,
  Palette,
  Heart,
  Target,
  ChevronRight,
  DollarSign,
  Menu,
  X,
} from 'lucide-react'

export default function LandingPage() {
  const supabase = createClient()

  const [isVisible, setIsVisible] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // ✅ auth state para mostrar "Ir al dashboard" y ocultar login/register
  const [isAuthed, setIsAuthed] = useState<boolean>(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    let mounted = true

    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setIsAuthed(!!data.session)
      setAuthChecked(true)
    })()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setIsAuthed(!!session)
      setAuthChecked(true)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  const features = [
    {
      icon: Calendar,
      title: 'Agenda Online 24/7',
      description:
        'Tus clientes reservan cuando quieren, sin llamadas. Sincronización automática con tu calendario.',
      tag: 'Reservas',
    },
    {
      icon: CreditCard,
      title: 'Pagos con Seña',
      description:
        'Cobra el 50% por adelantado con MercadoPago. Reducí el ausentismo hasta un 95%.',
      tag: 'Cobros',
    },
    {
      icon: Users,
      title: 'Equipo Ilimitado',
      description:
        'Agregá todos los profesionales que necesités. Comisiones automáticas, sin cálculos manuales.',
      tag: 'Equipo',
    },
    {
      icon: TrendingUp,
      title: 'Finanzas en Tiempo Real',
      description:
        'Ingresos, egresos y comisiones calculados automáticamente. Nunca más planillas de Excel.',
      tag: 'Finanzas',
    },
    {
      icon: BarChart3,
      title: 'Dashboard Inteligente',
      description:
        'Caja del día, próximos turnos, top profesionales. Todo lo que necesitás en una sola pantalla.',
      tag: 'Métricas',
    },
    {
      icon: Globe,
      title: 'Tu Página Web',
      description:
        'Landing personalizada con tu logo y colores para que tus clientes reserven directamente.',
      tag: 'Web',
    },
    {
      icon: Bell,
      title: 'Recordatorios Automáticos',
      description:
        'Emails automáticos 24h antes del turno. Menos cancelaciones, más asistencia.',
      tag: 'Automatización',
    },
    {
      icon: Smartphone,
      title: '100% Mobile',
      description:
        'Funciona perfecto en celular, tablet y desktop. Gestioná tu negocio desde cualquier lugar.',
      tag: 'Acceso',
    },
  ]

  const useCases = [
    { icon: Scissors, name: 'Barberías' },
    { icon: Palette, name: 'Uñas & Lashes' },
    { icon: Heart, name: 'Spa & Masajes' },
    { icon: Target, name: 'Nutrición' },
    { icon: Shield, name: 'Psicología' },
    { icon: TrendingUp, name: 'Fitness' },
  ]

  const testimonials = [
    {
      name: 'Juan Pérez',
      business: 'BarberShop Elite',
      role: 'Dueño · 5 barberos',
      text: 'Tenía 5 barberos y era un caos total. Ahora todo es automático: agenda, comisiones, pagos. El mejor cambio que hice.',
      rating: 5,
    },
    {
      name: 'María González',
      business: 'Estudio M&G',
      role: 'Dueña · Uñas & Extensiones',
      text: 'Mis clientas aman reservar online y pagar la seña. Cero no-shows. Recuperé horas de mi semana que perdía coordinando por WhatsApp.',
      rating: 5,
    },
    {
      name: 'Carlos Fernández',
      business: 'Nutrición Integral',
      role: 'Nutricionista · Consulta privada',
      text: 'Migré de planillas de Excel a Solo en un día. Ahora veo todo: ingresos, turnos, gastos. Es otro nivel de organización.',
      rating: 5,
    },
  ]

  return (
    <div
      className="min-h-screen bg-[#0a0a0a] text-white font-sans"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Cabinet+Grotesk:wght@400;500;700;800;900&display=swap');
        .heading-font { font-family: 'Cabinet Grotesk', 'DM Sans', system-ui, sans-serif; }
        .noise-overlay { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E"); pointer-events: none; }
        .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .card-hover:hover { transform: translateY(-4px); border-color: rgba(59, 130, 246, 0.4); }
        .gradient-border { background: linear-gradient(#0a0a0a, #0a0a0a) padding-box, linear-gradient(135deg, rgba(59, 130, 246, 0.6), rgba(139, 92, 246, 0.4), rgba(59, 130, 246, 0.1)) border-box; border: 1px solid transparent; }
        .hero-glow { background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59, 130, 246, 0.18) 0%, transparent 70%); }
        .shimmer-text { background: linear-gradient(90deg, #ffffff 0%, #93c5fd 40%, #c4b5fd 60%, #ffffff 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: shimmer 4s linear infinite; }
        @keyframes shimmer { 0% { background-position: 0% center; } 100% { background-position: 200% center; } }
        .float-slow { animation: floatSlow 6s ease-in-out infinite; }
        @keyframes floatSlow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        .blob { filter: blur(80px); border-radius: 50%; position: absolute; pointer-events: none; }
      `}</style>

      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob w-[600px] h-[600px] bg-blue-600/10 top-[-200px] left-[-200px]" />
        <div className="blob w-[500px] h-[500px] bg-violet-600/8 top-[40%] right-[-150px]" />
        <div className="blob w-[400px] h-[400px] bg-blue-500/6 bottom-[-100px] left-[30%]" />
        <div className="noise-overlay absolute inset-0" />
      </div>

      {/* ── NAVBAR ── */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/[0.06]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9">
              <Image src="/logo/solo.png" alt="Solo" fill className="object-contain" />
            </div>
            <span className="heading-font text-xl font-800 text-white tracking-tight">Solo</span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            <a
              href="#features"
              className="text-sm text-white/50 hover:text-white/90 transition-colors font-medium"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-white/50 hover:text-white/90 transition-colors font-medium"
            >
              Precios
            </a>
            <a
              href="#testimonials"
              className="text-sm text-white/50 hover:text-white/90 transition-colors font-medium"
            >
              Clientes
            </a>
          </div>

          {/* ✅ Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            {authChecked && isAuthed ? (
              <Button
                asChild
                className="bg-blue-500 hover:bg-blue-400 text-white text-sm h-9 px-5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-400/40 hover:scale-[1.03]"
              >
                <Link href="/dashboard" className="flex items-center gap-2">
                  Ir al dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="text-white/60 hover:text-white hover:bg-white/[0.06] text-sm h-9 px-4"
                >
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
                <Button
                  asChild
                  className="bg-blue-500 hover:bg-blue-400 text-white text-sm h-9 px-5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-400/40 hover:scale-[1.03]"
                >
                  <Link href="/register?plan=pro">Empezar Gratis</Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden text-white/70 hover:text-white p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* ✅ Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0f0f0f] border-b border-white/[0.06] px-5 py-4 space-y-3">
            <a
              href="#features"
              className="block text-white/60 hover:text-white text-sm py-1.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="block text-white/60 hover:text-white text-sm py-1.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              Precios
            </a>
            <a
              href="#testimonials"
              className="block text-white/60 hover:text-white text-sm py-1.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              Clientes
            </a>

            <div className="pt-2 flex flex-col gap-2">
              {authChecked && isAuthed ? (
                <Button
                  asChild
                  className="bg-blue-500 hover:bg-blue-400 w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/dashboard" className="flex items-center justify-center gap-2">
                    Ir al dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="border-white/10 text-white/70 hover:text-white bg-transparent w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/login">Iniciar Sesión</Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-blue-500 hover:bg-blue-400 w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/register?plan=pro">Empezar Gratis</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 pt-32 pb-24 px-5">
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        <div
          className={`max-w-5xl mx-auto text-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Más de 500 negocios activos · Hecho en Argentina 🇦🇷
          </div>

          <h1 className="heading-font text-5xl sm:text-6xl lg:text-7xl font-900 leading-[1.05] tracking-tight mb-6">
            <span className="text-white">El sistema que tu</span>
            <br />
            <span className="shimmer-text">negocio necesitaba</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
            Agenda online, pagos anticipados, comisiones automáticas y tu propia web. Todo desde un
            solo lugar — sin complicaciones.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
            <Button
              asChild
              className="bg-blue-500 hover:bg-blue-400 text-white text-base h-12 px-8 rounded-xl font-semibold shadow-xl shadow-blue-500/30 hover:shadow-blue-400/50 transition-all hover:scale-[1.04] group"
            >
              <Link href="/register?plan=pro" className="flex items-center gap-2">
                Crear mi cuenta gratis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/[0.06] text-base h-12 px-8 rounded-xl font-medium"
            >
              <Link href="#pricing">Ver Precios</Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/35">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-green-500" /> Sin tarjeta de crédito
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-green-500" /> Setup en 10 minutos
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-green-500" /> 14 días de prueba gratis
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-green-500" /> Cancelá cuando quieras
            </span>
          </div>
        </div>

        {/* ── DASHBOARD MOCK (identical to login) ── */}
        <div
          className={`max-w-5xl mx-auto mt-16 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="relative">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-blue-500/30 via-transparent to-transparent pointer-events-none" />
            <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f0f] overflow-hidden shadow-2xl shadow-black/60">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <div className="ml-3 text-[11px] text-white/20 font-mono">Dashboard · Solo</div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {
                      label: 'Caja hoy',
                      value: '$84.500',
                      icon: DollarSign,
                      color: 'text-green-400',
                      bg: 'bg-green-500/10',
                    },
                    {
                      label: 'Turnos',
                      value: '12',
                      icon: Calendar,
                      color: 'text-blue-400',
                      bg: 'bg-blue-500/10',
                    },
                    {
                      label: 'Mes',
                      value: '$1.2M',
                      icon: TrendingUp,
                      color: 'text-violet-400',
                      bg: 'bg-violet-500/10',
                    },
                    {
                      label: 'Clientes hoy',
                      value: '8',
                      icon: Users,
                      color: 'text-orange-400',
                      bg: 'bg-orange-500/10',
                    },
                  ].map((stat) => {
                    const Icon = stat.icon
                    return (
                      <div
                        key={stat.label}
                        className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}
                        >
                          <Icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <div className={`text-2xl heading-font font-700 ${stat.color} mb-0.5`}>
                          {stat.value}
                        </div>
                        <div className="text-xs text-white/30">{stat.label}</div>
                      </div>
                    )
                  })}
                </div>

                <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.06] p-4 flex items-center gap-4">
                  <div className="text-center min-w-[64px]">
                    <div className="heading-font text-xl font-700 text-blue-400">10:30</div>
                    <div className="text-[10px] text-white/30">próximo</div>
                  </div>
                  <div className="w-px h-12 bg-blue-500/20" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white/80">Valentina R.</div>
                    <div className="text-xs text-white/40">Corte & Color · Sofía M.</div>
                  </div>
                  <div className="text-xs px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 whitespace-nowrap">
                    En 8 min
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                  <div className="bg-white/[0.02] px-4 py-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/40 uppercase tracking-wide">
                      Top del mes
                    </span>
                    <span className="text-xs text-blue-400 cursor-pointer hover:text-blue-300">
                      Ver todos →
                    </span>
                  </div>
                  {[
                    { name: 'Sofía M.', amount: '$340.000', turnos: 42, medal: '🥇' },
                    { name: 'Tomás G.', amount: '$280.000', turnos: 35, medal: '🥈' },
                    { name: 'María J.', amount: '$195.000', turnos: 28, medal: '🥉' },
                  ].map((p, i) => (
                    <div
                      key={i}
                      className="px-4 py-3 flex items-center gap-3 border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    >
                      <span className="text-base">{p.medal}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white/70">{p.name}</div>
                        <div className="text-xs text-white/30">{p.turnos} turnos</div>
                      </div>
                      <div className="text-sm font-semibold text-white/60">{p.amount}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section className="py-12 border-y border-white/[0.06] overflow-hidden relative z-10">
        <div className="flex gap-8 items-center" style={{ width: 'max-content' }}>
          {[...useCases, ...useCases].map((item, i) => {
            const Icon = item.icon
            return (
              <div
                key={i}
                className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.07] text-white/40 text-sm font-medium whitespace-nowrap hover:text-white/70 hover:border-white/20 transition-colors cursor-default"
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-20 px-5 relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
          {[
            { value: '500+', label: 'Negocios activos' },
            { value: '50k+', label: 'Turnos mensuales' },
            { value: '95%', label: 'Menos ausentismo' },
            { value: '10min', label: 'Setup completo' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-[#0a0a0a] px-8 py-10 text-center hover:bg-white/[0.02] transition-colors"
            >
              <div className="heading-font text-4xl font-900 text-white mb-1">{stat.value}</div>
              <div className="text-sm text-white/35">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-5 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/40 text-xs font-semibold uppercase tracking-widest">
              Características
            </div>
            <h2 className="heading-font text-4xl sm:text-5xl font-900 text-white max-w-2xl leading-tight">
              Todo lo que necesita tu negocio, en un solo lugar
            </h2>
            <p className="mt-4 text-white/40 text-lg max-w-xl">
              Olvidá las 5 apps distintas y las planillas de Excel. Solo lo hace todo.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={i}
                  className="gradient-border rounded-xl p-5 card-hover cursor-default group"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center mb-4 group-hover:bg-blue-500/15 transition-colors">
                    <Icon className="w-4 h-4 text-white/50 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-1.5">
                    {feature.tag}
                  </div>
                  <h3 className="heading-font text-base font-700 text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-5 relative z-10 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/40 text-xs font-semibold uppercase tracking-widest">
              Cómo funciona
            </div>
            <h2 className="heading-font text-4xl sm:text-5xl font-900 text-white leading-tight">
              Empezá hoy en 3 pasos
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                step: '01',
                title: 'Creá tu cuenta',
                description:
                  'Registrá tu negocio, agregá a tu equipo y personalizá tu página en menos de 10 minutos.',
              },
              {
                step: '02',
                title: 'Compartí tu link',
                description:
                  'Enviá tu URL personalizada por Instagram, WhatsApp o donde sea. Tus clientes reservan solos.',
              },
              {
                step: '03',
                title: 'Gestioná todo',
                description:
                  'Recibí pagos, confirmá turnos y mirá el dashboard en tiempo real. Solo hace el trabajo pesado.',
              },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="gradient-border rounded-xl p-6 card-hover">
                  <div className="heading-font text-5xl font-900 text-white mb-4">{step.step}</div>
                  <h3 className="heading-font text-xl font-700 text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{step.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 z-10 text-white/20">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 px-5 relative z-10 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/40 text-xs font-semibold uppercase tracking-widest">
              Precios
            </div>
            <h2 className="heading-font text-4xl sm:text-5xl font-900 text-white leading-tight mb-3">
              Simple y transparente
            </h2>
            <p className="text-white/40 text-lg">
              Sin sorpresas. Sin cargos ocultos. 14 días de prueba gratis en todos los planes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="gradient-border rounded-2xl p-7 card-hover">
              <div className="mb-6">
                <h3 className="heading-font text-2xl font-800 text-white mb-1">Solo</h3>
                <p className="text-white/40 text-sm">Para emprendedores y profesionales independientes</p>
              </div>
              <div className="flex items-baseline gap-1 mb-7">
                <span className="heading-font text-5xl font-900 text-white">$20.000</span>
                <span className="text-white/35 text-base">/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  '1-2 profesionales',
                  'Agenda online ilimitada',
                  'Landing page personalizada',
                  'Pagos con MercadoPago',
                  'Recordatorios automáticos',
                  'Soporte por WhatsApp',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-white/60">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="w-full border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:border-white/20 h-11 font-semibold rounded-xl"
              >
                <Link href="/register?plan=solo">Empezar Gratis</Link>
              </Button>
            </div>

            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-violet-600/10 rounded-2xl" />
              <div className="absolute inset-0 border border-blue-500/40 rounded-2xl pointer-events-none" />
              <div className="relative p-7">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="heading-font text-2xl font-800 text-white mb-1">Pro</h3>
                    <p className="text-white/50 text-sm">Para negocios con equipo</p>
                  </div>
                  <span className="text-xs font-bold text-blue-300 bg-blue-500/20 border border-blue-500/30 px-2.5 py-1 rounded-full">
                    ★ Más elegido
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-7">
                  <span className="heading-font text-5xl font-900 text-white">$28.000</span>
                  <span className="text-white/35 text-base">/mes</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    'Profesionales ilimitados',
                    'Todo lo del plan Solo',
                    'Sistema de comisiones',
                    'Control de gastos fijos',
                    'Analytics avanzados',
                    'Exportar a Excel/PDF',
                    'Soporte prioritario',
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-white/70">
                      <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="w-full bg-blue-500 hover:bg-blue-400 text-white h-11 font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-400/40 transition-all hover:scale-[1.02]"
                >
                  <Link href="/register?plan=pro">Empezar Gratis</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-24 px-5 relative z-10 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/40 text-xs font-semibold uppercase tracking-widest">
              Testimonios
            </div>
            <h2 className="heading-font text-4xl sm:text-5xl font-900 text-white leading-tight">
              Ellos ya lo usan
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className="gradient-border rounded-xl p-6 card-hover">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/40 to-violet-500/40 flex items-center justify-center text-sm font-bold text-white">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-white/30">
                      {t.business} · {t.role.split(' · ')[1]}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-5 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-2xl overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-violet-600/5 p-12">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12)_0%,transparent_70%)] pointer-events-none" />
            <div className="flex justify-center mb-6">
              <div className="relative w-14 h-14 float-slow">
                <Image src="/logo/solo.png" alt="Solo" fill className="object-contain" />
              </div>
            </div>
            <h2 className="heading-font text-4xl sm:text-5xl font-900 text-white leading-tight mb-4">
              ¿Listo para profesionalizar tu negocio?
            </h2>
            <p className="text-white/45 text-lg mb-8 max-w-xl mx-auto">
              Únete a cientos de profesionales que ya automatizaron su agenda, sus cobros y sus
              finanzas con Solo.
            </p>
            <Button
              asChild
              className="bg-blue-500 hover:bg-blue-400 text-white text-base h-12 px-10 rounded-xl font-semibold shadow-xl shadow-blue-500/30 hover:shadow-blue-400/50 transition-all hover:scale-[1.04] group"
            >
              <Link href="/register?plan=pro" className="flex items-center gap-2">
                Crear mi cuenta gratis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
            <div className="flex flex-wrap justify-center gap-5 mt-6 text-sm text-white/30">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-green-400" /> Sin tarjeta
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-green-400" /> 14 días gratis
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-green-400" /> Cancelá cuando quieras
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] py-12 px-5 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">
            <div className="space-y-3">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="relative w-8 h-8">
                  <Image src="/logo/solo.png" alt="Solo" fill className="object-contain" />
                </div>
                <span className="heading-font text-lg font-800 text-white">Solo</span>
              </Link>
              <p className="text-sm text-white/30 max-w-xs leading-relaxed">
                La plataforma todo-en-uno para gestionar tu negocio de servicios.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-10 text-sm">
              <div>
                <div className="text-white/60 font-semibold mb-3">Producto</div>
                <ul className="space-y-2 text-white/30">
                  <li>
                    <a href="#features" className="hover:text-white/70 transition-colors">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#pricing" className="hover:text-white/70 transition-colors">
                      Precios
                    </a>
                  </li>
                  <li>
                    <Link href="/register?plan=pro" className="hover:text-white/70 transition-colors">
                      Empezar Gratis
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <div className="text-white/60 font-semibold mb-3">Soporte</div>
                <ul className="space-y-2 text-white/30">
                  <li>
                    <a href="/centro-de-ayuda" className="hover:text-white/70 transition-colors">
                      Centro de Ayuda
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://api.whatsapp.com/send/?phone=5491164613750&text=Necesito%20hablar%20con%20un%20representante%20de%20Solo&type=phone_number&app_absent=0"
                      className="hover:text-white/70 transition-colors"
                    >
                      WhatsApp
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:support@getsolo.site"
                      className="hover:text-white/70 transition-colors"
                    >
                      Email
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <div className="text-white/60 font-semibold mb-3">Legal</div>
                <ul className="space-y-2 text-white/30">
                  <li>
                    <a href="/terminos-y-condiciones" className="hover:text-white/70 transition-colors">
                      Términos y condiciones
                    </a>
                  </li>
                  <li>
                    <a href="/politica-de-privacidad" className="hover:text-white/70 transition-colors">
                      Política de privacidad
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/20">
            <span>© 2026 Solo. Todos los derechos reservados.</span>
            <span>🇦🇷 Hecho en Argentina</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
