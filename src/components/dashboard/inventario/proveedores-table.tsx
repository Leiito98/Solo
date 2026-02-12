'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Building2, Search, Edit, Trash2 } from 'lucide-react'
import { EditProveedorDialog } from '@/components/dashboard/inventario/edit-proveedor-dialog'

type Proveedor = {
  id: string
  nombre: string
  contacto?: string | null
  email?: string | null
  telefono?: string | null
  activo?: boolean
  direccion?: string | null
  notas?: string | null
}

export function ProveedoresTable({ proveedores }: { proveedores: Proveedor[] }) {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editProveedor, setEditProveedor] = useState<Proveedor | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return proveedores
    return proveedores.filter((p) => {
      return (
        p.nombre?.toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q) ||
        (p.telefono || '').toLowerCase().includes(q)
      )
    })
  }, [proveedores, search])

  async function onDelete(id: string) {
    const ok = window.confirm('¿Eliminar proveedor? Esta acción no se puede deshacer.')
    if (!ok) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/inventario/proveedores/${id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'No se pudo eliminar')

      toast({ title: 'Proveedor eliminado' })
      window.location.reload()
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Ocurrió un error', variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  if (proveedores.length === 0) {
    return (
      <div className="p-8 text-center">
        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 font-medium mb-2">No hay proveedores cargados</p>
        <p className="text-sm text-gray-400">Agregá tu primer proveedor para crear órdenes de compra</p>
      </div>
    )
  }

  return (
    <div>
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar proveedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{p.nombre}</p>
                      <p className="text-sm text-gray-500">{p.email || '—'}</p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900">{p.contacto || '—'}</p>
                  <p className="text-xs text-gray-500">{p.telefono || '—'}</p>
                </td>

                <td className="px-6 py-4">
                  {p.activo === false ? (
                    <Badge variant="secondary">Inactivo</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Activo</Badge>
                  )}
                </td>

                <td className="px-6 py-4 text-right space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => setEditProveedor(p)}>
                    <Edit className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={deletingId === p.id}
                    onClick={() => onDelete(p.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editProveedor && (
        <EditProveedorDialog
          proveedor={editProveedor}
          onClose={() => setEditProveedor(null)}
        />
      )}
    </div>
  )
}
