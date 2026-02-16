'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function SyncFacturasButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function run() {
    setLoading(true)
    try {
      const res = await fetch('/api/suscripcion/facturas/sync', { method: 'POST' })
      const json = await res.json().catch(() => ({}))
      toast({
        title: 'Sincronización lista',
        description: `Insertadas: ${json?.inserted ?? 0} (escaneadas: ${json?.scanned ?? 0})`,
      })
      router.refresh()
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'No se pudo sincronizar' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={run} disabled={loading} variant="outline" className="gap-2">
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Sincronizando…' : 'Sincronizar Facturas'}
    </Button>
  )
}
