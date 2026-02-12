import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const negocio_id = (searchParams.get('negocio_id') || '').trim()
    const fecha = (searchParams.get('fecha') || '').trim() // YYYY-MM-DD
    const duracion = parseInt(searchParams.get('duracion') || '30', 10)

    if (!negocio_id || !fecha || !Number.isFinite(duracion) || duracion <= 0) {
      return NextResponse.json({ error: 'Missing/invalid parameters' }, { status: 400 })
    }

    const supabase = await createClient()
    const dow = dayOfWeek0Sunday(fecha)
    const intervalo = 30

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

    // Mapa: profesional_id -> {startMin, endMin}
    const horarioMap = new Map<string, { start: number; end: number }>()
    for (const h of horarios || []) {
      const start = minutesSinceMidnight(toHHMMSS(String(h.hora_inicio)))
      const end = minutesSinceMidnight(toHHMMSS(String(h.hora_fin)))
      horarioMap.set(String(h.profesional_id), { start, end })
    }

    if (horarioMap.size === 0) return NextResponse.json({ slots: [] })

    // 3) Turnos que bloquean ese día (pendiente/confirmado)
    const { data: turnos, error: turnErr } = await supabase
      .from('turnos')
      .select('profesional_id, hora_inicio, hora_fin, estado')
      .eq('negocio_id', negocio_id)
      .eq('fecha', fecha)
      .in('estado', ['pendiente', 'confirmado'])
      .in('profesional_id', Array.from(horarioMap.keys()))

    if (turnErr) {
      console.error('Error turnos:', turnErr)
      return NextResponse.json({ error: 'Error turnos' }, { status: 500 })
    }

    // Armamos turnos por profesional en minutos
    const turnosByPro = new Map<string, Array<{ start: number; end: number }>>()
    for (const t of turnos || []) {
      const pid = String(t.profesional_id)
      const start = minutesSinceMidnight(toHHMMSS(String(t.hora_inicio)))
      const end = minutesSinceMidnight(toHHMMSS(String(t.hora_fin)))
      if (!turnosByPro.has(pid)) turnosByPro.set(pid, [])
      turnosByPro.get(pid)!.push({ start, end })
    }

    // 4) Generar slots globales: si AL MENOS 1 profesional puede tomarlo entero
    const slotsSet = new Set<string>()

    // Para limitar el rango, tomamos el mínimo inicio y máximo fin entre horarios
    let globalStart = Infinity
    let globalEnd = -Infinity
    for (const { start, end } of horarioMap.values()) {
      globalStart = Math.min(globalStart, start)
      globalEnd = Math.max(globalEnd, end)
    }

    // Normalizamos a múltiplos de 30
    const startRounded = Math.ceil(globalStart / intervalo) * intervalo
    const endRounded = Math.floor(globalEnd / intervalo) * intervalo

    for (let startMin = startRounded; startMin <= endRounded; startMin += intervalo) {
      const endMin = startMin + duracion

      // Si se pasa del final global, igual puede servir para alguno, pero lo chequeamos per-pro
      let anyProAvailable = false

      for (const [pid, h] of horarioMap.entries()) {
        // debe entrar dentro del horario del profesional
        if (startMin < h.start || endMin > h.end) continue

        // no debe solaparse con turnos bloqueantes
        const ocupados = turnosByPro.get(pid) || []
        const solapa = ocupados.some((r) => r.start < endMin && r.end > startMin)
        if (solapa) continue

        anyProAvailable = true
        break
      }

      if (anyProAvailable) {
        slotsSet.add(hhmmssFromMinutes(startMin))
      }
    }

    const slots = Array.from(slotsSet).sort() // HH:MM:SS lexicográfico funciona

    return NextResponse.json({ slots })
  } catch (e) {
    console.error('slots-disponibles error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
