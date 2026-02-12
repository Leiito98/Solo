'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function CancelarTurnoClient({
  negocioNombre,
  token,
  turno,
}: {
  negocioNombre: string
  token: string
  turno: any
}) {
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const cancelar = async () => {
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch('/api/booking/cancelar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'No se pudo cancelar')
      setOk(true)
    } catch (e: any) {
      setErr(e?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <Card className="max-w-lg w-full">
        <CardContent className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500">{negocioNombre}</p>
            <h1 className="text-2xl font-bold">Cancelar turno</h1>
          </div>

          <div className="text-sm text-gray-700">
            <div><strong>Fecha:</strong> {turno.fecha}</div>
            <div><strong>Hora:</strong> {String(turno.hora_inicio).slice(0,5)} - {String(turno.hora_fin).slice(0,5)}</div>
            <div><strong>Estado:</strong> {turno.estado}</div>
          </div>

          {ok ? (
            <div className="p-3 rounded-md bg-green-50 text-green-800 text-sm">
              ✅ Turno cancelado correctamente.
            </div>
          ) : (
            <Button onClick={cancelar} disabled={loading}>
              {loading ? 'Cancelando...' : 'Confirmar cancelación'}
            </Button>
          )}

          {err && (
            <div className="p-3 rounded-md bg-red-50 text-red-800 text-sm">
              {err}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
