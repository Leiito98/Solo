import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Clock, User, ArrowLeft, RotateCcw } from 'lucide-react'

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ turno_id?: string }>
}

function isValidHex(h: string | null | undefined): h is string {
  return typeof h === 'string' && /^#[0-9a-fA-F]{6}$/.test(h.trim())
}
function hexToRgb(hex: string) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

export default async function ReservaExitosaPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { turno_id } = await searchParams

  if (!turno_id) redirect(`/negocio/${slug}`)

  const supabase = await createClient()

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id, nombre, slug, logo_url, color_primario, color_secundario')
    .eq('slug', slug)
    .single()

  if (!negocio) redirect('/')

  const { data: turno } = await supabase
    .from('turnos')
    .select(`
      id, fecha, hora_inicio, hora_fin, pago_monto,
      servicios(nombre, precio),
      profesionales(nombre, foto_url, especialidad),
      clientes(nombre, email)
    `)
    .eq('id', turno_id)
    .eq('negocio_id', negocio.id)
    .single()

  if (!turno) redirect(`/negocio/${slug}`)

  const servicio    = Array.isArray(turno.servicios)     ? turno.servicios[0]     : turno.servicios
  const profesional = Array.isArray(turno.profesionales) ? turno.profesionales[0] : turno.profesionales
  const cliente     = Array.isArray(turno.clientes)      ? turno.clientes[0]      : turno.clientes

  const fechaFormateada = format(new Date(turno.fecha + 'T00:00:00'), "EEEE d 'de' MMMM", { locale: es })
  const seña        = turno.pago_monto || 0
  const precioTotal = (servicio as any)?.precio || 0
  const resto       = precioTotal - seña
  const esPagoCompleto = resto === 0

  const primary   = isValidHex((negocio as any).color_primario)   ? (negocio as any).color_primario!.trim()   : '#111827'
  const secondary = isValidHex((negocio as any).color_secundario) ? (negocio as any).color_secundario!.trim() : '#374151'
  const { r: pr, g: pg, b: pb } = hexToRgb(primary)

  const proNombre   = (profesional as any)?.nombre      || ''
  const proFoto     = (profesional as any)?.foto_url    || null
  const proEsp      = (profesional as any)?.especialidad || null
  const proInitials = proNombre.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div
      className="min-h-screen bg-[#f7f7f8]"
      style={{ fontFamily: "'Plus Jakarta Sans','DM Sans',system-ui,sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        :root { --p:${primary};--s:${secondary};--p-r:${pr};--p-g:${pg};--p-b:${pb}; }
        *{box-sizing:border-box}

        .ex-nav{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.95);backdrop-filter:blur(10px);border-bottom:1px solid #eeeff2}

        @keyframes ring-pop {
          0%   { transform:scale(.5); opacity:0 }
          65%  { transform:scale(1.1) }
          100% { transform:scale(1);  opacity:1 }
        }
        @keyframes check-draw {
          from { stroke-dashoffset:60 }
          to   { stroke-dashoffset:0  }
        }
        @keyframes slide-up {
          from { transform:translateY(20px); opacity:0 }
          to   { transform:translateY(0);    opacity:1 }
        }
        @keyframes pulse-ring {
          0%   { transform:scale(1);    opacity:.35 }
          50%  { transform:scale(1.12); opacity:.12 }
          100% { transform:scale(1);    opacity:.35 }
        }

        .success-ring  { animation:ring-pop .55s cubic-bezier(.34,1.56,.64,1) .05s both }
        .pulse-ring    { animation:pulse-ring 2.2s ease-in-out 1s infinite }
        .check-path    { stroke-dasharray:60; stroke-dashoffset:60; animation:check-draw .45s ease-out .55s forwards }
        .slide-1       { animation:slide-up .4s ease-out .15s both }
        .slide-2       { animation:slide-up .4s ease-out .3s  both }
        .slide-3       { animation:slide-up .4s ease-out .45s both }
        .slide-4       { animation:slide-up .4s ease-out .6s  both }

        .badge{display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:100px;font-size:.72rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;background:rgba(var(--p-r),var(--p-g),var(--p-b),.1);color:var(--p);border:1px solid rgba(var(--p-r),var(--p-g),var(--p-b),.2)}

        .btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--p);color:#fff;font-weight:700;font-size:.9rem;padding:0 1.5rem;height:48px;border-radius:12px;border:none;cursor:pointer;transition:filter .15s,transform .15s;text-decoration:none;white-space:nowrap}
        .btn-primary:hover{filter:brightness(1.08);transform:translateY(-1px)}
        .btn-outline{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#fff;color:var(--p);font-weight:600;font-size:.9rem;padding:0 1.25rem;height:48px;border-radius:12px;border:1.5px solid rgba(var(--p-r),var(--p-g),var(--p-b),.25);transition:background .15s,border-color .15s;text-decoration:none;white-space:nowrap}
        .btn-outline:hover{background:rgba(var(--p-r),var(--p-g),var(--p-b),.05);border-color:var(--p)}

        .detail-row{display:flex;align-items:center;gap:14px;padding:14px 16px;background:#f9fafb;border-radius:12px;border:1.5px solid #eeeff2}

        .solo-footer{margin-top:8px;border-top:1px solid #eeeff2;padding:28px 0 24px}
        .solo-footer-card{display:flex;align-items:center;justify-content:space-between;gap:24px;background:#fff;border-radius:20px;border:1px solid #e8e8ec;box-shadow:0 2px 12px rgba(0,0,0,.06);padding:20px 24px;position:relative;overflow:hidden}
        .solo-cta-btn{display:inline-flex;align-items:center;gap:7px;color:#fff;font-weight:700;font-size:.83rem;padding:0 18px;height:40px;border-radius:10px;text-decoration:none;transition:filter .15s,transform .15s;white-space:nowrap;background:var(--p)}
        .solo-cta-btn:hover{filter:brightness(1.08);transform:translateY(-1px)}
        .solo-mockup{position:relative;width:210px;height:125px;flex-shrink:0}
        .solo-screen{position:absolute;border-radius:8px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.12);border:1px solid #e5e7eb}

        @media(max-width:640px){
          .btn-primary,.btn-outline{height:44px;font-size:.85rem}
          .solo-footer-card{flex-direction:column;text-align:center;align-items:flex-start}
          .solo-mockup{display:none}
        }
      `}</style>

      {/* NAV */}
      <nav className="ex-nav">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          {(negocio as any).logo_url && (
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
              <Image src={(negocio as any).logo_url} alt={negocio.nombre} width={32} height={32} className="object-cover w-full h-full" />
            </div>
          )}
          <span className="text-sm font-bold text-gray-900 truncate">{negocio.nombre}</span>
        </div>
      </nav>

      {/* COLOR STRIP */}
      <div className="w-full h-1" style={{ background: `linear-gradient(90deg,${primary},${secondary})` }} />

      {/* CONTENT */}
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">

        {/* ── SUCCESS HERO ── */}
        <div className="text-center space-y-5 slide-1">
          <div className="flex justify-center">
            <div className="relative">
              <div
                className="pulse-ring absolute inset-0 rounded-full"
                style={{ background: `rgba(${pr},${pg},${pb},0.15)` }}
              />
              <div
                className="success-ring relative w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: `rgba(${pr},${pg},${pb},0.08)`,
                  border: `2.5px solid rgba(${pr},${pg},${pb},0.35)`,
                  boxShadow: `0 0 0 6px rgba(${pr},${pg},${pb},0.07), 0 8px 32px rgba(${pr},${pg},${pb},0.2)`,
                }}
              >
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                  <path
                    className="check-path"
                    d="M11 22L18.5 29.5L33 15"
                    stroke={primary}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="badge">✓ Pago confirmado</span>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">¡Todo listo!</h1>
            <p className="text-gray-500">
              Tu turno está confirmado en{' '}
              <span className="font-semibold text-gray-800">{negocio.nombre}</span>
            </p>
          </div>
        </div>

        {/* ── PAYMENT CARD ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden slide-2">
          <div className="h-1" style={{ background: `linear-gradient(90deg,${primary},${secondary})` }} />
          <div className="p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Resumen del pago</span>
              {esPagoCompleto ? (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                  100% abonado ✓
                </span>
              ) : (
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: `rgba(${pr},${pg},${pb},0.1)`, color: primary }}
                >
                  Seña abonada
                </span>
              )}
            </div>

            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: `rgba(${pr},${pg},${pb},0.06)`, border: `1.5px solid rgba(${pr},${pg},${pb},0.15)` }}
            >
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  {esPagoCompleto ? 'Total abonado' : 'Seña abonada'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">vía MercadoPago</p>
              </div>
              <span className="text-2xl font-black" style={{ color: primary }}>
                ${seña.toLocaleString('es-AR')}
              </span>
            </div>

            {!esPagoCompleto && (
              <>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50" style={{ border: '1.5px solid #eeeff2' }}>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Resto al llegar</p>
                    <p className="text-xs text-gray-400 mt-0.5">efectivo o tarjeta en el local</p>
                  </div>
                  <span className="text-2xl font-black text-gray-800">
                    ${resto.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-gray-400">Total del servicio</span>
                  <span className="text-sm font-bold text-gray-500">${precioTotal.toLocaleString('es-AR')}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── TURNO DETAILS ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-3 slide-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tu turno</p>

          <div className="detail-row">
            {proFoto ? (
              <div
                className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 border-2"
                style={{ borderColor: `rgba(${pr},${pg},${pb},0.3)` }}
              >
                <Image src={proFoto} alt={proNombre} width={44} height={44} className="object-cover w-full h-full" />
              </div>
            ) : (
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-black"
                style={{ background: `rgba(${pr},${pg},${pb},0.1)`, color: primary }}
              >
                {proInitials || <User className="w-4 h-4" />}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-gray-900">{proNombre || 'N/A'}</p>
              {proEsp && <p className="text-xs text-gray-400">{proEsp}</p>}
              {servicio && (
                <p className="text-xs font-semibold mt-0.5" style={{ color: primary }}>
                  {(servicio as any).nombre}
                </p>
              )}
            </div>
          </div>

          <div className="detail-row">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `rgba(${pr},${pg},${pb},0.1)` }}
            >
              <Calendar className="w-5 h-5" style={{ color: primary }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Fecha</p>
              <p className="font-bold text-gray-900 capitalize">{fechaFormateada}</p>
            </div>
          </div>

          <div className="detail-row">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `rgba(${pr},${pg},${pb},0.1)` }}
            >
              <Clock className="w-5 h-5" style={{ color: primary }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Horario</p>
              <p className="font-bold text-gray-900">
                {String(turno.hora_inicio).slice(0, 5)} – {String(turno.hora_fin).slice(0, 5)} hs
              </p>
            </div>
          </div>
        </div>

        {/* ── NOTICES ── */}
        <div className="space-y-3 slide-4">
          <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-xl flex-shrink-0 mt-0.5">📧</span>
            <p className="text-sm text-gray-600">
              Te enviamos la confirmación a{' '}
              <strong className="text-gray-900">{(cliente as any)?.email || 'tu email'}</strong>
            </p>
          </div>

          {!esPagoCompleto && (
            <div
              className="flex items-start gap-3 p-4 rounded-2xl border"
              style={{
                background: `rgba(${pr},${pg},${pb},0.04)`,
                borderColor: `rgba(${pr},${pg},${pb},0.18)`,
              }}
            >
              <span className="text-xl flex-shrink-0 mt-0.5">💳</span>
              <div className="text-sm">
                <p className="font-semibold" style={{ color: primary }}>Recordá llevar</p>
                <p className="text-gray-600 mt-0.5">
                  <strong className="text-gray-800">${resto.toLocaleString('es-AR')}</strong> para abonar al llegar · efectivo o tarjeta
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <span className="text-xl flex-shrink-0 mt-0.5">⏰</span>
            <p className="text-sm text-amber-800">
              Llegá <strong>5 minutos antes</strong> · Recibirás un recordatorio 24 hs antes de tu turno
            </p>
          </div>
        </div>

        {/* ── CTAs ── */}
        <div className="flex flex-col sm:flex-row gap-3 slide-4">
          <Link href={`/negocio/${slug}`} className="btn-primary flex-1 text-center">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>
          <Link href={`/negocio/${slug}/`} className="btn-outline flex-1 text-center">
            <RotateCcw className="w-4 h-4" /> Otra reserva
          </Link>
        </div>

        {/* ── FOOTER SOLO ── */}
        <div className="solo-footer slide-4">
          <div className="solo-footer-card">

            {/* Fondo decorativo sutil */}
            <div
              style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', opacity: .04,
                background: `radial-gradient(ellipse at 75% 50%, ${primary} 0%, transparent 65%)`,
              }}
            />

            {/* Columna izquierda: logo + copy + CTA */}
            <div className="relative flex flex-col gap-3 flex-1 min-w-0">

              {/* Logo real de GetSolo */}
              <div className="flex items-center gap-2">
                <a href="https://getsolo.site" target="_blank" rel="noopener noreferrer" className="inline-block w-fit">
                  <Image
                    src="/logo/solo.png"
                    alt="GetSolo"
                    width={80}
                    height={28}
                    className="object-contain"
                    style={{ height: 24, width: 'auto' }}
                  />
                </a>
                <a href="https://getsolo.site" className="text-xs font-bold text-gray-400 uppercase tracking-widest">GetSolo</a>
              </div>
              <div>
                <p className="font-black text-gray-900 text-[15px] leading-snug">
                  ¿Querés que tus clientes<br className="hidden sm:block" /> reserven así de fácil?
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Creá tu página de turnos online en minutos. Gratis.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <a
                  href="https://getsolo.site"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="solo-cta-btn w-fit"
                >
                  Probá GetSolo gratis →
                </a>
                <p className="text-[11px] text-gray-400">Turnos · WhatsApp · Pagos online</p>
              </div>
            </div>

            {/* Columna derecha: mockup CSS */}
            <div className="solo-mockup">

              {/* Pantalla principal — calendario */}
              <div className="solo-screen" style={{ width: 138, height: 88, top: 0, right: 0, background: '#fff' }}>
                <div style={{ height: 18, background: primary, display: 'flex', alignItems: 'center', padding: '0 8px', gap: 4 }}>
                  <div style={{ width: 38, height: 5, borderRadius: 3, background: 'rgba(255,255,255,.65)' }} />
                  <div style={{ flex: 1 }} />
                  <div style={{ width: 12, height: 5, borderRadius: 3, background: 'rgba(255,255,255,.4)' }} />
                </div>
                <div style={{ padding: '6px 8px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[
                    { color: `rgba(${pr},${pg},${pb},0.85)`, w: '78%', label: '09:00' },
                    { color: '#34d399',                       w: '62%', label: '10:30' },
                    { color: `rgba(${pr},${pg},${pb},0.45)`, w: '88%', label: '12:00' },
                    { color: '#f59e0b',                       w: '52%', label: '15:00' },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 7, color: '#9ca3af', width: 24, flexShrink: 0 }}>{row.label}</span>
                      <div style={{ height: 9, borderRadius: 3, background: row.color, width: row.w }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pantalla secundaria — card confirmación */}
              <div className="solo-screen" style={{ width: 98, height: 70, bottom: 0, left: 0, background: '#fff', padding: '7px 8px' }}>
                <p style={{ fontSize: 7, fontWeight: 800, color: '#111827', marginBottom: 5 }}>✅ Turno confirmado</p>
                {[
                  { label: 'Cliente', val: 'María G.' },
                  { label: 'Hora',    val: '10:30 hs' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 6.5, color: '#9ca3af' }}>{r.label}</span>
                    <span style={{ fontSize: 6.5, fontWeight: 700, color: '#374151' }}>{r.val}</span>
                  </div>
                ))}
                <div style={{ marginTop: 6, height: 13, borderRadius: 4, background: primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 6, color: '#fff', fontWeight: 700 }}>Ver turno</span>
                </div>
              </div>
            </div>
          </div>

          {/* Crédito mínimo */}
          <p className="text-center text-[11px] text-gray-400 mt-3">
            Reservas gestionadas por{' '}
            <a
              href="https://getsolo.site"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              GetSolo
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}