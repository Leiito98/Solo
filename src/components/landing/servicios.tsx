'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, DollarSign, Calendar, Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface Servicio {
  id: string
  nombre: string
  descripcion?: string | null
  duracion_min: number
  precio: number
}

interface ServiciosProps {
  servicios: Servicio[]
  negocioSlug: string
}

export function ServiciosSection({ servicios, negocioSlug }: ServiciosProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (!servicios || servicios.length === 0) {
    return null
  }

  // Determinar si hay un servicio popular (el más caro o el primero)
  const servicioPopularId = servicios.reduce((prev, current) => 
    current.precio > prev.precio ? current : prev
  ).id

  return (
    <section id="servicios" className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-400/5 rounded-full blur-[100px] top-0 right-0" />
        <div className="absolute w-96 h-96 bg-purple-400/5 rounded-full blur-[100px] bottom-0 left-0" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 mb-6">
            <Star className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">Nuestros Servicios</span>
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6">
            Servicios que te encantarán
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Elige el servicio que necesitas y agenda tu turno en minutos.
            <span className="block mt-2 font-semibold text-blue-600">
              Precios transparentes, sin sorpresas
            </span>
          </p>
        </div>

        {/* Grid de Servicios */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicios.map((servicio, index) => {
            const isPopular = servicio.id === servicioPopularId
            const isHovered = hoveredIndex === index
            
            return (
              <div
                key={servicio.id}
                className="group relative"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-4 py-1 shadow-lg">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Más Popular
                    </Badge>
                  </div>
                )}

                <Card 
                  className={`relative overflow-hidden transition-all duration-500 h-full ${
                    isPopular 
                      ? 'border-2 border-orange-300 shadow-xl shadow-orange-500/20' 
                      : 'border-2 border-gray-200 hover:border-blue-300'
                  } ${
                    isHovered ? 'scale-105 shadow-2xl -translate-y-2' : 'shadow-lg'
                  }`}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 transition-opacity duration-500 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`} />

                  <CardContent className="p-8 relative z-10">
                    <div className="space-y-6">
                      {/* Header with icon */}
                      <div className="flex items-start justify-between">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                          isPopular ? 'from-orange-500 to-red-500' : 'from-blue-500 to-indigo-600'
                        } flex items-center justify-center shadow-lg transition-transform duration-500 ${
                          isHovered ? 'scale-110 rotate-6' : ''
                        }`}>
                          <Star className="w-8 h-8 text-white" />
                        </div>

                        {/* Precio destacado */}
                        <div className="text-right">
                          <div className="flex items-start gap-1">
                            <DollarSign className={`w-6 h-6 mt-1 ${isPopular ? 'text-orange-600' : 'text-blue-600'}`} />
                            <span className={`text-4xl font-black ${
                              isPopular ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                            } bg-clip-text text-transparent`}>
                              {Number(servicio.precio).toLocaleString('es-AR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Nombre del servicio */}
                      <div>
                        <h3 className={`text-2xl font-bold mb-3 transition-colors ${
                          isHovered ? (isPopular ? 'text-orange-600' : 'text-blue-600') : 'text-gray-900'
                        }`}>
                          {servicio.nombre}
                        </h3>

                        {/* Descripción */}
                        {servicio.descripcion && (
                          <p className="text-gray-600 leading-relaxed line-clamp-2">
                            {servicio.descripcion}
                          </p>
                        )}
                      </div>

                      {/* Duración */}
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className={`w-10 h-10 rounded-lg ${
                          isPopular ? 'bg-orange-100' : 'bg-blue-100'
                        } flex items-center justify-center`}>
                          <Clock className={`w-5 h-5 ${isPopular ? 'text-orange-600' : 'text-blue-600'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {servicio.duracion_min} minutos
                          </p>
                          <p className="text-xs text-gray-500">Duración estimada</p>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Button 
                        asChild 
                        className={`w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all ${
                          isPopular 
                            ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                        } ${isHovered ? 'scale-105' : ''}`}
                      >
                        <Link href={`/reservar?servicio=${servicio.id}&slug=${negocioSlug}`} className="flex items-center justify-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Reservar Ahora
                        </Link>
                      </Button>
                    </div>
                  </CardContent>

                  {/* Glow effect on hover */}
                  <div className={`absolute -bottom-20 -right-20 w-40 h-40 ${
                    isPopular ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-gradient-to-br from-blue-500 to-purple-500'
                  } opacity-0 group-hover:opacity-20 rounded-full blur-3xl transition-opacity duration-500`} />
                </Card>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 text-lg mb-6">
            ¿No encuentras lo que buscas? 
            <span className="block mt-2 font-semibold text-gray-900">Contáctanos para servicios personalizados</span>
          </p>
          <Button 
            asChild 
            variant="outline" 
            size="lg"
            className="border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          >
            <a href="#contacto" className="text-lg px-8">
              Consultar Disponibilidad
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}