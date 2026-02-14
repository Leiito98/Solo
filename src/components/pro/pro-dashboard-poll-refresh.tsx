'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function ProDashboardPollRefresh({
  fecha,
  intervalMs = 8000,
}: {
  fecha: string
  profesionalId?: string // no hace falta si el endpoint detecta por auth, lo dejo opcional
  intervalMs?: number
}) {
  const router = useRouter()
  const lastFp = useRef('')

  useEffect(() => {
    let alive = true

    async function tick() {
      try {
        const res = await fetch(`/api/pro/dashboard-snapshot?fecha=${encodeURIComponent(fecha)}`, {
          cache: 'no-store',
        })
        if (!res.ok) return
        const json = await res.json()
        const fp = String(json?.fingerprint || '')

        if (!lastFp.current) {
          lastFp.current = fp
          return
        }

        if (fp && fp !== lastFp.current) {
          lastFp.current = fp
          router.refresh()
        }
      } catch {
        // sin ruido
      }
    }

    tick()
    const id = setInterval(() => {
      if (!alive) return
      tick()
    }, intervalMs)

    return () => {
      alive = false
      clearInterval(id)
    }
  }, [fecha, intervalMs, router])

  return null
}
