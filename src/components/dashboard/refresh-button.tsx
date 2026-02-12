// components/dashboard/refresh-button.tsx
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useState, useTransition } from 'react'

export function RefreshButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [spinning, setSpinning] = useState(false)

  function onRefresh() {
    setSpinning(true)
    startTransition(() => {
      router.refresh()
      // freno el spin visual un toque después
      setTimeout(() => setSpinning(false), 600)
    })
  }

  return (
    <Button variant="outline" onClick={onRefresh} disabled={isPending} className="gap-2">
      <RefreshCw className={`h-4 w-4 ${isPending || spinning ? 'animate-spin' : ''}`} />
      Actualizar
    </Button>
  )
}
