'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { CreateProductoDialog } from './create-producto-dialog'

export function CreateProductoButton({ negocioId }: { negocioId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="w-4 h-4" />
        Nuevo Producto
      </Button>

      {open && <CreateProductoDialog onClose={() => setOpen(false)} />}
    </>
  )
}
