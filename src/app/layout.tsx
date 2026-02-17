// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "Solo.site";
const RESERVED_SUBDOMAINS = new Set(["www", "app", "admin", "dashboard", "api"]);

function pickHost(h: Headers) {
  return (h.get("x-forwarded-host") || h.get("host") || "").toLowerCase();
}

function cleanHost(host: string) {
  return host.split(":")[0];
}

function getSubdomainFromHost(host: string) {
  const clean = cleanHost(host);
  if (!clean || clean === "localhost" || clean.endsWith(".localhost")) return null;

  // Si estás entrando por dominio de Vercel (preview o prod), tratá como plataforma
  if (clean.endsWith(".vercel.app")) return null;

  // Si es el dominio raíz o www del root
  if (clean === ROOT_DOMAIN || clean === `www.${ROOT_DOMAIN}`) return null;

  // Si termina en el root domain => extraer subdominio
  if (clean.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = clean.replace(`.${ROOT_DOMAIN}`, "");
    if (!sub || RESERVED_SUBDOMAINS.has(sub)) return null;
    return sub;
  }

  // Otros hosts raros => no asumir tenant
  return null;
}

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const host = pickHost(h);
  const sub = getSubdomainFromHost(host);

  // ROOT (marketing)
  if (!sub) {
    return {
      metadataBase: new URL(`https://${ROOT_DOMAIN}`),
      title: {
        default: "Solo — Turnos, cobros y gestión para profesionales",
        template: "%s — Solo",
      },
      description:
        "Sistema de turnos online para profesionales en Argentina. Cobrá señas, reducí ausencias y gestioná tu negocio en un solo lugar.",
      alternates: {
        canonical: `https://${ROOT_DOMAIN}`,
      },
      openGraph: {
        type: "website",
        url: `https://${ROOT_DOMAIN}`,
        siteName: "Solo",
        title: "Solo — Turnos, cobros y gestión para profesionales",
        description:
          "Turnos online + cobro de señas + gestión de ingresos/egresos, comisiones e inventario.",
        images: [
          {
            url: "/og.png",
            width: 1200,
            height: 630,
            alt: "Solo",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Solo — Turnos, cobros y gestión para profesionales",
        description:
          "Turnos online + cobro de señas + gestión completa para profesionales.",
        images: ["/og.png"],
      },
      robots: { index: true, follow: true },
      icons: {
        icon: "/favicon.ico",
      },
    };
  }

  // TENANT (subdominio)
  const supabase = await createClient();
  const { data: negocio } = await supabase
    .from("negocios")
    .select("nombre, logo_url, banner_url, slug, descripcion")
    .eq("slug", sub)
    .maybeSingle();

  const nombre = negocio?.nombre?.trim() || sub;
  const desc =
    negocio?.descripcion?.trim() ||
    `Reservas online y turnos para ${nombre} con Solo.`;

  // Imagen preferida para OG: banner > logo > default
  const ogImage = negocio?.banner_url || negocio?.logo_url || "/og.png";
  const canonical = `https://${sub}.${ROOT_DOMAIN}`;

  const icons = negocio?.logo_url
    ? {
        icon: negocio.logo_url,
        shortcut: negocio.logo_url,
        apple: negocio.logo_url,
      }
    : { icon: "/favicon.ico" };

  return {
    metadataBase: new URL(canonical),
    title: `${nombre} | Reservas Online`,
    description: desc,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "Solo",
      title: `${nombre} | Reservas Online`,
      description: desc,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: nombre,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${nombre} | Reservas Online`,
      description: desc,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
    icons,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
