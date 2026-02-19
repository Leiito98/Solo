import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const ROOT_HOST = "getsolo.site";

function getOriginFromReq(req: Request) {
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

function toRootOrigin(req: Request) {
  const url = new URL(req.url);
  return `${url.protocol}//${ROOT_HOST}`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  // ✅ 0) Canonical: si viene por www -> mandar a root UNA sola vez
  if (url.host === `www.${ROOT_HOST}`) {
    const target = new URL(req.url);
    target.host = ROOT_HOST; // mantiene path + query
    return NextResponse.redirect(target, 308);
  }

  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/register?step=2";

  // ✅ Usar origin real del request (ya canónico si no era www)
  const origin = getOriginFromReq(req);

  if (!code) {
    return NextResponse.redirect(new URL("/register?error=missing_code", origin));
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
    return NextResponse.redirect(
      new URL(`/register?error=${encodeURIComponent(error.message)}`, origin)
    );
  }

  // ✅ ya hay sesión en cookies -> redirigir al next
  // Seguridad: evitar open-redirects
  const safeNext = next.startsWith("/") ? next : "/register?step=2";

  return NextResponse.redirect(new URL(safeNext, origin));
}
