import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const raw = url.searchParams.get("slug") || ""
  const slug = slugify(raw)

  if (!slug || slug.length < 3) {
    return NextResponse.json({ available: false, slug, reason: "short" }, { status: 200 })
  }

  const supabaseAdmin = createAdminClient()

  const { data, error } = await supabaseAdmin
    .from("negocios")
    .select("id")
    .eq("slug", slug)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ available: false, slug, reason: "error" }, { status: 200 })
  }

  return NextResponse.json({ available: !data, slug }, { status: 200 })
}
