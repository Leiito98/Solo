import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "getsolo.site";

function pickHost(req: NextRequest) {
  const hostHeader = req.headers.get("host") || "";
  const forwardedHost = req.headers.get("x-forwarded-host") || "";
  const hostToUse = forwardedHost.includes(".") ? forwardedHost : hostHeader;

  return hostToUse.split(":")[0].toLowerCase(); // sin puerto
}

function isRootHost(host: string) {
  if (!host) return true;
  if (host === "localhost" || host.endsWith(".localhost")) return true;

  // Preview/prod de Vercel
  if (host.endsWith(".vercel.app")) return true;

  // Root domain o www.root
  if (host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`) return true;

  return false;
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ─────────────────────────────────────────
  // 0) API siempre pasa
  // ─────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const host = pickHost(req);
  const onRoot = isRootHost(host);

  // ─────────────────────────────────────────
  // 1) /negocio/:slug en ROOT → redirect a subdominio
  // ─────────────────────────────────────────
  if (onRoot && pathname.startsWith("/negocio/")) {
    const parts = pathname.split("/").filter(Boolean);
    const slug = parts[1];

    if (slug) {
      const rest = parts.slice(2).join("/");
      const target = new URL(req.url);

      if (host === "localhost" || host.endsWith(".localhost")) {
        return NextResponse.next();
      }

      target.hostname = `${slug}.${ROOT_DOMAIN}`;
      target.pathname = rest ? `/${rest}` : "/";
      target.search = req.nextUrl.search;

      return NextResponse.redirect(target, 308);
    }
  }

  // ─────────────────────────────────────────
  // 2) Detectar subdominio
  // ─────────────────────────────────────────
  const slugFromQuery = req.nextUrl.searchParams.get("slug");

  if (slugFromQuery && !pathname.startsWith("/negocio/")) {
    return NextResponse.rewrite(
      new URL(`/negocio/${slugFromQuery}${pathname}`, req.url)
    );
  }

  let subdomain: string | null = null;

  if (!onRoot) {
    const parts = host.split(".");

    if (parts.length >= 3 && host.endsWith(`.${ROOT_DOMAIN}`)) {
      subdomain = parts[0];
      if (subdomain === "www") subdomain = null;
    }
  }

  if (
    subdomain &&
    !pathname.startsWith("/negocio/") &&
    !pathname.startsWith("/_next/") &&
    !pathname.startsWith("/api/")
  ) {
    return NextResponse.rewrite(
      new URL(`/negocio/${subdomain}${pathname}`, req.url)
    );
  }

  // ─────────────────────────────────────────
  // 3) Rutas públicas
  // ─────────────────────────────────────────
  const ALWAYS_PUBLIC = ["/", "/login", "/register", "/callback", "/suscripcion"];

  if (ALWAYS_PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/negocio/")) {
    return NextResponse.next();
  }

  // ─────────────────────────────────────────
  // 4) Protección dashboard / pro
  // ─────────────────────────────────────────
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/pro")) {
    const res = NextResponse.next();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              req.cookies.set(name, value);
              res.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: negocio } = await supabase
        .from("negocios")
        .select("trial_ends_at, suscripcion_estado")
        .eq("owner_id", user.id)
        .single();

      if (negocio) {
        const ahora = new Date();
        const estaEnTrial = negocio.suscripcion_estado === "trial";
        const trialVencido =
          negocio.trial_ends_at && new Date(negocio.trial_ends_at) < ahora;

        const estaBloqueado =
          negocio.suscripcion_estado === "bloqueada" ||
          negocio.suscripcion_estado === "cancelada" ||
          (estaEnTrial && trialVencido);

        if (estaBloqueado) {
          return NextResponse.redirect(new URL("/suscripcion", req.url));
        }
      }
    }

    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)).*)",
  ],
};
