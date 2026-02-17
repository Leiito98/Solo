// app/sitemap.ts
import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "getsolo.site"
  const site = `https://${ROOT_DOMAIN}`
  const now = new Date()

  const routes: Array<{
    path: string
    priority: number
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
  }> = [
    // Home
    { path: "", priority: 1, changeFrequency: "weekly" },

    // Landing principal SEO
    { path: "/sistema-turnos-online", priority: 0.9, changeFrequency: "weekly" },

    // Verticales
    { path: "/barberia", priority: 0.8, changeFrequency: "weekly" },
    { path: "/belleza", priority: 0.8, changeFrequency: "weekly" },
    { path: "/nutricion", priority: 0.8, changeFrequency: "weekly" },
    { path: "/psicologia", priority: 0.8, changeFrequency: "weekly" },

    // ✅ Blog (solo lo indexable)
    // { path: "/blog", priority: 0.6, changeFrequency: "weekly" }, // <-- solo si tenés /blog
    { path: "/blog/cobrar-sena-online-barberia", priority: 0.7, changeFrequency: "monthly" },

    // Legal
    { path: "/politica-de-privacidad", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terminos-y-condiciones", priority: 0.3, changeFrequency: "yearly" },
  ]

  return routes.map((r) => ({
    url: `${site}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))
}
