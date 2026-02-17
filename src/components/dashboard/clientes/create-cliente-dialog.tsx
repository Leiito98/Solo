'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

type Props = {
  negocioId: string
  onClose: () => void
}

function normalizeDni(v: string) {
  return String(v || '').replace(/\D/g, '').trim()
}

export function CreateClienteDialog({ negocioId, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const dni = normalizeDni(String(formData.get('dni') || ''))
    const nombre = String(formData.get('nombre') || '').trim()
    const email = String(formData.get('email') || '').trim()
    const telefono = String(formData.get('telefono') || '').trim()
    const notas = String(formData.get('notas') || '').trim()

    if (!dni || dni.length < 7 || dni.length > 9) {
      setLoading(false)
      toast({ title: 'Error', description: 'DNI inválido (7 a 9 dígitos)', variant: 'destructive' })
      return
    }

    const { error } = await supabase
      .from('clientes')
      .insert({
        negocio_id: negocioId,
        dni,
        nombre,
        email: email || null,
        telefono: telefono || null,
        notas: notas || '',
        historial: {},
      })

    setLoading(false)

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
      return
    }

    toast({ title: 'Éxito', description: 'Cliente creado correctamente' })
    router.refresh()
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Cliente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dni">DNI *</Label>
              <Input id="dni" name="dni" placeholder="40123456" inputMode="numeric" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo *</Label>
              <Input id="nombre" name="nombre" placeholder="Juan Pérez" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="juan@email.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" name="telefono" placeholder="+54 11 1234-5678" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea id="notas" name="notas" placeholder="Notas internas sobre el cliente..." rows={3} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
