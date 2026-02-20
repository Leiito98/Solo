// app/page.tsx (SERVER)
import type { Metadata } from "next"
import LandingClient from "./landing-client"

const SITE = "https://getsolo.site"
const CANONICAL = `${SITE}/`

export const metadata = {
  title: "GetSolo – Turnos, cierre de caja y comisiones para barberías",
  description:
    "GetSolo es un sistema para barberías y profesionales: agenda online, cobros con MercadoPago, cierre de caja diario, comisiones por barbero, ingresos/egresos, abonos y giftcards. Probá 14 días gratis.",
  keywords: [
    "sistema para barberías",
    "agenda online barbería",
    "cierre de caja barbería",
    "comisiones barberos",
    "cobros mercadopago barbería",
    "software para barberos",
    "ingresos y egresos barbería",
    "alternativa a agendapro"
  ],
  openGraph: {
    title: "GetSolo – Gestión completa para barberías",
    description:
      "Agenda online + cobros + cierre de caja + comisiones + ingresos/egresos + portal de barberos. Probá 14 días gratis.",
  },
  twitter: {
    title: "GetSolo – Turnos y caja para barberías",
    description:
      "Agenda online, cobros con MP, cierre de caja diario, comisiones por profesional, abonos y giftcards.",
  },
};

function jsonLd() {
  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GetSolo",
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
    name: "GetSolo",
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
