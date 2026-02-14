'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  fecha: string
  intervalMs?: number
}

export function TurnosPollRefresh({ fecha, intervalMs = 8000 }: Props) {
  const router = useRouter()
  const lastFingerprintRef = useRef<string>('')

  useEffect(() => {
    let alive = true

    async function tick() {
      try {
        const res = await fetch(`/api/dashboard/turnos-snapshot?fecha=${encodeURIComponent(fecha)}`, {
          cache: 'no-store',
        })
        if (!res.ok) return
        const json = await res.json()
        const fp = String(json?.fingerprint || '')

        // Primera vez: guardar y no refrescar
        if (!lastFingerprintRef.current) {
          lastFingerprintRef.current = fp
          return
        }

        // Si cambió => refresh
        if (fp && fp !== lastFingerprintRef.current) {
          lastFingerprintRef.current = fp
          router.refresh()
        }
      } catch {
        // silencio (evitamos ruido en prod)
      }
    }

    // correr ya y luego interval
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
