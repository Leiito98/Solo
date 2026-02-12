'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Proveedor = {
  id: string
  nombre: string
  contacto?: string | null
  email?: string | null
  telefono?: string | null
  direccion?: string | null
  notas?: string | null
  activo?: boolean
}

type Props = {
  negocioId?: string
  mode: 'create' | 'edit'
  proveedor?: Partial<Proveedor> | null

  // ✅ para modal
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProveedorForm({ mode, proveedor, onSuccess, onCancel }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  const isEdit = mode === 'edit'

  const [nombre, setNombre] = useState(proveedor?.nombre || '')
  const [contacto, setContacto] = useState(proveedor?.contacto || '')
  const [email, setEmail] = useState(proveedor?.email || '')
  const [telefono, setTelefono] = useState(proveedor?.telefono || '')
  const [direccion, setDireccion] = useState(proveedor?.direccion || '')
  const [notas, setNotas] = useState(proveedor?.notas || '')
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => !!nombre.trim(), [nombre])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    try {
      const payload = {
        nombre: nombre.trim(),
        contacto: contacto.trim() || null,
        email: email.trim() || null,
        telefono: telefono.trim() || null,
        direccion: direccion.trim() || null,
        notas: notas.trim() || null,
      }

      const res = await fetch(
        isEdit ? `/api/inventario/proveedores/${proveedor?.id}` : '/api/inventario/proveedores',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'No se pudo guardar')

      toast({
        title: isEdit ? 'Proveedor actualizado' : 'Proveedor creado',
        description: isEdit ? 'Los cambios se guardaron correctamente.' : 'Ya podés usarlo en órdenes de compra.',
      })

      router.refresh()

      if (onSuccess) return onSuccess()
      router.push('/dashboard/inventario/proveedores')
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Ocurrió un error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold">{isEdit ? 'Datos del proveedor' : 'Nuevo proveedor'}</CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-2">
            <Label>Nombre *</Label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Distribuidora XYZ" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Contacto</Label>
              <Input value={contacto} onChange={(e) => setContacto(e.target.value)} placeholder="Nombre del vendedor" />
            </div>
            <div className="grid gap-2">
              <Label>Teléfono</Label>
              <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+54 ..." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ventas@proveedor.com" />
            </div>
            <div className="grid gap-2">
              <Label>Dirección</Label>
              <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Calle, número, ciudad" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Notas</Label>
            <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Condiciones, días de entrega, etc." />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={!canSubmit || loading}>
              {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear proveedor'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (onCancel) return onCancel()
                return router.back()
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
