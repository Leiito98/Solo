'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Phone, MapPin, Menu, X, Calendar, Star } from 'lucide-react'

interface NavbarProps {
  negocio: {
    nombre: string
    logo_url?: string | null
    telefono?: string | null
    slug: string
  }
}

export function LandingNavbar({ negocio }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200' 
        : 'bg-white/80 backdrop-blur-md border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Nombre */}
          <div className="flex items-center gap-4 group">
            {negocio.logo_url ? (
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
                <img 
                  src={negocio.logo_url} 
                  alt={negocio.nombre}
                  className="relative h-12 w-12 rounded-xl object-cover shadow-lg group-hover:scale-110 transition-transform"
                />
              </div>
            ) : (
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50" />
                <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-white font-black text-xl">
                    {negocio.nombre[0].toUpperCase()}
                  </span>
                </div>
              </div>
            )}
            <div>
              <span className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                {negocio.nombre}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xs text-gray-600 ml-1 font-semibold">5.0</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <a 
              href="#servicios" 
              className="relative text-gray-700 hover:text-blue-600 font-semibold transition-colors group"
            >
              Servicios
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300" />
            </a>
            <a 
              href="#profesionales" 
              className="relative text-gray-700 hover:text-blue-600 font-semibold transition-colors group"
            >
              Profesionales
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300" />
            </a>
            
            {negocio.telefono && (
              <a 
                href={`tel:${negocio.telefono}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-all hover:scale-105 border border-green-200"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm font-semibold">{negocio.telefono}</span>
              </a>
            )}
            
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50" />
              <Button 
                asChild 
                size="lg"
                className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Link href={`/reservar`} className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Reservar Turno
                </Link>
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-3">
            <Button 
              asChild
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              <Link href={`/reservar`}>
                Reservar
              </Link>
            </Button>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-900" />
              ) : (
                <Menu className="w-6 h-6 text-gray-900" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 pb-6' : 'max-h-0'
        }`}>
          <div className="space-y-4">
            <a 
              href="#servicios"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-semibold transition-all"
            >
              Servicios
            </a>
            <a 
              href="#profesionales"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-semibold transition-all"
            >
              Profesionales
            </a>
            
            {negocio.telefono && (
              <a 
                href={`tel:${negocio.telefono}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 text-green-700 font-semibold"
              >
                <Phone className="w-5 h-5" />
                {negocio.telefono}
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}