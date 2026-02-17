import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_FROM = process.env.EMAIL_FROM || "Solo <onboarding@resend.dev>"
const APP_URL =  "https://getsolo.site".replace(/\/$/, "")
const SOLO_LOGO_URL = `${APP_URL}/logo/solo.png`

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Brand = {
  brandPrimary?: string | null
  brandSecondary?: string | null
  brandLogoUrl?: string | null
}

type ConfirmacionClienteEmail = {
  clienteEmail: string
  clienteNombre: string
  negocioNombre: string
  servicioNombre: string
  profesionalNombre: string
  fecha: string
  hora: string
  negocioDireccion?: string | null
  negocioTelefono?: string | null
  cancel_url?: string | null
} & Brand

type NuevaReservaOwnerEmail = {
  ownerEmail: string
  ownerNombre: string
  clienteNombre: string
  clienteEmail: string
  clienteTelefono: string
  servicioNombre: string
  profesionalNombre: string
  fecha: string
  hora: string
  metodoPago: "online" | "local"
  negocioNombre: string
} & Brand

// ─── Helpers ─────────────────────────────────────────────────────────────────

function esc(s: any) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function isLikelyHexColor(v: string | null | undefined) {
  if (!v) return false
  const t = v.trim()
  return /^#[0-9a-fA-F]{6}$/.test(t)
}

function brandColors(data: Brand) {
  const primary = isLikelyHexColor(data.brandPrimary) ? data.brandPrimary!.trim() : "#3B82F6" // Solo default blue
  const secondary = isLikelyHexColor(data.brandSecondary) ? data.brandSecondary!.trim() : "#1E40AF" // Solo default indigo
  return { primary, secondary }
}

function footerSoloHTML() {
  return `
    <div class="solo-footer">
      <div class="solo-footer-inner">
        <img src="${SOLO_LOGO_URL}" width="32" height="32" alt="Solo" style="display:block;border:0;outline:none;text-decoration:none;border-radius:8px;" />
        <div style="text-align:left;">
          <div style="font-weight:700;color:#111827;line-height:1.2;">Solo</div>
          <div style="color:#6B7280;font-size:12px;line-height:1.2;">Sistema de turnos y gestión para profesionales</div>
          <div style="color:#9CA3AF;font-size:12px;line-height:1.2;">${APP_URL}</div>
        </div>
      </div>
    </div>
  `
}

function baseStyles(primary: string, secondary: string) {
  // Tip: muchos clientes de email limitan CSS, pero esto es bastante seguro
  return `
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; }
    .header { background: linear-gradient(135deg, ${primary} 0%, ${secondary} 100%); color: white; padding: 28px; text-align: center; border-radius: 12px 12px 0 0; }
    .content { background: #f9fafb; padding: 28px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
    .subtle { color: #6b7280; font-size: 14px; }
    .info-box { background: #ffffff; padding: 18px; border-radius: 10px; margin: 18px 0; border-left: 4px solid ${primary}; }
    .info-row { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .info-row:last-child { border-bottom: none; }
    .label { font-weight: bold; color: #6b7280; }
    .value { color: #111827; text-align: right; }
    .btn { display: inline-block; padding: 10px 16px; background: #ef4444; color: white !important; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 700; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 13px; font-weight: 700; }
    .badge-online { background: #dcfce7; color: #15803d; }
    .badge-local  { background: #fef9c3; color: #92400e; }
    .divider { margin-top: 22px; padding-top: 18px; border-top: 1px solid #e5e7eb; }
    .footer { text-align: center; margin-top: 22px; color: #6b7280; font-size: 13px; }
    .solo-footer { margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
    .solo-footer-inner { display:flex; align-items:center; justify-content:center; gap:10px; }
  `
}

// ─── Email al cliente: confirmación de reserva ───────────────────────────────

export async function sendConfirmacionReserva(data: ConfirmacionClienteEmail) {
  try {
    const fechaFormateada = new Date(data.fecha).toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const { primary, secondary } = brandColors(data)

    const negocioLogo = data.brandLogoUrl
      ? `<div style="margin-bottom:10px;">
           <img src="${esc(data.brandLogoUrl)}" alt="${esc(data.negocioNombre)}" height="44"
             style="height:44px; max-width:180px; object-fit:contain; display:inline-block; border-radius:10px; background:rgba(255,255,255,0.12); padding:6px;" />
         </div>`
      : ""

    const cancelBtn = data.cancel_url
      ? `<p style="margin-top:16px;">
           <a href="${esc(data.cancel_url)}" class="btn">Cancelar turno</a>
         </p>`
      : ""

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: data.clienteEmail,
      subject: `✅ Turno confirmado en ${data.negocioNombre}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>${baseStyles(primary, secondary)}</style>
          </head>
          <body>
            <div class="header">
              ${negocioLogo}
              <h1 style="margin:0;font-size:24px;line-height:1.2;">✅ ¡Turno Confirmado!</h1>
              <p style="margin:8px 0 0 0;opacity:.9;">${esc(data.negocioNombre)}</p>
            </div>

            <div class="content">
              <p>Hola <strong>${esc(data.clienteNombre)}</strong>,</p>
              <p>Tu turno fue reservado exitosamente en <strong>${esc(data.negocioNombre)}</strong>.</p>

              <div class="info-box">
                <div class="info-row"><span class="label">Servicio:</span><span class="value">${esc(data.servicioNombre)}</span></div>
                <div class="info-row"><span class="label">Profesional:</span><span class="value">${esc(data.profesionalNombre)}</span></div>
                <div class="info-row"><span class="label">Fecha:</span><span class="value">${esc(fechaFormateada)}</span></div>
                <div class="info-row"><span class="label">Hora:</span><span class="value">${esc(data.hora)}</span></div>
                ${
                  data.negocioDireccion
                    ? `<div class="info-row"><span class="label">Dirección:</span><span class="value">${esc(data.negocioDireccion)}</span></div>`
                    : ""
                }
                ${
                  data.negocioTelefono
                    ? `<div class="info-row"><span class="label">Teléfono:</span><span class="value">${esc(data.negocioTelefono)}</span></div>`
                    : ""
                }
              </div>

              <ul style="margin: 0; padding-left: 18px;">
                <li>Por favor llegá 5 minutos antes de tu turno.</li>
                <li>Si necesitás cancelar o reprogramar, hacelo con anticipación.</li>
              </ul>

              ${cancelBtn}

              <div class="divider footer">
                <p style="margin:0;" class="subtle">Este es un correo automático, por favor no respondas.</p>
                <p style="margin:6px 0 0 0;" class="subtle">© ${new Date().getFullYear()} ${esc(data.negocioNombre)}</p>

                ${footerSoloHTML()}
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error("[Email] Error enviando confirmación al cliente:", error)
      return { success: false, error }
    }
    return { success: true }
  } catch (error) {
    console.error("[Email] Error enviando confirmación al cliente:", error)
    return { success: false, error }
  }
}

// ─── Email al owner: nueva reserva recibida ──────────────────────────────────

export async function sendNuevaReservaOwner(data: NuevaReservaOwnerEmail) {
  try {
    const fechaFormateada = new Date(data.fecha).toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const metodoPagoLabel = data.metodoPago === "online" ? "💳 Online (seña)" : "💵 En el local"
    const { primary, secondary } = brandColors(data)

    const negocioLogo = data.brandLogoUrl
      ? `<div style="margin-bottom:10px;">
           <img src="${esc(data.brandLogoUrl)}" alt="${esc(data.negocioNombre)}" height="44"
             style="height:44px; max-width:180px; object-fit:contain; display:inline-block; border-radius:10px; background:rgba(255,255,255,0.12); padding:6px;" />
         </div>`
      : ""

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: data.ownerEmail,
      subject: `🔔 Nueva reserva — ${data.clienteNombre} · ${data.servicioNombre}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>${baseStyles(primary, secondary)}</style>
          </head>
          <body>
            <div class="header">
              ${negocioLogo}
              <h1 style="margin:0;font-size:24px;line-height:1.2;">🔔 Nueva Reserva</h1>
              <p style="margin:8px 0 0 0;opacity:.9;">${esc(data.negocioNombre)}</p>
            </div>

            <div class="content">
              <p>Hola <strong>${esc(data.ownerNombre)}</strong>, recibiste una nueva reserva.</p>

              <div class="info-box">
                <div class="info-row"><span class="label">Cliente:</span><span class="value">${esc(data.clienteNombre)}</span></div>
                <div class="info-row"><span class="label">Email:</span><span class="value">${esc(data.clienteEmail)}</span></div>
                <div class="info-row"><span class="label">Teléfono:</span><span class="value">${esc(data.clienteTelefono)}</span></div>
                <div class="info-row"><span class="label">Servicio:</span><span class="value">${esc(data.servicioNombre)}</span></div>
                <div class="info-row"><span class="label">Profesional:</span><span class="value">${esc(data.profesionalNombre)}</span></div>
                <div class="info-row"><span class="label">Fecha:</span><span class="value">${esc(fechaFormateada)}</span></div>
                <div class="info-row"><span class="label">Hora:</span><span class="value">${esc(data.hora)}</span></div>
                <div class="info-row">
                  <span class="label">Pago:</span>
                  <span class="value">
                    <span class="badge ${data.metodoPago === "online" ? "badge-online" : "badge-local"}">${esc(metodoPagoLabel)}</span>
                  </span>
                </div>
              </div>

              <p class="subtle">Podés gestionar el turno desde tu dashboard de Solo.</p>

              <div class="divider footer">
                <p style="margin:0;" class="subtle">© ${new Date().getFullYear()} Solo — Notificación automática</p>
                ${footerSoloHTML()}
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error("[Email] Error enviando nueva reserva al owner:", error)
      return { success: false, error }
    }
    return { success: true }
  } catch (error) {
    console.error("[Email] Error enviando nueva reserva al owner:", error)
    return { success: false, error }
  }
}
