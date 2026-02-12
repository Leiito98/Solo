'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { CreateClienteDialog } from './create-cliente-dialog'

export function CreateClienteButton({ negocioId }: { negocioId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Agregar Cliente
      </Button>

      {open && (
        <CreateClienteDialog
          negocioId={negocioId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
