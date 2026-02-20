import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  MessageSquare,
  Calendar,
  Clock,
  Scissors,
  ShieldCheck,
  ChevronRight,
} from "lucide-react"

const SITE = "https://getsolo.site"
const SLUG = "/blog/cobrar-sena-online-barberia"
const CANONICAL = `${SITE}${SLUG}`

export const metadata: Metadata = {
  title: "Cómo cobrar seña online en una barbería (MercadoPago + GetSolo)",
  description:
    "Guía práctica para cobrar seña online en barberías con MercadoPago y GetSolo. Reducí no-shows, confirmá turnos y cobrales la seña al reservar. Probá 14 días gratis.",
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: "article",
    url: CANONICAL,
    title: "Cómo cobrar seña online en una barbería (y dejar de perder turnos)",
    description:
      "Paso a paso para cobrar seña online en tu barbería con MercadoPago y GetSolo. Menos cancelaciones, más agenda real.",
    siteName: "GetSolo",
    images: [{ url: `${SITE}/og.png`, width: 1200, height: 630, alt: "GetSolo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cómo cobrar seña online en una barbería (y dejar de perder turnos)",
    description:
      "Guía práctica para cobrar seña online con MercadoPago y GetSolo: menos no-shows, más turnos confirmados.",
    images: [`${SITE}/og.png`],
  },
}

function jsonLd() {
  const published = new Date().toISOString().slice(0, 10)
  const modified = new Date().toISOString().slice(0, 10)

  const faqs = [
    {
      q: "¿El dinero va a mi cuenta?",
      a: "Sí. Cada pago entra directamente a tu cuenta de MercadoPago. GetSolo no toca tu dinero.",
    },
    {
      q: "¿Puedo cambiar el porcentaje después?",
      a: "Sí. Podés modificar el porcentaje de seña cuando quieras desde el panel.",
    },
    {
      q: "¿Qué pasa si un cliente cancela?",
      a: "Lo definís vos con tu política: podés devolver la seña, guardarla como crédito o no devolverla, según tus reglas.",
    },
  ]

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE },
      { "@type": "ListItem", position: 2, name: "Barbería", item: `${SITE}/barberia` },
      { "@type": "ListItem", position: 3, name: "Blog", item: `${SITE}/blog` },
      { "@type": "ListItem", position: 4, name: "Cobrar seña online", item: CANONICAL },
    ],
  }

  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "Cómo cobrar seña online en una barbería (y dejar de perder turnos)",
    description:
      "Guía práctica para cobrar seña online en barberías con MercadoPago y GetSolo. Reducí no-shows, confirmá turnos y cobrales la seña al reservar.",
    image: [`${SITE}/og.png`],
    datePublished: published,
    dateModified: modified,
    mainEntityOfPage: { "@type": "WebPage", "@id": CANONICAL },
    author: { "@type": "Organization", name: "GetSolo", url: SITE },
    publisher: {
      "@type": "Organization",
      name: "GetSolo",
      logo: { "@type": "ImageObject", url: `${SITE}/logo/solo.png` },
    },
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }

  return JSON.stringify([breadcrumb, blogPosting, faqSchema])
}

export default function CobrarSenaOnlineBarberiaPage() {
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
        .prose-article p { color: rgba(255,255,255,.55); line-height: 1.85; }
        .prose-article strong { color: rgba(255,255,255,.75); font-weight: 700; }
        .prose-article h2 { margin-top: 2.25rem; margin-bottom: .75rem; }
        .prose-article h3 { margin-top: 1.5rem; margin-bottom: .5rem; }
        .prose-article ul { color: rgba(255,255,255,.55); }
        .prose-article li { margin: .4rem 0; }
        .kbd-pill { border: 1px solid rgba(255,255,255,.10); background: rgba(255,255,255,.04); }
      `}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />

      {/* Background */}
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
              className="text-sm font-semibold text-white/60 hover:text-white transition-colors"
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
        {/* Hero / Article header */}
        <section className="mx-auto max-w-6xl px-5 pt-16 pb-10">
          <div className="hero-glow absolute inset-0 pointer-events-none" />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">
              <span className="inline-flex items-center gap-2">
                <Scissors className="w-4 h-4" /> Barbería
              </span>
              <span className="text-white/20">•</span>
              <span className="inline-flex items-center gap-2 text-white/40">
                <Clock className="w-4 h-4" /> 6–9 min de lectura
              </span>
              <span className="text-white/20">•</span>
              <span className="inline-flex items-center gap-2 text-white/40">
                <Calendar className="w-4 h-4" /> Actualizado hoy
              </span>
            </div>

            <h1 className="heading-font text-4xl sm:text-6xl font-900 leading-[1.06] mb-5">
              <span className="text-white">Cómo cobrar seña online en una </span>
              <span className="shimmer-text">barbería</span>
              <span className="text-white"> (y dejar de perder turnos)</span>
            </h1>

            <p className="text-lg text-white/50 leading-relaxed max-w-3xl">
              Guía práctica para cobrar señas con <strong>MercadoPago</strong> y confirmar turnos automáticamente con <strong>GetSolo</strong>.
              Menos ausencias, agenda real y menos WhatsApp infinito.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                href="/register?plan=pro"
                className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-base h-12 px-8 rounded-xl font-semibold shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.04] group"
              >
                Probar gratis 14 días
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/barberia"
                className="inline-flex items-center justify-center gap-2 border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:border-white/20 h-12 px-8 rounded-xl font-semibold transition-all"
              >
                Volver atrás
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap gap-4 text-sm text-white/35">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> 14 días gratis</span>
              <span className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-green-400" /> Seña online</span>
              <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-green-400" /> Menos WhatsApp</span>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <div className="grid lg:grid-cols-[1fr_360px] gap-10 items-start">
            {/* Article */}
            <article className="prose-article">
              <div className="gradient-border rounded-3xl p-7 sm:p-10">
                <h2 className="heading-font text-2xl sm:text-3xl font-900 text-white mb-4">
                  Introducción (problema real)
                </h2>

                <p>
                  Si tenés una barbería, seguro te pasó: clientes que reservan y no vienen, turnos vacíos y tiempo perdido.
                  La mayoría de las cancelaciones pasan por una sola razón: <strong>el cliente no tiene compromiso real con el turno</strong>.
                </p>
                <p>
                  La solución más simple hoy es cobrar una <strong>seña online</strong> al momento de reservar.
                  En esta guía te muestro cómo hacerlo paso a paso.
                </p>

                <h2 className="heading-font text-2xl sm:text-3xl font-900 text-white">
                  ¿Por qué cobrar seña en una barbería?
                </h2>

                <ul className="list-disc pl-5">
                  <li>Reduce drásticamente los “no show”.</li>
                  <li>Filtra clientes que no van en serio.</li>
                  <li>Te asegura ingresos aunque cancelen.</li>
                  <li>Ordena tu agenda.</li>
                  <li>Profesionaliza tu negocio.</li>
                </ul>

                <p>
                  No es solo cobrar antes. Es <strong>trabajar más tranquilo</strong>.
                </p>

                <h2 className="heading-font text-2xl sm:text-3xl font-900 text-white">
                  Cómo funciona una seña online en la práctica
                </h2>

                <p>El flujo ideal es este:</p>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  {[
                    { t: "Elige día y horario", d: "El cliente ve tu disponibilidad real." },
                    { t: "Selecciona el servicio", d: "Corte, barba, combo, etc." },
                    { t: "Paga la seña", d: "Por ejemplo 30% o 50%." },
                    { t: "Recibe confirmación", d: "Confirmación automática del turno." },
                  ].map((s) => (
                    <div key={s.t} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 card-hover">
                      <p className="font-bold text-white mb-1">{s.t}</p>
                      <p className="text-sm text-white/40 leading-relaxed">{s.d}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-5">
                  Vos recibís el pago directo en tu cuenta y el resto lo paga en el local. <strong>Simple</strong>.
                </p>

                <h2 className="heading-font text-2xl sm:text-3xl font-900 text-white">
                  Cómo cobrar seña online con GetSolo + MercadoPago
                </h2>

                <p>
                  Con GetSolo podés hacerlo sin conocimientos técnicos. Configurás una vez y después tu agenda se gestiona sola.
                </p>

                <div className="mt-6 grid gap-4">
                  {[
                    {
                      icon: CheckCircle2,
                      t: "Paso 1 — Crear tu cuenta",
                      d: "Te registrás y en minutos tenés tu propia página pública de turnos.",
                    },
                    {
                      icon: ShieldCheck,
                      t: "Paso 2 — Conectar MercadoPago",
                      d: "Autorizás tu cuenta con un clic. No tenés que pegar tokens ni claves.",
                    },
                    {
                      icon: CreditCard,
                      t: "Paso 3 — Elegir el porcentaje de seña",
                      d: "Definís cuánto paga el cliente al reservar (30%, 50% o lo que prefieras). Podés cambiarlo cuando quieras.",
                    },
                    {
                      icon: MessageSquare,
                      t: "Paso 4 — Compartir tu link de turnos",
                      d: "Pegás tu link en WhatsApp, Instagram, historias y bio. Desde ahí reservan y pagan solos.",
                    },
                  ].map((step) => {
                    const Icon = step.icon
                    return (
                      <div key={step.t} className="gradient-border rounded-2xl p-6 card-hover">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center border border-blue-500/20 mb-4">
                          <Icon className="w-5 h-5 text-blue-400" />
                        </div>
                        <p className="heading-font text-xl font-700 text-white mb-2">{step.t}</p>
                        <p className="text-sm text-white/40 leading-relaxed">{step.d}</p>
                      </div>
                    )
                  })}
                </div>

                <h2 className="heading-font text-2xl sm:text-3xl font-900 text-white">
                  Resultado
                </h2>

                <p>A partir de ese momento:</p>
                <ul className="list-disc pl-5">
                  <li>Los turnos quedan confirmados.</li>
                  <li>El cliente ya dejó dinero.</li>
                  <li>Vos trabajás con agenda real.</li>
                </ul>

                <p>
                  Nada de mensajes eternos. Nada de cancelaciones de último momento.
                </p>

                {/* CTA inline */}
                <div className="mt-8 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-violet-600/5 p-6">
                  <p className="heading-font text-lg font-800 text-white mb-1">Probá GetSolo gratis</p>
                  <p className="text-sm text-white/50 mb-4">
                    En menos de 10 minutos ya podés cobrar señas online y confirmar turnos.
                  </p>
                  <Link
                    href="/register?plan=pro"
                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-sm h-10 px-6 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.03]"
                  >
                    Crear mi sistema de turnos
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <p className="mt-3 text-xs text-white/30">14 días gratis • sin tarjeta</p>
                </div>

                <h2 className="heading-font text-2xl sm:text-3xl font-900 text-white">
                  Preguntas frecuentes
                </h2>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {[
                    {
                      q: "¿El dinero va a mi cuenta?",
                      a: "Sí. Cada pago entra directamente a tu cuenta de MercadoPago. GetSolo no toca tu dinero.",
                    },
                    {
                      q: "¿Puedo cambiar el porcentaje después?",
                      a: "Sí. Podés modificar el porcentaje de seña cuando quieras desde el panel.",
                    },
                    {
                      q: "¿Qué pasa si un cliente cancela?",
                      a: "Lo definís vos con tu política: devolver la seña, guardarla como crédito o no devolverla según tus reglas.",
                    },
                    {
                      q: "¿Esto sirve si tengo una sola silla?",
                      a: "Sí. Funciona igual para barberías chicas o equipos con varios barberos.",
                    },
                  ].map((f) => (
                    <div key={f.q} className="gradient-border rounded-2xl p-6 card-hover">
                      <p className="heading-font text-base font-700 text-white mb-2">{f.q}</p>
                      <p className="text-sm text-white/50 leading-relaxed">{f.a}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex flex-col sm:flex-row gap-3">
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
                    Ver sistema de turnos para barberías
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Internal links (SEO) */}
              <div className="mt-6 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6">
                <p className="text-sm text-white/40 mb-3">Siguiente lectura recomendada</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Link
                    href="/blog/evitar-cancelaciones-barberia"
                    className="gradient-border rounded-2xl p-5 card-hover block"
                  >
                    <p className="font-bold text-white mb-1">Cómo evitar cancelaciones en una barbería</p>
                    <p className="text-sm text-white/40">
                      Políticas simples + recordatorios + seña para reducir no-shows.
                    </p>
                  </Link>

                  <Link
                    href="/blog/turnos-barberia-whatsapp"
                    className="gradient-border rounded-2xl p-5 card-hover block"
                  >
                    <p className="font-bold text-white mb-1">Turnos por WhatsApp: cómo ordenarlo</p>
                    <p className="text-sm text-white/40">
                      De mensajes eternos a reservas automáticas con link.
                    </p>
                  </Link>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 space-y-4">
              <div className="gradient-border rounded-3xl p-6">
                <p className="heading-font text-lg font-900 text-white mb-2">Checklist rápido</p>
                <ul className="text-sm text-white/50 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-5 w-5 rounded-lg bg-white/[0.06] flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </span>
                    Activar seña (30%–50%)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-5 w-5 rounded-lg bg-white/[0.06] flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </span>
                    Conectar MercadoPago
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-5 w-5 rounded-lg bg-white/[0.06] flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </span>
                    Compartir link por WhatsApp/Instagram
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-5 w-5 rounded-lg bg-white/[0.06] flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </span>
                    Listo: turnos confirmados
                  </li>
                </ul>

                <div className="mt-5">
                  <Link
                    href="/register?plan=pro"
                    className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-sm h-10 px-6 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all w-full"
                  >
                    Crear cuenta gratis
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <p className="mt-3 text-xs text-white/30 text-center">14 días gratis • sin tarjeta</p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6">
                <p className="text-sm text-white/40 mb-2">Página Barber</p>
                <Link
                  href="/barberia"
                  className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                >
                  Sistema de turnos para barberías
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </aside>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-6xl px-5 py-24">
          <div className="relative rounded-3xl overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-violet-600/5 p-12">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12)_0%,transparent_70%)] pointer-events-none" />
            <div className="relative text-center">
              <h2 className="heading-font text-4xl sm:text-5xl font-900 text-white leading-tight mb-4">
                Confirmá turnos y cobrales la seña
              </h2>
              <p className="text-white/50 text-lg max-w-2xl mx-auto mb-8">
                Probá GetSolo gratis y empezá a tomar reservas 24/7 con señas online.
              </p>
              <Link
                href="/register?plan=pro"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-base h-12 px-10 rounded-xl font-semibold shadow-xl shadow-blue-500/30 hover:shadow-blue-400/50 transition-all hover:scale-[1.04] group"
              >
                Crear mi sistema de turnos
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <p className="mt-4 text-xs text-white/30">14 días gratis • sin tarjeta</p>
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
