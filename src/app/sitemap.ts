// app/sitemap.ts
import type { MetadataRoute } from "next"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"

type CF = MetadataRoute.Sitemap[number]["changeFrequency"]

function getRootSite() {
  const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "getsolo.site"
  return `https://${ROOT_DOMAIN}`
}

/**
 * Devuelve todos los slugs bajo /app/blog/** que tengan page.tsx (o page.jsx/ts/js)
 * Ej: app/blog/cobrar-sena-online-barberia/page.tsx -> /blog/cobrar-sena-online-barberia
 */
function getBlogRoutes(): string[] {
  const appDir = path.join(process.cwd(), "app")
  const blogDir = path.join(appDir, "blog")

  if (!fs.existsSync(blogDir)) return []

  const PAGE_FILES = new Set(["page.tsx", "page.ts", "page.jsx", "page.js"])

  const out: string[] = []

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const e of entries) {
      const full = path.join(dir, e.name)

      // ignorar cosas que no deberían ser "posts"
      if (e.name.startsWith("_")) continue
      if (e.name === "components") continue

      if (e.isDirectory()) {
        // ignorar drafts
        if (fs.existsSync(path.join(full, ".draft"))) return
        walk(full)
        continue
      }

      if (e.isFile() && PAGE_FILES.has(e.name)) {
        // full = .../app/blog/<slug>/page.tsx
        // Queremos quedarnos con lo que está después de /app y sin /page.*
        const relFromApp = path
          .relative(appDir, full)
          .replace(/\\/g, "/") // windows fix
          .replace(/\/page\.(tsx|ts|jsx|js)$/, "")

        // relFromApp empieza con "blog/..."
        if (!relFromApp.startsWith("blog/")) continue

        // Excluir "blog" raíz (si tenés app/blog/page.tsx) del listado de posts
        if (relFromApp === "blog") continue

        out.push("/" + relFromApp)
      }
    }
  }

  walk(blogDir)

  // dedupe + orden estable
  return Array.from(new Set(out)).sort()
}

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getRootSite()
  const now = new Date()

  const staticRoutes: Array<{
    path: string
    priority: number
    changeFrequency: CF
  }> = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/sistema-turnos-online", priority: 0.9, changeFrequency: "weekly" },

    { path: "/barberia", priority: 0.8, changeFrequency: "weekly" },
    { path: "/belleza", priority: 0.8, changeFrequency: "weekly" },
    { path: "/nutricion", priority: 0.8, changeFrequency: "weekly" },
    { path: "/psicologia", priority: 0.8, changeFrequency: "weekly" },

    // Legal
    { path: "/politica-de-privacidad", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terminos-y-condiciones", priority: 0.3, changeFrequency: "yearly" },
  ]

  const blogRoutes = getBlogRoutes()

  const blogEntries = blogRoutes.map((p) => ({
    url: `${site}${p}`,
    lastModified: now,
    changeFrequency: "monthly" as CF,
    priority: 0.7,
  }))

  const staticEntries = staticRoutes.map((r) => ({
    url: `${site}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  return [...staticEntries, ...blogEntries]
}