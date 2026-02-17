// app/page.tsx (SERVER)
import type { Metadata } from "next"
import LandingClient from "./landing-client"

const SITE = "https://getsolo.site"
const CANONICAL = `${SITE}/`

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Solo | Agenda online, señas con MercadoPago y gestión para profesionales",
  description:
    "Sistema todo-en-uno para negocios de servicios: turnos online 24/7, señas con MercadoPago, comisiones, finanzas y tu web de reservas. Probá 14 días gratis sin tarjeta.",
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: "website",
    url: CANONICAL,
    title: "Solo | Turnos online + señas con MercadoPago",
    description:
      "Agenda online 24/7, recordatorios, comisiones y finanzas. Tu web de reservas en minutos. 14 días gratis sin tarjeta.",
    siteName: "Solo",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Solo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solo | Turnos online + señas con MercadoPago",
    description:
      "Agenda online 24/7, recordatorios, comisiones y finanzas. 14 días gratis sin tarjeta.",
    images: ["/og.png"],
  },
}

function jsonLd() {
  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Solo",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: CANONICAL,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "ARS",
      description: "Prueba gratis 14 días (sin tarjeta).",
    },
    featureList: [
      "Agenda online 24/7",
      "Señas con MercadoPago",
      "Comisiones automáticas",
      "Finanzas y dashboard",
      "Página de reservas por negocio",
    ],
  }

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Solo",
    url: SITE,
    logo: `${SITE}/logo/solo.png`,
  }

  return JSON.stringify([software, organization])
}

export default function Page() {
  return (
    <>
      {/* JSON-LD para mejorar “entendimiento” y CTR */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />
      <LandingClient />
    </>
  )
}
