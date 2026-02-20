import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  CheckCircle2,
  X,
  AlertTriangle,
  BarChart2,
  Scissors,
  DollarSign,
  Users,
  ShieldCheck,
  Gift,
  Landmark,
  CalendarCheck,
} from "lucide-react"

const SITE = "https://getsolo.site"
const CANONICAL = `${SITE}/alternativa-agendapro`

export const metadata: Metadata = {
  title: "GetSolo: alternativa a AgendaPro para barberías | Caja, comisiones y cobros reales",
  description:
    "Buscás una alternativa a AgendaPro? GetSolo tiene agenda online, cierre de caja diario, comisiones por profesional y cobros con MercadoPago. Probá 14 días gratis.",
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "GetSolo – Alternativa a AgendaPro para barberías",
    description:
      "Una alternativa a AgendaPro para barberías que necesitan control de caja, comisiones y cobros reales.",
    url: CANONICAL,
    type: "website",
    siteName: "GetSolo",
    images: [{ url: `${SITE}/og.png`, width: 1200, height: 630, alt: "GetSolo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GetSolo – Alternativa a AgendaPro",
    description: "Agenda + caja + comisiones + MercadoPago. Probá 14 días gratis.",
    images: [`${SITE}/og.png`],
  },
}

function jsonLd() {
  const faqs = [
    {
      q: "¿GetSolo es una alternativa a AgendaPro?",
      a: "Sí. GetSolo cubre agenda online, cobros con MercadoPago, cierre de caja diario y comisiones por profesional, funciones que AgendaPro no incluye.",
    },
    {
      q: "¿Qué ventaja tiene GetSolo sobre AgendaPro para barberías?",
      a: "GetSolo incluye cierre de caja, control de ingresos/egresos, comisiones automáticas y portal individual para cada barbero.",
    },
    {
      q: "¿GetSolo cobra comisión por transacción?",
      a: "No cobramos comisión sobre tus cobros. Solo pagás el plan mensual.",
    },
    {
      q: "¿Puedo migrar desde AgendaPro?",
      a: "Sí. El onboarding es simple y podés importar servicios y profesionales en minutos.",
    },
    {
      q: "¿Necesito tarjeta para probar?",
      a: "No. Tenés 14 días gratis sin tarjeta.",
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
      "Alternativa a AgendaPro",
      "Agenda online para barberías",
      "Cierre de caja diario",
      "Comisiones por profesional",
      "Cobros con MercadoPago",
    ],
  }

  return JSON.stringify([appSchema, faqSchema])
}

const rows = [
  { fn: "Agenda online",                     gs: { label: "Incluida",          ok: "check" }, other: { label: "Incluida",              ok: "check" } },
  { fn: "Cobro de señas con MercadoPago",    gs: { label: "Señas y pagos",     ok: "check" }, other: { label: "Limitado",              ok: "warn"  } },
  { fn: "Cierre de caja diario",             gs: { label: "Sí",                ok: "check" }, other: { label: "No",                   ok: "cross" } },
  { fn: "Control de ingresos y egresos",     gs: { label: "Integrado",         ok: "check" }, other: { label: "No",                   ok: "cross" } },
  { fn: "Comisiones por profesional",        gs: { label: "Automáticas",       ok: "check" }, other: { label: "Manual / básico",      ok: "warn"  } },
  { fn: "Portal individual para barberos",   gs: { label: "Acceso individual", ok: "check" }, other: { label: "Inexistente",          ok: "cross" } },
  { fn: "Giftcards y bonos",                gs: { label: "Sí",                ok: "check" }, other: { label: "No",                   ok: "cross" } },
  { fn: "Validación de cobros en efectivo",  gs: { label: "Cierre de caja",    ok: "check" }, other: { label: "No",                   ok: "cross" } },
  { fn: "Enfoque en barberías",              gs: { label: "Vertical dedicado", ok: "check" }, other: { label: "Genérico",             ok: "warn"  } },
]

const differentiators = [
  { icon: Landmark,     title: "Cierre de caja diario",          desc: "Sabés exactamente cuánto entraste al final del día, en efectivo y digital, sin depender de tu memoria." },
  { icon: BarChart2,    title: "Ingresos y egresos integrados",  desc: "Registrá gastos, proveedores y entradas extra sin salir de la misma plataforma." },
  { icon: Users,        title: "Portal por barbero",             desc: "Cada profesional ve solo sus turnos y comisiones. Sin líos de acceso ni de confianza." },
  { icon: DollarSign,   title: "Comisiones automáticas",         desc: "Configurás el porcentaje una vez y GetSolo liquida solo al final del período." },
  { icon: ShieldCheck,  title: "Validación antifraude",          desc: "El cierre de caja actúa como control: si el efectivo no cierra, lo ves al instante." },
  { icon: Gift,         title: "Giftcards y bonos",             desc: "Vendé paquetes y giftcards directamente desde tu página de reservas." },
]

type OkType = "check" | "warn" | "cross"

function StatusCell({ ok, label }: { ok: OkType; label: string }) {
  if (ok === "check") {
    return (
      <span className="inline-flex items-center gap-1.5 text-green-300">
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        {label}
      </span>
    )
  }
  if (ok === "warn") {
    return (
      <span className="inline-flex items-center gap-1.5 text-yellow-400/80">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        {label}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-white/30">
      <X className="w-4 h-4 flex-shrink-0" />
      {label}
    </span>
  )
}

export default function AlternativaAgendaProPage() {
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
        .table-row-alt:nth-child(even) { background: rgba(255,255,255,0.015); }
      `}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />

      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob w-[600px] h-[600px] bg-blue-600/10 top-[-200px] left-[-200px]" />
        <div className="blob w-[500px] h-[500px] bg-violet-600/8 top-[40%] right-[-150px]" />
        <div className="noise-overlay absolute inset-0" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-9 h-9">
              <Image src="/logo/solo.png" alt="GetSolo" fill className="object-contain" />
            </div>
            <span className="heading-font text-xl font-800 text-white">GetSolo</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/barberia"
              className="text-sm font-semibold text-white/60 hover:text-white transition-colors hidden sm:block"
            >
              Barbería
            </Link>
            <Link
              href="/register?plan=pro"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-sm h-9 px-5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all"
            >
              Probar gratis 14 días
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">

        {/* ── HERO ── */}
        <section className="mx-auto max-w-6xl px-5 pt-20 pb-16 relative">
          <div className="hero-glow absolute inset-0 pointer-events-none" />
          <div className="relative">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">
              <Scissors className="w-4 h-4" /> Alternativa a AgendaPro
            </p>
            <h1 className="heading-font text-5xl sm:text-6xl font-900 leading-[1.05] mb-5">
              <span className="text-white">¿Buscás una alternativa a </span>
              <span className="shimmer-text">AgendaPro</span>
              <span className="text-white">?</span>
            </h1>
            <p className="text-lg text-white/50 leading-relaxed max-w-2xl mb-6">
              AgendaPro te da una agenda. GetSolo te da una agenda{" "}
              <strong className="text-white/70">más cierre de caja, comisiones automáticas y cobros reales con MercadoPago</strong>.
              Todo en un solo lugar.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link
                href="/register?plan=pro"
                className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-base h-12 px-8 rounded-xl font-semibold shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.04] group"
              >
                Probar GetSolo gratis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/barberia"
                className="inline-flex items-center justify-center gap-2 border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:border-white/20 h-12 px-8 rounded-xl font-semibold transition-all"
              >
                Ver página Barbería
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-white/35">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> 14 días gratis</span>
              <span className="flex items-center gap-2"><CalendarCheck className="w-4 h-4 text-green-400" /> Sin tarjeta</span>
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-400" /> Sin comisión por cobro</span>
            </div>
          </div>
        </section>

        {/* ── TABLA COMPARATIVA ── */}
        <section className="mx-auto max-w-6xl px-5 py-20 border-t border-white/[0.06]">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/40 text-xs font-semibold uppercase tracking-widest">
              <BarChart2 className="w-4 h-4" /> Comparativa funcional
            </div>
            <h2 className="heading-font text-4xl sm:text-5xl font-900 text-white leading-tight">
              GetSolo vs otras plataformas
            </h2>
            <p className="mt-4 text-white/40 text-lg max-w-2xl">
              Una agenda sola no alcanza. Mirá qué funciones tiene GetSolo que otras plataformas no ofrecen.
            </p>
          </div>

          <div className="gradient-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                    <th className="text-left px-6 py-4 font-semibold text-white/50 uppercase tracking-widest text-xs w-1/2">
                      Función
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-blue-300 uppercase tracking-widest text-xs w-1/4">
                      GetSolo
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-white/30 uppercase tracking-widest text-xs w-1/4">
                      Otras plataformas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={i}
                      className="table-row-alt border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors"
                    >
                      <td className="px-6 py-4 text-white/55 font-medium">{row.fn}</td>
                      <td className="px-6 py-4">
                        <StatusCell ok={row.gs.ok as OkType} label={row.gs.label} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusCell ok={row.other.ok as OkType} label={row.other.label} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-6 text-sm text-white/35 max-w-2xl">
            A diferencia de otras plataformas de agenda, GetSolo está pensado para negocios que necesitan
            controlar su caja, su equipo y sus ingresos — no solo tomar reservas.
          </p>
        </section>

        {/* ── POR QUÉ CAMBIAN ── */}
        <section className="mx-auto max-w-6xl px-5 py-20 border-t border-white/[0.06]">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/40 text-xs font-semibold uppercase tracking-widest">
              <CheckCircle2 className="w-4 h-4" /> Lo que hace la diferencia
            </div>
            <h2 className="heading-font text-4xl sm:text-5xl font-900 text-white leading-tight">
              ¿Por qué los negocios buscan otra opción?
            </h2>
            <p className="mt-4 text-white/40 text-lg max-w-2xl">
              El problema no suele ser la agenda. Es el control: cobros sin validar,
              comisiones mal liquidadas y sin cierre de caja al final del día.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {differentiators.map((d) => {
              const Icon = d.icon
              return (
                <div key={d.title} className="gradient-border rounded-2xl p-7 card-hover">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center border border-blue-500/20 mb-4">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="heading-font text-xl font-700 text-white mb-2">{d.title}</h3>
                  <p className="text-sm text-white/45 leading-relaxed">{d.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mx-auto max-w-6xl px-5 py-20 border-t border-white/[0.06]">
          <div className="mb-12">
            <h2 className="heading-font text-3xl sm:text-4xl font-900 text-white">
              Preguntas frecuentes
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                q: "¿GetSolo es una alternativa real a AgendaPro?",
                a: "Sí. Cubrís agenda + cobros + caja + comisiones en un solo sistema. No necesitás herramientas externas para cerrar el día.",
              },
              {
                q: "¿Puedo migrar desde AgendaPro fácilmente?",
                a: "El onboarding es simple: cargás servicios y barberos en minutos. No necesitás exportar nada complicado.",
              },
              {
                q: "¿GetSolo cobra comisión sobre mis cobros?",
                a: "No. Solo pagás el plan mensual. Las transacciones de MercadoPago tienen la comisión estándar de MP, nada más.",
              },
              {
                q: "¿Funciona si tengo varios barberos?",
                a: "Sí. Cada barbero tiene su portal individual, su agenda y sus comisiones calculadas automáticamente.",
              },
            ].map((f) => (
              <div key={f.q} className="gradient-border rounded-2xl p-6 card-hover">
                <p className="heading-font text-base font-700 text-white mb-2">{f.q}</p>
                <p className="text-sm text-white/50 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="mx-auto max-w-6xl px-5 py-24">
          <div className="relative rounded-3xl overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-violet-600/5 p-12">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12)_0%,transparent_70%)] pointer-events-none" />
            <div className="relative text-center">
              <h2 className="heading-font text-4xl sm:text-5xl font-900 text-white leading-tight mb-4">
                Más que una agenda. Una caja que cierra.
              </h2>
              <p className="text-white/50 text-lg max-w-2xl mx-auto mb-8">
                Probá GetSolo gratis y manejá turnos, cobros y caja en un solo lugar.
                Sin tarjeta, sin compromiso.
              </p>
              <Link
                href="/register?plan=pro"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-base h-12 px-10 rounded-xl font-semibold shadow-xl shadow-blue-500/30 hover:shadow-blue-400/50 transition-all hover:scale-[1.04] group"
              >
                Crear cuenta gratis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <p className="mt-4 text-xs text-white/30">14 días gratis · sin tarjeta · cancelás cuando querés</p>
              <div className="mt-8 text-sm text-white/40">
                Ver también:{" "}
                <Link className="text-blue-400 hover:text-blue-300 transition-colors" href="/barberia">Barbería</Link>
                {" · "}
                <Link className="text-blue-400 hover:text-blue-300 transition-colors" href="/nutricion">Nutrición</Link>
                {" · "}
                <Link className="text-blue-400 hover:text-blue-300 transition-colors" href="/psicologia">Psicología</Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12 px-5 relative z-10">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8">
              <Image src="/logo/solo.png" alt="GetSolo" fill className="object-contain" />
            </div>
            <span className="text-xs text-white/20">© {new Date().getFullYear()} GetSolo</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/barberia" className="text-white/40 hover:text-white/70 transition-colors">
              Barbería
            </Link>
            <Link href="/sistema-turnos-online" className="text-white/40 hover:text-white/70 transition-colors">
              Sistema de turnos
            </Link>
            <Link href="/register" className="text-white/40 hover:text-white/70 transition-colors">
              Crear cuenta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}