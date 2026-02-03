import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const hostHeader = req.headers.get("host") || ""; // "tio.lvh.me:3000"
  const host = hostHeader.split(":")[0];            // "tio.lvh.me"
  const pathname = req.nextUrl.pathname;

  const parts = host.split(".");
  let subdomain: string | null = null;

  if (parts.length === 3) subdomain = parts[0];

  if (subdomain && subdomain !== "www") {
    return NextResponse.rewrite(
      new URL(`/negocio/${subdomain}${pathname}`, req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
