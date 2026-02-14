"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, ImageIcon } from "lucide-react";

type Profesional = {
  id: string;
  nombre: string;
  foto_url: string | null;
};

export function SubirFotoDialog({
  profesional,
  onClose,
}: {
  profesional: Profesional;
  onClose: (updatedFotoUrl?: string | null) => void;
}) {
  const [open, setOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preview state — starts with the current foto_url
  const [preview, setPreview] = useState<string | null>(profesional.foto_url);
  const [file, setFile] = useState<File | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;

    // Basic client-side validation
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
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;

    // Simulate the same validation
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
      formData.append("profesional_id", profesional.id);
      formData.append("foto", file);

      const res = await fetch("/api/profesionales/foto", {
        method: "POST",
        body: formData,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Error subiendo la foto");

      setOpen(false);
      onClose(json?.foto_url ?? preview);
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteFoto() {
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/profesionales/foto?profesional_id=${profesional.id}`, {
        method: "DELETE",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Error eliminando la foto");

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

  // Revoke blob URL on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const initials = profesional.nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

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
          <DialogTitle>Foto de perfil • {profesional.nombre}</DialogTitle>
        </DialogHeader>

        {/* Current / preview */}
        <div className="flex flex-col items-center gap-4 py-2">
          <Avatar className="h-24 w-24">
            <AvatarImage src={preview || undefined} className="object-cover" />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>

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
              <span className="text-blue-600 underline underline-offset-2">hacé clic para seleccionar</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — máx. 5 MB</p>
          </div>

          {/* Hidden native input */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {error && <p className="text-sm text-red-600 w-full text-left">{error}</p>}
        </div>

        <div className="flex items-center justify-between gap-2 pt-2">
          {/* Delete button — only shown when there's a saved foto_url */}
          {profesional.foto_url && !file ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1"
              onClick={deleteFoto}
              disabled={deleting || saving}
            >
              <X className="h-4 w-4" />
              {deleting ? "Eliminando..." : "Eliminar foto"}
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
            <Button onClick={save} disabled={!file || saving || deleting} className="gap-2">
              <Upload className="h-4 w-4" />
              {saving ? "Subiendo..." : "Guardar foto"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}