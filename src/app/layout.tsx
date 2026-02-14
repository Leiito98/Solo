// app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "getsolo.site"
const RESERVED_SUBDOMAINS = new Set(["www", "app", "admin", "dashboard", "api"])

function pickHost(h: Headers) {
  return h.get("x-forwarded-host") || h.get("host") || ""
}

function getSubdomainFromHost(host: string) {
  const clean = host.split(":")[0].toLowerCase()
  if (!clean || clean === "localhost") return null

  // Si estás entrando por dominio de Vercel (preview o prod), tratá como plataforma
  if (clean.endsWith(".vercel.app")) return null

  // Si es el dominio raíz o www del root
  if (clean === ROOT_DOMAIN || clean === `www.${ROOT_DOMAIN}`) return null

  // Si termina en el root domain => extraer subdominio
  if (clean.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = clean.replace(`.${ROOT_DOMAIN}`, "")
    if (!sub || RESERVED_SUBDOMAINS.has(sub)) return null
    return sub
  }

  // Otros hosts raros => no asumir tenant
  return null
}

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  const host = pickHost(h)
  const sub = getSubdomainFromHost(host)

  if (!sub) {
    return {
      title: "Solo - Tu negocio online",
      description: "Plataforma para profesionales independientes",
    }
  }

  const supabase = await createClient()
  const { data: negocio } = await supabase
    .from("negocios")
    .select("nombre, logo_url")
    .eq("slug", sub)
    .maybeSingle()

  const nombre = negocio?.nombre?.trim()
  const logo = negocio?.logo_url || undefined

  return {
    title: nombre ? `${nombre} | Reservas Online` : "Solo - Tu negocio online",
    description: nombre
      ? `Reservas online para ${nombre}`
      : "Plataforma para profesionales independientes",
    ...(logo
      ? {
          icons: {
            icon: logo,
            shortcut: logo,
            apple: logo,
          },
        }
      : {}),
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  )
}
