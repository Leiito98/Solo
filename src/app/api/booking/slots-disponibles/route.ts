import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const APP_TZ = 'America/Argentina/Buenos_Aires'
const MIN_BUFFER_MINUTES = 0 // poné 10 o 15 si querés evitar “ya mismo”

function dayOfWeek0Sunday(fechaYYYYMMDD: string) {
  // JS: 0=domingo .. 6=sábado (coincide con tu schema)
  const d = new Date(`${fechaYYYYMMDD}T00:00:00`)
  return d.getDay()
}

function toHHMMSS(h: string) {
  if (/^\d{2}:\d{2}:\d{2}$/.test(h)) return h
  if (/^\d{2}:\d{2}$/.test(h)) return `${h}:00`
  return h
}

function minutesSinceMidnight(hhmmss: string) {
  const [hh, mm, ss] = hhmmss.split(':').map(Number)
  return hh * 60 + mm + Math.floor((ss || 0) / 60)
}

function hhmmssFromMinutes(totalMin: number) {
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

// ── TZ helpers ───────────────────────────────────────────────

function getNowPartsInTZ(timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date())

  const get = (type: string) => parts.find((p) => p.type === type)?.value || '00'

  return {
    y: get('year'),
    m: get('month'),
    d: get('day'),
    hh: get('hour'),
    mm: get('minute'),
  }
}

function isTodayInTZ(fechaYYYYMMDD: string, timeZone: string) {
  const n = getNowPartsInTZ(timeZone)
  const today = `${n.y}-${n.m}-${n.d}`
  return fechaYYYYMMDD === today
}

function minutesNowInTZ(timeZone: string) {
  const n = getNowPartsInTZ(timeZone)
  return Number(n.hh) * 60 + Number(n.mm)
}

function filterPastSlotsIfToday(fecha: string, slotsHHMMSS: string[]) {
  if (!isTodayInTZ(fecha, APP_TZ)) return slotsHHMMSS
  const nowMin = minutesNowInTZ(APP_TZ) + MIN_BUFFER_MINUTES
  return slotsHHMMSS.filter((s) => minutesSinceMidnight(toHHMMSS(String(s))) >= nowMin)
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const negocio_id = (searchParams.get('negocio_id') || '').trim()
    const fecha = (searchParams.get('fecha') || '').trim() // YYYY-MM-DD
    const duracion = parseInt(searchParams.get('duracion') || '30', 10)

    // opcional
    const profesional_id_raw = (searchParams.get('profesional_id') || '').trim()
    const profesional_id = profesional_id_raw ? profesional_id_raw : null

    if (!negocio_id || !fecha || !Number.isFinite(duracion) || duracion <= 0) {
      return NextResponse.json({ error: 'Missing/invalid parameters' }, { status: 400 })
    }

    const supabase = await createClient()
    const dow = dayOfWeek0Sunday(fecha)
    const intervalo = 30

    // ─────────────────────────────────────────────────────────────
    // ✅ MODO 1: Slots FILTRADOS por un profesional específico
    // ─────────────────────────────────────────────────────────────
    if (profesional_id) {
      // Validar que el profesional pertenezca al negocio y esté activo
      const { data: pro, error: proErr } = await supabase
        .from('profesionales')
        .select('id, activo, negocio_id')
        .eq('id', profesional_id)
        .eq('negocio_id', negocio_id)
        .maybeSingle()

      if (proErr || !pro || pro.activo === false) {
        return NextResponse.json({ slots: [], reason: 'no_trabaja' })
      }

      // 1) horario de ese día
      const { data: horario, error: horErr } = await supabase
        .from('horarios_trabajo')
        .select('hora_inicio, hora_fin')
        .eq('profesional_id', profesional_id)
        .eq('dia_semana', dow)
        .eq('activo', true)
        .maybeSingle()

      if (horErr) {
        console.error('Error horario profesional:', horErr)
        return NextResponse.json({ error: 'Error horarios' }, { status: 500 })
      }

      if (!horario) {
        return NextResponse.json({ slots: [], reason: 'no_trabaja' })
      }

      const start = minutesSinceMidnight(toHHMMSS(String(horario.hora_inicio)))
      const end = minutesSinceMidnight(toHHMMSS(String(horario.hora_fin)))

      if (!(end > start)) {
        return NextResponse.json({ slots: [], reason: 'no_trabaja' })
      }

      // 2) turnos ocupados ese día para ese profesional
      const { data: turnos, error: turnErr } = await supabase
        .from('turnos')
        .select('hora_inicio, hora_fin')
        .eq('negocio_id', negocio_id)
        .eq('profesional_id', profesional_id)
        .eq('fecha', fecha)
        .in('estado', ['pendiente', 'confirmado'])

      if (turnErr) {
        console.error('Error turnos profesional:', turnErr)
        return NextResponse.json({ error: 'Error turnos' }, { status: 500 })
      }

      const ocupados = (turnos || []).map((t: any) => ({
        start: minutesSinceMidnight(toHHMMSS(String(t.hora_inicio))),
        end: minutesSinceMidnight(toHHMMSS(String(t.hora_fin))),
      }))

      // 3) generar slots solo dentro del horario del profesional
      const slotsSet = new Set<string>()
      const startRounded = Math.ceil(start / intervalo) * intervalo
      const endRounded = Math.floor(end / intervalo) * intervalo

      for (let startMin = startRounded; startMin <= endRounded; startMin += intervalo) {
        const endMin = startMin + duracion
        if (endMin > end) continue

        const solapa = ocupados.some((r) => r.start < endMin && r.end > startMin)
        if (solapa) continue

        slotsSet.add(hhmmssFromMinutes(startMin))
      }

      let slots = Array.from(slotsSet).sort()
      slots = filterPastSlotsIfToday(fecha, slots)

      return NextResponse.json({ slots })
    }

    // ─────────────────────────────────────────────────────────────
    // ✅ MODO 2: Slots GLOBALES (primero disponible)
    // ─────────────────────────────────────────────────────────────

    // 1) Profesionales activos del negocio
    const { data: pros, error: prosErr } = await supabase
      .from('profesionales')
      .select('id')
      .eq('negocio_id', negocio_id)
      .eq('activo', true)

    if (prosErr) {
      console.error('Error profesionales:', prosErr)
      return NextResponse.json({ error: 'Error profesionales' }, { status: 500 })
    }

    const profesionalIds = (pros || []).map((p: any) => p.id)
    if (profesionalIds.length === 0) return NextResponse.json({ slots: [] })

    // 2) Horarios de trabajo del día para esos profesionales
    const { data: horarios, error: horErr } = await supabase
      .from('horarios_trabajo')
      .select('profesional_id, hora_inicio, hora_fin')
      .in('profesional_id', profesionalIds)
      .eq('dia_semana', dow)
      .eq('activo', true)

    if (horErr) {
      console.error('Error horarios:', horErr)
      return NextResponse.json({ error: 'Error horarios' }, { status: 500 })
    }

    const horarioMap = new Map<string, { start: number; end: number }>()
    for (const h of horarios || []) {
      const start = minutesSinceMidnight(toHHMMSS(String((h as any).hora_inicio)))
      const end = minutesSinceMidnight(toHHMMSS(String((h as any).hora_fin)))
      if (end > start) {
        horarioMap.set(String((h as any).profesional_id), { start, end })
      }
    }

    if (horarioMap.size === 0) return NextResponse.json({ slots: [] })

    // 3) Turnos que bloquean ese día (pendiente/confirmado)
    const { data: turnos, error: turnErr } = await supabase
      .from('turnos')
      .select('profesional_id, hora_inicio, hora_fin')
      .eq('negocio_id', negocio_id)
      .eq('fecha', fecha)
      .in('estado', ['pendiente', 'confirmado'])
      .in('profesional_id', Array.from(horarioMap.keys()))

    if (turnErr) {
      console.error('Error turnos:', turnErr)
      return NextResponse.json({ error: 'Error turnos' }, { status: 500 })
    }

    const turnosByPro = new Map<string, Array<{ start: number; end: number }>>()
    for (const t of turnos || []) {
      const pid = String((t as any).profesional_id)
      const start = minutesSinceMidnight(toHHMMSS(String((t as any).hora_inicio)))
      const end = minutesSinceMidnight(toHHMMSS(String((t as any).hora_fin)))
      if (!turnosByPro.has(pid)) turnosByPro.set(pid, [])
      turnosByPro.get(pid)!.push({ start, end })
    }

    // 4) Generar slots globales: si AL MENOS 1 profesional puede tomarlo entero
    const slotsSet = new Set<string>()

    let globalStart = Infinity
    let globalEnd = -Infinity
    for (const { start, end } of horarioMap.values()) {
      globalStart = Math.min(globalStart, start)
      globalEnd = Math.max(globalEnd, end)
    }

    const startRounded = Math.ceil(globalStart / intervalo) * intervalo
    const endRounded = Math.floor(globalEnd / intervalo) * intervalo

    for (let startMin = startRounded; startMin <= endRounded; startMin += intervalo) {
      const endMin = startMin + duracion

      let anyProAvailable = false

      for (const [pid, h] of horarioMap.entries()) {
        if (startMin < h.start || endMin > h.end) continue

        const ocupados = turnosByPro.get(pid) || []
        const solapa = ocupados.some((r) => r.start < endMin && r.end > startMin)
        if (solapa) continue

        anyProAvailable = true
        break
      }

      if (anyProAvailable) slotsSet.add(hhmmssFromMinutes(startMin))
    }

    let slots = Array.from(slotsSet).sort()
    slots = filterPastSlotsIfToday(fecha, slots)

    return NextResponse.json({ slots })
  } catch (e) {
    console.error('slots-disponibles error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
