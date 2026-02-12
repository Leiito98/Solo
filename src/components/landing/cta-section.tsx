'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Calendar, Clock, CreditCard, Shield, Check, Sparkles, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'

interface CTASectionProps {
  negocioSlug: string
}

export function CTASection({ negocioSlug }: CTASectionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById('cta-section')
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const features = [
    {
      icon: Calendar,
      title: 'Agenda 24/7',
      description: 'Reserva cuando quieras, desde donde estés',
      gradient: 'from-blue-500 to-cyan-500',
      delay: '0ms'
    },
    {
      icon: Clock,
      title: 'Confirmación Instantánea',
      description: 'Recibe confirmación al instante por WhatsApp',
      gradient: 'from-purple-500 to-pink-500',
      delay: '200ms'
    },
    {
      icon: Shield,
      title: 'Pago Seguro',
      description: 'Paga online de forma rápida y protegida',
      gradient: 'from-green-500 to-emerald-500',
      delay: '400ms'
    }
  ]

  return (
    <section 
      id="cta-section"
      className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden"
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-[100px] -top-48 -left-48 animate-float" />
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-[100px] -bottom-48 -right-48 animate-float-delayed" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-semibold text-white">Reserva en 3 simples pasos</span>
          </div>

          <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            ¿Listo para agendar
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              tu turno?
            </span>
          </h2>
          <p className="text-2xl text-blue-100 max-w-3xl mx-auto">
            Reserva online en menos de 2 minutos.
            <span className="block mt-2 font-bold text-white">
              Sin llamadas, sin esperas, sin complicaciones.
            </span>
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className={`transition-all duration-1000 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: isVisible ? feature.delay : '0ms' }}
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:-translate-y-2 group">
                  <CardContent className="p-8 text-center">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-blue-100">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        {/* Main CTA Card */}
        <div className={`transition-all duration-1000 delay-600 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <Card className="bg-white border-0 shadow-2xl overflow-hidden">
            <CardContent className="p-12">
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  {/* Left: Benefits */}
                  <div className="space-y-6">
                    <h3 className="text-3xl font-black text-gray-900 mb-6">
                      ¿Por qué reservar online?
                    </h3>
                    
                    <div className="space-y-4">
                      {[
                        'Disponibilidad en tiempo real',
                        'Confirmación inmediata',
                        'Recordatorios automáticos',
                        'Pago seguro con MercadoPago',
                        'Reprogramación fácil',
                        'Atención 24/7'
                      ].map((benefit, i) => (
                        <div 
                          key={i} 
                          className="flex items-center gap-3 group/item cursor-pointer"
                        >
                          <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center group-hover/item:scale-110 transition-transform">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-gray-700 font-medium group-hover/item:text-blue-600 transition-colors">
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: CTA */}
                  <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-200">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-700">
                        Pago online disponible
                      </span>
                    </div>

                    <div className="relative">
                      {/* Glow effect */}
                      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-30" />
                      
                      <Button 
                        asChild 
                        size="lg"
                        className="relative text-xl px-12 py-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:scale-110 transition-all group w-full"
                      >
                        <Link href={`/reservar?slug=${negocioSlug}`} className="flex items-center justify-center gap-3">
                          <Calendar className="w-6 h-6" />
                          Reservar Mi Turno Ahora
                          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>

                    <p className="text-sm text-gray-600">
                      <Check className="w-4 h-4 inline mr-1 text-green-600" />
                      Sin costo adicional por reserva online
                    </p>

                    {/* Trust badges */}
                    <div className="grid grid-cols-2 gap-4 pt-6">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                        <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                          100%
                        </p>
                        <p className="text-xs font-semibold text-gray-600">Seguro</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                        <p className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">
                          24/7
                        </p>
                        <p className="text-xs font-semibold text-gray-600">Disponible</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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