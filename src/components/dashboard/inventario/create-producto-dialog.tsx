'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ProductoForm } from '@/components/dashboard/inventario/producto-form'

type Props = {
  onClose: () => void
}

export function CreateProductoDialog({ onClose }: Props) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <ProductoForm
          mode="create"
          onSuccess={onClose}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
