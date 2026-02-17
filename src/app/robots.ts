import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "getsolo.site"
  const site = `https://${ROOT_DOMAIN}`

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/pro/",
          "/login",
          "/register",
          "/reset-password",
          "/callback",
          "/suscripcion",
          "/negocio/",
          "/(auth)/",
          "/*?*",
        ],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  }
}
