import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";

function getBaseUrl(req: Request) {
  // En Vercel / prod: https://getsolo.site (por env)
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (envUrl) return envUrl;

  // Fallback: lo deducimos desde el request
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/register?step=2";

  if (!code) {
    return NextResponse.redirect(new URL("/register?error=missing_code", getBaseUrl(req)));
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL(`/register?error=${encodeURIComponent(error.message)}`, getBaseUrl(req)));
  }

  // ✅ Ya hay sesión en cookies -> redirigimos al paso 2
  return NextResponse.redirect(new URL(next, getBaseUrl(req)));
}
