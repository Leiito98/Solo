'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Globe,
  Mail,
  Lock,
  Building,
  MapPin,
  Phone,
  User as UserIcon,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
} from 'lucide-react'

const VERTICALES = [
  { value: 'barberia', label: '💈 Barbería' },
  { value: 'peluqueria', label: '✂️ Peluquería' },
  { value: 'belleza', label: '💅 Belleza (Lashes, Uñas)' },
  { value: 'nutricion', label: '🥗 Nutrición' },
  { value: 'psicologia', label: '🧠 Psicología' },
  { value: 'fitness', label: '💪 Fitness' },
  { value: 'spa', label: '💆 Spa & Masajes' },
  { value: 'otros', label: '🔧 Otros' },
]

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
}

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error'

function normalizeEmail(v: string) {
  return v.trim().toLowerCase()
}

function isRateLimitError(msg: string) {
  const m = (msg || '').toLowerCase()
  return (
    m.includes('rate limit') ||
    m.includes('too many requests') ||
    m.includes('over_email_send_rate_limit') ||
    m.includes('email rate limit') ||
    m.includes('you have sent too many emails') ||
    m.includes('error sending confirmation email') ||
    m.includes('error sending invite email')
  )
}

function firstNameFromFullName(full: string) {
  const clean = (full || '').trim().replace(/\s+/g, ' ')
  if (!clean) return ''
  return clean.split(' ')[0] || ''
}

export default function RegisterClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const wantedStep = searchParams?.get('step') || '1'
  const planElegido = (searchParams?.get('plan') === 'pro' ? 'pro' : 'solo') as 'solo' | 'pro'
  const supabase = useMemo(() => createClient(), [])

  // ✅ Guard de sesión para evitar loops (race condition)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setHasSession(Boolean(data.session))
      setSessionLoading(false)
    })()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(Boolean(session))
      setSessionLoading(false)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [creatingUI, setCreatingUI] = useState(false)
  const [error, setError] = useState('')
  const inFlight = useRef(false)

  const [emailSent, setEmailSent] = useState(false)
  const [sentTo, setSentTo] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [ownerNombre, setOwnerNombre] = useState('')
  const [nombreNegocio, setNombreNegocio] = useState('')
  const [slug, setSlug] = useState('')
  const [vertical, setVertical] = useState<string>('')
  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [emailNegocio, setEmailNegocio] = useState('')
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle')

  const getEmailRedirectTo = () => {
    const base =
      (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '') ||
      (typeof window !== 'undefined' ? window.location.origin : '')
    return `${base}/callback?next=${encodeURIComponent('/register?step=2')}`
  }

  // ✅ Decidir step / redirects SOLO cuando terminó de cargar sesión
  useEffect(() => {
    if (sessionLoading) return

    // si el usuario vuelve del email con step=2:
    if (wantedStep === '2') {
      if (!hasSession) {
        router.replace('/login?next=/register?step=2')
        return
      }
      setStep(2)
      setEmailSent(false)
      setError('')
      return
    }

    // wantedStep !== 2:
    // si ya hay sesión, mandalo a step2 (NO a dashboard)
    if (hasSession) {
      router.replace('/register?step=2')
      return
    }

    setStep(1)
  }, [sessionLoading, wantedStep, hasSession, router])

  // Check slug
  useEffect(() => {
    if (step !== 2) return

    const s = slugify(slug || '')
    if (!s) {
      setSlugStatus('idle')
      return
    }
    if (s.length < 3) {
      setSlugStatus('taken')
      return
    }

    setSlugStatus('checking')

    const controller = new AbortController()
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/slug/check?slug=${encodeURIComponent(s)}`, {
          signal: controller.signal,
        })
        const json = await res.json()
        setSlugStatus(json?.available ? 'available' : 'taken')
      } catch {
        if (!controller.signal.aborted) setSlugStatus('error')
      }
    }, 450)

    return () => {
      controller.abort()
      clearTimeout(t)
    }
  }, [slug, step])

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault()
    if (inFlight.current) return
    inFlight.current = true

    setLoading(true)
    setError('')

    try {
      const cleanEmail = normalizeEmail(email)

      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { emailRedirectTo: getEmailRedirectTo() },
      })

      if (signUpErr) {
        if (isRateLimitError(signUpErr.message)) {
          setError('No se pudo enviar el email. Probá de nuevo en unos minutos.')
        } else {
          setError(signUpErr.message)
        }
        return
      }

      if (data.session) {
        router.replace('/register?step=2')
        return
      }

      setSentTo(cleanEmail)
      setEmailSent(true)
    } finally {
      setLoading(false)
      inFlight.current = false
    }
  }

  async function handleResendEmail() {
    if (!sentTo) return
    setLoading(true)
    setError('')
    try {
      const { error: resendErr } = await supabase.auth.resend({
        type: 'signup',
        email: sentTo,
        options: { emailRedirectTo: getEmailRedirectTo() },
      } as any)

      if (resendErr) {
        if (isRateLimitError(resendErr.message)) {
          setError('No se pudo reenviar. Esperá unos minutos.')
        } else {
          setError(resendErr.message)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateNegocio(e: React.FormEvent) {
    e.preventDefault()
    if (inFlight.current) return
    inFlight.current = true

    setLoading(true)
    setCreatingUI(true)
    setError('')

    try {
      if (slugStatus === 'checking') return setError('Verificando slug...')
      if (slugStatus === 'taken') return setError('Ese slug ya está en uso.')
      if (slugStatus === 'error') return setError('No pude verificar el slug.')

      const ownerFull = (ownerNombre || '').trim()
      if (!ownerFull) {
        setError('Ingresá tu nombre.')
        return
      }

      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()
      let userId = sessionData.session?.user?.id || null

      if (sessionErr || !userId) {
        const { data: userData, error: userErr } = await supabase.auth.getUser()
        userId = userData.user?.id || null
        if (userErr || !userId) return setError('No hay sesión activa.')
      }

      const first = firstNameFromFullName(ownerFull)
      const { error: metaErr } = await supabase.auth.updateUser({
        data: {
          full_name: ownerFull,
          first_name: first,
        },
      })
      if (metaErr) console.warn('metadata update failed', metaErr)

      const finalSlug = slugify(slug || nombreNegocio)
      if (!finalSlug) return setError('El slug no puede estar vacío.')

      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 14)

      const { error: insertErr } = await supabase.from('negocios').insert({
        owner_id: userId,
        nombre: nombreNegocio,
        slug: finalSlug,
        vertical,
        nombrecliente: ownerNombre.trim(),
        direccion: direccion || null,
        telefono: telefono || null,
        email: emailNegocio || null,

        plan: planElegido,
        trial_ends_at: trialEndsAt.toISOString(),
        suscripcion_estado: 'trial',
      })

      if (insertErr) {
        const msg = String(insertErr.message || '')
        const code = String((insertErr as any).code || '')
        if (msg.toLowerCase().includes('duplicate') || code === '23505') {
          setError('Ese slug ya está en uso.')
        } else {
          setError(msg || 'Error al crear el negocio.')
        }
        return
      }

      router.replace('/dashboard')
      router.refresh()
    } finally {
      setLoading(false)
      setCreatingUI(false)
      inFlight.current = false
    }
  }

  // ✅ Evita renders raros mientras se resuelve sesión / redirect
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <p className="text-sm text-white/50">Cargando…</p>
      </div>
    )
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
        .glow-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .card-feature {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          transition: all 0.25s;
        }
        .card-feature:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(59,130,246,0.3);
        }

        .blob { filter: blur(80px); border-radius: 50%; position: absolute; pointer-events: none; }

        .creating-pulse {
          animation: cpulse 1.4s ease-in-out infinite;
        }
        @keyframes cpulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .progress-fill {
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
        }

        [data-radix-popper-content-wrapper] { z-index: 9999 !important; }
      `}</style>

      {/* ── LEFT PANEL (form) ── */}
      <div className="w-full lg:w-[52%] flex flex-col min-h-screen relative z-10">
        {/* Background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="blob w-[500px] h-[500px] bg-blue-600/8 top-[-150px] left-[-150px]" />
          <div className="blob w-[400px] h-[400px] bg-violet-600/6 bottom-[-100px] right-[-100px]" />
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

        {/* Form container */}
        <div className="relative z-10 flex-1 flex items-start justify-center px-8 py-8">
          <div className="w-full max-w-[420px] space-y-7">

            {/* Step indicator */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === 1
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40'
                      : 'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}
                >
                  {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
                </div>
                <span
                  className={`text-xs font-semibold hidden sm:block ${
                    step === 1 ? 'text-white/70' : 'text-white/30'
                  }`}
                >
                  Tu cuenta
                </span>
              </div>

              <div className="flex-1 h-[2px] bg-white/[0.08] rounded-full overflow-hidden">
                <div className={`h-full progress-fill rounded-full ${step === 2 ? 'w-full' : 'w-0'}`} />
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === 2
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40'
                      : 'bg-white/[0.06] text-white/25 border border-white/[0.08]'
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-xs font-semibold hidden sm:block ${
                    step === 2 ? 'text-white/70' : 'text-white/25'
                  }`}
                >
                  Tu negocio
                </span>
              </div>
            </div>

            {/* Heading */}
            <div>
              <h1 className="heading-font text-3xl font-900 text-white leading-tight">
                {step === 1 ? (emailSent ? 'Revisá tu email' : 'Crear cuenta') : 'Configurá tu negocio'}
              </h1>
              <p className="text-sm text-white/40 mt-1.5">
                {step === 1
                  ? emailSent
                    ? `Enviamos un link de confirmación a ${sentTo}`
                    : '14 días gratis · Sin tarjeta de crédito'
                  : 'GetSolo te tomará 1 minuto más'}
              </p>
            </div>

            {/* ── STEP 1 ── */}
            {step === 1 && (
              emailSent ? (
                <div className="space-y-5">
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.07] p-5">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white">Email enviado</p>
                        <p className="text-xs text-white/50 leading-relaxed">
                          Abrí el mail en{' '}
                          <span className="text-blue-400 font-medium">{sentTo}</span>{' '}
                          y tocá "Confirm your email". Te llevaremos al paso 2 automáticamente.
                        </p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3">
                      <p className="text-xs text-red-400">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-2.5">
                    <Button
                      type="button"
                      onClick={handleResendEmail}
                      disabled={loading}
                      className="flex-1 h-11 text-sm font-semibold bg-white/[0.06] hover:bg-white/[0.10] text-white/70 hover:text-white border border-white/[0.08] rounded-xl transition-all"
                    >
                      {loading ? 'Reenviando...' : 'Reenviar email'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setEmailSent(false)
                        setError('')
                        setPassword('')
                      }}
                      className="flex-1 h-11 text-sm font-semibold bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/20 rounded-xl transition-all"
                    >
                      Cambiar email
                    </Button>
                  </div>

                  <div className="text-center">
                    <Link
                      href="/login"
                      className="text-xs text-white/30 hover:text-white/60 transition-colors"
                    >
                      ¿Ya confirmaste? Iniciá sesión →
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateAccount} className="space-y-5">
                  <div className="space-y-4">
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
                          placeholder="Mínimo 6 caracteres"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          className="dark-input h-11 pl-10 text-sm rounded-xl"
                        />
                      </div>
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
                    className="glow-btn w-full h-11 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold flex items-center justify-center gap-2 group"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        Continuar
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-white/20">
                    Al continuar, aceptás los{' '}
                    <a href="/terminos-y-condiciones" className="text-white/40 hover:text-white/70 underline transition-colors">
                      Términos
                    </a>{' '}
                    y la{' '}
                    <a href="/politica-de-privacidad" className="text-white/40 hover:text-white/70 underline transition-colors">
                      Privacidad
                    </a>
                  </p>

                  <div className="relative flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/[0.07]" />
                    <span className="text-xs text-white/20">¿Ya tenés cuenta?</span>
                    <div className="flex-1 h-px bg-white/[0.07]" />
                  </div>

                  <Link
                    href="/login"
                    className="flex items-center justify-center w-full h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/50 hover:text-white/80 transition-all font-medium"
                  >
                    Iniciar Sesión
                  </Link>
                </form>
              )
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div className="relative">
                {creatingUI && (
                  <div className="absolute inset-0 z-50 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-md" />
                    <div className="relative h-full w-full flex items-center justify-center p-6">
                      <div className="w-full max-w-xs rounded-2xl border border-white/[0.08] bg-[#111] p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-blue-400 creating-pulse" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">Creando tu negocio</p>
                            <p className="text-xs text-white/40">Preparando tu dashboard…</p>
                          </div>
                        </div>
                        <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
                          <div className="h-full w-2/3 progress-fill rounded-full creating-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleCreateNegocio} className="space-y-4">
                  {/* ... TU STEP 2 UI SIN CAMBIOS ... */}
                  {/* (dejé todo igual a tu código original desde aquí en adelante) */}

                  {/* Owner name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                      Tu nombre
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                      <Input
                        placeholder="Ej: Juan Pérez"
                        value={ownerNombre}
                        onChange={(e) => setOwnerNombre(e.target.value)}
                        required
                        className="dark-input h-11 pl-10 text-sm rounded-xl"
                      />
                    </div>
                    <p className="text-[11px] text-white/25 pl-1">Se usará para saludarte en el dashboard</p>
                  </div>

                  {/* Vertical */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                      Tipo de negocio
                    </Label>
                    <Select value={vertical} onValueChange={setVertical} required>
                      <SelectTrigger className="dark-input h-11 text-sm rounded-xl [&>span]:text-white/60 data-[placeholder]:text-white/25">
                        <SelectValue placeholder="Seleccioná tu rubro" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141414] border border-white/[0.1] rounded-xl shadow-2xl">
                        {VERTICALES.map((v) => (
                          <SelectItem
                            key={v.value}
                            value={v.value}
                            className="text-sm text-white/70 hover:text-white hover:bg-white/[0.06] focus:bg-white/[0.06] focus:text-white cursor-pointer py-2.5"
                          >
                            {v.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Business name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                      Nombre del negocio
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                      <Input
                        placeholder="Ej: Barbería El Clásico"
                        value={nombreNegocio}
                        onChange={(e) => {
                          const v = e.target.value
                          setNombreNegocio(v)
                          setSlug(slugify(v))
                        }}
                        required
                        className="dark-input h-11 pl-10 text-sm rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Slug */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                      Tu página web
                    </Label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                        <Input
                          value={slug}
                          onChange={(e) => setSlug(slugify(e.target.value))}
                          placeholder="mi-negocio"
                          required
                          className="dark-input h-11 pl-10 text-sm rounded-xl"
                        />
                      </div>
                      <span className="text-xs text-white/30 whitespace-nowrap font-medium">.getsolo.site</span>
                    </div>

                    {slug && (
                      <div className="flex items-center gap-2">
                        {slugStatus === 'checking' && (
                          <p className="text-xs text-white/40 flex items-center gap-1.5">
                            <div className="w-3 h-3 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                            Verificando...
                          </p>
                        )}
                        {slugStatus === 'available' && (
                          <p className="text-xs text-green-400 font-semibold flex items-center gap-1.5">
                            <Check className="w-3 h-3" /> Disponible
                          </p>
                        )}
                        {slugStatus === 'taken' && <p className="text-xs text-red-400 font-semibold">✗ Ya está en uso</p>}
                        {slugStatus === 'error' && <p className="text-xs text-yellow-400 font-semibold">⚠ Error al verificar</p>}
                      </div>
                    )}

                    <p className="text-[11px] text-white/25 pl-1">
                      URL: <span className="text-blue-400/70">{(slug || 'tu-negocio')}.getsolo.site</span>
                    </p>
                  </div>

                  {/* Optional fields */}
                  <details className="group">
                    <summary className="cursor-pointer text-xs font-semibold text-white/30 hover:text-white/60 transition-colors list-none flex items-center gap-1.5 py-1">
                      <span className="group-open:rotate-90 transition-transform inline-block">›</span>
                      Información opcional{' '}
                      <span className="text-white/20 font-normal">(lo completás después)</span>
                    </summary>

                    <div className="mt-3 space-y-3 pl-3 border-l border-white/[0.06]">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                          Dirección
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                          <Input
                            placeholder="Av. Siempre Viva 123"
                            value={direccion}
                            onChange={(e) => setDireccion(e.target.value)}
                            className="dark-input h-10 pl-10 text-sm rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                          Teléfono
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                          <Input
                            placeholder="+54 11 1234-5678"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            className="dark-input h-10 pl-10 text-sm rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                          Email del negocio
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                          <Input
                            type="email"
                            placeholder="contacto@negocio.com"
                            value={emailNegocio}
                            onChange={(e) => setEmailNegocio(e.target.value)}
                            className="dark-input h-10 pl-10 text-sm rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  </details>

                  {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3">
                      <p className="text-xs text-red-400">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => router.replace('/register')}
                      disabled={loading}
                      className="h-11 px-4 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-white/50 hover:text-white/80 text-sm font-medium transition-all flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Atrás
                    </button>
                    <button
                      type="submit"
                      disabled={loading || slugStatus === 'taken' || slugStatus === 'checking' || slugStatus === 'error'}
                      className="glow-btn flex-1 h-11 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:bg-blue-500/40 text-white text-sm font-semibold flex items-center justify-center gap-2 group"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creando...
                        </>
                      ) : (
                        <>
                          Crear mi negocio
                          <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (visual) ── */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden border-l border-white/[0.06]">
        {/* TU PANEL DERECHO SIN CAMBIOS */}
        {/* (Copié tal cual tu código original) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#0a0a14] to-[#0a0a0a]" />
        <div className="blob w-[500px] h-[500px] bg-blue-600/12 top-[-100px] right-[-100px]" />
        <div className="blob w-[400px] h-[400px] bg-violet-600/10 bottom-[-80px] left-[-80px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Todo listo en 5 minutos
            </div>
            <h2 className="heading-font text-4xl font-900 text-white leading-tight">
              Tu negocio,
              <br />
              <span className="text-blue-400">en modo pro</span>
            </h2>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Configurá tu negocio y empezá a recibir reservas online con pagos anticipados hoy mismo.
            </p>
          </div>

          {/* mock dashboard */}
          <div className="my-8">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f0f]/80 backdrop-blur-sm overflow-hidden shadow-2xl">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <div className="ml-3 text-[10px] text-white/20 font-mono">Dashboard · GetSolo</div>
              </div>

              <div className="p-4 space-y-3">
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

                <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                  <div className="px-3 py-2 border-b border-white/[0.04]">
                    <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wide">
                      Top del mes
                    </span>
                  </div>
                  {[
                    { name: 'Sofía M.', amount: '$340.000', turnos: 42, medal: '🥇' },
                    { name: 'Tomás G.', amount: '$280.000', turnos: 35, medal: '🥈' },
                  ].map((p, i) => (
                    <div
                      key={i}
                      className="px-3 py-2.5 flex items-center gap-2.5 border-t border-white/[0.03]"
                    >
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

          <div className="space-y-5">
            <div className="space-y-2.5">
              {[
                '14 días gratis, sin tarjeta de crédito',
                'Agenda + pagos + finanzas en un lugar',
                'Soporte en español por WhatsApp',
                'Cancelá cuando quieras, sin penalidades',
              ].map((item, i) => (
                <div key={i} className="card-feature rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-green-400" />
                  </div>
                  <span className="text-sm text-white/55">{item}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-3.5 h-3.5 fill-yellow-400" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-xs text-white/45 leading-relaxed italic">
                "En 10 minutos ya estaba recibiendo reservas. No puedo creer que antes lo hacía todo por WhatsApp."
              </p>
              <p className="text-xs font-semibold text-white/60 mt-2">— María G. · Estudio de Uñas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
