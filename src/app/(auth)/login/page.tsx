'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Mail,
  Lock,
  Check,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Sparkles,
  ArrowLeft,
} from 'lucide-react'
import { useEffect } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()



  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/dashboard')
      }
    })
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos'
          : error.message
      )
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div
      className="min-h-screen bg-[#0a0a0a] text-white flex"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=Cabinet+Grotesk:wght@400;500;700;800;900&display=swap');
        .heading-font { font-family: 'Cabinet Grotesk', 'DM Sans', system-ui, sans-serif; }

        .dark-input {
          background: rgba(255,255,255,0.04) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: white !important;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .dark-input::placeholder { color: rgba(255,255,255,0.25) !important; }
        .dark-input:focus {
          border-color: rgba(59,130,246,0.6) !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important;
          outline: none !important;
        }
        .dark-input:hover:not(:focus) { border-color: rgba(255,255,255,0.2) !important; }

        .glow-btn {
          box-shadow: 0 0 30px rgba(59,130,246,0.3);
          transition: all 0.2s;
        }
        .glow-btn:hover:not(:disabled) {
          box-shadow: 0 0 50px rgba(59,130,246,0.5);
          transform: scale(1.02);
        }
        .glow-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .blob { filter: blur(80px); border-radius: 50%; position: absolute; pointer-events: none; }

        .card-feature {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          transition: all 0.25s;
        }
        .card-feature:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(59,130,246,0.25);
        }

        .gradient-border-card {
          background: linear-gradient(#0f0f0f, #0f0f0f) padding-box,
                      linear-gradient(135deg, rgba(59,130,246,0.4), rgba(139,92,246,0.2), rgba(59,130,246,0.05)) border-box;
          border: 1px solid transparent;
        }

        .shimmer-num {
          background: linear-gradient(90deg, #93c5fd 0%, #c4b5fd 50%, #93c5fd 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* ── LEFT PANEL (form) ── */}
      <div className="w-full lg:w-[52%] flex flex-col min-h-screen relative z-10">
        {/* Background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="blob w-[500px] h-[500px] bg-blue-600/8 top-[-150px] left-[-150px]" />
          <div className="blob w-[350px] h-[350px] bg-violet-600/6 bottom-[-80px] right-[-80px]" />
        </div>

        {/* Nav */}
        <div className="relative z-10 px-8 pt-7 pb-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8">
              <Image src="/logo/solo.png" alt="GetSolo" fill className="object-contain" />
            </div>
            <span className="heading-font text-lg font-800 text-white">GetSolo</span>
          </Link>
          <Link
            href="/"
            className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Volver al inicio
          </Link>
        </div>

        {/* Form */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-8 py-8">
          <div className="w-full max-w-[380px] space-y-7">

            {/* Heading */}
            <div>
              <h1 className="heading-font text-3xl font-900 text-white leading-tight">
                Bienvenido de nuevo
              </h1>
              <p className="text-sm text-white/40 mt-1.5">
                Ingresá a tu cuenta para gestionar tu negocio
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="dark-input h-11 pl-10 text-sm rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="dark-input h-11 pl-10 text-sm rounded-xl"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="glow-btn w-full h-11 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold flex items-center justify-center gap-2 group mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  <>
                    Iniciar Sesión
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>

              {/* Link de recuperación debajo del botón */}
              <div className="text-center pt-1">
                <Link 
                  href="/reset-password" 
                  className="text-xs text-white/30 hover:text-white/60 transition-colors inline-block"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </form>

            {/* Divider */}
            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-white/[0.07]" />
              <span className="text-xs text-white/20">¿No tenés cuenta?</span>
              <div className="flex-1 h-px bg-white/[0.07]" />
            </div>

            {/* Register link */}
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/50 hover:text-white/80 transition-all font-medium group"
            >
              <Sparkles className="w-4 h-4 text-blue-400/70 group-hover:text-blue-400 transition-colors" />
              Crear cuenta gratis · 14 días sin tarjeta
            </Link>

          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (visual) ── */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden border-l border-white/[0.06]">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#0a0a14] to-[#0a0a0a]" />
        <div className="blob w-[500px] h-[500px] bg-blue-600/12 top-[-100px] right-[-100px]" />
        <div className="blob w-[400px] h-[400px] bg-violet-600/10 bottom-[-80px] left-[-80px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">

          {/* Top: headline */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Tu negocio en tiempo real
            </div>
            <h2 className="heading-font text-4xl font-900 text-white leading-tight">
              Todo tu negocio,
              <br />
              <span className="text-blue-400">en una pantalla</span>
            </h2>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Agenda, pagos, comisiones y finanzas. Desde el celular o la computadora.
            </p>
          </div>

          {/* Middle: dashboard snapshot */}
          <div className="my-8">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f0f]/80 overflow-hidden shadow-2xl">
              {/* Window bar */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <div className="ml-3 text-[10px] text-white/20 font-mono">Dashboard · GetSolo</div>
              </div>

              <div className="p-4 space-y-3">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: DollarSign, label: 'Caja hoy', value: '$84.500', color: 'text-green-400', bg: 'bg-green-500/10' },
                    { icon: Calendar, label: 'Turnos', value: '12', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { icon: TrendingUp, label: 'Mes', value: '$1.2M', color: 'text-violet-400', bg: 'bg-violet-500/10' },
                    { icon: Users, label: 'Clientes', value: '8', color: 'text-orange-400', bg: 'bg-orange-500/10' },
                  ].map((s) => {
                    const Icon = s.icon
                    return (
                      <div key={s.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                        <div className={`w-6 h-6 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                          <Icon className={`w-3 h-3 ${s.color}`} />
                        </div>
                        <div className={`heading-font text-base font-700 ${s.color}`}>{s.value}</div>
                        <div className="text-[10px] text-white/30">{s.label}</div>
                      </div>
                    )
                  })}
                </div>

                {/* Próximo turno card */}
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.06] p-3 flex items-center gap-3">
                  <div className="text-center min-w-[52px]">
                    <div className="heading-font text-lg font-700 text-blue-400">10:30</div>
                    <div className="text-[10px] text-white/30">próximo</div>
                  </div>
                  <div className="w-px h-10 bg-blue-500/20" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white/80 truncate">Valentina R.</div>
                    <div className="text-[11px] text-white/40 truncate">Corte & Color · Sofía M.</div>
                  </div>
                  <div className="text-[10px] px-2 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 whitespace-nowrap">
                    En 8 min
                  </div>
                </div>

                {/* Top pro */}
                <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                  <div className="px-3 py-2 border-b border-white/[0.04]">
                    <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wide">Top del mes</span>
                  </div>
                  {[
                    { name: 'Sofía M.', amount: '$340.000', turnos: 42, medal: '🥇' },
                    { name: 'Tomás G.', amount: '$280.000', turnos: 35, medal: '🥈' },
                  ].map((p, i) => (
                    <div key={i} className="px-3 py-2.5 flex items-center gap-2.5 border-t border-white/[0.03]">
                      <span className="text-sm">{p.medal}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-white/70">{p.name}</div>
                        <div className="text-[10px] text-white/30">{p.turnos} turnos</div>
                      </div>
                      <div className="text-xs font-semibold text-white/60">{p.amount}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: checklist + testimonial */}
          <div className="space-y-5">
            <div className="space-y-2">
              {[
                'Agenda 24/7 — tus clientes reservan solos',
                'Pagos con seña vía MercadoPago',
                'Comisiones y gastos en tiempo real',
                'Acceso desde cualquier dispositivo',
              ].map((item, i) => (
                <div key={i} className="card-feature rounded-xl px-4 py-2.5 flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-green-400" />
                  </div>
                  <span className="text-xs text-white/50">{item}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-3 h-3 fill-yellow-400" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-xs text-white/45 leading-relaxed italic">
                "Migré de Excel a GetSolo y fue el mejor cambio que hice. Ahora veo todo en un solo lugar."
              </p>
              <p className="text-xs font-semibold text-white/60 mt-2">— Juan P. · BarberShop Elite</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}