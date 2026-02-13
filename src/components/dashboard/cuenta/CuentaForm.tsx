'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

export default function CuentaForm({
  initialNombre,
  initialEmail,
  initialTelefono,
}: {
  initialNombre: string
  initialEmail: string
  initialTelefono: string
}) {
  const [nombre, setNombre] = useState(initialNombre)
  const [telefono, setTelefono] = useState(initialTelefono)
  const [saving, setSaving] = useState(false)

  const { toast } = useToast()
  const router = useRouter()

  async function onSave() {
    try {
      setSaving(true)

      const res = await fetch('/api/cuenta/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombrecliente: nombre.trim(),
          telefono: telefono.trim() || null,
        }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'No se pudo guardar')

      toast({
        title: 'Guardado',
        description: 'Tus cambios se guardaron correctamente.',
      })

      router.refresh()
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'No se pudo guardar',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre Completo
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Tu nombre"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          value={initialEmail}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
        />
        <p className="mt-1 text-xs text-gray-500">
          El email no se puede cambiar. Contactá a soporte si necesitás modificarlo.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teléfono
        </label>
        <input
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="+54 9 11 1234-5678"
        />
      </div>

      <div className="pt-4">
        <Button
          onClick={onSave}
          disabled={saving}
          className="bg-primary hover:bg-primary/90"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  )
}
