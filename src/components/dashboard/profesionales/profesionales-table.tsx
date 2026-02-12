'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { EditProfesionalDialog } from './edit-profesional-dialog'
import { DeleteProfesionalDialog } from './delete-profesional-dialog'
import { useState } from 'react'

type Profesional = {
  id: string
  nombre: string
  email: string | null
  telefono: string | null
  especialidad: string | null
  foto_url: string | null
  bio: string | null  // ⬅️ AGREGADO: necesario para el dialog de editar
  activo: boolean
}

export function ProfesionalesTable({ profesionales }: { profesionales: Profesional[] }) {
  const [editingProfesional, setEditingProfesional] = useState<Profesional | null>(null)
  const [deletingProfesional, setDeletingProfesional] = useState<Profesional | null>(null)

  if (profesionales.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-gray-500">No hay profesionales registrados</p>
        <p className="text-sm text-gray-400 mt-2">Agrega tu primer profesional para comenzar</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Profesional</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Especialidad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profesionales.map((profesional) => (
              <TableRow key={profesional.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={profesional.foto_url || undefined} />
                      <AvatarFallback>
                        {profesional.nombre.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{profesional.nombre}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {profesional.email && <div>{profesional.email}</div>}
                    {profesional.telefono && <div className="text-gray-500">{profesional.telefono}</div>}
                  </div>
                </TableCell>
                <TableCell>{profesional.especialidad || '-'}</TableCell>
                <TableCell>
                  <Badge variant={profesional.activo ? 'default' : 'secondary'}>
                    {profesional.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingProfesional(profesional)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingProfesional(profesional)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingProfesional && (
        <EditProfesionalDialog
          profesional={editingProfesional}
          onClose={() => setEditingProfesional(null)}
        />
      )}

      {deletingProfesional && (
        <DeleteProfesionalDialog
          profesional={deletingProfesional}
          onClose={() => setDeletingProfesional(null)}
        />
      )}
    </>
  )
}