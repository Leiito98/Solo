'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OrdenDetailDialog } from '@/components/dashboard/inventario/orden-detail-dialog'

function estadoBadge(estado: string) {
  const e = String(estado || 'pendiente')
  if (e === 'recibida') return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Recibida</Badge>
  if (e === 'confirmada') return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Confirmada</Badge>
  if (e === 'cancelada') return <Badge variant="destructive">Cancelada</Badge>
  return <Badge variant="secondary">Pendiente</Badge>
}

export function OrdenesTableClient({ ordenes }: { ordenes: any[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <>
      <div className="overflow-x-auto border rounded-lg bg-white">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {ordenes.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">{o.numero_orden || o.id.slice(0, 8)}</td>
                <td className="px-6 py-4 text-gray-900">{o.proveedores?.nombre || '—'}</td>
                <td className="px-6 py-4 text-gray-700">{new Date(o.fecha_orden).toLocaleDateString('es-AR')}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">${Number(o.total || 0).toLocaleString('es-AR')}</td>
                <td className="px-6 py-4">{estadoBadge(o.estado)}</td>
                <td className="px-6 py-4 text-right">
                  <Button size="sm" variant="outline" onClick={() => setOpenId(o.id)}>
                    Ver
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openId && <OrdenDetailDialog ordenId={openId} onClose={() => setOpenId(null)} />}
    </>
  )
}
