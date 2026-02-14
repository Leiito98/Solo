import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // No reescribir rutas de API
  if (pathname.startsWith("/api/")) return NextResponse.next();

  // Si ya estás en /negocio/... no reescribas
  if (pathname.startsWith("/negocio/")) return NextResponse.next();

  // 1) Detectar host real (ngrok manda x-forwarded-host)
  const forwardedHost = req.headers.get("x-forwarded-host");
  const hostHeader = forwardedHost || req.headers.get("host") || "";
  const host = hostHeader.split(":")[0];

  // 2) Si viene slug por query (modo ngrok): /?slug=barbershop
  const slugFromQuery = req.nextUrl.searchParams.get("slug");
  if (slugFromQuery) {
    return NextResponse.rewrite(
      new URL(`/negocio/${slugFromQuery}${pathname}`, req.url)
    );
  }

  // 3) Modo subdominio local: barbershop.lvh.me
  const parts = host.split(".");
  let subdomain: string | null = null;

  // Para lvh.me: barbershop.lvh.me -> 3 partes
  if (parts.length === 3) subdomain = parts[0];

  if (subdomain && subdomain !== "www") {
    return NextResponse.rewrite(
      new URL(`/negocio/${subdomain}${pathname}`, req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)).*)',
  ],
}
