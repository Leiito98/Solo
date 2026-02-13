'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Zap,
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
} from 'lucide-react'

const VERTICALES = [
  { value: 'barberia', label: '💈 Barbería' },
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

// ✅ IMPORTANTE: export default (si no, te tira "is not a module")
export default function RegisterClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inFlight = useRef(false)

  const [emailSent, setEmailSent] = useState(false)
  const [sentTo, setSentTo] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [nombreNegocio, setNombreNegocio] = useState('')
  const [slug, setSlug] = useState('')
  const [vertical, setVertical] = useState<string>('')
  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [emailNegocio, setEmailNegocio] = useState('')

  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle')

  // ✅ Callback real: /callback (según lo que dijiste)
  const getEmailRedirectTo = () => {
    const base =
      (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '') ||
      (typeof window !== 'undefined' ? window.location.origin : '')

    return `${base}/callback?next=${encodeURIComponent('/register?step=2')}`
  }

  // Si vuelve con ?step=2 y hay sesión, saltar a paso 2
  useEffect(() => {
    const wantedStep = searchParams?.get('step')
    if (wantedStep !== '2') return

    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session?.user) {
        setStep(2)
        setEmailSent(false)
        setError('')
      }
    })()
  }, [searchParams, supabase])

  // Si cambia la sesión (callback), también avanzar a paso 2
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const wantedStep = searchParams?.get('step')
      if (wantedStep === '2' && session?.user) {
        setStep(2)
        setEmailSent(false)
        setError('')
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [supabase, searchParams])

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
          setError('No se pudo enviar el email (o llegaste al límite). Probá de nuevo en unos minutos.')
        } else {
          setError(signUpErr.message)
        }
        return
      }

      // Si supabase devuelve sesión, pasás al paso 2 (cuando no requiere confirmación)
      if (data.session) {
        setStep(2)
        return
      }

      // Si no hay sesión => requiere confirmación por email
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
          setError('No se pudo reenviar el email. Esperá unos minutos y probá de nuevo.')
        } else {
          setError(resendErr.message)
        }
        return
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
    setError('')

    try {
      if (slugStatus === 'checking') return setError('Verificando slug...')
      if (slugStatus === 'taken') return setError('Ese slug ya está en uso.')
      if (slugStatus === 'error') return setError('No pude verificar el slug.')

      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()
      let userId = sessionData.session?.user?.id || null

      if (sessionErr || !userId) {
        const { data: userData, error: userErr } = await supabase.auth.getUser()
        userId = userData.user?.id || null
        if (userErr || !userId) return setError('No hay sesión activa.')
      }

      const finalSlug = slugify(slug || nombreNegocio)
      if (!finalSlug) return setError('El slug no puede estar vacío.')

      const { error: insertErr } = await supabase.from('negocios').insert({
        owner_id: userId,
        nombre: nombreNegocio,
        slug: finalSlug,
        vertical,
        direccion: direccion || null,
        telefono: telefono || null,
        email: emailNegocio || null,
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

      router.push('/dashboard')
      router.refresh()
    } finally {
      setLoading(false)
      inFlight.current = false
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row-reverse relative overflow-hidden">
      {/* Form side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Solo
            </span>
          </Link>

          {/* Progress indicator */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 ${step === 1 ? 'text-blue-600' : 'text-green-600'}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  step === 1 ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                }`}
              >
                {step === 1 ? '1' : <Check className="w-5 h-5" />}
              </div>
              <span className="text-sm font-semibold hidden sm:inline">Tu cuenta</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full bg-blue-600 transition-all duration-500 ${step === 2 ? 'w-full' : 'w-0'}`} />
            </div>
            <div className={`flex items-center gap-2 ${step === 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  step === 2 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                }`}
              >
                2
              </div>
              <span className="text-sm font-semibold hidden sm:inline">Tu negocio</span>
            </div>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-gray-900">
              {step === 1 ? (emailSent ? 'Revisá tu email' : '¡Empecemos!') : 'Configura tu negocio'}
            </h1>
            <p className="text-lg text-gray-600">
              {step === 1
                ? emailSent
                  ? 'Te enviamos un link para confirmar tu cuenta.'
                  : 'Crea tu cuenta y empieza gratis por 14 días'
                : 'Solo te tomará 1 minuto más'}
            </p>
          </div>

          {/* Step 1 */}
          {step === 1 ? (
            emailSent ? (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl border-2 border-blue-200 bg-blue-50">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-blue-900 font-semibold">Email de confirmación enviado</p>
                      <p className="text-sm text-blue-800">
                        Lo mandamos a <span className="font-bold">{sentTo}</span>. Abrí el mail y tocá “Confirm”.
                      </p>
                      <p className="text-xs text-blue-700">
                        Cuando confirmes, te vamos a llevar directo al paso 2 automáticamente.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={handleResendEmail}
                    variant="outline"
                    className="h-12 text-base font-semibold border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Reenviando...' : 'Reenviar email'}
                  </Button>

                  <Button
                    type="button"
                    className="h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex-1"
                    onClick={() => {
                      setEmailSent(false)
                      setError('')
                      setPassword('')
                    }}
                  >
                    Cambiar email
                  </Button>
                </div>

                <div className="text-center">
                  <Link href="/login" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">
                    ¿Ya confirmaste? Iniciá sesión →
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateAccount} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 text-lg border-2 border-gray-300 focus:border-blue-600 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-500" />
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-12 text-lg border-2 border-gray-300 focus:border-blue-600 transition-colors"
                    />
                    <p className="text-xs text-gray-500">Usa al menos 6 caracteres</p>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-[1.02] group"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creando cuenta...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Continuar
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Al continuar, aceptás nuestros{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Términos
                  </a>{' '}
                  y{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Privacidad
                  </a>
                </p>
              </form>
            )
          ) : (
            // Step 2
            <form onSubmit={handleCreateNegocio} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vertical" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gray-500" />
                    Tipo de negocio
                  </Label>
                  <Select value={vertical} onValueChange={setVertical} required>
                    <SelectTrigger className="h-12 text-lg border-2 border-gray-300 focus:border-blue-600">
                      <SelectValue placeholder="Selecciona tu rubro" />
                    </SelectTrigger>
                    <SelectContent>
                      {VERTICALES.map((v) => (
                        <SelectItem key={v.value} value={v.value} className="text-lg py-3">
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    Nombre de tu negocio
                  </Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Barbería El Clásico"
                    value={nombreNegocio}
                    onChange={(e) => {
                      const v = e.target.value
                      setNombreNegocio(v)
                      setSlug(slugify(v))
                    }}
                    required
                    className="h-12 text-lg border-2 border-gray-300 focus:border-blue-600 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    Tu página web
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(slugify(e.target.value))}
                      placeholder="mi-negocio"
                      required
                      className="h-12 text-lg border-2 border-gray-300 focus:border-blue-600 transition-colors"
                    />
                    <span className="text-sm text-gray-500 whitespace-nowrap font-medium">.getsolo.site</span>
                  </div>

                  {slug && (
                    <div className="flex items-center gap-2 mt-2">
                      {slugStatus === 'checking' && (
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                          Verificando...
                        </p>
                      )}
                      {slugStatus === 'available' && (
                        <p className="text-sm text-green-600 font-semibold flex items-center gap-2">
                          <Check className="w-4 h-4" />¡Disponible!
                        </p>
                      )}
                      {slugStatus === 'taken' && <p className="text-sm text-red-600 font-semibold">❌ Ese slug ya está en uso</p>}
                      {slugStatus === 'error' && <p className="text-sm text-red-600 font-semibold">⚠️ Error al verificar</p>}
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    Tu página será:{' '}
                    <span className="font-semibold text-blue-600">{(slug || 'tu-negocio')}.getsolo.site</span>
                  </p>
                </div>

                <details className="group">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors list-none flex items-center gap-2">
                    <span>+ Información opcional</span>
                    <span className="text-xs text-gray-500">(lo podés completar después)</span>
                  </summary>

                  <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
                    <div className="space-y-2">
                      <Label htmlFor="direccion" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        Dirección
                      </Label>
                      <Input
                        id="direccion"
                        placeholder="Av. Siempre Viva 123"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        className="h-12 text-lg border-2 border-gray-300 focus:border-blue-600 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefono" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        Teléfono
                      </Label>
                      <Input
                        id="telefono"
                        placeholder="+54 11 1234-5678"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        className="h-12 text-lg border-2 border-gray-300 focus:border-blue-600 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailNegocio" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        Email del negocio
                      </Label>
                      <Input
                        id="emailNegocio"
                        type="email"
                        placeholder="contacto@negocio.com"
                        value={emailNegocio}
                        onChange={(e) => setEmailNegocio(e.target.value)}
                        className="h-12 text-lg border-2 border-gray-300 focus:border-blue-600 transition-colors"
                      />
                    </div>
                  </div>
                </details>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="h-14 text-lg font-bold border-2 border-gray-300 hover:border-gray-400 flex-1"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Volver
                </Button>

                <Button
                  type="submit"
                  className="h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-[1.02] group flex-[2]"
                  disabled={loading || slugStatus === 'taken' || slugStatus === 'checking' || slugStatus === 'error'}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Crear mi Negocio
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    </span>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Footer */}
          {step === 1 && !emailSent && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">¿Ya tienes cuenta?</span>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="w-full h-12 text-base font-semibold border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 transition-all"
              >
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
            </>
          )}

          <div className="text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      {/* Visual side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white">
          <div className="max-w-lg space-y-8">
            <div className="space-y-4">
              <Sparkles className="w-16 h-16 text-yellow-300" />
              <h2 className="text-5xl font-black leading-tight">Todo listo en 5 minutos</h2>
              <p className="text-xl text-blue-100">Configurá tu negocio y empezá a recibir reservas online hoy mismo.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg">14 días gratis</p>
                  <p className="text-blue-100">Sin tarjeta de crédito. Cancelá cuando quieras.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg">Todo incluido</p>
                  <p className="text-blue-100">Agenda, pagos, finanzas y más en un solo lugar.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg">Soporte en español</p>
                  <p className="text-blue-100">Equipo local listo para ayudarte por WhatsApp.</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/20">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-yellow-400" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-blue-100 text-sm">"En 10 minutos ya estaba recibiendo reservas. Increíble."</p>
              <p className="text-white font-bold mt-2">— María G., Estudio de Uñas</p>
            </div>
          </div>
        </div>

        <div className="absolute w-64 h-64 bg-blue-400/20 rounded-full blur-[100px] top-10 right-10 animate-pulse" />
        <div
          className="absolute w-96 h-96 bg-purple-400/20 rounded-full blur-[100px] bottom-10 left-10 animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>
    </div>
  )
}
