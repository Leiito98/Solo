//components/dashboard/servicios/edit-servicio-dialog
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface Servicio {
  id: string
  nombre: string
  descripcion?: string | null
  duracion_min: number
  precio: number
}

interface EditServicioDialogProps {
  servicio: Servicio
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditServicioDialog({
  servicio,
  open,
  onOpenChange,
}: EditServicioDialogProps) {
  const [loading, setLoading] = useState(false)
  const [nombre, setNombre] = useState(servicio.nombre)
  const [descripcion, setDescripcion] = useState(servicio.descripcion || '')
  const [duracion, setDuracion] = useState(servicio.duracion_min.toString())
  const [precio, setPrecio] = useState(servicio.precio.toString())
  
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Reset form when servicio changes
  useEffect(() => {
    setNombre(servicio.nombre)
    setDescripcion(servicio.descripcion || '')
    setDuracion(servicio.duracion_min.toString())
    setPrecio(servicio.precio.toString())
  }, [servicio])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('servicios')
      .update({
        nombre,
        descripcion: descripcion || null,
        duracion_min: parseInt(duracion),
        precio: parseFloat(precio),
      })
      .eq('id', servicio.id)

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
      setLoading(false)
    } else {
      toast({
        title: 'Servicio actualizado',
        description: 'Los cambios se guardaron correctamente',
      })
      
      onOpenChange(false)
      router.refresh()
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Servicio</DialogTitle>
            <DialogDescription>
              Modifica los detalles del servicio
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre del servicio *</Label>
              <Input
                id="edit-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-descripcion">Descripción</Label>
              <Textarea
                id="edit-descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-duracion">Duración (minutos) *</Label>
                <Input
                  id="edit-duracion"
                  type="number"
                  min="5"
                  step="5"
                  value={duracion}
                  onChange={(e) => setDuracion(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-precio">Precio (ARS) *</Label>
                <Input
                  id="edit-precio"
                  type="number"
                  min="0"
                  step="0.01"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}