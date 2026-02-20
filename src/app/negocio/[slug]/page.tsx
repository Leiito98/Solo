// app/negocio/[slug]/page.tsx
import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import Image from "next/image"
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Calendar,
  Check,
  ArrowRight,
  Instagram,
  Facebook,
} from "lucide-react"
import { ReservaDialog } from "@/components/reserva/reserva-dialog"
import { ReservaButton } from "@/components/reserva/reserva-button"
import { TrackPublicPreview } from "@/components/public/track-public-preview"

// ─── Types ────────────────────────────────────────────────────────────────────

type Negocio = {
  id: string
  nombre: string
  slug: string
  vertical: string
  descripcion?: string | null
  logo_url?: string | null
  banner_url?: string | null
  direccion?: string | null
  telefono?: string | null
  email?: string | null
  color_primario?: string | null
  color_secundario?: string | null
  slogan?: string | null

  // redes
  facebook?: string | null
  instagram?: string | null

  // pagos/MP (para dialog)
  mp_sena_pct?: number | null
  mp_connected_at?: string | null
}

type Servicio = {
  id: string
  nombre: string
  descripcion?: string | null
  duracion_min: number
  precio: number
  imagen_url?: string | null
}

type Profesional = {
  id: string
  nombre: string
  especialidad?: string | null
  foto_url?: string | null
  bio?: string | null
}

type HorarioRow = {
  dia_semana: number
  cerrado: boolean
  hora_inicio: string | null
  hora_fin: string | null
}

// ─── Config ───────────────────────────────────────────────────────────────────

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "getsolo.site"

const VERTICAL_DEFAULTS: Record<string, { label: string; emoji: string }> = {
  barberia: { label: "Barbería", emoji: "✂️" },
  peluqueria: { label: "Peluquería", emoji: "💇" },
  belleza: { label: "Belleza", emoji: "💅" },
  nutricion: { label: "Nutrición", emoji: "🥗" },
  psicologia: { label: "Psicología", emoji: "🧠" },
  fitness: { label: "Fitness", emoji: "💪" },
  spa: { label: "Spa & Masajes", emoji: "💆" },
  otros: { label: "Servicios", emoji: "✨" },
}

const FALLBACK_PRIMARY = "#111827"
const FALLBACK_SECONDARY = "#374151"

const DAY_FULL: Record<number, string> = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
}

async function pickHost() {
  const h = await headers()
  return (h.get("x-forwarded-host") || h.get("host") || "").toLowerCase()
}
function cleanHost(host: string) {
  return host.split(":")[0]
}
function isRootHost(host: string) {
  const clean = cleanHost(host)
  // en localhost no redirigimos para no complicar dev
  if (!clean || clean === "localhost" || clean.endsWith(".localhost")) return false
  // previews de vercel: tratamos como root
  if (clean.endsWith(".vercel.app")) return true
  return clean === ROOT_DOMAIN || clean === `www.${ROOT_DOMAIN}`
}

function hhmm(v: string | null) {
  return v ? String(v).slice(0, 5) : ""
}
function displayHours(r: HorarioRow) {
  if (r.cerrado) return { text: "Cerrado", closed: true }
  return { text: `${hhmm(r.hora_inicio)} – ${hhmm(r.hora_fin)}`, closed: false }
}
function formatPrice(p: number) {
  return "$" + Number(p).toLocaleString("es-AR")
}
function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
function isValidHex(h: string | null | undefined): h is string {
  return typeof h === "string" && /^#[0-9a-fA-F]{6}$/.test(h.trim())
}
function hexToRgb(hex: string) {
  const h = hex.replace("#", "")
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function cleanStr(v: unknown) {
  const s = typeof v === "string" ? v.trim() : ""
  return s.length ? s : null
}
function isValidUrl(u: string) {
  try {
    const url = new URL(u)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}
function normalizeInstagram(raw: string | null) {
  if (!raw) return null
  const s = raw.trim()
  if (!s) return null
  if (isValidUrl(s)) return s
  if (/instagram\.com/i.test(s))
    return `https://${s.replace(/^\/+/, "").replace(/^https?:\/\//, "")}`
  const username = s.replace(/^@/, "").replace(/^\/+/, "")
  return username ? `https://instagram.com/${encodeURIComponent(username)}` : null
}
function normalizeFacebook(raw: string | null) {
  if (!raw) return null
  const s = raw.trim()
  if (!s) return null
  if (isValidUrl(s)) return s
  if (/facebook\.com/i.test(s))
    return `https://${s.replace(/^\/+/, "").replace(/^https?:\/\//, "")}`
  const handle = s.replace(/^@/, "").replace(/^\/+/, "")
  return handle ? `https://facebook.com/${encodeURIComponent(handle)}` : null
}

function toTelDigits(raw: string) {
  return raw.replace(/\D/g, "")
}

function buildCanonical(slug: string) {
  return `https://${slug}.${ROOT_DOMAIN}`
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const safeSlug = String(slug || "").trim()

  const canonical = buildCanonical(safeSlug)

  const supabase = await createClient()
  const { data: negocio } = await supabase
    .from("negocios")
    .select("nombre, logo_url, banner_url, descripcion")
    .eq("slug", safeSlug)
    .maybeSingle()

  const nombre = negocio?.nombre?.trim() || safeSlug
  const desc = negocio?.descripcion?.trim() || `Reservá tu turno online en ${nombre}.`

  const ogImage = negocio?.banner_url || negocio?.logo_url || "/og.png"

  // Si por algún motivo esto se renderiza en root (no debería), evitamos index.
  const host = await pickHost()
  const onRoot = isRootHost(host)

  return {
    metadataBase: new URL(canonical),
    title: `${nombre} | Reservas Online`,
    description: desc,
    alternates: { canonical },
    robots: onRoot ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "website",
      url: canonical,
      title: `${nombre} | Reservas Online`,
      description: desc,
      siteName: "GetSolo",
      images: [{ url: ogImage, width: 1200, height: 630, alt: nombre }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${nombre} | Reservas Online`,
      description: desc,
      images: [ogImage],
    },
    ...(negocio?.logo_url
      ? { icons: { icon: negocio.logo_url, shortcut: negocio.logo_url, apple: negocio.logo_url } }
      : {}),
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function NegocioPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const safeSlug = String(slug || "").trim()

  // ✅ Opción A: si entran por root a /negocio/:slug => redirect al subdominio
  const host = await pickHost()
  if (isRootHost(host)) {
    redirect(buildCanonical(safeSlug))
  }

  const supabase = await createClient()

  const { data: negocio, error: nErr } = await supabase
    .from("negocios")
    .select("*")
    .eq("slug", safeSlug)
    .single()

  if (nErr || !negocio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3 px-6">
          <p className="text-7xl">🔍</p>
          <h1 className="text-2xl font-bold text-gray-900">Negocio no encontrado</h1>
          <p className="text-gray-500 text-sm">
            <strong>{safeSlug}</strong> no existe o fue removido.
          </p>
          <Link href="/" className="inline-block text-sm text-blue-600 hover:underline mt-2">
            Volver al inicio →
          </Link>
        </div>
      </div>
    )
  }

  const negocioTyped = negocio as Negocio

  const { data: mpTokenRow } = await supabase
    .from("negocio_mp_tokens")
    .select("mp_access_token")
    .eq("negocio_id", negocioTyped.id)
    .maybeSingle()

  const mpAccessToken = mpTokenRow?.mp_access_token ?? null

  const { data: servicios } = await supabase
    .from("servicios")
    .select("id, nombre, descripcion, duracion_min, precio, imagen_url")
    .eq("negocio_id", negocioTyped.id)
    .order("nombre")

  const { data: profesionales } = await supabase
    .from("profesionales")
    .select("id, nombre, especialidad, foto_url, bio")
    .eq("negocio_id", negocioTyped.id)
    .eq("activo", true)
    .order("nombre")

  const { data: horarioRows } = await supabase
    .from("negocio_horarios")
    .select("dia_semana, cerrado, hora_inicio, hora_fin")
    .eq("negocio_id", negocioTyped.id)
    .order("dia_semana", { ascending: true })

  const horarios: HorarioRow[] = Array.from({ length: 7 }, (_, d) => {
    const found = (horarioRows || []).find((x) => x.dia_semana === d)
    return found || { dia_semana: d, cerrado: true, hora_inicio: null, hora_fin: null }
  })

  const primary = isValidHex(negocioTyped.color_primario)
    ? negocioTyped.color_primario!.trim()
    : FALLBACK_PRIMARY

  const secondary = isValidHex(negocioTyped.color_secundario)
    ? negocioTyped.color_secundario!.trim()
    : FALLBACK_SECONDARY

  const { r: pr, g: pg, b: pb } = hexToRgb(primary)
  const vcfg = VERTICAL_DEFAULTS[negocioTyped.vertical] || VERTICAL_DEFAULTS.otros

  const todayIdx = new Date().getDay()
  const todayInfo = displayHours(horarios[todayIdx])

  const mapsQuery = negocioTyped.direccion
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(negocioTyped.direccion)}`
    : null

  const googleMapsEmbedUrl = negocioTyped.direccion
    ? `https://maps.google.com/maps?q=${encodeURIComponent(negocioTyped.direccion)}&output=embed&z=15`
    : null

  // redes
  const instagramUrl = normalizeInstagram(cleanStr(negocioTyped.instagram))
  const facebookUrl = normalizeFacebook(cleanStr(negocioTyped.facebook))

  // Data for client components
  const negocioDialog = {
    id: negocioTyped.id,
    nombre: negocioTyped.nombre,
    slug: negocioTyped.slug,
    color_primario: negocioTyped.color_primario,
    color_secundario: negocioTyped.color_secundario,
    logo_url: negocioTyped.logo_url,
    tiene_mp: !!negocioTyped.mp_connected_at,
    mp_sena_pct: negocioTyped.mp_sena_pct ?? 50,
  }

  const serviciosDialog = (servicios || []).map((s) => ({
    id: s.id,
    nombre: s.nombre,
    descripcion: s.descripcion,
    duracion_min: s.duracion_min,
    precio: s.precio,
  }))

  const profesionalesDialog = (profesionales || []).map((p) => ({
    id: p.id,
    nombre: p.nombre,
    especialidad: p.especialidad,
    foto_url: p.foto_url,
  }))

  // ✅ JSON-LD (LocalBusiness)
  const canonical = buildCanonical(safeSlug)
  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: negocioTyped.nombre,
    url: canonical,
    image: negocioTyped.banner_url || negocioTyped.logo_url || undefined,
    telephone: negocioTyped.telefono || undefined,
    email: negocioTyped.email || undefined,
    address: negocioTyped.direccion
      ? {
          "@type": "PostalAddress",
          streetAddress: negocioTyped.direccion,
          addressCountry: "AR",
        }
      : undefined,
    sameAs: [instagramUrl, facebookUrl].filter(Boolean),
  }

  return (
    <div
      className="min-h-screen bg-[#f7f7f8] text-gray-900"
      style={{ fontFamily: "'Plus Jakarta Sans','DM Sans',system-ui,sans-serif" }}
    >
      <TrackPublicPreview slug={safeSlug} />

      {/* ✅ Structured data */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <style>{`
        :root { --p:${primary};--s:${secondary};--p-r:${pr};--p-g:${pg};--p-b:${pb}; }
        *{box-sizing:border-box}
        .btn-book{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--p);color:#fff;font-weight:700;font-size:.95rem;padding:0 1.5rem;height:48px;border-radius:12px;white-space:nowrap;border:none;cursor:pointer;transition:filter .15s,transform .15s}
        .btn-book:hover{filter:brightness(1.1);transform:translateY(-1px)}
        .btn-ghost{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#fff;color:var(--p);font-weight:600;font-size:.9rem;padding:0 1.25rem;height:44px;border-radius:10px;white-space:nowrap;border:1.5px solid rgba(var(--p-r),var(--p-g),var(--p-b),.25);transition:background .15s,border-color .15s;cursor:pointer;text-decoration:none}
        .btn-ghost:hover{background:rgba(var(--p-r),var(--p-g),var(--p-b),.05);border-color:var(--p)}
        .svc-card{background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e8e8ec;transition:box-shadow .2s,transform .2s}
        .svc-card:hover{box-shadow:0 8px 28px rgba(0,0,0,.1);transform:translateY(-2px)}
        .pro-pill{display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;border:none;background:none;padding:0}
        .pro-avatar{width:68px;height:68px;border-radius:50%;border:2.5px solid #e5e7eb;overflow:hidden;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.1rem;color:var(--p);background:rgba(var(--p-r),var(--p-g),var(--p-b),.08);transition:border-color .2s,transform .2s;flex-shrink:0}
        .pro-pill:hover .pro-avatar{border-color:var(--p);transform:scale(1.06)}
        .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:100px;font-size:.72rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;background:rgba(var(--p-r),var(--p-g),var(--p-b),.1);color:var(--p);border:1px solid rgba(var(--p-r),var(--p-g),var(--p-b),.18)}
        .hrow{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-radius:10px}
        .hrow.today{background:rgba(var(--p-r),var(--p-g),var(--p-b),.07);border:1.5px solid rgba(var(--p-r),var(--p-g),var(--p-b),.18)}
        .hrow:not(.today){background:#f9fafb;border:1.5px solid #eeeff2}
        .info-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:10px;background:#f3f4f6;border:1px solid #e5e7eb;font-size:.82rem;color:#4b5563;text-decoration:none;transition:background .15s}
        .info-pill:hover{background:#e9eaed}
        .sec-title{font-size:1.35rem;font-weight:800;color:#111827;letter-spacing:-.02em}
        .sticky-nav{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.95);backdrop-filter:blur(10px);border-bottom:1px solid #eeeff2}
        .social-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:999px;border:1px solid rgba(var(--p-r),var(--p-g),var(--p-b),.20);background:#fff;color:var(--p);transition:background .15s,border-color .15s,transform .15s}
        .social-btn:hover{background:rgba(var(--p-r),var(--p-g),var(--p-b),.08);border-color:rgba(var(--p-r),var(--p-g),var(--p-b),.35);transform:translateY(-1px)}
        @media(max-width:640px){.btn-book{height:44px;font-size:.88rem}.sec-title{font-size:1.15rem}}
      `}</style>

      {/* ReservaDialog: mounted once */}
      <ReservaDialog negocio={negocioDialog} servicios={serviciosDialog} profesionales={profesionalesDialog} />

      {/* NAV */}
      <nav className="sticky-nav">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {negocioTyped.logo_url && (
              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                <Image
                  src={negocioTyped.logo_url}
                  alt={negocioTyped.nombre}
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            <span className="text-gray-900 truncate text-sm font-bold">{negocioTyped.nombre}</span>
          </div>

          <div className="flex items-center gap-2">
            {(servicios?.length ?? 0) > 0 && (
              <a
                href="#servicios"
                className="hidden sm:block text-sm font-semibold text-gray-500 hover:text-gray-900 px-3 py-1.5 transition-colors"
              >
                Servicios
              </a>
            )}
            {(profesionales?.length ?? 0) > 0 && (
              <a
                href="#equipo"
                className="hidden sm:block text-sm font-semibold text-gray-500 hover:text-gray-900 px-3 py-1.5 transition-colors"
              >
                Equipo
              </a>
            )}
            <ReservaButton className="btn-book" style={{ height: "36px", padding: "0 1rem", fontSize: "0.85rem" }}>
              <Calendar className="w-3.5 h-3.5" /> Reservar
            </ReservaButton>
          </div>
        </div>
      </nav>

      {/* BANNER */}
      <div className="relative w-full overflow-hidden bg-gray-200" style={{ aspectRatio: "16/5", minHeight: "180px", maxHeight: "380px" }}>
        {negocioTyped.banner_url ? (
          <Image
            src={negocioTyped.banner_url}
            alt={`${negocioTyped.nombre} banner`}
            fill
            className="object-top"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg,${primary} 0%,${secondary} 100%)` }}>
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <span className="text-[10rem]">{vcfg.emoji}</span>
            </div>
          </div>
        )}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#f7f7f8] to-transparent" />
      </div>

      {/* HERO CARD */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="relative -mt-10 sm:-mt-14 bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Logo */}
            <div className="flex-shrink-0 -mt-10 sm:-mt-14 self-start">
              {negocioTyped.logo_url ? (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white border-4 border-white shadow-md">
                  <Image
                    src={negocioTyped.logo_url}
                    alt={negocioTyped.nombre}
                    width={96}
                    height={96}
                    className="object-contain w-full h-full"
                  />
                </div>
              ) : (
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-md border-4 border-white"
                  style={{ background: `linear-gradient(135deg,${primary},${secondary})` }}
                >
                  {negocioTyped.nombre[0].toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pt-1">
              {/* Título + Badge + Redes */}
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                  {negocioTyped.nombre}
                </h1>

                <span className="badge">{vcfg.label}</span>

                {(instagramUrl || facebookUrl) && (
                  <div className="flex items-center gap-1.5 ml-1">
                    {instagramUrl && (
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="social-btn"
                        title="Instagram"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {facebookUrl && (
                      <a
                        href={facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Facebook"
                        className="social-btn"
                        title="Facebook"
                      >
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* rating fake */}
              <div className="flex items-center gap-1 mb-3" aria-label="Calificación">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-4 h-4 fill-yellow-400" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-sm font-semibold text-gray-600 ml-1">5.0</span>
              </div>

              {negocioTyped.descripcion && (
                <p className="text-gray-500 text-sm leading-relaxed mb-4 max-w-2xl">{negocioTyped.descripcion}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {negocioTyped.direccion && (
                  <a href={mapsQuery ?? "#"} target="_blank" rel="noopener noreferrer" className="info-pill">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primary }} />
                    <span className="truncate max-w-[200px]">{negocioTyped.direccion}</span>
                  </a>
                )}

                {negocioTyped.telefono && (
                  <a
                    href={`https://wa.me/${toTelDigits(negocioTyped.telefono)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="info-pill"
                  >
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primary }} />
                    {negocioTyped.telefono}
                  </a>
                )}

                <div className="info-pill">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primary }} />
                  <span className={`font-semibold ${todayInfo.closed ? "text-red-500" : "text-green-600"}`}>
                    {todayInfo.closed ? "Cerrado hoy" : `Abierto · ${todayInfo.text}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop CTA */}
            <div className="hidden sm:flex flex-col gap-2 flex-shrink-0 self-start pt-2">
              <ReservaButton className="btn-book">
                <Calendar className="w-4 h-4" /> Reservar turno
              </ReservaButton>

              {negocioTyped.telefono && (
                <a
                  href={`https://wa.me/${toTelDigits(negocioTyped.telefono)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost flex items-center gap-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/whatsapp.svg" className="w-4 h-4" alt="WhatsApp" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Mobile CTA */}
          <div className="flex gap-2 mt-4 sm:hidden">
            <ReservaButton className="btn-book flex-1">
              <Calendar className="w-4 h-4" /> Reservar turno
            </ReservaButton>
            {negocioTyped.telefono && (
              <a
                href={`https://wa.me/${toTelDigits(negocioTyped.telefono)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
                style={{ padding: "0 1rem" }}
                aria-label="WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <main className="max-w-5xl mx-auto px-4 pb-24 mt-8 space-y-10">
        {/* Equipo */}
        {(profesionales?.length ?? 0) > 0 && (
          <section id="equipo">
            <div className="flex items-center justify-between mb-5">
              <h2 className="sec-title">Nuestro equipo</h2>
              <span className="text-xs text-gray-400 font-medium">{profesionales!.length} profesionales</span>
            </div>
            <div className="flex gap-5 flex-wrap">
              {profesionales!.map((p) => (
                <ReservaButton key={p.id} className="pro-pill">
                  <div className="pro-avatar">
                    {p.foto_url ? (
                      <Image src={p.foto_url} alt={p.nombre} width={68} height={68} className="object-cover w-full h-full" />
                    ) : (
                      <span>{initials(p.nombre)}</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-gray-700 text-center max-w-[80px] leading-tight">
                    {p.nombre.split(" ")[0]}
                  </span>
                  {p.especialidad && (
                    <span className="text-[11px] text-gray-400 text-center max-w-[80px] leading-tight">{p.especialidad}</span>
                  )}
                </ReservaButton>
              ))}
            </div>
          </section>
        )}

        {/* Servicios */}
        {(servicios?.length ?? 0) > 0 && (
          <section id="servicios">
            <h2 className="sec-title mb-5">Servicios</h2>
            <div className="space-y-4">
              {servicios!.map((s) => (
                <div key={s.id} className="svc-card overflow-hidden">
                  <div className="flex flex-col lg:flex-row lg:items-stretch">
                    {s.imagen_url && (
                      <div className="relative w-full h-52 lg:h-auto lg:w-[46%] flex-shrink-0 bg-gray-100">
                        <div className="absolute inset-0">
                          <Image
                            src={s.imagen_url}
                            alt={s.nombre}
                            fill
                            className="object-cover object-center rounded-t-2xl lg:rounded-l-2xl lg:rounded-t-none lg:rounded-r-none"
                            sizes="(max-width:1024px) 100vw, 46vw"
                          />
                        </div>
                        <div className="lg:hidden h-52" />
                      </div>
                    )}

                    <div className="p-5 lg:px-8 lg:py-6 flex w-full items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 leading-snug">{s.nombre}</h3>
                        {s.descripcion && <p className="text-gray-500 text-sm leading-relaxed mb-3 line-clamp-3">{s.descripcion}</p>}
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-500">{s.duracion_min} min</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 flex-shrink-0 ml-2">
                        <div className="text-right">
                          <p className="text-2xl font-black text-gray-900 leading-none">{formatPrice(s.precio)}</p>
                          <p className="text-xs text-gray-400 mt-0.5">ARS</p>
                        </div>

                        <ReservaButton servicioId={s.id} className="btn-book" style={{ height: "40px", padding: "0 1.25rem", fontSize: "0.85rem" }}>
                          Agendar
                        </ReservaButton>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Nosotros + Mapa */}
        <section id="nosotros">
          <div className="h-px bg-gray-200 mb-8" />
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h2 className="sec-title mb-4">Sobre {negocioTyped.nombre}</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">
                {negocioTyped.descripcion ||
                  `${negocioTyped.nombre} es un negocio de ${vcfg.label.toLowerCase()} dedicado a brindar la mejor atención. Reservá tu turno online en segundos.`}
              </p>

              <div className="space-y-2.5">
                {negocioTyped.telefono && (
                  <>
                    <a href={`tel:${negocioTyped.telefono}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `rgba(${pr},${pg},${pb},.1)` }}>
                        <Phone className="w-4 h-4" style={{ color: primary }} />
                      </div>
                      {negocioTyped.telefono}
                    </a>

                    <a
                      href={`https://wa.me/${toTelDigits(negocioTyped.telefono)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `rgba(${pr},${pg},${pb},.1)` }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/whatsapp.svg" className="w-4 h-4" alt="WhatsApp" />
                      </div>
                      <span className="text-gray-600 hover:text-gray-900 font-medium">¡Contáctanos por WhatsApp!</span>
                    </a>
                  </>
                )}

                {negocioTyped.email && (
                  <a href={`mailto:${negocioTyped.email}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `rgba(${pr},${pg},${pb},.1)` }}>
                      <Mail className="w-4 h-4" style={{ color: primary }} />
                    </div>
                    {negocioTyped.email}
                  </a>
                )}

                {negocioTyped.direccion && (
                  <a href={mapsQuery ?? "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `rgba(${pr},${pg},${pb},.1)` }}>
                      <MapPin className="w-4 h-4" style={{ color: primary }} />
                    </div>
                    {negocioTyped.direccion}
                  </a>
                )}
              </div>

              <div className="mt-6 space-y-2">
                {["Confirmación instantánea", "Recordatorio 24h antes", "Elegí profesional y horario"].map((b) => (
                  <div key={b} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `rgba(${pr},${pg},${pb},.12)` }}>
                      <Check className="w-3 h-3" style={{ color: primary }} />
                    </div>
                    {b}
                  </div>
                ))}
              </div>
            </div>

            {negocioTyped.direccion && googleMapsEmbedUrl && (
              <div>
                <h2 className="sec-title mb-4">Cómo llegar</h2>
                <a href={mapsQuery ?? "#"} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                  <iframe
                    title="Mapa"
                    width="100%"
                    height={208}
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={googleMapsEmbedUrl}
                  />
                  <div className="flex items-center gap-2 px-4 py-3 bg-white border-t border-gray-100">
                    <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: primary }} />
                    <span className="text-sm text-gray-600 truncate">{negocioTyped.direccion}</span>
                    <span className="ml-auto text-xs font-semibold flex-shrink-0" style={{ color: primary }}>
                      Ver en Maps →
                    </span>
                  </div>
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Horarios */}
        <section id="horarios">
          <div className="h-px bg-gray-200 mb-8" />
          <h2 className="sec-title mb-5">Horarios de atención</h2>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {horarios.map((h) => {
              const d = displayHours(h)
              const isToday = h.dia_semana === todayIdx
              return (
                <div key={h.dia_semana} className={`hrow${isToday ? " today" : ""}`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.closed ? "#ef4444" : "#22c55e" }} />
                    <span className="text-sm font-semibold text-gray-700">
                      {DAY_FULL[h.dia_semana]}
                      {isToday && (
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: primary }}>
                          hoy
                        </span>
                      )}
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${d.closed ? "text-red-500" : "text-gray-700"}`}>{d.text}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* CTA final */}
        <section>
          <div className="relative rounded-2xl overflow-hidden p-8 sm:p-12 text-center" style={{ background: `linear-gradient(135deg,${primary} 0%,${secondary} 100%)` }}>
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3Ccircle cx='23' cy='23' r='1.5'/%3E%3C/g%3E%3C/svg%3E\")",
              }}
            />
            <div className="relative z-10">
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">{negocioTyped.nombre}</p>
              <h2 className="text-2xl sm:text-4xl font-black text-white mb-3 leading-tight tracking-tight">¿Listo para reservar tu turno?</h2>
              <p className="text-white/65 text-sm mb-7">Elegís servicio, profesional y horario en menos de 2 minutos.</p>
              <ReservaButton
                className="inline-flex items-center gap-2 bg-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all hover:scale-105 hover:shadow-xl border-none cursor-pointer"
                style={{ color: primary }}
              >
                <Calendar className="w-4 h-4" />
                Reservar turno ahora
                <ArrowRight className="w-4 h-4" />
              </ReservaButton>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                {negocioTyped.logo_url ? (
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-100">
                    <Image src={negocioTyped.logo_url} alt={negocioTyped.nombre} width={32} height={32} className="object-cover" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black" style={{ background: primary }}>
                    {negocioTyped.nombre[0].toUpperCase()}
                  </div>
                )}
                <span className="font-bold text-gray-800 text-sm">{negocioTyped.nombre}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed max-w-[220px]">
                {negocioTyped.slogan?.slice(0, 80) || `Tu ${vcfg.label.toLowerCase()} de confianza.`}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Contacto</h4>
              <div className="space-y-2">
                {negocioTyped.telefono && (
                  <a href={`tel:${negocioTyped.telefono}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-800 transition-colors">
                    <Phone className="w-3.5 h-3.5" style={{ color: primary }} /> {negocioTyped.telefono}
                  </a>
                )}
                {negocioTyped.email && (
                  <a href={`mailto:${negocioTyped.email}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-800 transition-colors">
                    <Mail className="w-3.5 h-3.5" style={{ color: primary }} /> {negocioTyped.email}
                  </a>
                )}
                {negocioTyped.direccion && (
                  <p className="flex items-start gap-2 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: primary }} /> {negocioTyped.direccion}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Reservas</h4>
              <div className="space-y-2">
                <ReservaButton className="flex items-center gap-2 text-xs font-bold border-none bg-transparent cursor-pointer p-0" style={{ color: primary }}>
                  <Calendar className="w-3.5 h-3.5" /> Reservar turno
                </ReservaButton>
                {(servicios?.length ?? 0) > 0 && (
                  <a href="#servicios" className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-800 transition-colors">
                    Ver todos los servicios
                  </a>
                )}
                <a href="#horarios" className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-800 transition-colors">
                  Horarios
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} {negocioTyped.nombre}. Todos los derechos reservados.
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              Powered by{" "}
              <Link href="https://getsolo.site" className="font-bold hover:underline" style={{ color: primary }}>
                GetSolo
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
