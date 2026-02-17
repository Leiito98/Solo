import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

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
      return { valido: false, error: 'Estás pegando Public Key. Copiá el Access Token.' }
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

// GET /api/configuracion/integraciones/mercadopago
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: negocio, error } = await supabase
    .from('negocios')
    .select('id, mp_connected_at, mp_sena_pct')
    .eq('owner_id', user.id)
    .single()

  if (error || !negocio) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  return NextResponse.json({
    ok: true,
    configurado: !!(negocio as any).mp_connected_at,
    mp_connected_at: (negocio as any).mp_connected_at ?? null,
    mp_sena_pct: (negocio as any).mp_sena_pct ?? 50,
  })
}

// POST /api/configuracion/integraciones/mercadopago
// 👉 Modo manual (Avanzado): guarda Access Token en tabla segura + marca mp_connected_at
export async function POST(req: Request) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const token = String(body?.mp_access_token || '').trim()
  const senaPct = Math.min(100, Math.max(1, Number(body?.mp_sena_pct ?? 50)))

  if (!token) {
    return NextResponse.json({ error: 'El token no puede estar vacío' }, { status: 400 })
  }

  // Validación básica de formato
  const validPrefixes = ['TEST-', 'APP_USR-']
  const hasValidPrefix = validPrefixes.some((p) => token.startsWith(p))
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

  // Obtener el negocio del owner (RLS-safe)
  const { data: negocio, error: negocioErr } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (negocioErr || !negocio?.id) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  const nowIso = new Date().toISOString()

  // 1) Guardar token en tabla segura (service role)
  const { error: upsertErr } = await admin
    .from('negocio_mp_tokens')
    .upsert(
      {
        negocio_id: negocio.id,
        mp_access_token: token,
        mp_refresh_token: null, // manual no trae refresh
        mp_connected_at: nowIso,
        updated_at: nowIso,
      },
      { onConflict: 'negocio_id' }
    )

  if (upsertErr) {
    console.error('Error saving MP token (secure table):', upsertErr)
    return NextResponse.json({ error: 'Error al guardar la configuración (tokens)' }, { status: 500 })
  }

  // 2) Marcar conexión y guardar seña pct (tabla pública, sin secretos)
  const { error: updateNegocioErr } = await supabase
    .from('negocios')
    .update({ mp_connected_at: nowIso, mp_sena_pct: senaPct })
    .eq('id', negocio.id)
    .eq('owner_id', user.id)

  if (updateNegocioErr) {
    console.error('Error updating negocios mp_connected_at:', updateNegocioErr)
    return NextResponse.json({ error: 'Error al guardar la configuración' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    mp_connected_at: nowIso,
    mp_sena_pct: senaPct,
  })
}

// PATCH /api/configuracion/integraciones/mercadopago — actualizar solo mp_sena_pct
export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const senaPct = Math.min(100, Math.max(1, Number(body?.mp_sena_pct ?? 50)))

  const { data: negocio, error: negocioErr } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (negocioErr || !negocio) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

  const { error: updateErr } = await supabase
    .from('negocios')
    .update({ mp_sena_pct: senaPct })
    .eq('id', negocio.id)
    .eq('owner_id', user.id)

  if (updateErr) return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })

  return NextResponse.json({ ok: true, mp_sena_pct: senaPct })
}

// DELETE /api/configuracion/integraciones/mercadopago
// 👉 Borra tokens + desconecta (mp_connected_at = null)
export async function DELETE() {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: negocio, error: negocioErr } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (negocioErr || !negocio?.id) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  // 1) borrar tokens seguros
  const { error: delErr } = await admin
    .from('negocio_mp_tokens')
    .delete()
    .eq('negocio_id', negocio.id)

  if (delErr) {
    console.error('Error deleting negocio_mp_tokens:', delErr)
    return NextResponse.json({ error: 'Error al desvincular (tokens)' }, { status: 500 })
  }

  // 2) desconectar (sin secretos)
  const { error: updateErr } = await supabase
    .from('negocios')
    .update({ mp_connected_at: null })
    .eq('id', negocio.id)
    .eq('owner_id', user.id)

  if (updateErr) {
    console.error('Error setting mp_connected_at null:', updateErr)
    return NextResponse.json({ error: 'Error al desvincular' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
