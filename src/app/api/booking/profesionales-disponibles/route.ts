import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

function toHHMMSS(h: string) {
  const s = String(h || '').trim()
  if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s
  if (/^\d{2}:\d{2}$/.test(s)) return `${s}:00`
  throw new Error(`Invalid time: ${s}`)
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

function dayOfWeek0Sunday(fechaYYYYMMDD: string) {
  // JS: 0=domingo .. 6=sábado (coincide con tu schema)
  const d = new Date(`${fechaYYYYMMDD}T00:00:00`)
  return d.getDay()
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)

    const negocio_id = (url.searchParams.get('negocio_id') || '').trim()
    const fecha = (url.searchParams.get('fecha') || '').trim() // yyyy-mm-dd
    const horaRaw = (url.searchParams.get('hora') || '').trim() // HH:mm o HH:mm:ss
    const duracion = Number(url.searchParams.get('duracion') || 30)

    if (!negocio_id || !fecha || !horaRaw || !Number.isFinite(duracion) || duracion <= 0) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const slotStartHHMMSS = toHHMMSS(horaRaw)
    const slotStartMin = minutesSinceMidnight(slotStartHHMMSS)
    const slotEndMin = slotStartMin + duracion
    const slotEndHHMMSS = hhmmssFromMinutes(slotEndMin)

    const dow = dayOfWeek0Sunday(fecha)
    const supabase = await createClient()

    // 1) Profesionales activos del negocio
    const { data: pros, error: prosErr } = await supabase
      .from('profesionales')
      .select('id, nombre, especialidad, foto_url')
      .eq('negocio_id', negocio_id)
      .eq('activo', true)

    if (prosErr) {
      console.error('prosErr', prosErr)
      return NextResponse.json({ error: 'Error profesionales' }, { status: 500 })
    }

    if (!pros || pros.length === 0) {
      return NextResponse.json({ profesionales: [], count: 0 })
    }

    const profesionalIds = pros.map((p) => p.id)

    // 2) Horarios del día (que cubran slot entero)
    const { data: horarios, error: horErr } = await supabase
      .from('horarios_trabajo')
      .select('profesional_id, hora_inicio, hora_fin')
      .in('profesional_id', profesionalIds)
      .eq('dia_semana', dow)
      .eq('activo', true)

    if (horErr) {
      console.error('horErr', horErr)
      return NextResponse.json({ error: 'Error horarios' }, { status: 500 })
    }

    const horarioOk = new Set<string>()
    for (const h of horarios || []) {
      const start = minutesSinceMidnight(toHHMMSS(String(h.hora_inicio)))
      const end = minutesSinceMidnight(toHHMMSS(String(h.hora_fin)))
      if (slotStartMin >= start && slotEndMin <= end) {
        horarioOk.add(String(h.profesional_id))
      }
    }

    if (horarioOk.size === 0) {
      return NextResponse.json({ profesionales: [], count: 0 })
    }

    // 3) Turnos que bloquean el slot (solapamiento)
    // bloquean: pendiente/confirmado (completado no)
    const { data: turnos, error: turnErr } = await supabase
      .from('turnos')
      .select('profesional_id')
      .eq('negocio_id', negocio_id)
      .eq('fecha', fecha)
      .in('estado', ['pendiente', 'confirmado'])
      .in('profesional_id', Array.from(horarioOk))
      .lt('hora_inicio', slotEndHHMMSS)
      .gt('hora_fin', slotStartHHMMSS)

    if (turnErr) {
      console.error('turnErr', turnErr)
      return NextResponse.json({ error: 'Error turnos' }, { status: 500 })
    }

    const ocupados = new Set<string>((turnos || []).map((t) => String(t.profesional_id)))

    const disponibles = pros.filter((p) => horarioOk.has(p.id) && !ocupados.has(p.id))

    return NextResponse.json({ profesionales: disponibles, count: disponibles.length })
  } catch (e) {
    console.error('profesionales-disponibles error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
