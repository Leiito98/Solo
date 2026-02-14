"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon } from "lucide-react";

type Servicio = {
  id: string;
  nombre: string;
  imagen_url: string | null;
};

export function SubirImagenServicioDialog({
  servicio,
  onClose,
}: {
  servicio: Servicio;
  onClose: (updatedImagenUrl?: string | null) => void;
}) {
  const [open, setOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [preview, setPreview] = useState<string | null>(servicio.imagen_url);
  const [file, setFile] = useState<File | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;

    if (!picked.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen (JPG, PNG, WEBP…)");
      return;
    }
    if (picked.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar los 5 MB");
      return;
    }

    setError(null);
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const fakeEvent = {
      target: { files: e.dataTransfer.files },
    } as React.ChangeEvent<HTMLInputElement>;
    handleFileChange(fakeEvent);
  }

  async function save() {
    if (!file) return;

    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("servicio_id", servicio.id);
      formData.append("imagen", file);

      const res = await fetch("/api/servicios/imagen", {
        method: "POST",
        body: formData,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Error subiendo la imagen");

      setOpen(false);
      onClose(json?.imagen_url ?? preview);
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteImagen() {
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/servicios/imagen?servicio_id=${servicio.id}`,
        { method: "DELETE" }
      );

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Error eliminando la imagen");

      setPreview(null);
      setFile(null);
      setOpen(false);
      onClose(null);
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Imagen del servicio • {servicio.nombre}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          {/* Preview */}
          <div className="w-full h-40 rounded-lg border bg-gray-50 overflow-hidden flex items-center justify-center">
            {preview ? (
              <img
                src={preview}
                alt={servicio.nombre}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <ImageIcon className="h-10 w-10" />
                <span className="text-sm">Sin imagen</span>
              </div>
            )}
          </div>

          {/* Drop zone */}
          <div
            className="w-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              Arrastrá una imagen o{" "}
              <span className="text-blue-600 underline underline-offset-2">
                hacé clic para seleccionar
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG, WEBP — máx. 5 MB
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {error && (
            <p className="text-sm text-red-600 w-full text-left">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-2">
          {servicio.imagen_url && !file ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1"
              onClick={deleteImagen}
              disabled={deleting || saving}
            >
              <X className="h-4 w-4" />
              {deleting ? "Eliminando..." : "Eliminar imagen"}
            </Button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setOpen(false);
                onClose();
              }}
              disabled={saving || deleting}
            >
              Cancelar
            </Button>
            <Button
              onClick={save}
              disabled={!file || saving || deleting}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {saving ? "Subiendo..." : "Guardar imagen"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}