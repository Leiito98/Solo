import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";

const ROOT_HOST = "getsolo.site";

export async function GET(req: Request) {
  const url = new URL(req.url);

  // Canonical: www -> root
  if (url.host === `www.${ROOT_HOST}`) {
    const target = new URL(req.url);
    target.host = ROOT_HOST;
    return NextResponse.redirect(target, 308);
  }

  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/register?step=2";

  const origin = `${url.protocol}//${ROOT_HOST}`;

  if (!code) {
    return NextResponse.redirect(new URL("/register?error=missing_code", origin));
  }

  // ✅ Creamos la response DESDE YA, para poder setear cookies ahí
  const safeNext = next.startsWith("/") ? next : "/register?step=2";
  const redirectTo = new URL(safeNext, origin);

  const res = NextResponse.redirect(redirectTo);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // leer cookies entrantes del request
          return (req as any).cookies?.getAll?.() ?? [];
        },
        setAll(cookiesToSet) {
          // ✅ escribir cookies en la response del redirect
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
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

  return res;
}
