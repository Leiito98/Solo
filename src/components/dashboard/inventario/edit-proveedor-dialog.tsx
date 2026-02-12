'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ProveedorForm } from '@/components/dashboard/inventario/proveedor-form'

type Proveedor = {
  id: string
  nombre: string
  contacto?: string | null
  email?: string | null
  telefono?: string | null
  direccion?: string | null
  notas?: string | null
  activo?: boolean
}

export function EditProveedorDialog({
  proveedor,
  onClose,
}: {
  proveedor: Proveedor
  onClose: () => void
}) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar proveedor</DialogTitle>
        </DialogHeader>

        <ProveedorForm
          mode="edit"
          proveedor={proveedor}
          onSuccess={onClose}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
