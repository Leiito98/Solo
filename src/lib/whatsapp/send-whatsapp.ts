import { WhatsAppClient } from '@kapso/whatsapp-cloud-api'

// ─── Modos: SANDBOX (dev) vs PRODUCCION ───────────────────────────────────────
//
// SANDBOX  → usa el número de sandbox de Kapso + sendText (mensajes libres)
//            GetSolo funciona con números que tengan sesión activa en el sandbox.
//            Ideal para probar el flujo completo antes de tener número real.
//
// PRODUCCION → usa tu número de Meta conectado a Kapso + sendTemplate
//              Los templates deben estar aprobados por Meta (~24hs).
//
// Controlado por la env var KAPSO_MODE=sandbox | production (default: sandbox)
// ─────────────────────────────────────────────────────────────────────────────

const IS_SANDBOX = (process.env.KAPSO_MODE ?? 'sandbox') === 'sandbox'

// En sandbox, Kapso te da un phoneNumberId propio del sandbox
// En producción, es el phoneNumberId de tu número de Meta
const PHONE_NUMBER_ID = IS_SANDBOX
  ? process.env.KAPSO_SANDBOX_PHONE_NUMBER_ID!
  : process.env.KAPSO_PHONE_NUMBER_ID!

const client = new WhatsAppClient({
  baseUrl: 'https://api.kapso.ai/meta/whatsapp',
  kapsoApiKey: process.env.KAPSO_API_KEY!,
})

// ─── Tipos ────────────────────────────────────────────────────────────────────

type ConfirmacionClienteWA = {
  telefono: string
  clienteNombre: string
  negocioNombre: string
  servicioNombre: string
  profesionalNombre: string
  fecha: string        // YYYY-MM-DD
  hora: string         // HH:mm
  cancel_url: string
}

type NuevaReservaOwnerWA = {
  telefono: string
  ownerNombre: string
  clienteNombre: string
  clienteTelefono: string
  servicioNombre: string
  profesionalNombre: string
  fecha: string
  hora: string
}

type RecordatorioClienteWA = {
  telefono: string
  clienteNombre: string
  negocioNombre: string
  servicioNombre: string
  fecha: string
  hora: string
  horasRestantes: number
  cancel_url: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFechaES(fechaYYYYMMDD: string): string {
  const [y, m, d] = fechaYYYYMMDD.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

// Normaliza teléfono argentino → internacional E.164
// Acepta: 1155443322 | 01155443322 | +5491155443322 | 5491155443322
function normalizarTelefono(raw: string): string {
  let t = raw.replace(/\D/g, '')
  if (t.startsWith('549') && t.length === 13) return `+${t}`
  if (t.startsWith('54')  && t.length === 12) return `+${t}`
  if (t.startsWith('0')) t = t.slice(1)
  if (t.length === 10) return `+549${t}`
  return `+549${t}`
}

// ─── Dispatcher: texto libre (sandbox) vs template (producción) ───────────────

async function sendText(to: string, body: string) {
  return client.messages.sendText({ phoneNumberId: PHONE_NUMBER_ID, to, body })
}

async function sendTemplate(
  to: string,
  name: string,
  params: { parameterName: string; text: string }[]
) {
  return client.messages.sendTemplate({
    phoneNumberId: PHONE_NUMBER_ID,
    to,
    template: {
      name,
      language: { code: 'es' },   // Meta acepta 'es' globalmente para español
      components: [{
        type: 'body',
        parameters: params.map(p => ({ type: 'text' as const, parameterName: p.parameterName, text: p.text })),
      }],
    },
  })
}

// ─── 1. Confirmación al cliente ───────────────────────────────────────────────

export async function sendConfirmacionClienteWA(data: ConfirmacionClienteWA) {
  const to = normalizarTelefono(data.telefono)
  const fecha = formatFechaES(data.fecha)

  try {
    if (IS_SANDBOX) {
      // Texto libre — funciona sin templates ni aprobación
      await sendText(to,
        `✅ *¡Turno confirmado!*\n\n` +
        `Hola ${data.clienteNombre}, tu turno en *${data.negocioNombre}* fue reservado.\n\n` +
        `📋 Servicio: ${data.servicioNombre}\n` +
        `👤 Profesional: ${data.profesionalNombre}\n` +
        `📅 Fecha: ${fecha}\n` +
        `🕐 Hora: ${data.hora}\n\n` +
        `¿Necesitás cancelar?\n${data.cancel_url}`
      )
    } else {
      // Template aprobado por Meta — requerido para producción
      await sendTemplate(to, 'confirmacion_turno', [
        { parameterName: 'cliente_nombre',  text: data.clienteNombre },
        { parameterName: 'negocio_nombre',  text: data.negocioNombre },
        { parameterName: 'servicio',        text: data.servicioNombre },
        { parameterName: 'profesional',     text: data.profesionalNombre },
        { parameterName: 'fecha',           text: fecha },
        { parameterName: 'hora',            text: data.hora },
        { parameterName: 'cancel_url',      text: data.cancel_url },
      ])
    }
    console.log(`[WA] ✅ Confirmación enviada al cliente ${to} (${IS_SANDBOX ? 'sandbox' : 'prod'})`)
    return { success: true }
  } catch (error) {
    console.error('[WA] Error enviando confirmación al cliente:', error)
    return { success: false, error }
  }
}

// ─── 2. Nueva reserva al owner ────────────────────────────────────────────────

export async function sendNuevaReservaOwnerWA(data: NuevaReservaOwnerWA) {
  const to = normalizarTelefono(data.telefono)
  const fecha = formatFechaES(data.fecha)

  try {
    if (IS_SANDBOX) {
      await sendText(to,
        `🔔 *Nueva reserva recibida*\n\n` +
        `Hola ${data.ownerNombre}!\n\n` +
        `👤 Cliente: ${data.clienteNombre}\n` +
        `📱 Teléfono: ${data.clienteTelefono}\n` +
        `💇 Servicio: ${data.servicioNombre}\n` +
        `👨‍💼 Profesional: ${data.profesionalNombre}\n` +
        `📅 Fecha: ${fecha}\n` +
        `🕐 Hora: ${data.hora}`
      )
    } else {
      await sendTemplate(to, 'nueva_reserva_owner', [
        { parameterName: 'owner_nombre',     text: data.ownerNombre },
        { parameterName: 'cliente_nombre',   text: data.clienteNombre },
        { parameterName: 'cliente_telefono', text: data.clienteTelefono },
        { parameterName: 'servicio',         text: data.servicioNombre },
        { parameterName: 'profesional',      text: data.profesionalNombre },
        { parameterName: 'fecha',            text: fecha },
        { parameterName: 'hora',             text: data.hora },
      ])
    }
    console.log(`[WA] ✅ Nueva reserva enviada al owner ${to} (${IS_SANDBOX ? 'sandbox' : 'prod'})`)
    return { success: true }
  } catch (error) {
    console.error('[WA] Error enviando nueva reserva al owner:', error)
    return { success: false, error }
  }
}

// ─── 3. Recordatorio 12hs antes al cliente ────────────────────────────────────

export async function sendRecordatorioClienteWA(data: RecordatorioClienteWA) {
  const to = normalizarTelefono(data.telefono)
  const fecha = formatFechaES(data.fecha)

  try {
    if (IS_SANDBOX) {
      await sendText(to,
        `⏰ *Recordatorio de turno*\n\n` +
        `Hola ${data.clienteNombre}, te quedan *${data.horasRestantes} horas* para tu turno en ${data.negocioNombre}.\n\n` +
        `💇 Servicio: ${data.servicioNombre}\n` +
        `📅 Fecha: ${fecha}\n` +
        `🕐 Hora: ${data.hora}\n\n` +
        `¿No podés asistir? Cancelá acá:\n${data.cancel_url}`
      )
    } else {
      await sendTemplate(to, 'recordatorio_turno', [
        { parameterName: 'cliente_nombre',  text: data.clienteNombre },
        { parameterName: 'horas_restantes', text: String(data.horasRestantes) },
        { parameterName: 'negocio_nombre',  text: data.negocioNombre },
        { parameterName: 'servicio',        text: data.servicioNombre },
        { parameterName: 'fecha',           text: fecha },
        { parameterName: 'hora',            text: data.hora },
        { parameterName: 'cancel_url',      text: data.cancel_url },
      ])
    }
    console.log(`[WA] ✅ Recordatorio enviado al cliente ${to} (${IS_SANDBOX ? 'sandbox' : 'prod'})`)
    return { success: true }
  } catch (error) {
    console.error('[WA] Error enviando recordatorio al cliente:', error)
    return { success: false, error }
  }
}