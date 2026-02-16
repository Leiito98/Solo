"use client"

import { useEffect } from "react"

export function TrackPublicPreview({ slug }: { slug: string }) {
  useEffect(() => {
    // fire-and-forget
    fetch("/api/public/preview-visit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug }),
    }).catch(() => {})
  }, [slug])

  return null
}
