'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Zap, 
  Check, 
  ArrowRight,
  BarChart3,
  Smartphone,
  Star,
  Sparkles,
  ChevronDown,
  Package,
  Shield,
  Clock,
  CreditCard,
  Bell,
  Globe,
  Target,
  Rocket,
  Heart,
  Scissors,
  Palette
} from 'lucide-react'

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setIsVisible(true)

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const features = [
    {
      icon: Calendar,
      title: 'Agenda Online 24/7',
      description: 'Tus clientes reservan cuando quieren, sin llamadas. Sincronización automática.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: CreditCard,
      title: 'Pagos con Seña',
      description: 'Cobra el 50% por adelantado con MercadoPago. Reduce ausentismo al 95%.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Users,
      title: 'Equipo Ilimitado',
      description: 'Agrega todos los profesionales que necesites. Sin cargos extra.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: TrendingUp,
      title: 'Finanzas Automáticas',
      description: 'Comisiones, gastos y reportes calculados en tiempo real.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: BarChart3,
      title: 'Dashboard en Vivo',
      description: 'Caja del día, próximo turno, top profesionales. Todo en una pantalla.',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Globe,
      title: 'Tu Página Web',
      description: 'Landing personalizada con tu logo y colores. Lista en 5 minutos.',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: Bell,
      title: 'Recordatorios Auto',
      description: 'Emails automáticos a clientes 24h antes. Menos cancelaciones.',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Smartphone,
      title: '100% Responsive',
      description: 'Funciona perfecto en celular, tablet y desktop.',
      gradient: 'from-teal-500 to-green-500'
    }
  ]

  const pricing = [
    {
      name: 'Solo',
      price: '20.000',
      description: 'Para emprendedores',
      features: [
        '1-2 profesionales',
        'Agenda online ilimitada',
        'Landing personalizada',
        'Pagos MercadoPago',
        'Recordatorios automáticos',
        'Soporte por WhatsApp'
      ],
      cta: 'Empezar Gratis',
      popular: false
    },
    {
      name: 'Pro',
      price: '28.000',
      description: 'El más elegido',
      features: [
        'Profesionales ilimitados',
        'Todo lo del plan Solo',
        'Sistema de comisiones',
        'Control de gastos fijos',
        'Analytics avanzados',
        'Exportar a Excel/PDF',
        'Soporte prioritario'
      ],
      cta: 'Empezar Gratis',
      popular: true
    }
  ]

  const testimonials = [
    {
      name: 'Juan Pérez',
      business: 'BarberShop Elite',
      text: 'Tengo 5 barberos y antes era un caos. Ahora todo es automático: agenda, comisiones, pagos. El mejor cambio que hice para mi negocio.',
      rating: 5,
      vertical: 'Barbería'
    },
    {
      name: 'María González',
      business: 'Estudio de Uñas M&G',
      text: 'Mis clientas aman poder reservar online y pagar la seña. Ya no pierdo turnos por no-shows. 100% recomendado.',
      rating: 5,
      vertical: 'Belleza'
    },
    {
      name: 'Carlos Fernández',
      business: 'Nutrición Integral',
      text: 'Migré de planillas de Excel a Solo. Ahora veo todo en un dashboard: ingresos, turnos, gastos. Es otro nivel.',
      rating: 5,
      vertical: 'Nutrición'
    }
  ]

  const useCases = [
    { icon: Scissors, name: 'Barberías', gradient: 'from-blue-500 to-cyan-500' },
    { icon: Palette, name: 'Uñas & Lashes', gradient: 'from-pink-500 to-rose-500' },
    { icon: Heart, name: 'Spa & Masajes', gradient: 'from-purple-500 to-pink-500' },
    { icon: Target, name: 'Nutrición', gradient: 'from-green-500 to-emerald-500' },
    { icon: Shield, name: 'Psicología', gradient: 'from-indigo-500 to-purple-500' },
    { icon: TrendingUp, name: 'Fitness', gradient: 'from-orange-500 to-red-500' },
  ]

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        
        {/* Floating orbs */}
        <div 
          className="absolute w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] animate-float"
          style={{
            top: '10%',
            left: '5%',
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
          }}
        />
        <div 
          className="absolute w-[400px] h-[400px] bg-purple-400/20 rounded-full blur-[100px] animate-float-delayed"
          style={{
            top: '40%',
            right: '10%',
            transform: `translate(${mousePosition.x * -0.008}px, ${mousePosition.y * 0.008}px)`
          }}
        />
        <div 
          className="absolute w-[350px] h-[350px] bg-indigo-400/15 rounded-full blur-[100px] animate-float-slow"
          style={{
            bottom: '15%',
            left: '30%',
            transform: `translate(${mousePosition.x * 0.005}px, ${mousePosition.y * -0.005}px)`
          }}
        />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className={`flex justify-between items-center h-16 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Solo
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Precios
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Clientes
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" className="hover:bg-blue-50">
                <Link href="/login">
                  Iniciar Sesión
                </Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-105">
                <Link href="/register">
                  Empezar Gratis
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8 max-w-5xl mx-auto">
            {/* Badge */}
            <div 
              className={`inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-5 py-2.5 rounded-full text-sm font-semibold border border-blue-200 shadow-lg hover:scale-105 transition-all duration-500 cursor-pointer ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
              }`}
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              Más de 500 negocios ya confían en Solo
            </div>

            {/* Main Headline */}
            <h1 
              className={`text-6xl sm:text-7xl lg:text-8xl font-black text-gray-900 leading-tight transition-all duration-1000 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              Tu negocio online
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
                  en 10 minutos
                </span>
                <svg
                  className="absolute -bottom-4 left-0 w-full"
                  height="12"
                  viewBox="0 0 300 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 10C54.2228 4 106.446 2 158.668 2C210.891 2 263.113 4 315.336 10"
                    stroke="url(#paint0_linear)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="paint0_linear" x1="2" y1="10" x2="315.336" y2="10">
                      <stop stopColor="#3B82F6" />
                      <stop offset="0.5" stopColor="#6366F1" />
                      <stop offset="1" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Subheadline */}
            <p 
              className={`text-xl sm:text-2xl lg:text-3xl text-gray-600 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 delay-400 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              Agenda, pagos online, finanzas y tu propia web.
              <br />
              <span className="font-bold text-blue-600">Todo en un solo lugar. Sin complicaciones.</span>
            </p>

            {/* CTA Buttons */}
            <div 
              className={`flex flex-col sm:flex-row gap-5 justify-center items-center pt-6 transition-all duration-1000 delay-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <Button 
                asChild 
                size="lg" 
                className="text-lg px-10 py-7 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-[0_0_40px_rgba(59,130,246,0.5)] hover:shadow-[0_0_60px_rgba(59,130,246,0.7)] transition-all duration-300 hover:scale-110 group"
              >
                <Link href="/register" className="flex items-center gap-2">
                  Crear mi Negocio Gratis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline" 
                className="text-lg px-10 py-7 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 hover:scale-110"
              >
                <Link href="#pricing">
                  Ver Precios
                </Link>
              </Button>
            </div>

            {/* Social Proof */}
            <div 
              className={`pt-10 flex flex-col sm:flex-row items-center justify-center gap-8 text-base text-gray-600 transition-all duration-1000 delay-800 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-medium group-hover:text-green-600 transition-colors">Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium group-hover:text-blue-600 transition-colors">Setup en 10 minutos</span>
              </div>
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-medium group-hover:text-purple-600 transition-colors">Cancela cuando quieras</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Screenshot */}
          <div 
            className={`mt-20 max-w-6xl mx-auto transition-all duration-1000 delay-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
            }`}
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative rounded-3xl bg-white shadow-2xl border border-gray-200 p-6 hover:scale-[1.02] transition-all duration-500">
                <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
                  
                  <div className="text-center space-y-4 p-8 relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/50 animate-float">
                      <BarChart3 className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-gray-600 font-semibold text-lg">
                      Dashboard Preview
                    </p>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                      Vista previa del panel donde gestionarás tu negocio
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-center">
            {[
              { value: '500+', label: 'Negocios activos', icon: Users },
              { value: '50k+', label: 'Turnos mensuales', icon: Calendar },
              { value: '95%', label: 'Menos ausentismo', icon: TrendingUp },
              { value: '10min', label: 'Setup completo', icon: Clock },
            ].map((stat, i) => (
              <div 
                key={i}
                className="group cursor-pointer transform hover:scale-110 transition-all duration-500"
              >
                <div className="flex justify-center mb-3">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <stat.icon className="w-7 h-7 text-blue-300 group-hover:text-blue-200 transition-colors" />
                  </div>
                </div>
                <p className="text-5xl font-black text-white mb-2 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-blue-200 text-sm font-medium group-hover:text-blue-100 transition-colors">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-16">
            <h3 className="text-4xl sm:text-5xl font-black text-gray-900">
              Perfecto para cualquier negocio de servicios
            </h3>
            <p className="text-xl text-gray-600">
              Unete a cientos de negocios que ya confían en Solo
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon
              return (
                <div 
                  key={index}
                  className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center hover:border-blue-300 hover:shadow-2xl transition-all hover:scale-110 group cursor-pointer"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${useCase.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="font-bold text-gray-900 text-sm">{useCase.name}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">Características</span>
            </div>
            <h2 className="text-5xl sm:text-6xl font-black text-gray-900">
              Todo lo que necesitás
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Las herramientas que usan los negocios más exitosos, en una sola plataforma
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={i}
                  className="group relative"
                >
                  <div className="relative p-8 rounded-3xl bg-white border-2 border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    
                    <div className="relative z-10">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {feature.title}
                      </h3>

                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 rounded-full blur-3xl transition-opacity duration-500`} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-20">
            <h2 className="text-5xl sm:text-6xl font-black text-gray-900">
              Precios simples y transparentes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sin sorpresas. Sin cargos ocultos. <span className="font-bold text-blue-600">Cancela cuando quieras.</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {pricing.map((plan) => (
              <div 
                key={plan.name} 
                className={`relative group ${plan.popular ? 'md:scale-110 md:z-10' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                      Más Vendido
                    </span>
                  </div>
                )}
                
                <Card className={`relative overflow-hidden ${plan.popular ? 'border-4 border-blue-500 shadow-2xl shadow-blue-500/30' : 'border-2 border-gray-200 hover:border-blue-300'} transition-all duration-500 hover:scale-105`}>
                  {plan.popular && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
                  )}
                  
                  <CardContent className="p-10 space-y-8 relative z-10">
                    <div>
                      <h3 className="text-3xl font-black text-gray-900">{plan.name}</h3>
                      <p className="text-gray-600 mt-2 text-lg">{plan.description}</p>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        ${plan.price}
                      </span>
                      <span className="text-xl text-gray-600 font-semibold">/mes</span>
                    </div>

                    <ul className="space-y-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3 group/item">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-gray-700 font-medium text-lg">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      asChild 
                      size="lg" 
                      className={`w-full text-lg py-7 ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/40 hover:shadow-blue-500/60' : 'border-2 border-gray-300 bg-white hover:bg-gray-50'} transition-all hover:scale-105`}
                    >
                      <Link href="/register">
                        {plan.cta}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-600 mt-12 text-lg">
            ✨ Todos los planes incluyen <span className="font-bold text-blue-600">14 días de prueba gratis</span>
          </p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-20">
            <h2 className="text-5xl sm:text-6xl font-black text-gray-900">
              Historias reales de éxito
            </h2>
            <p className="text-xl text-gray-600">
              Negocios que crecieron con Solo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 bg-white overflow-hidden group"
              >
                <CardContent className="p-8 space-y-5">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-5 h-5 fill-yellow-400 text-yellow-400 group-hover:scale-125 transition-transform" 
                        style={{ transitionDelay: `${i * 50}ms` }}
                      />
                    ))}
                  </div>
                  
                  <p className="text-gray-700 text-lg italic leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  
                  <div className="pt-5 border-t-2 border-gray-100">
                    <p className="font-bold text-gray-900 text-lg">{testimonial.name}</p>
                    <p className="text-sm text-blue-600 font-semibold mt-1">{testimonial.business}</p>
                    <p className="text-xs text-gray-500 mt-1">{testimonial.vertical}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        
        <div className="max-w-5xl mx-auto text-center space-y-10 relative z-10">
          <Rocket className="w-16 h-16 mx-auto text-yellow-300 animate-bounce" />
          
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight">
            ¿Listo para hacer crecer tu negocio?
          </h2>
          
          <p className="text-2xl text-blue-100 max-w-2xl mx-auto">
            Únete a los cientos de negocios que ya confían en Solo
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center pt-4">
            <Button 
              asChild 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 text-xl px-12 py-8 shadow-2xl hover:scale-110 transition-all group"
            >
              <Link href="/register" className="flex items-center gap-2">
                Crear mi Cuenta Gratis
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-blue-100 text-lg flex-wrap">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              14 días gratis
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              Sin tarjeta
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              Cancelá cuando quieras
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black text-white">Solo</span>
              </div>
              <p className="text-sm leading-relaxed">
                La plataforma todo-en-uno para gestionar tu negocio de servicios
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 text-lg">Producto</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Precios</a></li>
                <li><Link href="/register" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Empezar Gratis</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 text-lg">Soporte</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">WhatsApp</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Email</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 text-lg">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Términos</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Privacidad</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm">&copy; 2026 Solo. Todos los derechos reservados.</p>
            <p className="text-xs mt-2 text-gray-500">
              Hecho con <Heart className="w-3 h-3 inline text-red-500" /> en Argentina 🇦🇷
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  )
}