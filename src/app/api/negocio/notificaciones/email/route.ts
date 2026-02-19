import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

function cleanStr(v: unknown) {
  const s = typeof v === "string" ? v.trim() : ""
  return s.length ? s : null
}

function isEmail(v: string) {
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v.trim())
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => null)

    const notif_email_cliente_confirm = Boolean(body?.notif_email_cliente_confirm)
    const notif_email_owner_new_booking = Boolean(body?.notif_email_owner_new_booking)
    const notif_email_reply_to_raw = cleanStr(body?.notif_email_reply_to)

    if (notif_email_reply_to_raw && !isEmail(notif_email_reply_to_raw)) {
      return NextResponse.json({ error: "Reply-To inválido" }, { status: 400 })
    }

    // tu modelo: 1 negocio por owner (si después soportás más, cambiás esto)
    const { data: negocio, error: nErr } = await supabase
      .from("negocios")
      .select("id")
      .eq("owner_id", user.id)
      .single()

    if (nErr || !negocio?.id) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 })
    }

    const { data: updated, error: uErr } = await supabase
      .from("negocios")
      .update({
        notif_email_cliente_confirm,
        notif_email_owner_new_booking,
        notif_email_reply_to: notif_email_reply_to_raw,
        updated_at: new Date().toISOString(),
      })
      .eq("id", negocio.id)
      .select(
        "id, email, notif_email_cliente_confirm, notif_email_owner_new_booking, notif_email_reply_to"
      )
      .single()

    if (uErr) {
      return NextResponse.json({ error: uErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, negocio: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}
