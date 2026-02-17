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
    const nombre = String(searchParams.get('nombre') || '').trim()
    const email = String(searchParams.get('email') || '').trim()
    const telefono = String(searchParams.get('telefono') || '').trim()

    if (!negocio_id || !dni) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    const admin = createAdminClient()

    // 1️⃣ Buscar cliente existente
    const { data: cliente, error } = await admin
      .from('clientes')
      .select('id, dni, nombre, email, telefono')
      .eq('negocio_id', negocio_id)
      .eq('dni', dni)
      .maybeSingle()

    if (error) {
      console.error(error)
      return NextResponse.json({ error: 'Error buscando cliente' }, { status: 500 })
    }

    // 2️⃣ Si existe → devolverlo
    if (cliente) {
      return NextResponse.json({
        found: true,
        cliente,
      })
    }

    // 3️⃣ Si no existe → crear
    const { data: nuevo, error: insertError } = await admin
      .from('clientes')
      .insert({
        negocio_id,
        dni,
        nombre,
        email,
        telefono,
      })
      .select()
      .single()

    if (insertError) {
      console.error(insertError)
      return NextResponse.json({ error: 'Error creando cliente' }, { status: 500 })
    }

    // 4️⃣ Devolver cliente recién creado
    return NextResponse.json({
      found: false,
      created: true,
      cliente: nuevo,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
