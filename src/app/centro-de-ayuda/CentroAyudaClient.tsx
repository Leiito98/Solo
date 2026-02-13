'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Search, 
  Calendar, 
  CreditCard, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Globe, 
  Bell, 
  Smartphone,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Mail,
  HelpCircle,
  Book,
  Zap,
  Lock,
  DollarSign,
} from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQCategory {
  id: string
  title: string
  icon: any
  description: string
  questions: FAQItem[]
}

const faqCategories: FAQCategory[] = [
  {
    id: 'primeros-pasos',
    title: 'Primeros pasos',
    icon: Zap,
    description: 'Todo lo que necesitás saber para empezar',
    questions: [
      {
        question: '¿Cómo creo mi cuenta en Solo?',
        answer: 'Creá tu cuenta en solo 2 pasos: (1) Hacé click en "Empezar Gratis" e ingresá tu email y contraseña. Confirmá tu email haciendo click en el link que te enviamos. (2) Completá los datos de tu negocio: nombre del responsable, tipo de negocio, nombre comercial y elegí tu URL única (slug). ¡Listo! Ya podés empezar a usar Solo.',
      },
      {
        question: '¿Cuánto tarda el setup inicial?',
        answer: 'El setup completo de Solo toma aproximadamente 10 minutos. Esto incluye: crear tu cuenta, configurar tus datos, agregar servicios y precios, dar de alta a tu equipo (si lo tenés), y personalizar tu página pública. Podés empezar a recibir reservas inmediatamente después.',
      },
      {
        question: '¿Necesito tarjeta de crédito para la prueba gratis?',
        answer: 'No. Los 14 días de prueba gratuita no requieren tarjeta de crédito. Podés explorar todas las funcionalidades sin ingresar datos de pago. Al finalizar el período de prueba, te pediremos que elijas un plan y agregues un método de pago para continuar usando Solo.',
      },
      {
        question: '¿Puedo migrar mis datos desde otra plataforma?',
        answer: 'Actualmente no tenemos una herramienta de migración automática, pero podés contactarnos por WhatsApp y te ayudamos a importar tus clientes, servicios y precios de forma manual. Es un proceso simple que podemos guiarte paso a paso.',
      },
    ],
  },
  {
    id: 'agenda-turnos',
    title: 'Agenda y turnos',
    icon: Calendar,
    description: 'Gestión de reservas y disponibilidad',
    questions: [
      {
        question: '¿Cómo funcionan las reservas online?',
        answer: 'Tus clientes entran a tu URL personalizada (tuNegocio.getsolo.site), eligen el servicio, el profesional y el horario disponible. Si configuraste el cobro de seña obligatorio, deberán pagarla con MercadoPago. El turno se confirma automáticamente y tanto vos como el cliente reciben una notificación. 24 horas antes del turno, el cliente recibe un recordatorio automático por email.',
      },
      {
        question: '¿Puedo configurar horarios diferentes para cada profesional?',
        answer: 'Sí. Cada profesional puede tener su propia disponibilidad horaria. Desde el panel de administración, andá a "Equipo", seleccioná al profesional y configurá sus días y horarios de trabajo. Los clientes solo verán los horarios disponibles de cada uno.',
      },
      {
        question: '¿Qué pasa si un cliente cancela?',
        answer: 'Podés gestionar cancelaciones desde el Dashboard. Si el turno tenía seña pagada, deberás coordinar la devolución o crédito directamente con tu cliente según tu política de cancelación. Solo te muestra el estado del pago pero no procesa devoluciones automáticas.',
      },
      {
        question: '¿Puedo bloquear horarios para eventos privados?',
        answer: 'Sí. Desde el panel de agenda podés crear "turnos bloqueados" que ocupan un horario pero no están asociados a ningún cliente. Esto es útil para reservar tiempo para capacitaciones, eventos privados o descansos del equipo.',
      },
      {
        question: '¿Los recordatorios se envían automáticamente?',
        answer: 'Sí. Solo envía automáticamente un recordatorio por email al cliente 24 horas antes de su turno. No tenés que hacer nada, el sistema lo gestiona completamente. El email incluye fecha, hora, servicio y profesional asignado.',
      },
    ],
  },
  {
    id: 'pagos-senas',
    title: 'Pagos y señas',
    icon: CreditCard,
    description: 'Cobros, MercadoPago y procesamiento de pagos',
    questions: [
      {
        question: '¿Cómo configuro MercadoPago?',
        answer: 'Desde el panel de configuración, andá a "Pagos" y conectá tu cuenta de MercadoPago siguiendo el proceso de autorización OAuth. Solo necesitás tener una cuenta de MercadoPago activa. Una vez conectada, podés empezar a cobrar señas inmediatamente. Todos los pagos se acreditan directamente en tu cuenta de MercadoPago.',
      },
      {
        question: '¿Cuánto cobran de comisión por las señas?',
        answer: 'Solo no cobra ninguna comisión adicional sobre los pagos. Las únicas comisiones son las de MercadoPago, que varían según el tipo de pago (tarjeta de crédito, débito, etc.). Podés ver las tarifas actualizadas en el sitio de MercadoPago.',
      },
      {
        question: '¿La seña es obligatoria?',
        answer: 'Vos decidís. Podés configurar si querés que la seña sea obligatoria o opcional. Si la hacés obligatoria, los clientes no podrán confirmar el turno sin pagarla. Si es opcional, pueden reservar sin pagar pero vos podés elegir confirmar o no el turno.',
      },
      {
        question: '¿Qué porcentaje de seña puedo cobrar?',
        answer: 'El sistema está configurado para cobrar el 50% del valor del servicio como seña, que es el estándar de la industria. Si necesitás un porcentaje diferente, contactanos por WhatsApp y podemos configurarlo para tu negocio.',
      },
      {
        question: '¿Qué pasa si falla un pago?',
        answer: 'Si el pago de la seña falla (tarjeta rechazada, fondos insuficientes, etc.), el turno no se confirma automáticamente. El cliente ve un mensaje de error y puede intentar nuevamente. Vos recibís una notificación de que hay un turno pendiente de confirmación de pago.',
      },
    ],
  },
  {
    id: 'equipo-comisiones',
    title: 'Equipo y comisiones',
    icon: Users,
    description: 'Gestión de profesionales y cálculo de comisiones',
    questions: [
      {
        question: '¿Cuántos profesionales puedo agregar?',
        answer: 'Depende de tu plan. El plan Solo permite hasta 2 profesionales. El plan Pro permite profesionales ilimitados. Podés agregar, editar o eliminar profesionales desde el panel de "Equipo" en cualquier momento.',
      },
      {
        question: '¿Cómo funcionan las comisiones?',
        answer: 'Asignás un porcentaje de comisión a cada profesional (por ejemplo, 40%). Solo calcula automáticamente cuánto le corresponde a cada uno según los turnos que atendió y el precio de cada servicio. Al final del mes, podés ver el detalle completo en el Dashboard y exportarlo a Excel si tenés el plan Pro.',
      },
      {
        question: '¿Puedo asignar diferentes comisiones por profesional?',
        answer: 'Sí, totalmente. Cada profesional puede tener su propio porcentaje de comisión. Por ejemplo, un profesional senior puede tener 45% y uno junior 30%. El sistema calcula todo automáticamente.',
      },
      {
        question: '¿Los profesionales pueden ver sus propias comisiones?',
        answer: 'Actualmente no. Solo el dueño del negocio tiene acceso completo al Dashboard. Los profesionales no tienen login propio. Estamos trabajando en una funcionalidad de acceso limitado para el equipo en futuras versiones.',
      },
    ],
  },
  {
    id: 'finanzas-reportes',
    title: 'Finanzas y reportes',
    icon: TrendingUp,
    description: 'Caja, ingresos, gastos y exportación de datos',
    questions: [
      {
        question: '¿Cómo veo la caja del día?',
        answer: 'En el Dashboard principal, la tarjeta "Caja hoy" te muestra el total de ingresos del día actual en tiempo real. Incluye todos los turnos cobrados (con o sin seña). Podés hacer click para ver el detalle de cada transacción.',
      },
      {
        question: '¿Puedo registrar gastos fijos?',
        answer: 'Sí, en el plan Pro. Desde el panel de "Finanzas" podés cargar gastos fijos como alquiler, servicios, insumos, sueldos base, etc. El sistema resta automáticamente estos gastos de tus ingresos para mostrarte la ganancia neta real.',
      },
      {
        question: '¿Puedo exportar reportes a Excel?',
        answer: 'Sí, en el plan Pro. Podés exportar turnos, ingresos, gastos y comisiones a Excel o PDF. Los reportes incluyen filtros por fecha, profesional y servicio. Ideal para llevarle a tu contador o hacer análisis propios.',
      },
      {
        question: '¿El sistema emite facturas?',
        answer: 'No. Solo registra los ingresos pero no emite facturas legales. Deberás emitir tus facturas a través del sistema que uses habitualmente (AFIP, Monotributo, etc.). Solo te provee los datos para que puedas hacerlo fácilmente.',
      },
    ],
  },
  {
    id: 'pagina-web',
    title: 'Página web',
    icon: Globe,
    description: 'URL personalizada y landing page pública',
    questions: [
      {
        question: '¿Cómo funciona mi página web?',
        answer: 'Al crear tu cuenta, Solo genera automáticamente una landing page en tu URL única (tuNegocio.getsolo.site). Esta página incluye el nombre de tu negocio, tus servicios, precios y un botón para que los clientes reserven turnos. Podés compartir esta URL por Instagram, WhatsApp, Google Maps, etc.',
      },
      {
        question: '¿Puedo personalizar mi página?',
        answer: 'Actualmente la personalización es limitada: podés cambiar el nombre del negocio, agregar/editar servicios y precios. Estamos trabajando en permitir subir tu logo, cambiar colores y agregar fotos. Si tenés un dominio propio y querés conectarlo, contactanos por WhatsApp.',
      },
      {
        question: '¿Puedo usar mi propio dominio?',
        answer: 'Sí. Podés conectar tu dominio propio (ej: www.tunegocio.com) en lugar de usar el subdominio de Solo. Contactanos por WhatsApp y te ayudamos con la configuración DNS. Esta funcionalidad está disponible en ambos planes.',
      },
      {
        question: '¿La página es responsive?',
        answer: 'Sí, totalmente. Tu página funciona perfectamente en celulares, tablets y computadoras. La mayoría de tus clientes reservarán desde el celular, por eso está optimizada para mobile-first.',
      },
    ],
  },
  {
    id: 'planes-facturacion',
    title: 'Planes y facturación',
    icon: DollarSign,
    description: 'Suscripciones, cambios de plan y pagos',
    questions: [
      {
        question: '¿Cuál es la diferencia entre los planes Solo y Pro?',
        answer: 'Plan Solo ($20.000/mes): hasta 2 profesionales, agenda online, landing, pagos, recordatorios y soporte WhatsApp. Plan Pro ($28.000/mes): todo lo del plan Solo + profesionales ilimitados, sistema de comisiones, control de gastos, analytics avanzados, exportar a Excel/PDF y soporte prioritario.',
      },
      {
        question: '¿Puedo cambiar de plan después?',
        answer: 'Sí, podés cambiar de plan en cualquier momento desde el panel de configuración. Si pasás de Solo a Pro, se prorratea la diferencia. Si bajás de Pro a Solo, el crédito se aplica al siguiente mes. El cambio es inmediato.',
      },
      {
        question: '¿Cómo se cobra la suscripción mensual?',
        answer: 'El cobro se realiza automáticamente cada mes en la fecha de tu suscripción inicial, usando el método de pago que configuraste (tarjeta de crédito/débito vía DoDoPayments). Recibís una factura por email cada mes.',
      },
      {
        question: '¿Puedo cancelar cuando quiera?',
        answer: 'Sí. No hay permanencia mínima. Podés cancelar tu suscripción en cualquier momento desde la configuración. La cancelación toma efecto al finalizar tu período de facturación actual (no hay reembolsos prorrateados). Tus datos se eliminan 90 días después de la cancelación.',
      },
      {
        question: '¿Qué pasa si no pago un mes?',
        answer: 'Si falla el pago, intentamos cobrar nuevamente durante 3 días. Si no se regulariza, tu cuenta se suspende temporalmente: no podés recibir nuevas reservas pero conservás el acceso para ver tus datos. Tenés 7 días para regularizar antes de que la cuenta se desactive completamente.',
      },
    ],
  },
  {
    id: 'seguridad-privacidad',
    title: 'Seguridad y privacidad',
    icon: Lock,
    description: 'Protección de datos y privacidad',
    questions: [
      {
        question: '¿Mis datos están seguros?',
        answer: 'Sí. Todos los datos se almacenan con cifrado en tránsito (HTTPS/TLS) y en reposo. Las contraseñas se guardan con hashing seguro (nunca en texto plano). Cada negocio tiene su propio espacio aislado (arquitectura multi-tenant) así que nadie puede acceder a tus datos.',
      },
      {
        question: '¿Quién puede ver los datos de mis clientes?',
        answer: 'Solo vos y tu equipo (cuando implementemos el acceso limitado). Ni siquiera el personal de Solo puede ver tus datos salvo que nos lo autorices explícitamente para resolver un problema técnico. Cada negocio es un tenant completamente aislado.',
      },
      {
        question: '¿Qué pasa con mis datos si cancelo?',
        answer: 'Si cancelás tu cuenta, tus datos se conservan durante 90 días por si decidís volver. Después de ese período, se eliminan permanentemente de nuestros servidores. Podés solicitar la eliminación inmediata contactándonos.',
      },
      {
        question: '¿Puedo exportar mis datos antes de cancelar?',
        answer: 'Sí. Antes de cancelar podés exportar toda tu información (clientes, turnos, ingresos) a Excel desde el plan Pro. Si tenés el plan Solo, contactanos y te generamos la exportación manualmente sin cargo.',
      },
    ],
  },
  {
    id: 'soporte-tecnico',
    title: 'Soporte técnico',
    icon: MessageCircle,
    description: 'Ayuda, contacto y resolución de problemas',
    questions: [
      {
        question: '¿Cómo contacto a soporte?',
        answer: 'Podés contactarnos por WhatsApp (link en el footer de la plataforma) o por email a support@getsolo.site. El plan Solo tiene soporte estándar (respuesta en 24-48hs). El plan Pro tiene soporte prioritario (respuesta en menos de 12hs).',
      },
      {
        question: '¿Hay soporte telefónico?',
        answer: 'Actualmente ofrecemos soporte por WhatsApp y email. El WhatsApp funciona como un chat en tiempo real durante horario de oficina (Lun-Vie 9-18hs ART). Para emergencias críticas del plan Pro, ofrecemos asistencia inmediata.',
      },
      {
        question: '¿Hacen capacitaciones para usar la plataforma?',
        answer: 'Sí. Ofrecemos una videollamada de onboarding gratuita de 30 minutos para nuevos clientes del plan Pro. Para el plan Solo, tenemos tutoriales en video disponibles en el Centro de Ayuda. También podés pedir ayuda por WhatsApp en cualquier momento.',
      },
      {
        question: '¿Qué hago si encuentro un error?',
        answer: 'Reportalo inmediatamente por WhatsApp o email con el mayor detalle posible: qué estabas haciendo, qué pasó, capturas de pantalla si tenés. Nuestro equipo técnico lo revisa y corrige lo antes posible. Los errores críticos se priorizan en ambos planes.',
      },
    ],
  },
]

export default function CentroAyudaPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

  const toggleQuestion = (categoryId: string, questionIndex: number) => {
    const key = `${categoryId}-${questionIndex}`
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedQuestions(newExpanded)
  }

  const filteredCategories = faqCategories.map(category => {
    if (!searchQuery) return category
    const filtered = category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
    return { ...category, questions: filtered }
  }).filter(category => category.questions.length > 0)

  return (
    <div
      className="min-h-screen bg-[#0a0a0a] text-white"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Cabinet+Grotesk:wght@400;500;700;800;900&display=swap');
        .heading-font { font-family: 'Cabinet Grotesk', 'DM Sans', system-ui, sans-serif; }
        .blob { filter: blur(80px); border-radius: 50%; position: absolute; pointer-events: none; }
        .category-card { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .category-card:hover { transform: translateY(-2px); border-color: rgba(59, 130, 246, 0.3); }
        .question-item { transition: all 0.15s; }
        .question-item:hover { background: rgba(255,255,255,0.02); }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob w-[500px] h-[500px] bg-blue-600/8 top-[-150px] left-[-150px]" />
        <div className="blob w-[400px] h-[400px] bg-violet-600/6 bottom-[-100px] right-[-100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-7 h-7">
              <Image src="/logo/solo.png" alt="Solo" fill className="object-contain" />
            </div>
            <span className="heading-font text-base font-800 text-white">Solo</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/terminos-y-condiciones" className="text-xs text-white/30 hover:text-white/60 transition-colors hidden sm:block">
              Términos
            </Link>
            <Link href="/politica-de-privacidad" className="text-xs text-white/30 hover:text-white/60 transition-colors hidden sm:block">
              Privacidad
            </Link>
            <Link href="/register" className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg font-semibold transition-all">
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-5 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] text-white/25 text-[11px] font-semibold uppercase tracking-widest">
            <HelpCircle className="w-3 h-3" />
            Soporte
          </div>
          <h1 className="heading-font text-4xl sm:text-5xl font-900 text-white leading-tight mb-4">
            Centro de Ayuda
          </h1>
          <p className="text-base text-white/40 max-w-xl mx-auto leading-relaxed mb-8">
            Encontrá respuestas rápidas a las preguntas más frecuentes sobre Solo
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Buscá tu pregunta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.06] transition-all"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-3 mb-12">
          <a
            href="https://api.whatsapp.com/send/?phone=5491164613750&text=Necesito%20hablar%20con%20un%20representante%20de%20Solo&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-green-500/30 hover:bg-green-500/[0.04] transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
              <MessageCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">WhatsApp</div>
              <div className="text-xs text-white/30">Chat en vivo</div>
            </div>
          </a>

          <a
            href="mailto:support@getsolo.site"
            className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-blue-500/30 hover:bg-blue-500/[0.04] transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">Email</div>
              <div className="text-xs text-white/30">support@getsolo.site</div>
            </div>
          </a>

          <Link
            href="#tutoriales"
            className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-violet-500/30 hover:bg-violet-500/[0.04] transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
              <Book className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">Tutoriales</div>
              <div className="text-xs text-white/30">Videos y guías</div>
            </div>
          </Link>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {filteredCategories.map((category) => {
            const Icon = category.icon
            const isExpanded = expandedCategory === category.id
            
            return (
              <div key={category.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden category-card">
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="heading-font text-lg font-700 text-white mb-0.5">{category.title}</h3>
                    <p className="text-xs text-white/35">{category.description} · {category.questions.length} preguntas</p>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-white/30 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="border-t border-white/[0.06]">
                    {category.questions.map((q, i) => {
                      const key = `${category.id}-${i}`
                      const isQuestionExpanded = expandedQuestions.has(key)
                      
                      return (
                        <div key={i} className="border-b border-white/[0.04] last:border-0">
                          <button
                            onClick={() => toggleQuestion(category.id, i)}
                            className="w-full flex items-start gap-3 p-5 question-item text-left"
                          >
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-white/70 mb-1 pr-6">{q.question}</div>
                              {isQuestionExpanded && (
                                <p className="text-sm text-white/45 leading-relaxed mt-3 pr-6">{q.answer}</p>
                              )}
                            </div>
                            {isQuestionExpanded ? (
                              <ChevronUp className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5" />
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* No results */}
        {searchQuery && filteredCategories.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-white/20" />
            </div>
            <h3 className="heading-font text-xl font-700 text-white/50 mb-2">No encontramos resultados</h3>
            <p className="text-sm text-white/30 mb-6">Probá con otros términos o contactanos directamente</p>
            <a
              href="https://api.whatsapp.com/send/?phone=5491164613750&text=Necesito%20ayuda%20con%20Solo&type=phone_number&app_absent=0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500/15 hover:bg-green-500/25 border border-green-500/20 text-green-400 rounded-lg text-sm font-semibold transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Hablar por WhatsApp
            </a>
          </div>
        )}

        {/* Tutorials Section */}
        <div id="tutoriales" className="mt-16 pt-16 border-t border-white/[0.06]">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] text-white/25 text-[11px] font-semibold uppercase tracking-widest">
              <Book className="w-3 h-3" />
              Recursos
            </div>
            <h2 className="heading-font text-3xl font-900 text-white mb-3">Tutoriales y guías</h2>
            <p className="text-white/40 text-sm">Aprendé a usar Solo con nuestras guías paso a paso</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-6 hover:border-blue-500/30 hover:bg-white/[0.03] transition-all">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="heading-font text-base font-700 text-white mb-2">Guía de inicio rápido</h3>
              <p className="text-sm text-white/40 mb-4">Configurá tu negocio en 10 minutos: desde el registro hasta tu primera reserva.</p>
              <span className="text-xs text-blue-400 font-semibold">Próximamente →</span>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-6 hover:border-blue-500/30 hover:bg-white/[0.03] transition-all">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="heading-font text-base font-700 text-white mb-2">Configurar MercadoPago</h3>
              <p className="text-sm text-white/40 mb-4">Conectá tu cuenta y empezá a cobrar señas en menos de 5 minutos.</p>
              <span className="text-xs text-blue-400 font-semibold">Próximamente →</span>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-6 hover:border-blue-500/30 hover:bg-white/[0.03] transition-all">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="heading-font text-base font-700 text-white mb-2">Gestionar tu equipo</h3>
              <p className="text-sm text-white/40 mb-4">Agregá profesionales, asigná comisiones y gestioná horarios.</p>
              <span className="text-xs text-blue-400 font-semibold">Próximamente →</span>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-6 hover:border-blue-500/30 hover:bg-white/[0.03] transition-all">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="heading-font text-base font-700 text-white mb-2">Entender las métricas</h3>
              <p className="text-sm text-white/40 mb-4">Aprovechá al máximo el Dashboard y los reportes financieros.</p>
              <span className="text-xs text-blue-400 font-semibold">Próximamente →</span>
            </div>
          </div>
        </div>

        {/* Still need help */}
        <div className="mt-16">
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/[0.06] to-transparent p-8 text-center">
            <h3 className="heading-font text-2xl font-800 text-white mb-3">¿Todavía necesitás ayuda?</h3>
            <p className="text-white/40 text-sm mb-6 max-w-md mx-auto">
              Nuestro equipo está disponible para ayudarte por WhatsApp o email
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://api.whatsapp.com/send/?phone=5491164613750&text=Necesito%20ayuda%20con%20Solo&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-green-500/20 hover:shadow-green-400/30"
              >
                <MessageCircle className="w-4 h-4" />
                Hablar por WhatsApp
              </a>
              <a
                href="mailto:support@getsolo.site"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white rounded-xl text-sm font-semibold transition-all"
              >
                <Mail className="w-4 h-4" />
                Enviar email
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-6 h-6">
              <Image src="/logo/solo.png" alt="Solo" fill className="object-contain" />
            </div>
            <span className="text-xs text-white/25">© 2026 Solo. Todos los derechos reservados.</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-white/25">
            <Link href="/terminos-y-condiciones" className="hover:text-white/60 transition-colors">Términos y Condiciones</Link>
            <Link href="/politica-de-privacidad" className="hover:text-white/60 transition-colors">Política de Privacidad</Link>
            <Link href="/" className="hover:text-white/60 transition-colors">Volver al inicio</Link>
          </div>
        </div>
      </div>
    </div>
  )
}