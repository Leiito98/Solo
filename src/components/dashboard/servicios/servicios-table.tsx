'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Pencil, Trash2, Package } from 'lucide-react'
import { EditServicioDialog } from './edit-servicio-dialog'
import { DeleteServicioDialog } from './delete-servicio-dialog'
import { ServicioProductosDialog } from '@/components/dashboard/servicios/servicio-productos-dialog'

interface Servicio {
  id: string
  nombre: string
  descripcion?: string | null
  duracion_min: number
  precio: number
}

interface ServiciosTableProps {
  servicios: Servicio[]
}

export function ServiciosTable({ servicios }: ServiciosTableProps) {
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null)
  const [deletingServicio, setDeletingServicio] = useState<Servicio | null>(null)

  // ✅ modal productos
  const [productosServicioId, setProductosServicioId] = useState<string | null>(null)

  if (servicios.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-500">No hay servicios creados todavía</p>
          <p className="text-sm text-gray-400 mt-2">
            Crea tu primer servicio para comenzar a recibir reservas
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Duración</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Productos por servicio</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {servicios.map((servicio) => (
                <TableRow key={servicio.id}>
                  <TableCell className="font-medium">{servicio.nombre}</TableCell>

                  <TableCell className="text-gray-600 max-w-xs truncate">
                    {servicio.descripcion || '-'}
                  </TableCell>

                  <TableCell className="text-right">{servicio.duracion_min} min</TableCell>

                  <TableCell className="text-right font-semibold">
                    ${Number(servicio.precio).toLocaleString('es-AR')}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setProductosServicioId(servicio.id)}
                      title="Configurar productos del servicio"
                    >
                      <Package className="w-4 h-4" />
                      Productos
                    </Button>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingServicio(servicio)}
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingServicio(servicio)}
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingServicio && (
        <EditServicioDialog
          servicio={editingServicio}
          open={!!editingServicio}
          onOpenChange={(open) => !open && setEditingServicio(null)}
        />
      )}

      {deletingServicio && (
        <DeleteServicioDialog
          servicio={deletingServicio}
          open={!!deletingServicio}
          onOpenChange={(open) => !open && setDeletingServicio(null)}
        />
      )}

      {/* ✅ Modal Productos */}
      <ServicioProductosDialog
        open={!!productosServicioId}
        servicioId={productosServicioId || ''}
        onOpenChange={(open) => {
          if (!open) setProductosServicioId(null)
        }}
      />
    </>
  )
}
