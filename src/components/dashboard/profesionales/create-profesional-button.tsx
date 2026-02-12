'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { CreateProfesionalDialog } from './create-profesional-dialog'

export function CreateProfesionalButton({ negocioId }: { negocioId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Agregar Profesional
      </Button>

      {open && (
        <CreateProfesionalDialog
          negocioId={negocioId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}