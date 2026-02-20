// app/sistema-turnos-online/page.tsx
import type { Metadata } from "next"
import Link from "next/link"
import Image from 'next/image'
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  Star,
  Users,
  ArrowRight,
  BarChart3,
  Bell,
  Globe,
  Scissors,
  Palette,
  Heart,
  Target,
  TrendingUp,
  DollarSign,
  Check,
} from "lucide-react"

const SITE = "https://getsolo.site"
const CANONICAL = `${SITE}/sistema-turnos-online`

export const metadata: Metadata = {
  title: "Sistema de turnos online para profesionales en Argentina | GetSolo",
  description:
    "Agenda online para barberías, psicólogos, nutricionistas y estética: reservas 24/7, recordatorios, señas con MercadoPago y gestión del negocio. Probá 14 días gratis.",
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: "website",
    url: CANONICAL,
    title: "Sistema de turnos online para profesionales en Argentina | GetSolo",
    description:
      "Reservas 24/7 + recordatorios + señas con MercadoPago. Probá GetSolo 14 días gratis.",
    siteName: "GetSolo",
    images: [{ url: `${SITE}/og.png`, width: 1200, height: 630, alt: "GetSolo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sistema de turnos online para profesionales en Argentina | GetSolo",
    description:
      "Reservas 24/7 + recordatorios + señas con MercadoPago. Probá GetSolo 14 días gratis.",
    images: [`${SITE}/og.png`],
  },
}

function jsonLd() {
  const faqs = [
    {
      q: "¿GetSolo sirve para barberías, psicólogos y nutricionistas?",
      a: "Sí. GetSolo está pensado para profesionales y negocios de servicios: barberías, estética, psicología, nutrición, fitness y más.",
    },
    {
      q: "¿Puedo cobrar seña con MercadoPago?",
      a: "Sí. Podés solicitar señas (por ejemplo 50%) para reducir ausencias y confirmar turnos.",
    },
    {
      q: "¿Mis clientes pueden reservar online sin llamarme?",
      a: "Sí. Tus clientes reservan 24/7 desde tu página de turnos y vos lo ves en tu agenda.",
    },
    {
      q: "¿Envía recordatorios por WhatsApp o email?",
      a: "Sí. Podés automatizar recordatorios y confirmaciones para bajar cancelaciones y no-shows.",
    },
    {
      q: "¿Necesito tarjeta para probar?",
      a: "No. Tenés 14 días gratis sin tarjeta para ver si te sirve.",
    },
    {
      q: "¿Puedo tener varios profesionales y comisiones?",
      a: "Sí. Cada profesional puede tener su cuenta y vos podés ver turnos, ingresos y comisiones.",
    },
  ]

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GetSolo",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: CANONICAL,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "ARS",
      description: "Prueba gratis 14 días (sin tarjeta).",
    },
    featureList: [
      "Sistema de turnos online 24/7",
      "Página pública para reservar",
      "Recordatorios por WhatsApp y email",
      "Cobro de señas con MercadoPago",
      "Gestión de ingresos, egresos y comisiones",
      "Multi-profesional",
    ],
  }

  return JSON.stringify([appSchema, faqSchema])
}

export default function SistemaTurnosOnlinePage() {
  const useCases = [
    { icon: Scissors, name: 'Barberías' },
    { icon: Palette, name: 'Uñas & Lashes' },
    { icon: Heart, name: 'Spa & Masajes' },
    { icon: Target, name: 'Nutrición' },
    { icon: ShieldCheck, name: 'Psicología' },
    { icon: TrendingUp, name: 'Fitness' },
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
        .blob { filter: blur(80px); border-radius: 50%; position: absolute; pointer-events: none; }
      `}</style>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd() }}
      />

      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob w-[600px] h-[600px] bg-blue-600/10 top-[-200px] left-[-200px]" />
        <div className="blob w-[500px] h-[500px] bg-violet-600/8 top-[40%] right-[-150px]" />
        <div className="blob w-[400px] h-[400px] bg-blue-500/6 bottom-[-100px] left-[30%]" />
        <div className="noise-overlay absolute inset-0" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9">
              <Image src="/logo/solo.png" alt="GetSolo" fill className="object-contain" />
            </div>
            <span className="heading-font text-xl font-800 text-white tracking-tight">GetSolo</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/register?plan=pro"
              className="text-sm font-semibold text-white/60 hover:text-white transition-colors"
            >
              Crear cuenta
            </Link>
            <Link
              href="/register?plan=pro"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-sm h-9 px-5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-400/40 hover:scale-[1.03]"
            >
              Probar gratis 14 días
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 pt-20 pb-16 px-5">
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">
                <Star className="w-4 h-4" />
                Sistema de turnos online en Argentina
              </p>

              <h1 className="heading-font text-5xl sm:text-6xl font-900 leading-[1.05] mb-5">
                <span className="text-white">Sistema de turnos online para </span>
                <span className="shimmer-text">profesionales en Argentina</span>
              </h1>

              <p className="text-lg text-white/50 leading-relaxed mb-6">
                Barberías, nutricionistas, psicólogos y centros de estética usan GetSolo para{" "}
                <strong className="text-white/70">organizar agenda</strong>,{" "}
                <strong className="text-white/70">cobrar señas con MercadoPago</strong> y{" "}
                <strong className="text-white/70">reducir ausencias</strong>.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Link
                  href="/register?plan=pro"
                  className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-base h-12 px-8 rounded-xl font-semibold shadow-xl shadow-blue-500/30 hover:shadow-blue-400/50 transition-all hover:scale-[1.04] group"
                >
                  Probar gratis 14 días
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center gap-2 border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:border-white/20 h-12 px-8 rounded-xl font-semibold transition-all"
                >
                  Ver cómo funciona
                </a>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-white/35">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" /> 14 días gratis
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-400" /> Sin tarjeta
                </span>
                <span className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-green-400" /> Reservas 24/7
                </span>
              </div>
            </div>

            {/* Preview card */}
            <div className="lg:justify-self-end">
              <div className="gradient-border rounded-2xl overflow-hidden card-hover">
                <div className="bg-white/[0.02] px-5 py-4 border-b border-white/[0.06]">
                  <p className="text-sm font-bold text-white">Tu agenda (vista rápida)</p>
                  <p className="text-xs text-white/40">Ejemplo de cómo se ve para un negocio</p>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { t: "10:00", s: "Corte + barba", e: "Pendiente", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
                    { t: "12:30", s: "Consulta nutrición", e: "Confirmado", color: "bg-green-500/15 text-green-400 border-green-500/20" },
                    { t: "16:00", s: "Sesión terapia", e: "Pagado", color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
                  ].map((r) => (
                    <div key={r.t} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white/80">{r.s}</p>
                        <p className="text-xs text-white/40">{r.t}</p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${r.color}`}>
                        {r.e}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2">
                    <Link
                      href="/register?plan=pro"
                      className="w-full inline-flex items-center justify-center bg-blue-500 hover:bg-blue-400 text-white text-sm h-11 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all"
                    >
                      Empezar ahora
                    </Link>
                    <p className="mt-2 text-xs text-white/30 text-center">
                      Probá 14 días gratis. Cancelás cuando quieras.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
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

      {/* Problems */}
      <section className="mx-auto max-w-6xl px-5 py-20 relative z-10">
        <div className="gradient-border rounded-3xl p-8 sm:p-12">
          <h2 className="heading-font text-3xl sm:text-4xl font-900 text-white mb-3">
            Si hoy coordinás turnos por WhatsApp, te va a pasar esto
          </h2>
          <p className="text-white/40 mb-8 max-w-2xl">
            Estos son los problemas más comunes de los negocios que no tienen un sistema de turnos online.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: MessageSquare, t: "Idas y vueltas", d: "Mensajes interminables para cerrar un horario." },
              { icon: Clock, t: "Ausencias", d: "No-shows que te hacen perder plata y tiempo." },
              { icon: Users, t: "Desorden", d: "No sabés qué profesional tiene qué turno." },
              { icon: CreditCard, t: "Señas manuales", d: "Cobrar y controlar pagos se vuelve un lío." },
            ].map((c) => {
              const Icon = c.icon
              return (
                <div key={c.t} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 card-hover">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-white/50" />
                  </div>
                  <p className="font-bold text-white mb-1">{c.t}</p>
                  <p className="text-sm text-white/40 leading-relaxed">{c.d}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-5 py-20 relative z-10">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/40 text-xs font-semibold uppercase tracking-widest">
            Cómo funciona
          </div>
          <h2 className="heading-font text-3xl sm:text-4xl font-900 text-white mb-3">
            Cómo funciona GetSolo
          </h2>
          <p className="text-white/40 max-w-2xl">
            Lo configurás una vez y después tu agenda se ordena sola.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              n: "1",
              t: "Creás tu cuenta",
              d: "Cargás tu negocio, servicios, horarios y profesionales.",
              icon: CheckCircle2,
            },
            {
              n: "2",
              t: "Compartís tu link",
              d: "Tus clientes reservan 24/7 desde tu página de turnos.",
              icon: Calendar,
            },
            {
              n: "3",
              t: "Confirmás y cobrás señas",
              d: "Recordatorios + seña con MercadoPago para reducir ausencias.",
              icon: CreditCard,
            },
          ].map((s) => {
            const Icon = s.icon
            return (
              <div key={s.n} className="gradient-border rounded-2xl p-6 card-hover">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center border border-blue-500/20">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-xs font-black text-white/30">PASO {s.n}</span>
                </div>
                <p className="heading-font text-xl font-700 text-white mb-2">{s.t}</p>
                <p className="text-sm text-white/40 leading-relaxed">{s.d}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 items-center justify-center">
          <Link
            href="/register?plan=pro"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-base h-12 px-8 rounded-xl font-semibold shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.04]"
          >
            Empezar gratis
            <ArrowRight className="w-4 h-4" />
          </Link>
          <span className="text-sm text-white/30">o</span>
          <Link href="/register?plan=pro" className="text-sm font-semibold text-white/60 hover:text-white transition-colors">
            Creá tu cuenta ahora →
          </Link>
        </div>
      </section>

      {/* Differentiator: MP */}
      <section className="mx-auto max-w-6xl px-5 py-20 relative z-10 border-t border-white/[0.06]">
        <div className="gradient-border rounded-3xl p-8 sm:p-12">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="heading-font text-3xl sm:text-4xl font-900 text-white mb-3">
                Cobrá señas con MercadoPago y bajá las ausencias
              </h2>
              <p className="text-white/40 max-w-2xl mb-6">
                Pedí una seña (por ejemplo 50%) para confirmar turnos y evitar cancelaciones a último momento.
              </p>
              <ul className="grid sm:grid-cols-2 gap-3 text-sm text-white/60 mb-6">
                {[
                  "Confirmación más rápida",
                  "Menos no-shows",
                  "Mejor previsibilidad",
                  "Más ingresos por agenda ordenada",
                ].map((b) => (
                  <li key={b} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" /> {b}
                  </li>
                ))}
              </ul>
              <Link
                href="/register?plan=pro"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-sm h-11 px-6 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all"
              >
                Empezar ahora
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="mt-2 text-xs text-white/30">14 días gratis. Sin tarjeta.</p>
            </div>
          </div>
        </div>
      </section>

      {/* For who */}
      <section className="mx-auto max-w-6xl px-5 py-20 relative z-10 border-t border-white/[0.06]">
        <div className="mb-12">
          <h2 className="heading-font text-3xl sm:text-4xl font-900 text-white mb-3">Ideal para</h2>
          <p className="text-white/40">
            Elegí tu rubro y empezá con una plantilla pensada para tu forma de trabajar.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { t: "Barberías", href: "/barberia" },
            { t: "Nutricionistas", href: "/nutricion" },
            { t: "Psicólogos", href: "/psicologia" },
            { t: "Estética", href: "/belleza" },
          ].map((v) => (
            <Link
              key={v.t}
              href={v.href}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:bg-white/[0.04] hover:border-white/20 transition-all card-hover group"
            >
              <p className="heading-font text-lg font-700 text-white mb-1 group-hover:text-blue-400 transition-colors">
                {v.t}
              </p>
              <p className="text-sm text-white/40 group-hover:text-white/60 transition-colors">
                Ver cómo funciona →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-5 py-20 relative z-10 border-t border-white/[0.06]">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/40 text-xs font-semibold uppercase tracking-widest">
            Preguntas frecuentes
          </div>
          <h2 className="heading-font text-3xl sm:text-4xl font-900 text-white">
            Preguntas frecuentes
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              q: "¿Solo sirve para barberías, psicólogos y nutricionistas?",
              a: "Sí. Está pensado para negocios de servicios: barberías, estética, psicología, nutrición, fitness y más.",
            },
            {
              q: "¿Puedo cobrar seña con MercadoPago?",
              a: "Sí. Podés solicitar señas para confirmar turnos y reducir ausencias.",
            },
            {
              q: "¿Mis clientes reservan sin llamarme?",
              a: "Sí. Reservan 24/7 desde tu página y vos lo ves en tu agenda.",
            },
            {
              q: "¿Envía recordatorios por WhatsApp y email?",
              a: "Sí. Podés automatizar recordatorios y confirmaciones para bajar no-shows.",
            },
            {
              q: "¿Necesito tarjeta para probar?",
              a: "No. Tenés 14 días gratis sin tarjeta.",
            },
            {
              q: "¿Puedo manejar profesionales y comisiones?",
              a: "Sí. Cada profesional puede tener su cuenta y vos controlás turnos, ingresos y comisiones.",
            },
          ].map((f) => (
            <div key={f.q} className="gradient-border rounded-2xl p-6 card-hover">
              <p className="heading-font text-base font-700 text-white mb-2">{f.q}</p>
              <p className="text-sm text-white/50 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-5 py-24 relative z-10">
        <div className="relative rounded-3xl overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-violet-600/5 p-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12)_0%,transparent_70%)] pointer-events-none" />
          <div className="relative text-center">
            <h2 className="heading-font text-4xl sm:text-5xl font-900 text-white leading-tight mb-4">
              Probá GetSolo gratis y empezá a tomar turnos hoy
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto mb-8">
              Armá tu página de reservas, organizá tu agenda y cobrá señas con MercadoPago.
            </p>
            <Link
              href="/register?plan=pro"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-base h-12 px-10 rounded-xl font-semibold shadow-xl shadow-blue-500/30 hover:shadow-blue-400/50 transition-all hover:scale-[1.04] group"
            >
              Crear cuenta gratis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <div className="flex flex-wrap justify-center gap-5 mt-6 text-sm text-white/30">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-green-400" /> Sin tarjeta
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-green-400" /> 14 días gratis
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-green-400" /> Cancelás cuando quieras
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12 px-5 relative z-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">
            <div className="space-y-3">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="relative w-8 h-8">
                  <Image src="/logo/solo.png" alt="GetSolo" fill className="object-contain" />
                </div>
                <span className="heading-font text-lg font-800 text-white">GetSolo</span>
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
                    <a href="#como-funciona" className="hover:text-white/70 transition-colors">
                      Cómo funciona
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
                    <Link href="/centro-de-ayuda" className="hover:text-white/70 transition-colors">
                      Centro de Ayuda
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://api.whatsapp.com/send/?phone=5491164613750&text=Necesito%20hablar%20con%20un%20representante%20de%20Solo&type=phone_number&app_absent=0"
                      className="hover:text-white/70 transition-colors"
                    >
                      WhatsApp
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <div className="text-white/60 font-semibold mb-3">Legal</div>
                <ul className="space-y-2 text-white/30">
                  <li>
                    <Link href="/terminos-y-condiciones" className="hover:text-white/70 transition-colors">
                      Términos
                    </Link>
                  </li>
                  <li>
                    <Link href="/politica-de-privacidad" className="hover:text-white/70 transition-colors">
                      Privacidad
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/20">
            <span>© 2026 GetSolo. Todos los derechos reservados.</span>
            <span>🇦🇷 Hecho en Argentina</span>
          </div>
        </div>
      </footer>
    </div>
  )
}