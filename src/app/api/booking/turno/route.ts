import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { randomUUID } from 'crypto'
import crypto from 'crypto'

export const runtime = 'nodejs'

function normalizeTime(t: string) {
  const s = String(t || '').trim()

  if (/^\d{2}:\d{2}$/.test(s)) return `${s}:00`
  if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s

  const m = s.match(/T(\d{2}:\d{2}:\d{2})/)
  if (m) return m[1]

  const parts = s.split(':')
  if (parts.length >= 3) return `${parts[0]}:${parts[1]}:${parts[2]}`

  throw new Error(`Invalid time format: ${s}`)
}

function addMinutesToTime(timeHHMMSS: string, minutesToAdd: number) {
  const [hh, mm, ss] = timeHHMMSS.split(':').map(Number)
  const baseMinutes = hh * 60 + mm + Math.floor((ss || 0) / 60)
  const total = baseMinutes + minutesToAdd
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

function signWebhook(turno_id: string, negocio_id: string) {
  const secret = process.env.MP_WEBHOOK_SECRET || ''
  if (!secret) throw new Error('Missing MP_WEBHOOK_SECRET')
  const payload = `${turno_id}.${negocio_id}`
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

type Body = {
  negocio_id: string
  servicio_id: string
  profesional_id: string
  fecha: string // YYYY-MM-DD
  hora_inicio: string // HH:mm o HH:mm:ss
  cliente: { nombre: string; email: string; telefono: string }
  metodo_pago: 'online' | 'local'
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Body>

    const negocio_id = String(body.negocio_id || '').trim()
    const servicio_id = String(body.servicio_id || '').trim()
    const profesional_id = String(body.profesional_id || '').trim()
    const fecha = String(body.fecha || '').trim()
    const hora_inicio_raw = String(body.hora_inicio || '').trim()
    const metodo_pago = body.metodo_pago as 'online' | 'local'

    const cliente = body.cliente as Body['cliente'] | undefined

    if (!negocio_id || !servicio_id || !profesional_id || !fecha || !hora_inicio_raw) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    if (!cliente?.nombre || !cliente?.email || !cliente?.telefono) {
      return NextResponse.json({ error: 'Datos del cliente incompletos' }, { status: 400 })
    }

    if (!metodo_pago || !['online', 'local'].includes(metodo_pago)) {
      return NextResponse.json({ error: 'Método de pago inválido' }, { status: 400 })
    }

    const supabase = await createClient()
    const admin = createAdminClient()

    // 1) Negocio
    const { data: negocio, error: negocioErr } = await supabase
      .from('negocios')
      .select('id, nombre, slug, mp_access_token')
      .eq('id', negocio_id)
      .single()

    if (negocioErr || !negocio) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    // 2) Servicio
    const { data: servicio, error: servErr } = await supabase
      .from('servicios')
      .select('id, duracion_min, nombre, precio')
      .eq('id', servicio_id)
      .single()

    if (servErr || !servicio) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    // 3) Hora fin
    const hora_inicio = normalizeTime(hora_inicio_raw)
    const hora_fin = addMinutesToTime(hora_inicio, Number(servicio.duracion_min || 0))

    // 4) Cliente (buscar/crear por email dentro del negocio)
    let clienteId: string

    const { data: clienteExistente, error: clienteExistenteErr } = await admin
      .from('clientes')
      .select('id')
      .eq('negocio_id', negocio_id)
      .eq('email', cliente.email)
      .maybeSingle()

    if (clienteExistenteErr) {
      console.error('Error searching client:', clienteExistenteErr)
      return NextResponse.json({ error: 'Error buscando cliente' }, { status: 500 })
    }

    if (clienteExistente?.id) {
      clienteId = clienteExistente.id
      const { error: updErr } = await admin
        .from('clientes')
        .update({ nombre: cliente.nombre, telefono: cliente.telefono })
        .eq('id', clienteId)

      if (updErr) console.error('Error updating client:', updErr)
    } else {
      const { data: nuevoCliente, error: clienteError } = await admin
        .from('clientes')
        .insert({
          negocio_id,
          nombre: cliente.nombre,
          email: cliente.email,
          telefono: cliente.telefono,
          notas: '',
          historial: {},
        })
        .select('id')
        .single()

      if (clienteError || !nuevoCliente) {
        console.error('Error creating client:', clienteError)
        return NextResponse.json({ error: 'Error al crear cliente' }, { status: 500 })
      }

      clienteId = nuevoCliente.id
    }

    // 5) Conflictos (solapamiento)
    const { data: turnosExistentes, error: conflictErr } = await supabase
      .from('turnos')
      .select('id')
      .eq('negocio_id', negocio_id)
      .eq('profesional_id', profesional_id)
      .eq('fecha', fecha)
      .in('estado', ['pendiente', 'confirmado'])
      .lt('hora_inicio', hora_fin)
      .gt('hora_fin', hora_inicio)

    if (conflictErr) {
      console.error('Error checking conflicts:', conflictErr)
      return NextResponse.json({ error: 'Error verificando disponibilidad' }, { status: 500 })
    }

    if (turnosExistentes && turnosExistentes.length > 0) {
      return NextResponse.json({ error: 'El horario ya no está disponible' }, { status: 409 })
    }

    // 6) Montos
    const precioTotal = Number(servicio.precio || 0)
    const sena = Math.round(precioTotal * 0.5)
    const resto = precioTotal - sena

    // 7) Estado inicial
    const estadoTurno = 'pendiente'
    const estadoPago = 'pendiente'
    const montoInicial = 0

    // token seguro para cancelar
    const cancel_token = randomUUID()

    // 8) Crear turno
    const { data: turno, error: turnoError } = await admin
      .from('turnos')
      .insert({
        negocio_id,
        servicio_id,
        profesional_id,
        cliente_id: clienteId,
        fecha,
        hora_inicio,
        hora_fin,
        estado: estadoTurno,
        pago_estado: estadoPago,
        pago_monto: montoInicial,
        cancel_token,
      })
      .select('id, fecha, hora_inicio, hora_fin, cancel_token')
      .single()

    if (turnoError || !turno) {
      console.error('Error creating turno:', turnoError)
      return NextResponse.json({ error: 'Error al crear turno' }, { status: 500 })
    }

    // 9) Profesional (para respuesta)
    const { data: profesional } = await supabase
      .from('profesionales')
      .select('nombre')
      .eq('id', profesional_id)
      .single()

    // baseUrl público (en prod va a ser https://getsolo.site)
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    const cancel_url = `${baseUrl}/negocio/${negocio.slug}/cancelar?token=${turno.cancel_token}`

    // 10) Pago online => crear preferencia MP
    let payment_url: string | null = null

    if (metodo_pago === 'online') {
      const accessToken =
        (negocio.mp_access_token as string | null) || process.env.MERCADOPAGO_ACCESS_TOKEN || ''

      if (!accessToken) {
        return NextResponse.json(
          { error: 'Este negocio aún no configuró MercadoPago. Contactá al negocio.' },
          { status: 422 }
        )
      }

      try {
        // notification_url firmada (multi-tenant seguro)
        const sig = signWebhook(turno.id, negocio_id)
        const notification_url = `${baseUrl}/api/webhooks/mercadopago?turno_id=${turno.id}&negocio_id=${negocio_id}&sig=${sig}`

        const mpClient = new MercadoPagoConfig({ accessToken })
        const preference = new Preference(mpClient)

        const pref = await preference.create({
          body: {
            items: [
              {
                id: servicio_id,
                title: `${servicio.nombre} - ${negocio.nombre}`,
                description: `Seña 50% - Turno: ${fecha} ${hora_inicio_raw}`,
                quantity: 1,
                unit_price: sena,
                currency_id: 'ARS',
              },
            ],
            payer: {
              name: cliente.nombre,
              email: cliente.email,
              phone: { number: cliente.telefono },
            },
            back_urls: {
              success: `${baseUrl}/negocio/${negocio.slug}/reserva-exitosa?turno_id=${turno.id}`,
              failure: `${baseUrl}/negocio/${negocio.slug}/reserva-fallida?turno_id=${turno.id}`,
              pending: `${baseUrl}/negocio/${negocio.slug}/reserva-pendiente?turno_id=${turno.id}`,
            },
            auto_return: 'approved',
            notification_url,
            external_reference: turno.id,
            metadata: {
              turno_id: turno.id,
              negocio_id,
              cliente_id: clienteId,
              cancel_token: turno.cancel_token,
            },
          },
        })

        // Importante: priorizar prod
        payment_url = pref.init_point || pref.sandbox_init_point || null

        // Guardar preference id
        if (pref.id) {
          await admin
            .from('turnos')
            .update({ mp_preference_id: String(pref.id) })
            .eq('id', turno.id)
        }
      } catch (mpError) {
        console.error('Error creating MP preference:', mpError)
        return NextResponse.json({ error: 'No se pudo generar el link de pago' }, { status: 500 })
      }
    }

    // 11) Respuesta
    return NextResponse.json({
      success: true,
      turno: {
        id: turno.id,
        fecha: turno.fecha,
        hora: String(turno.hora_inicio).substring(0, 5),
        servicio: servicio.nombre,
        profesional: profesional?.nombre || '',
        precio: precioTotal,
        seña: sena,
        resto,
        cancel_url,
      },
      metodo_pago,
      payment_url,
    })
  } catch (error) {
    console.error('Error in POST /api/booking/turno:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
