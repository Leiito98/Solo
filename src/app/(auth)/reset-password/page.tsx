'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Mail,
  Check,
  ArrowLeft,
  CheckCircle2,
  Info,
} from 'lucide-react'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password/confirm`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
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
      `}</style>

      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob w-[500px] h-[500px] bg-blue-600/8 top-[-150px] left-[-150px]" />
        <div className="blob w-[350px] h-[350px] bg-violet-600/6 bottom-[-80px] right-[-80px]" />
      </div>

      {/* Main Container */}
      <div className="w-full flex flex-col min-h-screen relative z-10">
        {/* Nav */}
        <div className="relative z-10 px-8 pt-7 pb-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8">
              <Image src="/logo/solo.png" alt="GetSolo" fill className="object-contain" />
            </div>
            <span className="heading-font text-lg font-800 text-white">GetSolo</span>
          </Link>
          <Link
            href="/login"
            className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Volver a iniciar sesión
          </Link>
        </div>

        {/* Form */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-8 py-8">
          <div className="w-full max-w-[420px] space-y-7">

            {success ? (
              /* Success State */
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>

                <div className="text-center">
                  <h1 className="heading-font text-3xl font-900 text-white leading-tight mb-3">
                    Email enviado
                  </h1>
                  <p className="text-sm text-white/40 leading-relaxed">
                    Te enviamos un link para restablecer tu contraseña a{' '}
                    <span className="text-blue-400 font-medium">{email}</span>
                  </p>
                </div>

                <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.07] p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-300/80 leading-relaxed">
                      <p className="font-semibold mb-1">Revisá tu bandeja de entrada</p>
                      <p>El link es válido por 1 hora. Si no lo recibís, revisá spam o volvé a intentar.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setSuccess(false)
                      setEmail('')
                    }}
                    className="glow-btn w-full h-11 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold flex items-center justify-center gap-2 group"
                  >
                    Enviar nuevamente
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>

                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/50 hover:text-white/80 transition-all font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a iniciar sesión
                  </Link>
                </div>
              </div>
            ) : (
              /* Form State */
              <>
                <div className="text-center">
                  <h1 className="heading-font text-3xl font-900 text-white leading-tight mb-3">
                    Recuperar contraseña
                  </h1>
                  <p className="text-sm text-white/40 leading-relaxed">
                    Ingresá tu email y te enviaremos un link para restablecer tu contraseña
                  </p>
                </div>

                <form onSubmit={handleReset} className="space-y-4">
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
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar link de recuperación
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/[0.07]" />
                  <span className="text-xs text-white/20">o</span>
                  <div className="flex-1 h-px bg-white/[0.07]" />
                </div>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/50 hover:text-white/80 transition-all font-medium group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  Volver a iniciar sesión
                </Link>
              </>
            )}

            {/* Info adicional */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/60 mb-1">¿Problemas para recuperar tu cuenta?</p>
                  <p className="text-xs text-white/35 leading-relaxed">
                    Contactanos por WhatsApp y te ayudamos a recuperar el acceso a tu cuenta.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}