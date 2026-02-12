"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal } from "lucide-react";
import { ConfigurarComisionesDialog } from "./ConfigurarComisionesDialog";

type Profesional = {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  especialidad: string | null;
  foto_url: string | null;
  activo: boolean;
  comision_pct: number; // fallback global actual
};

export function ProfesionalesComisionesTable({ profesionales }: { profesionales: Profesional[] }) {
  const [selected, setSelected] = useState<Profesional | null>(null);

  if (profesionales.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-gray-500">No hay profesionales registrados</p>
        <p className="text-sm text-gray-400 mt-2">Agrega tu primer profesional para configurar comisiones</p>
      </div>
    );
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
            {profesionales.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={p.foto_url || undefined} />
                      <AvatarFallback>
                        {p.nombre.split(" ").map((n) => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{p.nombre}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-sm">
                    {p.email && <div>{p.email}</div>}
                    {p.telefono && <div className="text-gray-500">{p.telefono}</div>}
                  </div>
                </TableCell>

                <TableCell>{p.especialidad || "-"}</TableCell>

                <TableCell>
                  <Badge variant={p.activo ? "default" : "secondary"}>{p.activo ? "Activo" : "Inactivo"}</Badge>
                </TableCell>

                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setSelected(p)}>
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Configurar por servicio
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selected && <ConfigurarComisionesDialog profesional={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
