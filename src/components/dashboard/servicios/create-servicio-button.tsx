'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CreateServicioDialog } from './create-servicio-dialog'

interface CreateServicioButtonProps {
  negocioId: string
}

export function CreateServicioButton({ negocioId }: CreateServicioButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="w-4 h-4" />
        Nuevo Servicio
      </Button>

      <CreateServicioDialog
        negocioId={negocioId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}