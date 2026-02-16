import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const slug = String(body?.slug || "").trim()

  if (!slug) return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 })

  // Si querés permitir marcar SOLO cuando el dueño está logueado:
  // const supabase = await createClient()
  // const { data: { user } } = await supabase.auth.getUser()
  // if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const admin = createAdminClient()

  // Marcar timestamp (idempotente: si ya estaba, lo deja igual)
  const { data: negocio, error } = await admin
    .from("negocios")
    .select("id, public_preview_seen_at")
    .eq("slug", slug)
    .maybeSingle()

  if (error || !negocio) {
    return NextResponse.json({ ok: false, error: "Negocio not found" }, { status: 404 })
  }

  if (!negocio.public_preview_seen_at) {
    await admin
      .from("negocios")
      .update({ public_preview_seen_at: new Date().toISOString() })
      .eq("id", negocio.id)
  }

  return NextResponse.json({ ok: true })
}
