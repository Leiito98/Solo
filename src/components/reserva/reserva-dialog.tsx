'use client'

// app/components/reserva/reserva-dialog.tsx
// Pure Client Component — no render props, no function children.
// Opens via a custom DOM event fired by <ReservaButton> siblings.

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  X, ChevronLeft, ChevronRight, Clock, Calendar, Check,
  Users, Loader2, ArrowRight, User, Mail, Phone,
  CreditCard, Wallet, CheckCircle2, XCircle, IdCard,
} from 'lucide-react'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NegocioDialogData {
  id: string
  nombre: string
  slug: string
  color_primario?: string | null
  color_secundario?: string | null
  logo_url?: string | null
  tiene_mp?: boolean       // si el negocio tiene MP configurado
  mp_sena_pct?: number     // porcentaje de seña (0-100), default 50
}

export interface ServicioData {
  id: string
  nombre: string
  descripcion?: string | null
  duracion_min: number
  precio: number
}

export interface ProfesionalData {
  id: string
  nombre: string
  especialidad?: string | null
  foto_url?: string | null
}

interface ClienteData {
  dni: string
  nombre: string
  email: string
  telefono: string
}

type Step = 'servicio' | 'datetime' | 'profesional' | 'dni' | 'cliente' | 'confirmacion' | 'success'
const STEP_ORDER: Step[] = ['servicio', 'datetime', 'profesional', 'dni', 'cliente', 'confirmacion']
const STEP_LABELS: Record<Step, string> = {
  servicio: 'Servicio',
  datetime: 'Fecha y hora',
  profesional: 'Profesional',
  dni: 'DNI',
  cliente: 'Tus datos',
  confirmacion: 'Confirmar',
  success: 'Listo',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
function isValidHex(h?: string | null): h is string {
  return typeof h === 'string' && /^#[0-9a-fA-F]{6}$/.test(h.trim())
}
function formatPrice(p: number) {
  return '$' + Number(p).toLocaleString('es-AR')
}
function hexRgb(hex: string) {
  const h = hex.replace('#', '')
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`
}
function normalizeDni(v: string) {
  return String(v || '').replace(/\D/g, '').trim()
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ReservaDialogProps {
  negocio: NegocioDialogData
  servicios: ServicioData[]
  profesionales: ProfesionalData[]
  /** Custom event name to listen for (default: "open-reserva-dialog") */
  eventName?: string
}

export function ReservaDialog({
  negocio,
  servicios,
  profesionales: profesionalesProp,
  eventName = 'open-reserva-dialog',
}: ReservaDialogProps) {
  const primary = isValidHex(negocio.color_primario) ? negocio.color_primario.trim() : '#7c3aed'
  const rgb = hexRgb(primary)

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('servicio')

  // Selections
  const [servicio, setServicio] = useState<ServicioData | null>(null)
  const [profesional, setProfesional] = useState<ProfesionalData | null>(null)
  const [profesDisponibles, setProfesDisponibles] = useState<ProfesionalData[]>([])
  const [fecha, setFecha] = useState<Date | null>(null)
  const [hora, setHora] = useState<string | null>(null)
  const [cliente, setCliente] = useState<ClienteData>({ dni: '', nombre: '', email: '', telefono: '' })
  const [metodoPago, setMetodoPago] = useState<'online' | 'local'>(negocio.tiene_mp ? 'online' : 'local')

  // Loading
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [loadingProfes, setLoadingProfes] = useState(false)
  const [loadingConfirm, setLoadingConfirm] = useState(false)

  // DNI lookup
  const [loadingDni, setLoadingDni] = useState(false)
  const [dniError, setDniError] = useState<string | null>(null)

  // Data
  const [slots, setSlots] = useState<string[]>([])
  const [turnoCreado, setTurnoCreado] = useState<any>(null)

  // UI
  const [timeTab, setTimeTab] = useState<'manana' | 'tarde'>('tarde')
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [formErrors, setFormErrors] = useState<Partial<Pick<ClienteData, 'nombre' | 'email' | 'telefono'>>>({})
  const [errorConfirm, setErrorConfirm] = useState<string | null>(null)

  // NUEVO: mensaje cuando el profesional no trabaja ese día
  const [noTrabajaMsg, setNoTrabajaMsg] = useState<string | null>(null)

  // ── Listen for open event ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ servicioId?: string }>).detail
      const sid = detail?.servicioId ?? null

      if (sid) {
        const found = servicios.find(s => s.id === sid)
        if (found) {
          setServicio(found)
          setStep('datetime')
        } else {
          setStep('servicio')
        }
      } else {
        setServicio(null)
        setStep('servicio')
      }

      setOpen(true)
    }
    window.addEventListener(eventName, handler)
    return () => window.removeEventListener(eventName, handler)
  }, [eventName, servicios])

  // ── Lock scroll when open ─────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // ── Cuando cambia profesional o fecha: limpiar hora seleccionada ──────────
  useEffect(() => {
    setHora(null)
  }, [profesional?.id, fecha?.toISOString()])

  // ── Load slots when date/servicio/profesional changes ─────────────────────
  useEffect(() => {
    if (!fecha || !servicio) return

    setLoadingSlots(true)
    setNoTrabajaMsg(null)

    const fechaStr = format(fecha, 'yyyy-MM-dd')
    const pid = profesional?.id ? `&profesional_id=${encodeURIComponent(profesional.id)}` : ''

    fetch(`/api/booking/slots-disponibles?negocio_id=${negocio.id}&fecha=${fechaStr}&duracion=${servicio.duracion_min}${pid}`)
      .then(r => r.json())
      .then(d => {
        const all: string[] = d.slots || []
        setSlots(all)

        if (d.reason === 'no_trabaja' && profesional?.id) {
          const first = profesional.nombre?.split(' ')[0] || 'El profesional'
          setNoTrabajaMsg(`${first} no trabaja este día.`)
        }

        const hasTarde = all.some(s => parseInt(s.split(':')[0]) >= 12)
        setTimeTab(hasTarde ? 'tarde' : 'manana')
      })
      .catch(() => {
        setSlots([])
      })
      .finally(() => setLoadingSlots(false))
  }, [fecha, servicio, negocio.id, profesional?.id])

  // ── Load profesionales (solo para "Primero disponible") ───────────────────
  const loadProfes = useCallback(async (f: string, h: string) => {
    setLoadingProfes(true)
    try {
      const dur = servicio?.duracion_min || 30
      const res = await fetch(
        `/api/booking/profesionales-disponibles?negocio_id=${negocio.id}&fecha=${f}&hora=${h}&duracion=${dur}`
      )
      const json = await res.json()
      setProfesDisponibles(json.profesionales || [])
    } finally {
      setLoadingProfes(false)
    }
  }, [negocio.id, servicio])

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setStep('servicio')
    setServicio(null)
    setProfesional(null)
    setFecha(null)
    setHora(null)
    setCliente({ dni: '', nombre: '', email: '', telefono: '' })
    setMetodoPago(negocio.tiene_mp ? 'online' : 'local')
    setSlots([])
    setProfesDisponibles([])
    setTurnoCreado(null)
    setErrorConfirm(null)
    setFormErrors({})
    setNoTrabajaMsg(null)
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
    setLoadingDni(false)
    setDniError(null)
  }, [negocio.tiene_mp])

  const handleClose = () => {
    setOpen(false)
    setTimeout(reset, 300)
  }

  const stepIndex = STEP_ORDER.indexOf(step)
  const goBack = () => { if (stepIndex > 0) setStep(STEP_ORDER[stepIndex - 1]) }

  // ── DNI: buscar cliente por DNI ───────────────────────────────────────────
  const handleContinuarDni = async () => {
    const dni = normalizeDni(cliente.dni)
    setDniError(null)

    if (!dni || dni.length < 7 || dni.length > 9) {
      setDniError('DNI inválido (7 a 9 dígitos)')
      return
    }

    setLoadingDni(true)
    try {
      const res = await fetch(
        `/api/booking/cliente-por-dni?negocio_id=${encodeURIComponent(negocio.id)}&dni=${encodeURIComponent(dni)}`
      )

      if (res.ok) {
        const data = await res.json().catch(() => null)
        if (data?.found && data?.cliente) {
          setCliente({
            dni,
            nombre: String(data.cliente.nombre || ''),
            email: String(data.cliente.email || ''),
            telefono: String(data.cliente.telefono || ''),
          })
          setStep('confirmacion')
          return
        }
      }

      if (res.status === 404) {
        // no existe -> completar datos
        setCliente(c => ({ ...c, dni }))
        setStep('cliente')
        return
      }

      const data = await res.json().catch(() => ({}))
      setDniError(data?.error || 'No se pudo verificar el DNI')
    } catch {
      setDniError('No se pudo verificar el DNI')
    } finally {
      setLoadingDni(false)
    }
  }

  // ── Confirm booking ───────────────────────────────────────────────────────
  const handleConfirmar = async () => {
    if (!servicio || !fecha || !hora || !profesional) return
    setLoadingConfirm(true)
    setErrorConfirm(null)
    try {
      const res = await fetch('/api/booking/turno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          negocio_id: negocio.id,
          servicio_id: servicio.id,
          profesional_id: profesional.id,
          fecha: format(fecha, 'yyyy-MM-dd'),
          hora_inicio: hora,
          cliente: { ...cliente, dni: normalizeDni(cliente.dni) },
          metodo_pago: metodoPago,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 409) throw new Error('Ese horario se acaba de ocupar. Volvé y elegí otro.')
        throw new Error(data.error || 'Error al crear la reserva')
      }
      const data = await res.json()
      setTurnoCreado(data.turno)
      if (metodoPago === 'online' && data.payment_url) {
        window.location.href = data.payment_url
      } else {
        setStep('success')
      }
    } catch (err) {
      setErrorConfirm(err instanceof Error ? err.message : 'Error al confirmar')
    } finally {
      setLoadingConfirm(false)
    }
  }

  // ── Validate ──────────────────────────────────────────────────────────────
  const validateCliente = () => {
    const errors: Partial<Pick<ClienteData, 'nombre' | 'email' | 'telefono'>> = {}
    if (!cliente.nombre.trim() || cliente.nombre.trim().length < 2)
      errors.nombre = 'Nombre requerido (mín. 2 caracteres)'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email))
      errors.email = 'Email inválido'
    if (!/^[\d\s\-\+\(\)]{10,15}$/.test(cliente.telefono.trim()))
      errors.telefono = 'Teléfono inválido (ej: 11 1234-5678)'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const mananaSlots = slots.filter(s => parseInt(s.split(':')[0]) < 12)
  const tardeSlots  = slots.filter(s => parseInt(s.split(':')[0]) >= 12)
  const visibleSlots = timeTab === 'manana' ? mananaSlots : tardeSlots

  const progress = step === 'success' ? 100 : (stepIndex / (STEP_ORDER.length - 1)) * 100
  const precioTotal = servicio?.precio || 0
  const senaPct = (negocio.mp_sena_pct ?? 50) / 100
  const seña = Math.round(precioTotal * senaPct)
  const esPagoCompleto = (negocio.mp_sena_pct ?? 50) === 100
  const fechaFormateada = fecha ? format(fecha, "EEEE d 'de' MMMM", { locale: es }) : ''

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999]"
      style={{ fontFamily: "'Plus Jakarta Sans','DM Sans',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        .rd-back{background:rgba(0,0,0,.52);backdrop-filter:blur(4px)}
        .rd-sheet{background:#fff;border-radius:24px 24px 0 0;box-shadow:0 -8px 60px rgba(0,0,0,.18);max-height:92dvh;display:flex;flex-direction:column}
        @media(min-width:640px){.rd-sheet{border-radius:20px;max-height:88dvh;width:540px}}
        .rd-scroll{overflow-y:auto;flex:1}
        .rd-scroll::-webkit-scrollbar{width:4px}
        .rd-scroll::-webkit-scrollbar-thumb{background:#e0e0e0;border-radius:4px}
        .rd-day{display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:12px;padding:10px 4px;gap:3px;border:1.5px solid #e5e7eb;background:#fafafa;cursor:pointer;transition:all .15s;min-width:0}
        .rd-day:hover:not(:disabled){border-color:var(--rdp);background:rgba(var(--rgb),.05)}
        .rd-day.sel{background:var(--rdp);border-color:var(--rdp);color:#fff}
        .rd-day.tod:not(.sel){border-color:var(--rdp)}
        .rd-day:disabled{opacity:.35;cursor:not-allowed}
        .rd-slot{padding:10px 8px;border-radius:10px;border:1.5px solid #e5e7eb;background:#fafafa;font-weight:600;font-size:.82rem;cursor:pointer;transition:all .15s;text-align:center}
        .rd-slot:hover{border-color:var(--rdp);background:rgba(var(--rgb),.06)}
        .rd-slot.sel{background:var(--rdp);border-color:var(--rdp);color:#fff}
        .rd-pro{border-radius:14px;border:2px solid #e5e7eb;padding:18px 12px;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;transition:all .15s;text-align:center;background:#fafafa;position:relative}
        .rd-pro:hover{border-color:var(--rdp);box-shadow:0 4px 16px rgba(0,0,0,.07)}
        .rd-pro.sel{border-color:var(--rdp);background:rgba(var(--rgb),.05)}
        .rd-svc{border-radius:14px;border:2px solid #e5e7eb;padding:16px;cursor:pointer;transition:all .15s;text-align:left;background:#fafafa;width:100%}
        .rd-svc:hover{border-color:var(--rdp);box-shadow:0 4px 14px rgba(0,0,0,.07)}
        .rd-svc.sel{border-color:var(--rdp);background:rgba(var(--rgb),.04)}
        .rd-pill{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:100px;font-weight:600;font-size:.82rem;border:2px solid #e5e7eb;background:#f9fafb;color:#374151;cursor:pointer;transition:all .15s;white-space:nowrap}
        .rd-pill.sel{background:var(--rdp);border-color:var(--rdp);color:#fff}
        .rd-pill:hover:not(.sel){border-color:var(--rdp)}
        .rd-av{width:52px;height:52px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1rem;border:2px solid #e5e7eb;background:rgba(var(--rgb),.1);flex-shrink:0}
        .rd-inp{width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid #e5e7eb;font-size:.9rem;outline:none;transition:border-color .15s;background:#fff}
        .rd-inp:focus{border-color:var(--rdp);box-shadow:0 0 0 3px rgba(var(--rgb),.12)}
        .rd-inp.err{border-color:#ef4444}
        .rd-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:700;font-size:.9rem;padding:0 1.5rem;height:48px;border-radius:12px;border:none;cursor:pointer;transition:filter .15s,transform .15s;width:100%;background:var(--rdp);color:#fff}
        .rd-btn:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-1px)}
        .rd-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}
        .rd-ghost{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:#fff;color:#374151;font-weight:600;font-size:.88rem;padding:0 1.25rem;height:44px;border-radius:12px;border:1.5px solid #e5e7eb;cursor:pointer;transition:background .15s;white-space:nowrap}
        .rd-ghost:hover{background:#f3f4f6}
        .rd-ghost:disabled{opacity:.5;cursor:not-allowed}
        .rd-pay{border-radius:12px;border:2px solid #e5e7eb;padding:14px 16px;cursor:pointer;transition:all .15s}
        .rd-pay.sel{border-color:var(--rdp);background:rgba(var(--rgb),.04)}
        .rd-pay:hover:not(.sel){border-color:rgba(var(--rgb),.4)}
        .rd-tab{flex:1;padding:8px;border-radius:8px;font-weight:600;font-size:.82rem;border:none;cursor:pointer;transition:all .15s}
        .rd-tab.on{color:#fff}
        .rd-tab:not(.on){background:transparent;color:#6b7280}
      `}</style>

      {/* Backdrop */}
      <div className="rd-back absolute inset-0" onClick={handleClose} />

      {/* Sheet */}
      <div
        className="rd-sheet absolute bottom-0 inset-x-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
        style={{ '--rdp': primary, '--rgb': rgb } as React.CSSProperties}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-0 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            {negocio.logo_url && (
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                <Image src={negocio.logo_url} alt={negocio.nombre} width={28} height={28} className="object-cover" />
              </div>
            )}
            <span className="text-sm font-bold text-gray-700">{negocio.nombre}</span>
          </div>
          <button onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Progress bar */}
        {step !== 'success' && (
          <div className="px-5 pt-3 pb-0 flex-shrink-0">
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: primary }} />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              {STEP_ORDER.map((s, i) => (
                <span key={s} className="text-[10px] font-semibold"
                  style={{ color: s === step ? primary : i < stepIndex ? '#9ca3af' : '#d1d5db' }}>
                  {STEP_LABELS[s]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable body */}
        <div className="rd-scroll px-5 pt-4 pb-6">

          {/* ── SUCCESS ── */}
          {step === 'success' && (
            <div className="text-center py-6 space-y-5">
              <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
                style={{ background: `rgba(${rgb},.1)` }}>
                <CheckCircle2 className="w-10 h-10" style={{ color: primary }} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">¡Reserva confirmada!</h2>
                <p className="text-gray-500 text-sm mt-1">Tu turno ha sido agendado exitosamente</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-left space-y-3 text-sm">
                {[
                  ['Negocio', negocio.nombre],
                  ['Servicio', servicio?.nombre ?? ''],
                  ['Profesional', profesional?.nombre ?? ''],
                  ['Fecha', fechaFormateada],
                  ['Hora', hora ? hora.slice(0,5) + ' hs' : ''],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-gray-900 capitalize">{value}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                💰 Abonás {formatPrice(precioTotal)} al llegar al local.
              </div>
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
                📧 Confirmación enviada a <strong>{cliente.email}</strong>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button className="rd-btn" onClick={handleClose}>Cerrar</button>
                <button className="rd-ghost" onClick={() => { reset(); setStep('servicio') }}>
                  Hacer otra reserva
                </button>
              </div>
            </div>
          )}

          {/* ── SERVICIO ── */}
          {step === 'servicio' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">¿Qué servicio querés?</h2>
                <p className="text-sm text-gray-500 mt-0.5">Elegí el servicio para continuar</p>
              </div>
              <div className="space-y-2.5">
                {servicios.map(s => {
                  const sel = servicio?.id === s.id
                  return (
                    <button key={s.id} className={`rd-svc ${sel ? 'sel' : ''}`}
                      onClick={() => { setServicio(s); setStep('datetime') }}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-bold text-gray-900">{s.nombre}</p>
                            {sel && (
                              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: primary }}>
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          {s.descripcion && <p className="text-xs text-gray-500 line-clamp-2">{s.descripcion}</p>}
                          <span className="flex items-center gap-1 text-xs text-gray-400 mt-1.5">
                            <Clock className="w-3.5 h-3.5" /> {s.duracion_min} min
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-black text-gray-900">{formatPrice(s.precio)}</p>
                          <p className="text-[10px] text-gray-400">ARS</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── DATETIME ── */}
          {step === 'datetime' && (
            <div className="space-y-5">
              {servicio && (
                <div className="flex items-center justify-between rounded-xl p-3 text-sm"
                  style={{ background: `rgba(${rgb},.07)` }}>
                  <span className="font-semibold text-gray-800">{servicio.nombre}</span>
                  <div className="flex items-center gap-3 text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {servicio.duracion_min} min</span>
                    <span className="font-bold text-gray-900">{formatPrice(servicio.precio)}</span>
                  </div>
                </div>
              )}

              {profesionalesProp.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">¿Quién prefieres?</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`rd-pill ${!profesional ? 'sel' : ''}`}
                      onClick={() => setProfesional(null)}
                    >
                      <User className="w-3.5 h-3.5" /> Primero disponible
                    </button>

                    {profesionalesProp.map(p => (
                      <button key={p.id}
                        className={`rd-pill ${profesional?.id === p.id ? 'sel' : ''}`}
                        onClick={() => setProfesional(prev => prev?.id === p.id ? null : p)}
                      >
                        {p.foto_url
                          ? <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                              <Image src={p.foto_url} alt={p.nombre} width={20} height={20} className="object-cover" />
                            </div>
                          : <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
                              style={profesional?.id === p.id
                                ? { background: 'rgba(255,255,255,.25)', color: '#fff' }
                                : { background: `rgba(${rgb},.15)`, color: primary }}>
                              {initials(p.nombre)}
                            </div>
                        }
                        {p.nombre.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Calendar */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">¿Qué día?</p>
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      onClick={() => setWeekStart(addDays(weekStart, -7))}>
                      <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    <span className="text-xs font-semibold text-gray-600 capitalize px-1 min-w-[96px] text-center">
                      {format(weekStart, 'MMMM yyyy', { locale: es })}
                    </span>
                    <button className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      onClick={() => setWeekStart(addDays(weekStart, 7))}>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map(day => {
                    const past = day < new Date() && !isSameDay(day, new Date())
                    const today = isSameDay(day, new Date())
                    const sel = fecha ? isSameDay(day, fecha) : false
                    return (
                      <button key={day.toISOString()} disabled={past}
                        onClick={() => { setFecha(day); setHora(null) }}
                        className={`rd-day ${sel ? 'sel' : ''} ${today && !sel ? 'tod' : ''}`}
                        style={sel ? { background: primary, borderColor: primary, color: '#fff' }
                          : today && !sel ? { borderColor: primary } : {}}>
                        <span className="text-[10px] font-semibold capitalize">
                          {format(day, 'EEE', { locale: es })}
                        </span>
                        <span className="text-sm font-bold">{format(day, 'd')}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Slots */}
              {fecha && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">¿A qué hora?</p>
                  <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-3">
                    {(['manana', 'tarde'] as const).map(t => (
                      <button key={t} className={`rd-tab ${timeTab === t ? 'on' : ''}`}
                        style={timeTab === t ? { background: primary } : {}}
                        onClick={() => setTimeTab(t)}>
                        {t === 'manana' ? 'Mañana' : 'Tarde'}
                        {t === 'manana' && mananaSlots.length > 0 && <span className="opacity-70 ml-1">({mananaSlots.length})</span>}
                        {t === 'tarde' && tardeSlots.length > 0 && <span className="opacity-70 ml-1">({tardeSlots.length})</span>}
                      </button>
                    ))}
                  </div>

                  {loadingSlots ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" style={{ color: primary }} />
                    </div>
                  ) : noTrabajaMsg ? (
                    <p className="text-center text-sm text-gray-500 py-6">{noTrabajaMsg}</p>
                  ) : visibleSlots.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-6">
                      No hay horarios {timeTab === 'manana' ? 'por la mañana' : 'por la tarde'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {visibleSlots.map(s => (
                        <button key={s} className={`rd-slot ${hora === s ? 'sel' : ''}`}
                          style={hora === s ? { background: primary, borderColor: primary, color: '#fff' } : {}}
                          onClick={() => setHora(s)}>
                          {s.slice(0,5)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button className="rd-ghost" onClick={goBack}><ChevronLeft className="w-4 h-4" /> Volver</button>

                <button
                  className="rd-btn"
                  disabled={!fecha || !hora || !!noTrabajaMsg}
                  onClick={async () => {
                    if (!fecha || !hora) return

                    // ✅ Si ya eligió un profesional, salteamos el paso "profesional"
                    if (profesional?.id) {
                      setStep('dni')
                      return
                    }

                    // "Primero disponible" -> mantenemos flujo original
                    await loadProfes(format(fecha, 'yyyy-MM-dd'), hora)
                    setStep('profesional')
                  }}
                >
                  Continuar <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── PROFESIONAL ── */}
          {step === 'profesional' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">Elegí tu profesional</h2>
                <p className="text-sm text-gray-500 mt-0.5 capitalize">{fechaFormateada} · {hora?.slice(0,5)} hs</p>
              </div>
              {loadingProfes
                ? <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin" style={{ color: primary }} /></div>
                : profesDisponibles.length === 0
                  ? <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="font-semibold text-gray-800 mb-1">Sin disponibilidad</p>
                      <p className="text-sm text-gray-500 mb-4">Probá con otro horario.</p>
                      <button className="rd-ghost" onClick={goBack}><ChevronLeft className="w-4 h-4" /> Cambiar horario</button>
                    </div>
                  : <>
                      <div className="grid grid-cols-2 gap-3">
                        {profesDisponibles.map(p => {
                          const sel = profesional?.id === p.id
                          return (
                            <button key={p.id} className={`rd-pro ${sel ? 'sel' : ''}`} onClick={() => setProfesional(p)}>
                              {sel && (
                                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: primary }}>
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              )}
                              <div className="rd-av" style={sel ? { borderColor: primary } : {}}>
                                {p.foto_url
                                  ? <Image src={p.foto_url} alt={p.nombre} width={52} height={52} className="object-cover w-full h-full" />
                                  : <span style={{ color: primary }}>{initials(p.nombre)}</span>
                                }
                              </div>
                              <p className="font-bold text-gray-900 text-sm">{p.nombre.split(' ')[0]}</p>
                              {p.especialidad && <p className="text-xs text-gray-400">{p.especialidad}</p>}
                            </button>
                          )
                        })}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button className="rd-ghost" onClick={goBack}><ChevronLeft className="w-4 h-4" /> Volver</button>
                        <button className="rd-btn" disabled={!profesional} onClick={() => setStep('dni')}>
                          Continuar <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </>
              }
            </div>
          )}

          {/* ── DNI ── */}
          {step === 'dni' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">Ingresá tu DNI</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Si ya estás registrado, completamos tus datos automáticamente.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1.5">
                  DNI <span className="text-red-500">*</span>
                </label>
                <input
                  className={`rd-inp ${dniError ? 'err' : ''}`}
                  inputMode="numeric"
                  placeholder="Ej: 40123456"
                  value={cliente.dni}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d]/g, '')
                    setCliente(c => ({ ...c, dni: val }))
                    setDniError(null)
                  }}
                />
                {dniError && <p className="text-xs text-red-500 mt-1">{dniError}</p>}
              </div>

              <div className="flex gap-2 pt-2">
                <button className="rd-ghost" onClick={goBack} disabled={loadingDni}>
                  <ChevronLeft className="w-4 h-4" /> Volver
                </button>
                <button className="rd-btn" onClick={handleContinuarDni} disabled={loadingDni}>
                  {loadingDni
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
                    : <>Continuar <ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </div>
            </div>
          )}

          {/* ── CLIENTE ── */}
          {step === 'cliente' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">Tus datos</h2>
                <p className="text-sm text-gray-500 mt-0.5">Para enviarte la confirmación</p>
              </div>

              {/* DNI fijo (solo visual) */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm flex items-center gap-2">
                <IdCard className="w-4 h-4" style={{ color: primary }} />
                <span className="text-gray-700 font-semibold">DNI: {normalizeDni(cliente.dni)}</span>
              </div>

              <div className="space-y-3">
                {([
                  { f: 'nombre' as const, label: 'Nombre completo', type: 'text', ph: 'Juan Pérez' },
                  { f: 'email' as const, label: 'Email', type: 'email', ph: 'tu@email.com' },
                  { f: 'telefono' as const, label: 'Teléfono', type: 'tel', ph: '11 1234-5678' },
                ]).map(({ f, label, type, ph }) => (
                  <div key={f}>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">
                      {label} <span className="text-red-500">*</span>
                    </label>
                    <input className={`rd-inp ${formErrors[f] ? 'err' : ''}`} type={type} placeholder={ph}
                      value={cliente[f]}
                      onChange={e => {
                        setCliente(c => ({ ...c, [f]: e.target.value }))
                        setFormErrors(fe => ({ ...fe, [f]: undefined }))
                      }} />
                    {formErrors[f] && <p className="text-xs text-red-500 mt-1">{formErrors[f]}</p>}
                    {f === 'telefono' && !formErrors.telefono && (
                      <p className="text-xs text-gray-400 mt-1">Recibirás confirmación por WhatsApp</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button className="rd-ghost" onClick={goBack}><ChevronLeft className="w-4 h-4" /> Volver</button>
                <button className="rd-btn" onClick={() => { if (validateCliente()) setStep('confirmacion') }}>
                  Continuar <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── CONFIRMACIÓN ── */}
          {step === 'confirmacion' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">Confirmá tu reserva</h2>
                <p className="text-sm text-gray-500 mt-0.5">Verificá que todo esté bien</p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `rgba(${rgb},.1)` }}>
                    <Calendar className="w-4 h-4" style={{ color: primary }} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 capitalize">{fechaFormateada}</p>
                    <p className="text-gray-400 text-xs">{hora?.slice(0,5)} hs · {servicio?.duracion_min} min</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="font-black text-gray-900 text-base">{formatPrice(precioTotal)}</p>
                    <p className="text-[10px] text-gray-400">ARS</p>
                  </div>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex items-center gap-3">
                  <div className="rd-av" style={{ width: 36, height: 36, fontSize: '.72rem' }}>
                    {profesional?.foto_url
                      ? <Image src={profesional.foto_url} alt={profesional.nombre} width={36} height={36} className="object-cover w-full h-full" />
                      : <span style={{ color: primary }}>{initials(profesional?.nombre || '')}</span>
                    }
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{profesional?.nombre}</p>
                    <p className="text-xs text-gray-400">{servicio?.nombre}</p>
                  </div>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="space-y-1.5 text-xs text-gray-500">
                  {[
                    [<IdCard key="d" className="w-3.5 h-3.5" />, normalizeDni(cliente.dni)],
                    [<User key="u" className="w-3.5 h-3.5" />, cliente.nombre],
                    [<Mail key="m" className="w-3.5 h-3.5" />, cliente.email],
                    [<Phone key="p" className="w-3.5 h-3.5" />, cliente.telefono],
                  ].map(([icon, text], i) => (
                    <div key={i} className="flex items-center gap-2">{icon}{text}</div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Método de pago</p>
                <div className="space-y-2">
                  {negocio.tiene_mp && (
                  <div className={`rd-pay ${metodoPago === 'online' ? 'sel' : ''}`} onClick={() => setMetodoPago('online')}>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={metodoPago === 'online' ? { borderColor: primary, background: primary } : { borderColor: '#d1d5db' }}>
                        {metodoPago === 'online' && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-4 h-4" style={{ color: primary }} />
                          <span className="font-bold text-gray-900 text-sm">
                            {esPagoCompleto ? 'Pagar online' : 'Pagar seña online'}
                          </span>
                          {!esPagoCompleto && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Recomendado</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {esPagoCompleto
                            ? <><strong>{formatPrice(precioTotal)}</strong> — pago total online</>
                            : <>Pagás solo <strong>{formatPrice(seña)}</strong> ahora · resto en el local</>
                          }
                        </p>
                        <p className="text-xs font-medium mt-1" style={{ color: primary }}>💳 Pago seguro con MercadoPago</p>
                      </div>
                    </div>
                  </div>
                  )}
                  <div className={`rd-pay ${metodoPago === 'local' ? 'sel' : ''}`} onClick={() => setMetodoPago('local')}>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={metodoPago === 'local' ? { borderColor: primary, background: primary } : { borderColor: '#d1d5db' }}>
                        {metodoPago === 'local' && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Wallet className="w-4 h-4 text-gray-500" />
                          <span className="font-bold text-gray-900 text-sm">Pagar en el local</span>
                        </div>
                        <p className="text-xs text-gray-500">Total <strong>{formatPrice(precioTotal)}</strong> al llegar · efectivo o tarjeta</p>
                        <p className="text-xs text-amber-600 font-medium mt-1">⚠️ Turno pendiente de confirmación</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {errorConfirm && (
                <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 p-3.5">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{errorConfirm}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button className="rd-ghost" onClick={goBack} disabled={loadingConfirm}><ChevronLeft className="w-4 h-4" /> Volver</button>
                <button className="rd-btn" disabled={loadingConfirm} onClick={handleConfirmar}>
                  {loadingConfirm
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                    : metodoPago === 'online'
                      ? <><CreditCard className="w-4 h-4" /> Pagar {esPagoCompleto ? formatPrice(precioTotal) : formatPrice(seña)}</>
                      : <><CheckCircle2 className="w-4 h-4" /> Confirmar reserva</>
                  }
                </button>
              </div>
              <p className="text-[11px] text-center text-gray-400 pt-1">
                Al confirmar aceptás las políticas de reserva del negocio
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
