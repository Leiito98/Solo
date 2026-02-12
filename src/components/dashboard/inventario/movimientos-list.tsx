'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowDownRight, ArrowUpRight, Search, Wrench } from 'lucide-react'

type Movimiento = {
  id: string
  tipo: 'entrada' | 'salida' | 'ajuste'
  cantidad: number
  cantidad_anterior: number
  cantidad_nueva: number
  motivo?: string | null
  precio_unitario?: number | null
  created_at: string
  productos?: { nombre: string; unidad?: string | null } | { nombre: string; unidad?: string | null }[]
  proveedores?: { nombre: string } | { nombre: string }[]
}

function getOne<T>(v: any): T | null {
  if (!v) return null
  return Array.isArray(v) ? (v[0] as T) : (v as T)
}

export function MovimientosList({ movimientos }: { movimientos: Movimiento[] }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return movimientos
    return movimientos.filter((m) => {
      const prod = getOne<{ nombre: string }>(m.productos)
      const prov = getOne<{ nombre: string }>(m.proveedores)
      return (
        (prod?.nombre || '').toLowerCase().includes(q) ||
        (m.motivo || '').toLowerCase().includes(q) ||
        (prov?.nombre || '').toLowerCase().includes(q)
      )
    })
  }, [movimientos, search])

  if (movimientos.length === 0) {
    return <div className="p-8 text-center text-gray-500">No hay movimientos registrados</div>
  }

  return (
    <div>
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por producto, motivo o proveedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {filtered.map((m) => {
          const prod = getOne<{ nombre: string; unidad?: string | null }>(m.productos)
          const prov = getOne<{ nombre: string }>(m.proveedores)

          const icon =
            m.tipo === 'entrada' ? (
              <ArrowUpRight className="w-5 h-5 text-green-600" />
            ) : m.tipo === 'salida' ? (
              <ArrowDownRight className="w-5 h-5 text-red-600" />
            ) : (
              <Wrench className="w-5 h-5 text-amber-600" />
            )

          const badge =
            m.tipo === 'entrada' ? (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Entrada</Badge>
            ) : m.tipo === 'salida' ? (
              <Badge variant="destructive">Salida</Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Ajuste</Badge>
            )

          return (
            <div key={m.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg ${
                      m.tipo === 'entrada'
                        ? 'bg-green-100'
                        : m.tipo === 'salida'
                        ? 'bg-red-100'
                        : 'bg-amber-100'
                    }`}
                  >
                    {icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 truncate">{prod?.nombre || 'Producto'}</p>
                      {badge}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {m.motivo || '—'}
                      {prov?.nombre ? ` • ${prov.nombre}` : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={`font-semibold ${
                      m.tipo === 'entrada'
                        ? 'text-green-600'
                        : m.tipo === 'salida'
                        ? 'text-red-600'
                        : 'text-amber-700'
                    }`}
                  >
                    {m.tipo === 'entrada' ? '+' : m.tipo === 'salida' ? '-' : '→'}
                    {Number(m.cantidad).toLocaleString('es-AR')} {prod?.unidad || ''}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(m.created_at).toLocaleString('es-AR')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Number(m.cantidad_anterior)} → {Number(m.cantidad_nueva)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
