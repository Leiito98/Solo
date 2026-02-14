// components/dashboard/refresh-button.tsx
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'

export function RefreshButton({
  autoIntervalMs,
  autoWhenHidden = false,
}: {
  autoIntervalMs?: number // ej 60000
  autoWhenHidden?: boolean // si querés que refresque aunque la pestaña esté oculta
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [spinning, setSpinning] = useState(false)

  const lastRunRef = useRef<number>(0)

  function doRefresh() {
    const now = Date.now()
    // evita dobles refresh si coincide manual + auto
    if (now - lastRunRef.current < 800) return
    lastRunRef.current = now

    setSpinning(true)
    startTransition(() => {
      router.refresh()
      setTimeout(() => setSpinning(false), 600)
    })
  }

  useEffect(() => {
    if (!autoIntervalMs || autoIntervalMs <= 0) return

    const tick = () => {
      if (!autoWhenHidden && typeof document !== 'undefined' && document.hidden) return
      doRefresh()
    }

    // opcional: primer refresh a los X ms (no inmediato)
    const id = setInterval(tick, autoIntervalMs)

    // bonus: al volver a la pestaña, refresca una vez
    const onVis = () => {
      if (!document.hidden) tick()
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoIntervalMs, autoWhenHidden])

  return (
    <Button variant="outline" onClick={doRefresh} disabled={isPending} className="gap-2">
      <RefreshCw className={`h-4 w-4 ${isPending || spinning ? 'animate-spin' : ''}`} />
      Actualizar
    </Button>
  )
}
