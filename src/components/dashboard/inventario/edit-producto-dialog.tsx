'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ProductoForm } from '@/components/dashboard/inventario/producto-form'

type Producto = {
  id: string
  nombre: string
  cantidad: number
  unidad: string
  precio_unitario: number
  alerta_stock_minimo: number
}

export function EditProductoDialog({
  producto,
  onClose,
}: {
  producto: Producto
  onClose: () => void
}) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar producto</DialogTitle>
        </DialogHeader>

        <ProductoForm
          mode="edit"
          producto={producto}
          onSuccess={onClose}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
