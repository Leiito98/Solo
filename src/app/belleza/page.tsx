import type { Metadata } from "next"
import Link from "next/link"
import Image from 'next/image'
import { ArrowRight, Calendar, CheckCircle2, Clock, CreditCard, MessageSquare, Star, Users, Palette } from "lucide-react"

const SITE = "https://getsolo.site"
const CANONICAL = `${SITE}/belleza`

export const metadata: Metadata = {
  title: "Sistema de turnos para estética y belleza en Argentina | GetSolo",
  description:
    "Agenda online para estética: turnos 24/7, recordatorios, señas con MercadoPago y organización por profesional. Probá 14 días gratis sin tarjeta.",
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: "website",
    url: CANONICAL,
    title: "Sistema de turnos para estética y belleza en Argentina | GetSolo",
    description: "Reservas 24/7 + recordatorios + señas con MercadoPago. Probá 14 días gratis.",
    siteName: "GetSolo",
    images: [{ url: `${SITE}/og.png`, width: 1200, height: 630, alt: "GetSolo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sistema de turnos para estética y belleza en Argentina | GetSolo",
    description: "Reservas 24/7 + recordatorios + señas con MercadoPago. Probá 14 días gratis.",
    images: [`${SITE}/og.png`],
  },
}

function jsonLd() {
  const faqs = [
    { q: "¿GetSolo sirve para estética, uñas y lashes?", a: "Sí. Podés ofrecer servicios, organizar agenda y confirmar con señas." },
    { q: "¿Se puede cobrar seña con MercadoPago?", a: "Sí. Para confirmar turnos y bajar ausencias." },
    { q: "¿Puedo manejar varios profesionales?", a: "Sí. Agenda por profesional y horarios definidos." },
    { q: "¿Envía recordatorios?", a: "Sí. Recordatorios y confirmaciones para reducir cancelaciones." },
    { q: "¿Necesito tarjeta para probar?", a: "No. 14 días gratis sin tarjeta." },
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
    offers: { "@type": "Offer", price: "0", priceCurrency: "ARS", description: "Prueba gratis 14 días (sin tarjeta)." },
    featureList: [
      "Agenda online para estética",
      "Reservas 24/7",
      "Recordatorios",
      "Señas con MercadoPago",
      "Agenda por profesional",
    ],
  }

  return JSON.stringify([appSchema, faqSchema])
}

export default function BellezaPage() {
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
            <Link href="/sistema-turnos-online" className="text-sm font-semibold text-white/60 hover:text-white transition-colors">
              Sistema de turnos
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

      {/* Hero */}
      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-5 pt-20 pb-16">
          <div className="hero-glow absolute inset-0 pointer-events-none" />
          <div className="relative">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">
              <Palette className="w-4 h-4" /> Agenda online para estética
            </p>
            <h1 className="heading-font text-5xl sm:text-6xl font-900 leading-[1.05] mb-5">
              <span className="text-white">Sistema de turnos para </span>
              <span className="shimmer-text">estética y belleza en Argentina</span>
            </h1>
            <p className="text-lg text-white/50 leading-relaxed max-w-2xl mb-6">
              Reservas 24/7, recordatorios y <strong className="text-white/70">señas con MercadoPago</strong> para reducir ausencias en uñas, lashes, faciales y más.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link
                href="/register?plan=pro"
                className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-base h-12 px-8 rounded-xl font-semibold shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.04] group"
              >
                Probar gratis 14 días
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/sistema-turnos-online"
                className="inline-flex items-center justify-center gap-2 border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:border-white/20 h-12 px-8 rounded-xl font-semibold transition-all"
              >
                Ver la solución completa
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-white/35">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> 14 días gratis</span>
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-green-400" /> Reservas 24/7</span>
              <span className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-green-400" /> Señas con MP</span>
            </div>
          </div>
        </section>

        {/* Problems */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="gradient-border rounded-3xl p-8 sm:p-12">
            <h2 className="heading-font text-3xl sm:text-4xl font-900 text-white mb-3">
              Lo que GetSolo ordena en estética
            </h2>
            <p className="text-white/40 mb-8 max-w-2xl">
              Automatizá tu agenda y reducí cancelaciones con estas funcionalidades clave.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: MessageSquare, t: "Menos coordinación", d: "Clientes reservan sin mensajes." },
                { icon: Clock, t: "Menos ausencias", d: "Seña + recordatorios para confirmar." },
                { icon: Users, t: "Equipo", d: "Agenda por profesional y horarios." },
                { icon: Calendar, t: "Servicios claros", d: "Duraciones y precios por servicio." },
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
        <section className="mx-auto max-w-6xl px-5 py-20 border-t border-white/[0.06]">
          <div className="mb-12">
            <h2 className="heading-font text-3xl sm:text-4xl font-900 text-white mb-3">
              Cómo funciona (estética)
            </h2>
            <p className="text-white/40 max-w-2xl">
              Configurá una vez y automatizá tu flujo de reservas para siempre.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { t: "Cargás servicios", d: "Uñas, lashes, faciales, depilación, etc.", icon: CheckCircle2 },
              { t: "Sumás profesionales", d: "Cada uno con su disponibilidad.", icon: Users },
              { t: "Activás seña", d: "MercadoPago para confirmar turnos.", icon: CreditCard },
            ].map((s) => {
              const Icon = s.icon
              return (
                <div key={s.t} className="gradient-border rounded-2xl p-6 card-hover">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center border border-blue-500/20 mb-4">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="heading-font text-xl font-700 text-white mb-2">{s.t}</p>
                  <p className="text-sm text-white/40 leading-relaxed">{s.d}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/register?plan=pro"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-base h-12 px-8 rounded-xl font-semibold shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.04]"
            >
              Empezar ahora
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="mt-3 text-xs text-white/30">Sin tarjeta. Cancelás cuando quieras.</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-6xl px-5 py-20 border-t border-white/[0.06]">
          <div className="mb-12">
            <h2 className="heading-font text-3xl sm:text-4xl font-900 text-white">Preguntas frecuentes</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { q: "¿Sirve para uñas, lashes y estética facial?", a: "Sí. Configurás servicios con duración y precio." },
              { q: "¿Puedo pedir seña para confirmar turnos?", a: "Sí. Con MercadoPago." },
              { q: "¿Puedo tener varias profesionales?", a: "Sí. Agenda por profesional." },
              { q: "¿Necesito tarjeta para probar?", a: "No. 14 días gratis sin tarjeta." },
            ].map((f) => (
              <div key={f.q} className="gradient-border rounded-2xl p-6 card-hover">
                <p className="heading-font text-base font-700 text-white mb-2">{f.q}</p>
                <p className="text-sm text-white/50 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-6xl px-5 py-24">
          <div className="relative rounded-3xl overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-violet-600/5 p-12">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12)_0%,transparent_70%)] pointer-events-none" />
            <div className="relative text-center">
              <h2 className="heading-font text-4xl sm:text-5xl font-900 text-white leading-tight mb-4">
                Tu agenda de estética, con turnos online
              </h2>
              <p className="text-white/50 text-lg max-w-2xl mx-auto mb-8">
                Probá GetSolo gratis y empezá a tomar reservas 24/7.
              </p>
              <Link
                href="/register?plan=pro"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-base h-12 px-10 rounded-xl font-semibold shadow-xl shadow-blue-500/30 hover:shadow-blue-400/50 transition-all hover:scale-[1.04] group"
              >
                Crear cuenta gratis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <p className="mt-4 text-xs text-white/30">14 días gratis • sin tarjeta</p>
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