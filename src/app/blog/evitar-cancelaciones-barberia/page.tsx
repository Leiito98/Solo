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
  Bell,
  Wallet,
  Ban,
  Sparkles,
} from "lucide-react"

const SITE = "https://getsolo.site"
const SLUG = "/blog/evitar-cancelaciones-barberia"
const CANONICAL = `${SITE}${SLUG}`

export const metadata: Metadata = {
  title: "Cómo evitar cancelaciones en una barbería (con seña online + reglas claras)",
  description:
    "Reducí cancelaciones y no-shows en tu barbería con política simple, recordatorios y seña online. Ejemplos listos para copiar y cómo aplicarlo con Solo. Probá 14 días gratis.",
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: "article",
    url: CANONICAL,
    title: "Cómo evitar cancelaciones en una barbería (sin volverte loco por WhatsApp)",
    description:
      "Política simple + recordatorios + seña online: el combo para bajar no-shows y tener agenda real.",
    siteName: "Solo",
    images: [{ url: `${SITE}/og.png`, width: 1200, height: 630, alt: "Solo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cómo evitar cancelaciones en una barbería (sin volverte loco por WhatsApp)",
    description:
      "Bajá cancelaciones con reglas claras, recordatorios y seña online. Plantillas y ejemplo con Solo.",
    images: [`${SITE}/og.png`],
  },
}

function jsonLd() {
  const published = new Date().toISOString().slice(0, 10)
  const modified = new Date().toISOString().slice(0, 10)

  const faqs = [
    {
      q: "¿Cobrar seña reduce cancelaciones de verdad?",
      a: "Sí. La seña crea compromiso real: el cliente ya dejó dinero y es menos probable que falte o cancele a último momento.",
    },
    {
      q: "¿Qué porcentaje de seña conviene?",
      a: "Lo más común es 30%–50%. Si tenés muchos no-shows, arrancá con 50% en horarios pico y ajustá según tu caso.",
    },
    {
      q: "¿Qué hago si cancelan con tiempo?",
      a: "Podés devolver la seña, convertirla en crédito para reprogramar, o retenerla si tu política lo indica. Lo importante es que esté claro antes de reservar.",
    },
    {
      q: "¿Cómo lo implemento sin discutir con clientes?",
      a: "Con una política corta, visible y consistente + recordatorios automáticos. El problema no es cobrar, es comunicarlo mal o cambiar reglas según el cliente.",
    },
  ]

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE },
      { "@type": "ListItem", position: 2, name: "Barbería", item: `${SITE}/barberia` },
      { "@type": "ListItem", position: 3, name: "Blog", item: `${SITE}/blog` },
      { "@type": "ListItem", position: 4, name: "Evitar cancelaciones", item: CANONICAL },
    ],
  }

  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "Cómo evitar cancelaciones en una barbería (con seña online + reglas claras)",
    description:
      "Guía práctica para reducir cancelaciones y no-shows con política simple, recordatorios y seña online. Incluye ejemplos y cómo aplicarlo con Solo.",
    image: [`${SITE}/og.png`],
    datePublished: published,
    dateModified: modified,
    mainEntityOfPage: { "@type": "WebPage", "@id": CANONICAL },
    author: { "@type": "Organization", name: "Solo", url: SITE },
    publisher: {
      "@type": "Organization",
      name: "Solo",
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

export default function EvitarCancelacionesBarberiaPage() {
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
        .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
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
              <Image src="/logo/solo.png" alt="Solo" fill className="object-contain" />
            </div>
            <span className="heading-font text-xl font-800 text-white">Solo</span>
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
              <span className="text-white">Cómo evitar </span>
              <span className="shimmer-text">cancelaciones</span>
              <span className="text-white"> en una barbería (con seña online)</span>
            </h1>

            <p className="text-lg text-white/50 leading-relaxed max-w-3xl">
              La mayoría de las cancelaciones no se arreglan con “mandame un msj si no venís”.
              Se arreglan con <strong>reglas claras</strong>, <strong>recordatorios</strong> y <strong>una seña</strong> que confirme el turno.
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
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" /> Política simple
              </span>
              <span className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-green-400" /> Recordatorios
              </span>
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-green-400" /> Seña online
              </span>
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
                  El problema real (y por qué pasa tanto)
                </h2>

                <p>
                  En barberías pasa siempre: te reservan un turno, lo guardás, y a último momento te clavan el visto.
                  El problema no es “la gente”. Es el sistema: <strong>si reservar no cuesta nada, cancelar tampoco</strong>.
                </p>

                <p>
                  El objetivo no es “cobrar por cobrar”. El objetivo es que tu agenda sea <strong>agenda real</strong>.
                  Y eso se consigue con 3 cosas:
                </p>

                <div className="grid sm:grid-cols-3 gap-4 mt-4">
                  {[
                    { icon: ShieldCheck, t: "Reglas claras", d: "Política corta y visible." },
                    { icon: Bell, t: "Recordatorios", d: "Confirmación antes del turno." },
                    { icon: CreditCard, t: "Seña online", d: "Compromiso real al reservar." },
                  ].map((s) => {
                    const Icon = s.icon
                    return (
                      <div key={s.t} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 card-hover">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center border border-blue-500/20 mb-3">
                          <Icon className="w-5 h-5 text-blue-400" />
                        </div>
                        <p className="font-bold text-white mb-1">{s.t}</p>
                        <p className="text-sm text-white/40 leading-relaxed">{s.d}</p>
                      </div>
                    )
                  })}
                </div>

                <h2 className="heading-font text-2xl sm:text-3xl font-900 text-white">
                  Cuánto se pierde por cancelaciones (sin darte cuenta)
                </h2>

                <p>
                  No es solo “un turno vacío”. Es tiempo muerto + huecos imposibles de rellenar + energía contestando mensajes.
                  Y cuando son horarios pico (viernes/sábado), duele el doble.
                </p>

                <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
                  <p className="text-white font-bold mb-2">Ejemplo rápido (para entender el impacto)</p>
                  <ul className="list-disc pl-5">
                    <li>
                      Si perdés <strong>3 turnos por semana</strong> por cancelación
                    </li>
                    <li>
                      Son <strong>12 por mes</strong>.
                    </li>
                    <li>
                      Y si tu ticket promedio es <strong>$15.000</strong>, son <strong>$180.000</strong> al mes que se te va.
                    </li>
                  </ul>
                  <p className="text-xs text-white/30 mt-3">
                    Ajustá números a tu realidad. La lógica es la misma.
                  </p>
                </div>

                <h2 className="heading-font text-2xl sm:text-3xl font-900 text-white">
                  La solución en 3 capas (la que funciona de verdad)
                </h2>

                <h3 className="heading-font text-xl sm:text-2xl font-800 text-white">
                  1) Política corta (visible, sin discusiones)
                </h3>

                <p>
                  Tu política no puede ser un testamento. Tiene que ser corta, clara y aplicada igual para todos.
                  Si no, discutís con cada cliente y volvés al caos.
                </p>

                <div className="mt-4 gradient-border rounded-2xl p-6">
                  <p className="heading-font text-lg font-800 text-white mb-2">
                    Plantilla copy-paste (barbería)
                  </p>
                  <div className="rounded-2xl border border-white/[0.08] bg-black/30 p-5">
                    <p className="text-sm text-white/70 leading-relaxed mono">
                      • Para reservar se solicita una seña del X%.<br />
                      • Cancelaciones con más de 24 hs: se reprograma sin problema.<br />
                      • Cancelaciones con menos de 24 hs o no asistencia: la seña no se reintegra.<br />
                      • Si llegás tarde, el turno puede recortarse para respetar la agenda.
                    </p>
                  </div>
                  <p className="mt-3 text-xs text-white/30">
                    Tip: “X%” lo definís vos (30–50% suele funcionar bien).
                  </p>
                </div>

                <h3 className="heading-font text-xl sm:text-2xl font-800 text-white">
                  2) Recordatorios (sin WhatsApp infinito)
                </h3>

                <p>
                  Mucha gente no cancela: <strong>se olvida</strong>. Un recordatorio 24 hs antes te salva turnos.
                  Y si confirma, te da tranquilidad.
                </p>

                <ul className="list-disc pl-5">
                  <li>Recordatorio 24 hs antes (confirmar o reprogramar).</li>
                  <li>Recordatorio 2 hs antes (solo “nos vemos pronto”).</li>
                  <li>Link directo para reprogramar (sin discutir).</li>
                </ul>

                <h3 className="heading-font text-xl sm:text-2xl font-800 text-white">
                  3) Seña online (el filtro que te cambia el juego)
                </h3>

                <p>
                  La seña no es “para ganar plata”. Es para que el cliente tenga algo que perder si no viene.
                  Eso cambia el comportamiento al toque.
                </p>

                <div className="mt-5 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: Wallet,
                      t: "Compromiso real",
                      d: "Si ya pagó, es menos probable que falte.",
                    },
                    {
                      icon: Ban,
                      t: "Menos no-shows",
                      d: "Filtra a los que reservan “por las dudas”.",
                    },
                    {
                      icon: MessageSquare,
                      t: "Menos mensajes",
                      d: "Menos negociación, más automático.",
                    },
                    {
                      icon: Sparkles,
                      t: "Más profesional",
                      d: "Reglas claras = negocio serio.",
                    },
                  ].map((c) => {
                    const Icon = c.icon
                    return (
                      <div key={c.t} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 card-hover">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center border border-blue-500/20 mb-3">
                          <Icon className="w-5 h-5 text-blue-400" />
                        </div>
                        <p className="font-bold text-white mb-1">{c.t}</p>
                        <p className="text-sm text-white/40 leading-relaxed">{c.d}</p>
                      </div>
                    )
                  })}
                </div>

                <h2 className="heading-font text-2xl sm:text-3xl font-900 text-white">
                  Ejemplo con Solo (simple y sin vueltas)
                </h2>

                <p>
                  Con Solo armás el sistema una vez y después se gestiona solo: link público, agenda, y seña con MercadoPago.
                </p>

                <div className="mt-6 grid gap-4">
                  {[
                    {
                      icon: CheckCircle2,
                      t: "Paso 1 — Crear tu cuenta",
                      d: "Te registrás y en minutos tenés tu link público de turnos.",
                    },
                    {
                      icon: ShieldCheck,
                      t: "Paso 2 — Conectar MercadoPago",
                      d: "Autorizás con un clic. El dinero va a tu cuenta.",
                    },
                    {
                      icon: CreditCard,
                      t: "Paso 3 — Activar seña",
                      d: "Elegís porcentaje (30%–50%) y listo.",
                    },
                    {
                      icon: MessageSquare,
                      t: "Paso 4 — Compartir el link",
                      d: "Pegalo en WhatsApp/Instagram. Reservan sin hablar con vos.",
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

                {/* CTA inline */}
                <div className="mt-8 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-violet-600/5 p-6">
                  <p className="heading-font text-lg font-800 text-white mb-1">
                    Querés agenda real (sin cancelaciones)
                  </p>
                  <p className="text-sm text-white/50 mb-4">
                    Probá Solo gratis: política + seña + link de turnos para reservar 24/7.
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
                      q: "¿Cobrar seña reduce cancelaciones de verdad?",
                      a: "Sí. La seña crea compromiso real: el cliente ya dejó dinero y es menos probable que falte o cancele a último momento.",
                    },
                    {
                      q: "¿Qué porcentaje de seña conviene?",
                      a: "Lo más común es 30%–50%. Si tenés muchos no-shows, arrancá con 50% en horarios pico y ajustá según tu caso.",
                    },
                    {
                      q: "¿Qué hago si cancelan con tiempo?",
                      a: "Podés devolver, convertir en crédito para reprogramar o retenerla según tu política. Lo importante es que esté comunicado.",
                    },
                    {
                      q: "¿Y si tengo una sola silla?",
                      a: "También sirve. De hecho, te pega más fuerte un turno vacío, así que se nota el cambio más rápido.",
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
                    Probar Solo gratis
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
                    href="/blog/cobrar-sena-online-barberia"
                    className="gradient-border rounded-2xl p-5 card-hover block"
                  >
                    <p className="font-bold text-white mb-1">Cómo cobrar seña online en una barbería</p>
                    <p className="text-sm text-white/40">
                      MercadoPago + Solo: activá señas y confirmá turnos automáticamente.
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
                <p className="heading-font text-lg font-900 text-white mb-2">Checklist anti-cancelación</p>
                <ul className="text-sm text-white/50 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-5 w-5 rounded-lg bg-white/[0.06] flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </span>
                    Política corta y visible
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-5 w-5 rounded-lg bg-white/[0.06] flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </span>
                    Recordatorio 24 hs antes
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-5 w-5 rounded-lg bg-white/[0.06] flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </span>
                    Seña (30%–50%) en horarios pico
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-5 w-5 rounded-lg bg-white/[0.06] flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </span>
                    Link para reprogramar
                  </li>
                </ul>

                <div className="mt-5">
                  <Link
                    href="/register?plan=pro"
                    className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-sm h-10 px-6 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all w-full"
                  >
                    Activar esto en Solo
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
                Menos cancelaciones. Más agenda real.
              </h2>
              <p className="text-white/50 text-lg max-w-2xl mx-auto mb-8">
                Política + recordatorios + seña online. Armalo en Solo y dejá de depender de WhatsApp.
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
              <Image src="/logo/solo.png" alt="Solo" fill className="object-contain" />
            </div>
            <span className="text-xs text-white/20">© {new Date().getFullYear()} Solo</span>
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