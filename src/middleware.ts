import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ─────────────────────────────────────────────────────────
  // 0) Webhooks y API: nunca los toques
  // ─────────────────────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // ─────────────────────────────────────────────────────────
  // 1) Detectar subdominio de negocio PRIMERO
  //    Esto tiene que ir antes que cualquier otra regla,
  //    porque "/" matchea ALWAYS_PUBLIC y corta el flujo.
  // ─────────────────────────────────────────────────────────
  const hostHeader = req.headers.get("host") || "";
  const forwardedHost = req.headers.get("x-forwarded-host");
  const hostToUse =
    forwardedHost && forwardedHost.includes(".") ? forwardedHost : hostHeader;
  const host = hostToUse.split(":")[0]; // quitar puerto

  // Slug por query param (ej: localhost:3000/?slug=ovejas-negras)
  const slugFromQuery = req.nextUrl.searchParams.get("slug");
  if (slugFromQuery && !pathname.startsWith("/negocio/")) {
    return NextResponse.rewrite(
      new URL(`/negocio/${slugFromQuery}${pathname}`, req.url)
    );
  }

  // Subdominio: soporta tanto xxx.getsolo.site (3 partes) como 
  // subdominios con guiones (ovejas-negras.getsolo.site también es 3 partes)
  const parts = host.split(".");
  const ROOT_DOMAINS = ["getsolo.site", "localhost"]; // añadí tus dominios raíz acá

  let subdomain: string | null = null;

  if (parts.length === 3) {
    // ovejas-negras.getsolo.site → ["ovejas-negras", "getsolo", "site"]
    subdomain = parts[0];
  } else if (parts.length === 4) {
    // por si usás www.ovejas-negras.getsolo.site (poco probable, pero cubierto)
    subdomain = parts[1];
  }

  // Si hay subdominio y no es "www", reescribir a /negocio/:slug
  if (
    subdomain &&
    subdomain !== "www" &&
    !pathname.startsWith("/negocio/") &&
    !pathname.startsWith("/_next/") &&
    !pathname.startsWith("/api/")
  ) {
    return NextResponse.rewrite(
      new URL(`/negocio/${subdomain}${pathname}`, req.url)
    );
  }

  // ─────────────────────────────────────────────────────────
  // 2) Rutas que siempre pasan sin auth (solo en dominio raíz)
  // ─────────────────────────────────────────────────────────
  const ALWAYS_PUBLIC = ["/", "/login", "/register", "/callback", "/suscripcion"];

  if (
    ALWAYS_PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"))
  ) {
    return NextResponse.next();
  }

  // Páginas /negocio/* son públicas
  if (pathname.startsWith("/negocio/")) {
    return NextResponse.next();
  }

  // ─────────────────────────────────────────────────────────
  // 3) Protección de dashboard / pro con check de suscripción
  // ─────────────────────────────────────────────────────────
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