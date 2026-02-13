import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

function isValidUrl(u: string) {
  try {
    const url = new URL(u)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const nombre = String(body?.nombre || '').trim()
  const websiteRaw = body?.website ? String(body.website).trim() : ''
  const detalle = body?.detalle ? String(body.detalle).trim() : ''

  if (!nombre) return NextResponse.json({ error: 'Nombre de integración requerido' }, { status: 400 })
  if (websiteRaw && !isValidUrl(websiteRaw)) return NextResponse.json({ error: 'Website inválido' }, { status: 400 })

  // Traer negocio del owner para contexto (opcional pero útil)
  const { data: negocio } = await supabase
    .from('negocios')
    .select('id, nombre, slug')
    .eq('owner_id', user.id)
    .single()

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return NextResponse.json({ error: 'Falta RESEND_API_KEY en env' }, { status: 500 })

  // OJO: en Resend el FROM debe ser un dominio verificado.
  // Recomendación: no-reply@getsolo.site o notifications@getsolo.site
  const from = process.env.RESEND_FROM || 'no-reply@getsolo.site'
  const to = 'support@getsolo.site'

  const subject = `Solicitud de integración: ${nombre}`
  const text = [
    `Nueva solicitud de integración`,
    ``,
    `Integración: ${nombre}`,
    `Website: ${websiteRaw || '-'}`,
    `Detalle: ${detalle || '-'}`,
    ``,
    `Usuario: ${user.email || user.id}`,
    `Negocio: ${negocio?.nombre || '-'} (${negocio?.slug || '-'})`,
    `Negocio ID: ${negocio?.id || '-'}`,
    ``,
    `Fecha: ${new Date().toISOString()}`,
  ].join('\n')

  const resend = new Resend(resendKey)

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    text,
    // para que vos puedas responderle al usuario directo:
    replyTo: user.email || undefined,
  })

  if (error) {
    return NextResponse.json({ error: error.message || 'No se pudo enviar el email' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
