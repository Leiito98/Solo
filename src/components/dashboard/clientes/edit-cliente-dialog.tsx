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

type Cliente = {
  id: string
  dni: string | null
  nombre: string
  email: string | null
  telefono: string | null
  notas: string | null
}

type Props = {
  cliente: Cliente
  onClose: () => void
}

function normalizeDni(v: string) {
  return String(v || '').replace(/\D/g, '').trim()
}

export function EditClienteDialog({ cliente, onClose }: Props) {
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
      .update({
        dni,
        nombre,
        email: email || null,
        telefono: telefono || null,
        notas: notas || '',
      })
      .eq('id', cliente.id)

    setLoading(false)

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
      return
    }

    toast({ title: 'Éxito', description: 'Cliente actualizado correctamente' })
    router.refresh()
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dni">DNI *</Label>
              <Input
                id="dni"
                name="dni"
                defaultValue={cliente.dni || ''}
                placeholder="40123456"
                inputMode="numeric"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo *</Label>
              <Input id="nombre" name="nombre" defaultValue={cliente.nombre} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={cliente.email || ''} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" name="telefono" defaultValue={cliente.telefono || ''} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea id="notas" name="notas" defaultValue={cliente.notas || ''} rows={3} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
