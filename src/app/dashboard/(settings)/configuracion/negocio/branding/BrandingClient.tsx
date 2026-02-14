"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function isValidHex(v: string) {
  return /^#[0-9a-fA-F]{6}$/.test(v.trim());
}

export default function BrandingClient({
  negocioId,
  negocioNombre,
  initialLogoUrl,
  initialPrimary,
  initialSecondary,
  initialBannerUrl,
}: {
  negocioId: string;
  negocioNombre: string;
  initialLogoUrl: string | null;
  initialPrimary: string;
  initialSecondary: string;
  initialBannerUrl: string | null;
}) {
  const supabase = useMemo(() => createClient(), []);
  const { toast } = useToast();

  const fileRef = useRef<HTMLInputElement | null>(null);

  // ✅ Banner refs
  const bannerRef = useRef<HTMLInputElement | null>(null);

  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
  const [primary, setPrimary] = useState(initialPrimary);
  const [secondary, setSecondary] = useState(initialSecondary);

  // ✅ Banner state
  const [bannerUrl, setBannerUrl] = useState<string | null>(initialBannerUrl);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ Banner uploading state (separado para no mezclar con logo)
  const [uploadingBanner, setUploadingBanner] = useState(false);

  async function onPickFile() {
    fileRef.current?.click();
  }

  // ✅ Banner pick
  async function onPickBanner() {
    bannerRef.current?.click();
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const max = 2 * 1024 * 1024;
    if (file.size > max) {
      toast({ title: "Archivo demasiado grande", description: "Máximo 2MB.", variant: "destructive" });
      e.target.value = "";
      return;
    }

    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast({ title: "Formato inválido", description: "Usá PNG, JPG, SVG o WEBP.", variant: "destructive" });
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      // Guardamos en storage en una carpeta por negocio
      const ext = file.name.split(".").pop() || "png";
      const path = `${negocioId}/logo-${Date.now()}.${ext}`;

      // Upload
      const { error: upErr } = await supabase.storage
        .from("negocio-logos")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (upErr) throw upErr;

      // Public URL (bucket debe ser public)
      const { data } = supabase.storage.from("negocio-logos").getPublicUrl(path);
      const publicUrl = data.publicUrl;

      // Persistimos en DB
      const res = await fetch("/api/negocio/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logo_url: publicUrl }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudo guardar el logo");

      setLogoUrl(publicUrl);
      toast({ title: "Logo actualizado", description: "Se guardó correctamente." });
    } catch (err: any) {
      toast({ title: "Error subiendo logo", description: err?.message || "Intentá de nuevo.", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  // ✅ Banner upload handler (nuevo)
  async function onBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const max = 2 * 1024 * 1024;
    if (file.size > max) {
      toast({ title: "Archivo demasiado grande", description: "Máximo 2MB.", variant: "destructive" });
      e.target.value = "";
      return;
    }

    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast({ title: "Formato inválido", description: "Usá PNG, JPG, SVG o WEBP.", variant: "destructive" });
      e.target.value = "";
      return;
    }

    setUploadingBanner(true);
    try {
      // Guardamos en storage en una carpeta por negocio
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${negocioId}/banner-${Date.now()}.${ext}`;

      // Upload
      const { error: upErr } = await supabase.storage
        .from("negocio-logos")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (upErr) throw upErr;

      // Public URL (bucket debe ser public)
      const { data } = supabase.storage.from("negocio-logos").getPublicUrl(path);
      const publicUrl = data.publicUrl;

      // Persistimos en DB
      const res = await fetch("/api/negocio/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banner_url: publicUrl }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudo guardar el banner");

      setBannerUrl(publicUrl);
      toast({ title: "Banner actualizado", description: "Se guardó correctamente." });
    } catch (err: any) {
      toast({ title: "Error subiendo banner", description: err?.message || "Intentá de nuevo.", variant: "destructive" });
    } finally {
      setUploadingBanner(false);
      e.target.value = "";
    }
  }

  async function onSaveColors() {
    const p = primary.trim();
    const s = secondary.trim();

    if (!isValidHex(p) || !isValidHex(s)) {
      toast({ title: "Colores inválidos", description: "Usá formato #RRGGBB.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/negocio/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color_primario: p, color_secundario: s }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudo guardar");

      toast({ title: "Branding guardado", description: "Colores actualizados." });
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Intentá de nuevo.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* LOGO */}
      <Card>
        <CardHeader>
          <CardTitle>Logo del Negocio</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp" className="hidden" onChange={onFileChange} />

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border flex items-center justify-center">
              {logoUrl ? (
                <Image src={logoUrl} alt={`Logo ${negocioNombre}`} width={64} height={64} className="object-cover w-full h-full" />
              ) : (
                <ImageIcon className="w-7 h-7 text-gray-400" />
              )}
            </div>

            <div className="flex-1">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">Arrastrá tu logo acá o subilo</p>
                <p className="text-xs text-gray-500">PNG, JPG, SVG o WEBP (máx. 2MB)</p>

                <Button variant="outline" className="mt-4" onClick={onPickFile} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    "Seleccionar archivo"
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Este logo aparecerá en tu página pública y en los emails enviados a tus clientes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ BANNER (NUEVO) */}
      <Card>
        <CardHeader>
          <CardTitle>Banner del Negocio</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <input
            ref={bannerRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
            className="hidden"
            onChange={onBannerChange}
          />

          <div className="flex items-start gap-4">
            {/* Preview del banner con altura fija (evita que te rompa la pagina) */}
            <div className="w-40 h-20 rounded-xl overflow-hidden bg-gray-100 border flex items-center justify-center">
              {bannerUrl ? (
                <Image
                  src={bannerUrl}
                  alt={`Banner ${negocioNombre}`}
                  width={160}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <ImageIcon className="w-7 h-7 text-gray-400" />
              )}
            </div>

            <div className="flex-1">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">Subí una imagen para el banner</p>
                <p className="text-xs text-gray-500">Recomendado: 1600x600 · PNG/JPG/WEBP (máx. 2MB)</p>

                <Button variant="outline" className="mt-4" onClick={onPickBanner} disabled={uploadingBanner}>
                  {uploadingBanner ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    "Seleccionar banner"
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Este banner se verá arriba de tu landing pública (/[slug]) como portada del negocio.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* COLORES */}
      <Card>
        <CardHeader>
          <CardTitle>Colores del Negocio</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color Principal</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="#3b82f6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color Secundario</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={secondary}
                onChange={(e) => setSecondary(e.target.value)}
                className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={secondary}
                onChange={(e) => setSecondary(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="#8b5cf6"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <Button onClick={onSaveColors} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>

            {/* mini preview */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Preview:</span>
              <div className="w-6 h-6 rounded" style={{ background: primary }} />
              <div className="w-6 h-6 rounded" style={{ background: secondary }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
