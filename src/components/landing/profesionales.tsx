'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Star, Award, Briefcase } from 'lucide-react'
import { useState } from 'react'

interface Profesional {
  id: string
  nombre: string
  especialidad?: string | null
  foto_url?: string | null
  bio?: string | null
}

interface ProfesionalesProps {
  profesionales: Profesional[]
}

export function ProfesionalesSection({ profesionales }: ProfesionalesProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (!profesionales || profesionales.length === 0) {
    return null
  }

  return (
    <section id="profesionales" className="py-32 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-400/5 rounded-full blur-[120px] -top-48 left-1/4" />
        <div className="absolute w-96 h-96 bg-blue-400/5 rounded-full blur-[120px] bottom-0 right-1/4" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 border border-purple-200 mb-6">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">Nuestro Equipo</span>
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6">
            Profesionales que marcan
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              la diferencia
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Nuestro equipo está formado por expertos apasionados y altamente capacitados,
            <span className="block mt-2 font-semibold text-purple-600">
              comprometidos con tu satisfacción
            </span>
          </p>
        </div>

        {/* Grid de Profesionales */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {profesionales.map((profesional, index) => {
            const initials = profesional.nombre
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)

            const isHovered = hoveredIndex === index

            return (
              <div
                key={profesional.id}
                className="group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Card 
                  className={`relative overflow-hidden transition-all duration-500 h-full border-2 ${
                    isHovered 
                      ? 'border-purple-300 shadow-2xl scale-105 -translate-y-2' 
                      : 'border-gray-200 shadow-lg'
                  }`}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 transition-opacity duration-500 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`} />

                  <CardContent className="p-8 text-center relative z-10">
                    <div className="space-y-5">
                      {/* Avatar con efecto */}
                      <div className="relative inline-block">
                        {/* Glow ring */}
                        <div className={`absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />
                        
                        {/* Avatar */}
                        <Avatar className={`w-32 h-32 border-4 border-white shadow-xl transition-transform duration-500 relative z-10 ${
                          isHovered ? 'scale-110' : ''
                        }`}>
                          <AvatarImage src={profesional.foto_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-2xl font-black">
                            {initials}
                          </AvatarFallback>
                        </Avatar>

                        {/* Badge de verificación */}
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center z-20">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      {/* Nombre */}
                      <div>
                        <h3 className={`text-xl font-bold mb-2 transition-colors ${
                          isHovered ? 'text-purple-600' : 'text-gray-900'
                        }`}>
                          {profesional.nombre}
                        </h3>
                        
                        {profesional.especialidad && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-3 py-1">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {profesional.especialidad}
                          </Badge>
                        )}
                      </div>

                      {/* Bio */}
                      {profesional.bio && (
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 px-2">
                          {profesional.bio}
                        </p>
                      )}

                      {/* Rating */}
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 fill-yellow-400 text-yellow-400 transition-transform ${
                                isHovered ? 'scale-125' : ''
                              }`}
                              style={{ transitionDelay: `${i * 50}ms` }}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 font-medium">
                          Profesional Certificado
                        </p>
                      </div>

                      {/* Stats mini */}
                      <div className="grid grid-cols-2 gap-3 pt-4">
                        <div className="p-3 bg-purple-50 rounded-xl">
                          <p className="text-2xl font-black text-purple-600">50+</p>
                          <p className="text-xs text-gray-600 font-medium">Clientes</p>
                        </div>
                        <div className="p-3 bg-pink-50 rounded-xl">
                          <p className="text-2xl font-black text-pink-600">5.0</p>
                          <p className="text-xs text-gray-600 font-medium">Rating</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  {/* Glow effect on hover */}
                  <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 rounded-full blur-3xl transition-opacity duration-500" />
                </Card>
              </div>
            )
          })}
        </div>

        {/* Bottom message */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">Todos nuestros profesionales</p>
              <p className="text-sm text-gray-600">están certificados y capacitados continuamente</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}