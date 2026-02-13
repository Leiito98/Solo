import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

function slugify(input: string) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-')
}

export async function GET(req: Request) {
  const supabase = await createClient()

  // opcional: solo owners logueados (recomendado)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const slugRaw = url.searchParams.get('slug') || ''
  const current = slugify(url.searchParams.get('current') || '')
  const slug = slugify(slugRaw)

  if (!slug) return NextResponse.json({ available: false, reason: 'empty' })
  if (slug === current) return NextResponse.json({ available: true, reason: 'current' })

  const { data, error } = await supabase
    .from('negocios')
    .select('id')
    .eq('slug', slug)
    .limit(1)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const available = (data || []).length === 0
  return NextResponse.json({ available })
}
