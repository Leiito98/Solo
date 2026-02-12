'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { OrdenDetail } from '@/components/dashboard/inventario/orden-detail'

export function OrdenDetailDialog({
  ordenId,
  onClose,
}: {
  ordenId: string
  onClose: () => void
}) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [orden, setOrden] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('ordenes_compra')
          .select(`
            *,
            proveedores(nombre, email, telefono),
            items_orden_compra(*, productos(nombre, unidad))
          `)
          .eq('id', ordenId)
          .single()

        if (!alive) return
        if (error) throw error
        setOrden(data)
      } catch (e: any) {
        if (!alive) return
        setError(e?.message || 'No se pudo cargar la orden')
      } finally {
        if (!alive) return
        setLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [ordenId])

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Orden</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="p-6 text-sm text-gray-500">Cargando...</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : (
          <OrdenDetail orden={orden as any} />
        )}
      </DialogContent>
    </Dialog>
  )
}
