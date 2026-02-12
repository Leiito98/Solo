import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Verifica el token llamando directamente al endpoint de MP (más confiable que el SDK)
async function verificarTokenMP(token: string): Promise<{ valido: boolean; error?: string }> {
  try {
    const res = await fetch('https://api.mercadopago.com/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (res.status === 401) {
      return { valido: false, error: 'Token inválido. Verificá que sea correcto en tu panel de MercadoPago.' }
    }

    if (res.status === 403) {
      return { valido: false, error: 'Estas pegando Public Key, Copia el Access Token.' }
    }

    if (!res.ok) {
      // Cualquier otro error no-auth lo tratamos como no-bloqueante
      console.warn(`MP /users/me respondió ${res.status}, guardamos igual`)
      return { valido: true }
    }

    return { valido: true }
  } catch (err) {
    // Error de red u otro => no bloqueamos al usuario
    console.warn('No se pudo verificar el token MP (error de red), guardando igual:', err)
    return { valido: true }
  }
}

// GET /api/configuracion/mercadopago
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: negocio, error } = await supabase
    .from('negocios')
    .select('id, mp_access_token')
    .eq('owner_id', user.id)
    .single()

  if (error || !negocio) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  const token = negocio.mp_access_token as string | null

  return NextResponse.json({
    configurado: !!token,
    token_preview: token ? `****${token.slice(-4)}` : null,
    token_tipo: token
      ? token.startsWith('TEST-') ? 'test' : token.startsWith('APP_USR-') ? 'produccion' : 'desconocido'
      : null,
  })
}

// POST /api/configuracion/mercadopago
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const token = String(body?.mp_access_token || '').trim()

  if (!token) {
    return NextResponse.json({ error: 'El token no puede estar vacío' }, { status: 400 })
  }

  // Validación básica de formato
  const validPrefixes = ['TEST-', 'APP_USR-']
  const hasValidPrefix = validPrefixes.some(p => token.startsWith(p))

  if (!hasValidPrefix) {
    return NextResponse.json(
      { error: 'Token inválido. Debe comenzar con TEST- (sandbox) o APP_USR- (producción)' },
      { status: 400 }
    )
  }

  // Verificar el token contra la API de MP
  const { valido, error: mpError } = await verificarTokenMP(token)
  if (!valido) {
    return NextResponse.json({ error: mpError }, { status: 400 })
  }

  // Obtener el negocio del owner
  const { data: negocio, error: negocioErr } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (negocioErr || !negocio) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  // Guardar el token
  const { error: updateErr } = await supabase
    .from('negocios')
    .update({ mp_access_token: token })
    .eq('id', negocio.id)
    .eq('owner_id', user.id)

  if (updateErr) {
    console.error('Error saving MP token:', updateErr)
    return NextResponse.json({ error: 'Error al guardar la configuración' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    token_preview: `****${token.slice(-4)}`,
    token_tipo: token.startsWith('TEST-') ? 'test' : 'produccion',
  })
}

// DELETE /api/configuracion/mercadopago
export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: negocio, error: negocioErr } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (negocioErr || !negocio) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  const { error: updateErr } = await supabase
    .from('negocios')
    .update({ mp_access_token: null })
    .eq('id', negocio.id)
    .eq('owner_id', user.id)

  if (updateErr) {
    return NextResponse.json({ error: 'Error al desvincular' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}