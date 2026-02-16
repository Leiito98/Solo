'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

type Billing = {
  razon_social: string | null
  cuit: string | null
  direccion: string | null
  ciudad: string | null
  codigo_postal: string | null
}

export function BillingInfoForm({ initial }: { initial: Billing | null }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [razon_social, setRazon] = useState(initial?.razon_social ?? '')
  const [cuit, setCuit] = useState(initial?.cuit ?? '')
  const [direccion, setDireccion] = useState(initial?.direccion ?? '')
  const [ciudad, setCiudad] = useState(initial?.ciudad ?? '')
  const [codigo_postal, setCP] = useState(initial?.codigo_postal ?? '')

  const changed = useMemo(() => {
    return (
      (initial?.razon_social ?? '') !== razon_social ||
      (initial?.cuit ?? '') !== cuit ||
      (initial?.direccion ?? '') !== direccion ||
      (initial?.ciudad ?? '') !== ciudad ||
      (initial?.codigo_postal ?? '') !== codigo_postal
    )
  }, [initial, razon_social, cuit, direccion, ciudad, codigo_postal])

  async function onSave() {
    try {
      setLoading(true)
      const res = await fetch('/api/negocio/facturacion', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ razon_social, cuit, direccion, ciudad, codigo_postal }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Error al guardar')
      toast({ title: 'Guardado', description: 'Datos de facturación actualizados.' })
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Información de facturación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre o Razón Social</label>
          <input
            value={razon_social}
            onChange={(e) => setRazon(e.target.value)}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Juan Pérez / BarberGold SRL"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CUIT/CUIL (opcional)</label>
          <input
            value={cuit}
            onChange={(e) => setCuit(e.target.value)}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="20-12345678-9"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de facturación</label>
          <input
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Av. Corrientes 1234"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
            <input
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Buenos Aires"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal</label>
            <input
              value={codigo_postal}
              onChange={(e) => setCP(e.target.value)}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="1001"
            />
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          <Button
            onClick={onSave}
            disabled={loading || !changed}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
          {!changed && (
            <span className="text-xs text-gray-500 self-center">Sin cambios</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
