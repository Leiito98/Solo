'use client'

import { useMemo, useState } from 'react'
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
import { Pencil, Trash2, Package, ImageIcon } from 'lucide-react'
import { EditServicioDialog } from './edit-servicio-dialog'
import { DeleteServicioDialog } from './delete-servicio-dialog'
import { ServicioProductosDialog } from '@/components/dashboard/servicios/servicio-productos-dialog'
import { SubirImagenServicioDialog } from './SubirImagenServicioDialog'

interface Servicio {
  id: string
  nombre: string
  descripcion?: string | null
  duracion_min: number
  precio: number
  imagen_url: string | null
}

interface ServiciosTableProps {
  servicios: Servicio[]
}

export function ServiciosTable({ servicios }: ServiciosTableProps) {
  // ✅ Overrides optimistas SOLO para imagen_url (no congelamos el listado)
  const [imagenOverrides, setImagenOverrides] = useState<Record<string, string | null>>({})

  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null)
  const [deletingServicio, setDeletingServicio] = useState<Servicio | null>(null)
  const [productosServicioId, setProductosServicioId] = useState<string | null>(null)
  const [imagenServicio, setImagenServicio] = useState<Servicio | null>(null)

  function handleImagenUpdated(id: string, imagen_url: string | null) {
    setImagenOverrides((prev) => ({ ...prev, [id]: imagen_url }))
  }

  // ✅ servicios + override de imagen (si existe)
  const serviciosView = useMemo(() => {
    if (!servicios?.length) return []
    return servicios.map((s) => ({
      ...s,
      imagen_url: Object.prototype.hasOwnProperty.call(imagenOverrides, s.id)
        ? imagenOverrides[s.id]!
        : s.imagen_url,
    }))
  }, [servicios, imagenOverrides])

  if (serviciosView.length === 0) {
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
                <TableHead className="text-right">Imagen de servicio</TableHead>
                <TableHead className="text-right">Productos por servicio</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {serviciosView.map((servicio) => (
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
                    <div className="flex items-center justify-end gap-6">
                      {servicio.imagen_url ? (
                        <img
                          src={servicio.imagen_url}
                          alt={servicio.nombre}
                          className="h-9 w-9 rounded-md object-cover border"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-md border bg-gray-50 flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setImagenServicio(servicio)}
                        className="text-xs h-7 px-2"
                      >
                        {servicio.imagen_url ? 'Cambiar' : 'Subir'}
                      </Button>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-8"
                      onClick={() => setProductosServicioId(servicio.id)}
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

      <ServicioProductosDialog
        open={!!productosServicioId}
        servicioId={productosServicioId || ''}
        onOpenChange={(open) => {
          if (!open) setProductosServicioId(null)
        }}
      />

      {imagenServicio && (
        <SubirImagenServicioDialog
          servicio={imagenServicio}
          onClose={(updatedImagenUrl) => {
            if (updatedImagenUrl !== undefined) {
              handleImagenUpdated(imagenServicio.id, updatedImagenUrl)
            }
            setImagenServicio(null)
          }}
        />
      )}
    </>
  )
}