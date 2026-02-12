'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Clock, Star, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface HeroProps {
  negocio: {
    nombre: string
    vertical: string
    direccion?: string | null
    telefono?: string | null
    slug: string
  }
}

const VERTICAL_CONFIG: Record<string, { 
  title: string
  description: string
  icon: string
  gradient: string
  badge: string
}> = {
  barberia: {
    title: 'Tu estilo, nuestra pasión',
    description: 'Reserva tu turno online y disfruta de un servicio profesional de calidad',
    icon: '✂️',
    gradient: 'from-blue-600 to-indigo-600',
    badge: 'Barbería Profesional'
  },
  belleza: {
    title: 'Belleza que transforma',
    description: 'Agenda tu cita y descubre tu mejor versión con nuestros expertos',
    icon: '💎',
    gradient: 'from-pink-600 to-rose-600',
    badge: 'Centro de Belleza'
  },
  nutricion: {
    title: 'Tu salud, nuestra prioridad',
    description: 'Agenda tu consulta nutricional personalizada con profesionales certificados',
    icon: '🥗',
    gradient: 'from-green-600 to-emerald-600',
    badge: 'Nutrición Profesional'
  },
  psicologia: {
    title: 'Cuidamos tu bienestar emocional',
    description: 'Reserva tu sesión de terapia online en un espacio seguro y confidencial',
    icon: '🧠',
    gradient: 'from-purple-600 to-violet-600',
    badge: 'Atención Psicológica'
  },
  fitness: {
    title: 'Alcanza tus objetivos',
    description: 'Entrena con profesionales certificados y transforma tu cuerpo',
    icon: '💪',
    gradient: 'from-orange-600 to-red-600',
    badge: 'Fitness & Training'
  },
  otros: {
    title: 'Servicios profesionales',
    description: 'Agenda tu cita de forma rápida y sencilla',
    icon: '✨',
    gradient: 'from-blue-600 to-purple-600',
    badge: 'Servicios Profesionales'
  }
}

export function Hero({ negocio }: HeroProps) {
  const [isVisible, setIsVisible] = useState(false)
  const config = VERTICAL_CONFIG[negocio.vertical] || VERTICAL_CONFIG.otros

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] -top-48 -left-48 animate-float" />
        <div className="absolute w-[400px] h-[400px] bg-purple-400/10 rounded-full blur-[100px] top-1/2 -right-48 animate-float-delayed" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div 
              className={`inline-flex transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
              }`}
            >
              <Badge className={`px-4 py-2 text-sm font-semibold bg-gradient-to-r ${config.gradient} text-white border-0`}>
                <Star className="w-4 h-4 mr-2" />
                {config.badge}
              </Badge>
            </div>

            {/* Main Heading */}
            <div 
              className={`space-y-4 transition-all duration-1000 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 leading-tight">
                {negocio.nombre}
              </h1>
              <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {config.title}
              </p>
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                {config.description}
              </p>
            </div>

            {/* Info Cards */}
            <div 
              className={`flex flex-wrap gap-3 transition-all duration-1000 delay-400 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              {negocio.direccion && (
                <div className="group flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:scale-105">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {negocio.direccion}
                  </span>
                </div>
              )}
              {negocio.telefono && (
                <a 
                  href={`tel:${negocio.telefono}`}
                  className="group flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 hover:scale-105"
                >
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {negocio.telefono}
                  </span>
                </a>
              )}
              <div className="group flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 hover:scale-105">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  Abierto Ahora
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div 
              className={`flex flex-wrap gap-4 transition-all duration-1000 delay-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <Button 
                asChild 
                size="lg" 
                className={`text-lg px-10 py-7 bg-gradient-to-r ${config.gradient} hover:opacity-90 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group`}
              >
                <Link href={`/reservar`} className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Reservar Turno Ahora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="text-lg px-10 py-7 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all hover:scale-105"
              >
                <a href="#servicios">
                  Ver Servicios
                </a>
              </Button>
            </div>

            {/* Social Proof */}
            <div 
              className={`flex items-center gap-6 pt-6 transition-all duration-1000 delay-800 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 border-2 border-white flex items-center justify-center text-white font-bold text-sm"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  <span className="font-bold text-gray-900">100+</span> clientes satisfechos
                </p>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div 
            className={`relative transition-all duration-1000 delay-400 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <div className="relative group">
              {/* Glow effect */}
              <div className={`absolute -inset-4 bg-gradient-to-r ${config.gradient} rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity`} />
              
              {/* Main card */}
              <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
                
                <div className="relative h-full flex items-center justify-center p-12">
                  <div className="text-center space-y-8">
                    {/* Icon */}
                    <div className={`relative mx-auto w-40 h-40 rounded-3xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-2xl animate-float group-hover:scale-110 transition-transform duration-500`}>
                      <span className="text-7xl">{config.icon}</span>
                      <div className={`absolute -inset-4 bg-gradient-to-r ${config.gradient} rounded-3xl blur-xl opacity-50`} />
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-6 pt-8">
                      <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200">
                        <p className={`text-4xl font-black bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-2`}>
                          100%
                        </p>
                        <p className="text-sm font-semibold text-gray-600">Profesional</p>
                      </div>
                      <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200">
                        <p className={`text-4xl font-black bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-2`}>
                          5★
                        </p>
                        <p className="text-sm font-semibold text-gray-600">Calificación</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}