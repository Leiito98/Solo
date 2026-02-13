'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { MessageSquare, Loader2 } from 'lucide-react'

export function RequestIntegrationDialogButton() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [nombre, setNombre] = useState('')
  const [website, setWebsite] = useState('')
  const [detalle, setDetalle] = useState('')

  function reset() {
    setNombre('')
    setWebsite('')
    setDetalle('')
  }

  async function submit() {
    if (!nombre.trim()) {
      toast({ title: 'Falta el nombre', description: 'Decime qué integración querés (ej: Google Calendar).', variant: 'destructive' })
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/integraciones/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          website: website.trim() || null,
          detalle: detalle.trim() || null,
        }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'No se pudo enviar la solicitud')

      toast({
        title: 'Solicitud enviada',
        description: 'Gracias. Te respondemos por email si necesitamos más info.',
      })

      reset()
      setOpen(false)
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'No se pudo enviar la solicitud',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="outline" className="bg-white hover:bg-gray-50" onClick={() => setOpen(true)}>
        <MessageSquare className="w-4 h-4 mr-2" />
        Solicitar Integración
      </Button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Solicitar integración</DialogTitle>
            <DialogDescription>
              Contanos qué herramienta querés conectar con Solo. Esto se envía a <b>support@getsolo.site</b>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Integración *</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Google Calendar, WhatsApp, Facturación AFIP..."
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Sitio (opcional)</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="detalle">¿Qué necesitás? (opcional)</Label>
              <Textarea
                id="detalle"
                value={detalle}
                onChange={(e) => setDetalle(e.target.value)}
                placeholder="Ej: quiero que al crear turnos se sincronicen, recordatorios automáticos, etc."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button onClick={submit} disabled={loading || !nombre.trim()}>
                {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>) : 'Enviar solicitud'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
