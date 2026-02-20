'use client'

import { useState } from 'react'
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

interface CreateServicioDialogProps {
  negocioId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateServicioDialog({ negocioId, open, onOpenChange }: CreateServicioDialogProps) {
  const [loading, setLoading] = useState(false)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [duracion, setDuracion] = useState('30')
  const [precio, setPrecio] = useState('')

  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)

    const supabase = createClient() // ✅ igual que en profesionales (dentro del submit)

    try {
      const dur = Number(duracion)
      const pre = Number(precio)

      if (!nombre.trim()) {
        toast({ title: 'Falta nombre', description: 'Ingresá el nombre del servicio', variant: 'destructive' })
        return
      }
      if (!Number.isFinite(dur) || dur <= 0) {
        toast({ title: 'Duración inválida', description: 'Ingresá una duración válida', variant: 'destructive' })
        return
      }
      if (!Number.isFinite(pre) || pre < 0) {
        toast({ title: 'Precio inválido', description: 'Ingresá un precio válido', variant: 'destructive' })
        return
      }

      const { error } = await supabase
        .from('servicios')
        .insert({
          negocio_id: negocioId,
          nombre: nombre.trim(),
          descripcion: descripcion.trim() ? descripcion.trim() : null,
          duracion_min: dur,
          precio: pre,
        })

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' })
        return
      }

      toast({ title: 'Servicio creado', description: 'El servicio se creó correctamente' })

      // ✅ refrescar onboarding instantáneo
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('getsolo:onboarding-refresh'))
      }

      // ✅ IMPORTANTE: refresh primero
      router.refresh()

      // Reset form
      setNombre('')
      setDescripcion('')
      setDuracion('30')
      setPrecio('')

      // Cerrar modal al final
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nuevo Servicio</DialogTitle>
            <DialogDescription>
              Crea un nuevo servicio que ofreces a tus clientes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del servicio *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Corte de cabello"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Descripción del servicio (opcional)"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duracion">Duración (minutos) *</Label>
                <Input
                  id="duracion"
                  type="number"
                  min="5"
                  step="5"
                  placeholder="30"
                  value={duracion}
                  onChange={(e) => setDuracion(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio">Precio (ARS) *</Label>
                <Input
                  id="precio"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="5000"
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
              {loading ? 'Creando...' : 'Crear Servicio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}