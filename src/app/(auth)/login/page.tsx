'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Zap, ArrowRight, Sparkles, Check } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message === 'Invalid login credentials' 
        ? 'Email o contraseña incorrectos' 
        : error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left side - Form */}
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

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-gray-900">
              ¡Bienvenido de nuevo!
            </h1>
            <p className="text-lg text-gray-600">
              Accede a tu cuenta para gestionar tu negocio
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
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
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 text-lg border-2 border-gray-300 focus:border-blue-600 transition-colors"
                />
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
                  Ingresando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Iniciar Sesión
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">
                ¿No tienes cuenta?
              </span>
            </div>
          </div>

          {/* Register link */}
          <Button 
            asChild 
            variant="outline" 
            className="w-full h-14 text-lg font-bold border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 transition-all hover:scale-[1.02]"
          >
            <Link href="/register" className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Crear Cuenta Gratis
            </Link>
          </Button>

          {/* Back to home */}
          <div className="text-center">
            <Link 
              href="/" 
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white">
          <div className="max-w-lg space-y-8">
            <div className="space-y-4">
              <Zap className="w-16 h-16 text-yellow-300" />
              <h2 className="text-5xl font-black leading-tight">
                Gestiona tu negocio desde cualquier lugar
              </h2>
              <p className="text-xl text-blue-100">
                Dashboard en tiempo real, agenda online, pagos automáticos y más.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-lg">Agenda 24/7</p>
                  <p className="text-blue-100">Tus clientes reservan cuando quieren</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-lg">Pagos Automáticos</p>
                  <p className="text-blue-100">Cobra seña con MercadoPago</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-lg">Finanzas en Vivo</p>
                  <p className="text-blue-100">Caja del día, comisiones, gastos</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/20">
              <p className="text-blue-100 text-sm">
                "Migré de Excel a Solo y fue el mejor cambio que hice para mi barbería"
              </p>
              <p className="text-white font-bold mt-2">— Juan Pérez, BarberShop Elite</p>
            </div>
          </div>
        </div>

        {/* Floating orbs */}
        <div className="absolute w-64 h-64 bg-blue-400/20 rounded-full blur-[100px] top-10 right-10 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-400/20 rounded-full blur-[100px] bottom-10 left-10 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
    </div>
  )
}