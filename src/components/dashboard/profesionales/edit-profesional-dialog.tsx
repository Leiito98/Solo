'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

type Profesional = {
  id: string
  nombre: string
  email: string | null
  telefono: string | null
  especialidad: string | null
  bio: string | null
  foto_url: string | null
  activo: boolean
}

type Props = {
  profesional: Profesional
  onClose: () => void
}

export function EditProfesionalDialog({ profesional, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [activo, setActivo] = useState(profesional.activo)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const { error } = await supabase
      .from('profesionales')
      .update({
        nombre: formData.get('nombre') as string,
        email: formData.get('email') as string || null,
        telefono: formData.get('telefono') as string || null,
        especialidad: formData.get('especialidad') as string || null,
        bio: formData.get('bio') as string || null,
        activo: activo,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profesional.id)

    setLoading(false)

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Éxito',
        description: 'Profesional actualizado correctamente',
      })
      router.refresh()
      onClose()
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Profesional</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input
              id="nombre"
              name="nombre"
              defaultValue={profesional.nombre}
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="especialidad">Especialidad</Label>
            <Input
              id="especialidad"
              name="especialidad"
              defaultValue={profesional.especialidad || ''}
              placeholder="Barbero, Estilista, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={profesional.email || ''}
                placeholder="juan@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                defaultValue={profesional.telefono || ''}
                placeholder="+54 11 1234-5678"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={profesional.bio || ''}
              placeholder="Breve descripción del profesional..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="activo"
              checked={activo}
              onCheckedChange={(checked) => setActivo(checked as boolean)}
            />
            <Label
              htmlFor="activo"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Profesional activo
            </Label>
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