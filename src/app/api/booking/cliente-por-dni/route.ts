import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

function normalizeDni(v: string) {
  return String(v || '').replace(/\D/g, '').trim()
}

export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const negocio_id = String(searchParams.get('negocio_id') || '').trim()
    const dni = normalizeDni(searchParams.get('dni') || '')

    if (!negocio_id || !dni) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data, error } = await admin
      .from('clientes')
      .select('id, dni, nombre, email, telefono')
      .eq('negocio_id', negocio_id)
      .eq('dni', dni)
      .maybeSingle()

    if (error) {
      console.error('Lookup cliente por DNI error:', error)
      return NextResponse.json({ error: 'Error buscando cliente' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ found: false }, { status: 404 })
    }

    return NextResponse.json({
      found: true,
      cliente: {
        dni: data.dni || dni,
        nombre: data.nombre || '',
        email: data.email || '',
        telefono: data.telefono || '',
      },
    })
  } catch (e) {
    console.error('GET /api/booking/cliente-por-dni error:', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
