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

export function CreateProfesionalDialog({ negocioId, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
  
    const formData = new FormData(e.currentTarget)
    const supabase = createClient()
  
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({ title: 'Error', description: 'Sesión no válida', variant: 'destructive' })
        return
      }
  
      const { data: negocio, error: negErr } = await supabase
        .from('negocios')
        .select('plan')
        .eq('id', negocioId)
        .single()
  
      if (negErr) {
        toast({ title: 'Error', description: negErr.message, variant: 'destructive' })
        return
      }
  
      if (negocio?.plan === 'solo') {
        const { count } = await supabase
          .from('profesionales')
          .select('id', { count: 'exact', head: true })
          .eq('negocio_id', negocioId)
          .eq('activo', true)
  
        if ((count ?? 0) >= 2) {
          toast({
            title: 'Límite del plan Solo',
            description: 'Tu plan Solo permite hasta 2 profesionales. Actualizá a Plan Pro para agregar más.',
            variant: 'destructive',
          })
          return
        }
      }
  
      const { error } = await supabase
        .from('profesionales')
        .insert({
          negocio_id: negocioId,
          nombre: formData.get('nombre') as string,
          email: (formData.get('email') as string) || null,
          telefono: (formData.get('telefono') as string) || null,
          especialidad: (formData.get('especialidad') as string) || null,
          bio: (formData.get('bio') as string) || null,
          activo: true,
        })
  
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Éxito', description: 'Profesional creado correctamente' })

      // ✅ refrescar onboarding instantáneo
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('getsolo:onboarding-refresh'))
      }
        router.refresh()
        onClose()
      }
    } finally {
      setLoading(false)
    }
  }
  

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Profesional</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input
              id="nombre"
              name="nombre"
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="especialidad">Especialidad</Label>
            <Input
              id="especialidad"
              name="especialidad"
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
                placeholder="juan@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                placeholder="+54 11 1234-5678"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Breve descripción del profesional..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Profesional'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}