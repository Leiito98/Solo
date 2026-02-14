// app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

function pickHost(h: Headers) {
  // En prod muchas veces viene por proxy
  return (
    h.get("x-forwarded-host") ||
    h.get("host") ||
    ""
  )
}

function getSubdomainFromHost(host: string) {
  // "ovejas-negras.lvh.me:3000" -> "ovejas-negras"
  const clean = host.split(":")[0]
  if (!clean || clean === "localhost") return null

  const parts = clean.split(".")
  if (parts.length < 3) return null

  return parts[0]
}

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  const host = pickHost(h)
  const sub = getSubdomainFromHost(host)

  // Sin subdominio => título plataforma
  if (!sub) {
    return {
      title: "Solo - Tu negocio online",
      description: "Plataforma para profesionales independientes",
    }
  }

  const supabase = await createClient()

  const { data: negocio} = await supabase
    .from("negocios")
    .select("nombre, logo_url")
    .eq("slug", sub) // ✅ "ovejas-negras"
    .single()

  const nombre = negocio?.nombre?.trim()
  const logo = negocio?.logo_url

  return {
    title: nombre ? `${nombre} | Reservas Online` : "Reservas Online",
    icons: {
      icon: logo,
      shortcut: logo,
      apple: logo,
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  )
}
