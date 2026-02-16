import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ─────────────────────────────────────────────────────────
  // 1) Rutas que SIEMPRE deben pasar sin auth y SIN rewrites raros
  //    (webhook / callback / auth / suscripción / home)
  // ─────────────────────────────────────────────────────────
  const ALWAYS_PUBLIC = [
    "/", // landing
    "/login",
    "/register",
    "/callback",
    "/suscripcion",
  ];

  // Webhooks/API: nunca los toques
  if (pathname.startsWith("/api/suscripcion/webhook")) {
    return NextResponse.next();
  }

  // Todo api también pasa
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Rutas públicas “normales”
  if (ALWAYS_PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    // OJO: para estas rutas NO queremos rewrite a /negocio/... por subdominio,
    // porque rompen el back_url/return en ngrok y auth.
    return NextResponse.next();
  }

  // Páginas públicas de negocio por slug (sí reescribimos)
  if (pathname.startsWith("/negocio/")) {
    return NextResponse.next();
  }

  // ─────────────────────────────────────────────────────────
  // 2) Bloqueo solo para app interna (dashboard / pro)
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

    // Si no está logueado, dejalo pasar (o si querés, redirigí a /login)
    // Yo lo dejo pasar porque vos no pediste gate de auth acá.
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

  // ─────────────────────────────────────────────────────────
  // 3) Para el resto de rutas, aplicamos tu rewrite de subdominio
  // ─────────────────────────────────────────────────────────
  return handleSubdomain(req);
}

// Tu lógica de subdominios (ajustada para ngrok)
function handleSubdomain(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Nunca reescribas assets / api / negocio
  if (pathname.startsWith("/api/")) return NextResponse.next();
  if (pathname.startsWith("/negocio/")) return NextResponse.next();

  // Host: en dev/ngrok a veces forwarded-host viene raro
  const hostHeader = req.headers.get("host") || "";
  const forwardedHost = req.headers.get("x-forwarded-host");
  const hostToUse = (forwardedHost && forwardedHost.includes(".")) ? forwardedHost : hostHeader;
  const host = hostToUse.split(":")[0];

  // Si pasan slug por query, reescribimos a /negocio/:slug
  const slugFromQuery = req.nextUrl.searchParams.get("slug");
  if (slugFromQuery) {
    return NextResponse.rewrite(
      new URL(`/negocio/${slugFromQuery}${pathname}`, req.url)
    );
  }

  // Subdominio: solo para dominios tipo xxx.tudominio.com
  // NO para ngrok-free.app (tiene más niveles)
  const parts = host.split(".");
  let subdomain: string | null = null;

  // Ej: barberia.getsolo.site => 3 partes => subdomain ok
  if (parts.length === 3) subdomain = parts[0];

  if (subdomain && subdomain !== "www") {
    return NextResponse.rewrite(new URL(`/negocio/${subdomain}${pathname}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)).*)",
  ],
};
