'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { CreateOrdenDialog } from './create-orden-dialog'

export function CreateOrdenButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="w-4 h-4" />
        Nueva orden
      </Button>

      {open && <CreateOrdenDialog onClose={() => setOpen(false)} />}
    </>
  )
}
