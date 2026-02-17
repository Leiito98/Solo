'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, IdCard } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { EditClienteDialog } from './edit-cliente-dialog'
import { DeleteClienteDialog } from './delete-cliente-dialog'
import { useState } from 'react'

type Cliente = {
  id: string
  dni: string | null
  nombre: string
  email: string | null
  telefono: string | null
  notas: string | null
}

function formatDni(v: string | null) {
  const dni = String(v || '').replace(/\D/g, '')
  return dni || '-'
}

export function ClientesTable({ clientes }: { clientes: Cliente[] }) {
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [deletingCliente, setDeletingCliente] = useState<Cliente | null>(null)

  if (clientes.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-gray-500">No hay clientes registrados</p>
        <p className="text-sm text-gray-400 mt-2">Agrega tu primer cliente para comenzar</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Notas</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {cliente.nombre
                          .split(' ')
                          .filter(Boolean)
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="font-medium leading-tight">{cliente.nombre}</div>

                      {/* DNI debajo del nombre */}
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <IdCard className="w-3.5 h-3.5" />
                        DNI: <span className="font-medium text-gray-600">{formatDni(cliente.dni)}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-sm">
                    {cliente.email && <div>{cliente.email}</div>}
                    {cliente.telefono && <div className="text-gray-500">{cliente.telefono}</div>}
                    {!cliente.email && !cliente.telefono && <div className="text-gray-400">-</div>}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-sm text-gray-600 max-w-[420px] truncate">
                    {cliente.notas?.trim() ? cliente.notas : '-'}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingCliente(cliente)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeletingCliente(cliente)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingCliente && (
        <EditClienteDialog cliente={editingCliente} onClose={() => setEditingCliente(null)} />
      )}

      {deletingCliente && (
        <DeleteClienteDialog cliente={deletingCliente} onClose={() => setDeletingCliente(null)} />
      )}
    </>
  )
}
