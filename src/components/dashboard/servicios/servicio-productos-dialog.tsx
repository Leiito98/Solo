'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ServicioProductosConfig } from '@/components/dashboard/servicios/servicio-productos-config'
import { useToast } from '@/hooks/use-toast'
import { Loader2, X } from 'lucide-react'

type Producto = {
  id: string
  nombre: string
  unidad: string
  cantidad: number
  precio_unitario: number
  contenido_por_unidad?: number | null
}

type ProductoAsociado = {
  id: string
  producto_id: string
  cantidad_por_uso: number
  productos: Producto
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-10 rounded-lg bg-gray-100 animate-pulse" />
      <div className="h-24 rounded-lg bg-gray-100 animate-pulse" />
      <div className="h-40 rounded-lg bg-gray-100 animate-pulse" />
      <div className="h-24 rounded-lg bg-gray-100 animate-pulse" />
      <div className="flex justify-end gap-2 pt-2">
        <div className="h-10 w-24 rounded-lg bg-gray-100 animate-pulse" />
        <div className="h-10 w-44 rounded-lg bg-gray-100 animate-pulse" />
      </div>
    </div>
  )
}

export function ServicioProductosDialog({
  open,
  onOpenChange,
  servicioId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  servicioId: string
}) {
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false) // ✅ bloquea cerrar mientras guarda

  const [negocioId, setNegocioId] = useState<string>('')
  const [servicioNombre, setServicioNombre] = useState<string>('')

  const [productos, setProductos] = useState<Producto[]>([])
  const [productosAsociados, setProductosAsociados] = useState<ProductoAsociado[]>([])

  const close = useCallback(() => {
    if (saving) return
    onOpenChange(false)
  }, [onOpenChange, saving])

  useEffect(() => {
    if (!open) return

    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/servicios/${servicioId}/productos`, {
          cache: 'no-store',
        })
        const json = await res.json().catch(() => ({}))

        if (!res.ok) throw new Error(json?.error || 'No se pudo cargar la configuración')
        if (cancelled) return

        setNegocioId(json?.negocioId || '')
        setServicioNombre(json?.servicio?.nombre || 'Servicio')
        setProductos(json?.productos || [])
        setProductosAsociados(json?.productosAsociados || [])
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err?.message || 'No se pudo cargar',
          variant: 'destructive',
        })
        onOpenChange(false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, servicioId, toast, onOpenChange])

  return (
    <Dialog
      open={open}
      // ✅ evita que se cierre si está guardando
      onOpenChange={(next) => {
        if (!next) {
          if (saving) return
          onOpenChange(false)
        } else {
          onOpenChange(true)
        }
      }}
    >
      {/* ✅ Modal más chico + scroll interno */}
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden p-0">
        {/* ✅ Header sticky */}
        <DialogHeader className="sticky top-0 z-10 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="truncate">
                Productos del servicio • {servicioNombre || '...'}
              </DialogTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Configurá el consumo por turno para descontar stock y calcular costos.
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={close}
              disabled={saving}
              title={saving ? 'Guardando...' : 'Cerrar'}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            </Button>
          </div>
        </DialogHeader>

        {/* ✅ Body con scroll */}
        <div className="overflow-y-auto max-h-[calc(85vh-76px)]">
          {loading ? (
            <LoadingSkeleton />
          ) : !negocioId ? (
            <div className="p-6 text-sm text-gray-600">
              No se pudo cargar la info del negocio.
              <div className="mt-4">
                <Button variant="outline" onClick={close} disabled={saving}>
                  Cerrar
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <ServicioProductosConfig
                servicioId={servicioId}
                negocioId={negocioId}
                productos={productos}
                productosAsociados={productosAsociados}
                // ✅ clave: el Cancelar del config ahora cierra el modal (no te manda a la página grande)
                onCancel={close}
                // ✅ opcional: si querés bloquear cierre mientras guarda desde adentro
                onSavingChange={setSaving as any}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
