'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, User, Scissors, AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react'

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
function formatFecha(fechaYYYYMMDD: string) {
  const [y, m, d] = fechaYYYYMMDD.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ─── Props ───────────────────────────────────────────────────────────────────

type Props = {
  negocioNombre: string
  negocioSlug: string
  logoUrl: string | null
  colorPrimario: string | null
  colorSecundario: string | null
  token: string
  turno: {
    id: string
    estado: string
    fecha: string
    hora_inicio: string
    hora_fin: string
    servicio: string | null
    profesional: string | null
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CancelarTurnoClient({
  negocioNombre,
  negocioSlug,
  logoUrl,
  colorPrimario,
  colorSecundario,
  token,
  turno,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false) // muestra el paso de confirmación

  const primary = isValidHex(colorPrimario) ? colorPrimario!.trim() : '#111827'
  const secondary = isValidHex(colorSecundario) ? colorSecundario!.trim() : '#374151'
  const { r: pr, g: pg, b: pb } = hexToRgb(primary)

  // Ya cancelado desde antes
  const yaEstabaCancelado = turno.estado === 'cancelado'

  const cancelar = async () => {
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch('/api/booking/cancelar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'No se pudo cancelar')
      setOk(true)
    } catch (e: any) {
      setErr(e?.message || 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-[#f7f7f8]"
      style={{ fontFamily: "'Plus Jakarta Sans','DM Sans',system-ui,sans-serif" }}
    >
      {/* ── CSS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        :root{--p:${primary};--s:${secondary};--p-r:${pr};--p-g:${pg};--p-b:${pb}}
        *{box-sizing:border-box}

        .nav{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.95);backdrop-filter:blur(10px);border-bottom:1px solid #eeeff2}

        @keyframes slide-up{from{transform:translateY(18px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes fade-in{from{opacity:0}to{opacity:1}}
        @keyframes check-pop{0%{transform:scale(.4);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
        @keyframes warning-shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-4px)}40%,80%{transform:translateX(4px)}}

        .s1{animation:slide-up .38s ease-out .05s both}
        .s2{animation:slide-up .38s ease-out .15s both}
        .s3{animation:slide-up .38s ease-out .25s both}
        .s4{animation:slide-up .38s ease-out .35s both}
        .check-anim{animation:check-pop .5s cubic-bezier(.34,1.56,.64,1) both}
        .warn-anim{animation:warning-shake .45s ease-in-out .1s both}

        .detail-row{display:flex;align-items:center;gap:14px;padding:14px 16px;background:#f9fafb;border-radius:12px;border:1.5px solid #eeeff2}

        .btn-danger{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#ef4444;color:#fff;font-weight:700;font-size:.92rem;padding:0 1.5rem;height:50px;border-radius:12px;border:none;cursor:pointer;transition:filter .15s,transform .15s;width:100%}
        .btn-danger:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-1px)}
        .btn-danger:disabled{opacity:.6;cursor:not-allowed;transform:none}

        .btn-ghost{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#fff;color:#374151;font-weight:600;font-size:.9rem;padding:0 1.25rem;height:50px;border-radius:12px;border:1.5px solid #e5e7eb;transition:background .15s,border-color .15s;width:100%;text-decoration:none}
        .btn-ghost:hover{background:#f9fafb;border-color:#d1d5db}

        .btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--p);color:#fff;font-weight:700;font-size:.92rem;padding:0 1.5rem;height:50px;border-radius:12px;border:none;cursor:pointer;transition:filter .15s,transform .15s;width:100%;text-decoration:none}
        .btn-primary:hover{filter:brightness(1.08);transform:translateY(-1px)}

        /* ── FOOTER SOLO (igual a reserva-exitosa) ── */
        .solo-footer{margin-top:8px;border-top:1px solid #eeeff2;padding:28px 0 24px}
        .solo-footer-card{display:flex;align-items:center;justify-content:space-between;gap:24px;background:#fff;border-radius:20px;border:1px solid #e8e8ec;box-shadow:0 2px 12px rgba(0,0,0,.06);padding:20px 24px;position:relative;overflow:hidden}
        .solo-cta-btn{display:inline-flex;align-items:center;gap:7px;color:#fff;font-weight:700;font-size:.83rem;padding:0 18px;height:40px;border-radius:10px;text-decoration:none;transition:filter .15s,transform .15s;white-space:nowrap;background:var(--p)}
        .solo-cta-btn:hover{filter:brightness(1.08);transform:translateY(-1px)}
        .solo-mockup{position:relative;width:210px;height:125px;flex-shrink:0}
        .solo-screen{position:absolute;border-radius:8px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.12);border:1px solid #e5e7eb}

        @media(max-width:640px){
          .solo-footer-card{flex-direction:column;text-align:center;align-items:flex-start}
          .solo-mockup{display:none}
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center gap-3">
          {logoUrl ? (
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
              <Image
                src={logoUrl}
                alt={negocioNombre}
                width={32}
                height={32}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black text-white"
              style={{ background: primary }}
            >
              {negocioNombre.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-bold text-gray-900 truncate">{negocioNombre}</span>
        </div>
      </nav>

      {/* ── COLOR STRIP ── */}
      <div className="w-full h-1" style={{ background: `linear-gradient(90deg,${primary},${secondary})` }} />

      {/* ── CONTENT ── */}
      <div className="max-w-xl mx-auto px-4 py-10 space-y-4">
        {/* Estado: ya cancelado */}
        {yaEstabaCancelado && (
          <div className="s1 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center check-anim">
                <CheckCircle2 className="w-10 h-10 text-gray-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Turno ya cancelado</h1>
              <p className="text-gray-500 text-sm mt-1">Este turno ya fue cancelado anteriormente.</p>
            </div>
            <Link href={`/negocio/${negocioSlug}`} className="btn-primary s2">
              <ArrowLeft className="w-4 h-4" /> Volver al inicio
            </Link>
          </div>
        )}

        {/* Estado: cancelado exitosamente ahora */}
        {!yaEstabaCancelado && ok && (
          <div className="s1 text-center space-y-5">
            <div className="flex justify-center">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center check-anim"
                style={{
                  background: `rgba(${pr},${pg},${pb},0.08)`,
                  border: `2.5px solid rgba(${pr},${pg},${pb},0.25)`,
                  boxShadow: `0 0 0 6px rgba(${pr},${pg},${pb},0.06), 0 8px 32px rgba(${pr},${pg},${pb},0.15)`,
                }}
              >
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                  <path
                    d="M11 22L18.5 29.5L33 15"
                    stroke={primary}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-1 s2">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Turno cancelado</h1>
              <p className="text-gray-500">Tu turno fue cancelado exitosamente.</p>
            </div>
            <div className="flex flex-col gap-3 s3">
              <Link href={`/negocio/${negocioSlug}`} className="btn-primary">
                <ArrowLeft className="w-4 h-4" /> Reservar otro turno
              </Link>
            </div>
          </div>
        )}

        {/* Estado: flujo normal */}
        {!yaEstabaCancelado && !ok && (
          <>
            {/* Header */}
            <div className="s1 text-center space-y-2">
              <div
                className="warn-anim mx-auto w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '2.5px solid rgba(239,68,68,0.22)',
                  boxShadow: '0 0 0 6px rgba(239,68,68,0.05)',
                }}
              >
                <AlertTriangle className="w-9 h-9 text-red-500" />
              </div>
              <div className="pt-1">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Cancelar turno</h1>
                <p className="text-gray-500 text-sm mt-1">¿Estás seguro? Esta acción no se puede deshacer.</p>
              </div>
            </div>

            {/* Detalle del turno */}
            <div className="s2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-1" style={{ background: `linear-gradient(90deg,${primary},${secondary})` }} />
              <div className="p-5 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tu turno</p>

                {/* Servicio / Profesional */}
                <div className="detail-row">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `rgba(${pr},${pg},${pb},0.1)` }}
                  >
                    <Scissors className="w-5 h-5" style={{ color: primary }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Servicio</p>
                    <p className="font-bold text-gray-900">{turno.servicio || '—'}</p>
                    {turno.profesional && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3" /> {turno.profesional}
                      </p>
                    )}
                  </div>
                </div>

                {/* Fecha */}
                <div className="detail-row">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `rgba(${pr},${pg},${pb},0.1)` }}
                  >
                    <Calendar className="w-5 h-5" style={{ color: primary }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Fecha</p>
                    <p className="font-bold text-gray-900 capitalize">{formatFecha(turno.fecha)}</p>
                  </div>
                </div>

                {/* Hora */}
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
            </div>

            {/* Aviso */}
            <div className="s3 flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <span className="text-lg flex-shrink-0 mt-0.5">💡</span>
              <p className="text-sm text-amber-800">
                Si querés reprogramar, podés{' '}
                <Link href={`/negocio/${negocioSlug}`} className="font-semibold underline underline-offset-2">
                  reservar un nuevo turno
                </Link>{' '}
                después de cancelar este.
              </p>
            </div>

            {/* Error */}
            {err && (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100 text-sm text-red-800">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {err}
              </div>
            )}

            {/* CTAs */}
            {!confirmed ? (
              <div className="s4 flex flex-col sm:flex-row gap-3">
                <Link href={`/negocio/${negocioSlug}`} className="btn-ghost">
                  <ArrowLeft className="w-4 h-4" /> Mantener turno
                </Link>
                <button className="btn-danger" onClick={() => setConfirmed(true)}>
                  <AlertTriangle className="w-4 h-4" /> Sí, cancelar
                </button>
              </div>
            ) : (
              <div className="s4 space-y-3">
                <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-center">
                  <p className="text-sm font-bold text-red-800">⚠️ ¿Confirmás la cancelación?</p>
                  <p className="text-xs text-red-600 mt-1">Esta acción es irreversible.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="btn-ghost" onClick={() => setConfirmed(false)} disabled={loading}>
                    Volver atrás
                  </button>
                  <button className="btn-danger" onClick={cancelar} disabled={loading}>
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{' '}
                        Cancelando...
                      </>
                    ) : (
                      'Confirmar cancelación'
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── FOOTER SOLO (igual a reserva-exitosa) ── */}
        <div className="solo-footer s4">
          <div className="solo-footer-card">
            {/* Fondo decorativo sutil */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                opacity: 0.04,
                background: `radial-gradient(ellipse at 75% 50%, ${primary} 0%, transparent 65%)`,
              }}
            />

            {/* Columna izquierda: logo + copy + CTA */}
            <div className="relative flex flex-col gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <a href="https://getsolo.site" target="_blank" rel="noopener noreferrer" className="inline-block w-fit">
                  <Image
                    src="/logo/solo.png"
                    alt="Solo"
                    width={80}
                    height={28}
                    className="object-contain"
                    style={{ height: 24, width: 'auto' }}
                  />
                </a>
                <a
                  href="https://getsolo.site"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-gray-400 uppercase tracking-widest"
                >
                  Solo
                </a>
              </div>

              <div>
                <p className="font-black text-gray-900 text-[15px] leading-snug">
                  ¿Querés que tus clientes
                  <br className="hidden sm:block" /> reserven así de fácil?
                </p>
                <p className="text-xs text-gray-400 mt-1">Creá tu página de turnos online en minutos. Gratis.</p>
              </div>

              <div className="flex flex-col gap-2">
                <a href="https://getsolo.site" target="_blank" rel="noopener noreferrer" className="solo-cta-btn w-fit">
                  Probá Solo gratis →
                </a>
                <p className="text-[11px] text-gray-400">Turnos · WhatsApp · Pagos online</p>
              </div>
            </div>

            {/* Columna derecha: mockup CSS */}
            <div className="solo-mockup">
              {/* Pantalla principal — calendario */}
              <div className="solo-screen" style={{ width: 138, height: 88, top: 0, right: 0, background: '#fff' }}>
                <div
                  style={{
                    height: 18,
                    background: primary,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 8px',
                    gap: 4,
                  }}
                >
                  <div style={{ width: 38, height: 5, borderRadius: 3, background: 'rgba(255,255,255,.65)' }} />
                  <div style={{ flex: 1 }} />
                  <div style={{ width: 12, height: 5, borderRadius: 3, background: 'rgba(255,255,255,.4)' }} />
                </div>
                <div style={{ padding: '6px 8px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[
                    { color: `rgba(${pr},${pg},${pb},0.85)`, w: '78%', label: '09:00' },
                    { color: '#34d399', w: '62%', label: '10:30' },
                    { color: `rgba(${pr},${pg},${pb},0.45)`, w: '88%', label: '12:00' },
                    { color: '#f59e0b', w: '52%', label: '15:00' },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 7, color: '#9ca3af', width: 24, flexShrink: 0 }}>{row.label}</span>
                      <div style={{ height: 9, borderRadius: 3, background: row.color, width: row.w }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pantalla secundaria — card confirmación */}
              <div
                className="solo-screen"
                style={{ width: 98, height: 70, bottom: 0, left: 0, background: '#fff', padding: '7px 8px' }}
              >
                <p style={{ fontSize: 7, fontWeight: 800, color: '#111827', marginBottom: 5 }}>✅ Turno confirmado</p>
                {[
                  { label: 'Cliente', val: 'María G.' },
                  { label: 'Hora', val: '10:30 hs' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 6.5, color: '#9ca3af' }}>{r.label}</span>
                    <span style={{ fontSize: 6.5, fontWeight: 700, color: '#374151' }}>{r.val}</span>
                  </div>
                ))}
                <div
                  style={{
                    marginTop: 6,
                    height: 13,
                    borderRadius: 4,
                    background: primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
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
              Solo
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
