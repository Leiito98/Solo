"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  Calendar,
  MapPin,
  Phone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PublicLogo } from "@/components/public/public-logo";

function isValidHex(v: string) {
  return /^#[0-9a-fA-F]{6}$/.test(v.trim());
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function PublicMiniPreview({
  negocioNombre,
  logoUrl,
  bannerUrl,
  primary,
  secondary,
}: {
  negocioNombre: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  primary: string;
  secondary: string;
}) {
  const p = isValidHex(primary) ? primary.trim() : "#111827";
  const s = isValidHex(secondary) ? secondary.trim() : "#374151";
  const { r, g, b } = hexToRgb(p);

  const serviciosDemo = [
    { nombre: "Corte clásico", duracion: 30, precio: 5500 },
    { nombre: "Corte + barba", duracion: 45, precio: 8000 },
  ];
  const fmtPrice = (n: number) => "$" + Number(n).toLocaleString("es-AR");

  return (
    <div className="pmv-root rounded-xl border bg-white overflow-hidden">
      <style>{`
        .pmv-root{
          font-family: 'Plus Jakarta Sans','DM Sans',system-ui,sans-serif;
        }
        .pmv-shell{
          background:#f7f7f8;
        }
        .pmv-sticky{
          position: sticky;
          top: 0;
          z-index: 10;
          background: rgba(255,255,255,.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #eeeff2;
        }
        .pmv-btn-book{
          display:inline-flex;align-items:center;justify-content:center;gap:8px;
          background: var(--p);
          color:#fff;font-weight:800;font-size:.78rem;
          padding:0 .9rem;height:32px;border-radius:10px;
          border:none;cursor:pointer;white-space:nowrap;
          transition: filter .15s, transform .15s;
        }
        .pmv-btn-book:hover{filter:brightness(1.05);transform:translateY(-.5px)}
        .pmv-btn-ghost{
          display:inline-flex;align-items:center;justify-content:center;gap:8px;
          background:#fff;color:var(--p);
          font-weight:800;font-size:.74rem;
          padding:0 .8rem;height:30px;border-radius:10px;
          border:1.5px solid rgba(var(--pr),var(--pg),var(--pb),.25);
          transition: background .15s, border-color .15s;
        }
        .pmv-btn-ghost:hover{
          background: rgba(var(--pr),var(--pg),var(--pb),.06);
          border-color: rgba(var(--pr),var(--pg),var(--pb),.45);
        }
        .pmv-badge{
          display:inline-flex;align-items:center;gap:4px;
          padding:3px 10px;border-radius:999px;
          font-size:.62rem;font-weight:900;letter-spacing:.06em;
          text-transform:uppercase;
          background: rgba(var(--pr),var(--pg),var(--pb),.10);
          color: var(--p);
          border: 1px solid rgba(var(--pr),var(--pg),var(--pb),.18);
        }
        .pmv-info-pill{
          display:inline-flex;align-items:center;gap:6px;
          padding:6px 10px;border-radius:10px;
          background:#f3f4f6;border:1px solid #e5e7eb;
          font-size:.74rem;color:#4b5563;
          white-space:nowrap;
        }
        .pmv-hero{
          background:#fff;
          border:1px solid #f1f2f4;
          box-shadow: 0 18px 40px rgba(0,0,0,.10);
          border-radius: 18px;
        }
        .pmv-svc-card{
          background:#fff;border-radius:14px;overflow:hidden;
          border:1px solid #e8e8ec;
          transition: box-shadow .2s, transform .2s;
        }
        .pmv-svc-card:hover{box-shadow:0 8px 20px rgba(0,0,0,.08);transform:translateY(-1px)}
        .pmv-cta{
          position:relative;border-radius:18px;overflow:hidden;
          padding:16px;text-align:center;color:#fff;
          background: linear-gradient(135deg, var(--p) 0%, var(--s) 100%);
        }
        .pmv-cta::before{
          content:"";
          position:absolute;inset:0;opacity:.06;
          background-image:url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3Ccircle cx='23' cy='23' r='1.5'/%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>

      <div
        className="pmv-shell"
        style={
          {
            ["--p" as any]: p,
            ["--s" as any]: s,
            ["--pr" as any]: r,
            ["--pg" as any]: g,
            ["--pb" as any]: b,
          } as React.CSSProperties
        }
      >
        {/* NAV */}
        <div className="pmv-sticky">
          <div className="px-4 h-12 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {/* ✅ PRO: logo robusto (nunca muestra “?”) */}
              <PublicLogo
                name={negocioNombre}
                src={logoUrl}
                primary={p}
                secondary={s}
                size={32}
                className="rounded-lg border border-gray-200 bg-white"
              />

              <span className="text-gray-900 truncate text-xs font-black">
                {negocioNombre}
              </span>
            </div>

            <button type="button" className="pmv-btn-book">
              <Calendar className="w-3.5 h-3.5" /> Reservar
            </button>
          </div>
        </div>

        {/* BANNER */}
        <div
          className="relative w-full overflow-hidden bg-gray-200"
          style={{ aspectRatio: "16/5", minHeight: 110, maxHeight: 160 }}
        >
          {bannerUrl ? (
            <Image
              src={bannerUrl}
              alt="banner"
              fill
              sizes="800px"
              className="object-cover object-top"
              priority={false}
              // ✅ por si el banner está roto, lo “ocultamos” mostrando gradiente
              onError={(e) => {
                const el = e.currentTarget as any;
                if (el?.style) el.style.display = "none";
              }}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg,${p} 0%,${s} 100%)` }}
            />
          )}

          {/* overlay (si banner existe, igual queda lindo) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                bannerUrl
                  ? "linear-gradient(to top, rgba(247,247,248,0.95) 0%, rgba(247,247,248,0.35) 30%, rgba(247,247,248,0) 60%)"
                  : "transparent",
            }}
          />
          <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#f7f7f8] to-transparent" />
        </div>

        {/* HERO */}
        <div className="px-4">
          <div className="relative -mt-8 pmv-hero p-4">
            <div className="flex gap-4">
              {/* ✅ PRO: logo grande robusto */}
              <div className="flex-shrink-0 -mt-8">
                <PublicLogo
                  name={negocioNombre}
                  src={logoUrl}
                  primary={p}
                  secondary={s}
                  size={64}
                  className="border-4 border-white shadow-md"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="text-base font-black text-gray-900 truncate">
                    {negocioNombre}
                  </p>
                  <span className="pmv-badge">Vista previa</span>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                  Así se vería tu página con estos colores.
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className="pmv-info-pill">
                    <MapPin className="w-3.5 h-3.5" style={{ color: p }} />
                    Dirección
                  </span>
                  <span className="pmv-info-pill">
                    <Phone className="w-3.5 h-3.5" style={{ color: p }} />
                    WhatsApp
                  </span>

                  <div className="ml-auto flex gap-2">
                    <button type="button" className="pmv-btn-ghost">
                      Ver servicios
                    </button>
                    <button type="button" className="pmv-btn-book">
                      Reservar turno
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SERVICIOS */}
        <div className="px-4 mt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-extrabold text-gray-900">Servicios</p>
            <span className="text-[11px] text-gray-400 font-medium">
              {serviciosDemo.length} servicios
            </span>
          </div>

          <div className="space-y-2.5">
            {serviciosDemo.map((svc) => (
              <div key={svc.nombre} className="pmv-svc-card">
                <div className="p-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 leading-snug">
                      {svc.nombre}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                      {svc.duracion} min
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-black text-gray-900 leading-none">
                        {fmtPrice(svc.precio)}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">ARS</p>
                    </div>

                    <button
                      type="button"
                      className="pmv-btn-book"
                      style={{ height: 30, fontSize: ".74rem" }}
                    >
                      Agendar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-4 pmv-cta">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/75">
                {negocioNombre}
              </p>
              <p className="text-lg font-black leading-tight mt-1">
                ¿Listo para reservar tu turno?
              </p>
              <p className="text-xs text-white/70 mt-1">
                Elegís servicio, profesional y horario en minutos.
              </p>
              <button
                type="button"
                className="mt-3 bg-white font-black text-xs px-5 py-2.5 rounded-xl"
                style={{ color: p }}
              >
                Reservar turno ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
  const bannerRef = useRef<HTMLInputElement | null>(null);

  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
  const [primary, setPrimary] = useState(initialPrimary);
  const [secondary, setSecondary] = useState(initialSecondary);
  const [bannerUrl, setBannerUrl] = useState<string | null>(initialBannerUrl);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  async function onPickFile() {
    fileRef.current?.click();
  }
  async function onPickBanner() {
    bannerRef.current?.click();
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const max = 2 * 1024 * 1024;
    if (file.size > max) {
      toast({
        title: "Archivo demasiado grande",
        description: "Máximo 2MB.",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    const allowed = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/svg+xml",
      "image/webp",
    ];
    if (!allowed.includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Usá PNG, JPG, SVG o WEBP.",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${negocioId}/logo-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("negocio-logos")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (upErr) throw upErr;

      const { data } = supabase.storage.from("negocio-logos").getPublicUrl(path);
      const publicUrl = data.publicUrl;

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
      toast({
        title: "Error subiendo logo",
        description: err?.message || "Intentá de nuevo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function onBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const max = 2 * 1024 * 1024;
    if (file.size > max) {
      toast({
        title: "Archivo demasiado grande",
        description: "Máximo 2MB.",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    const allowed = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/svg+xml",
      "image/webp",
    ];
    if (!allowed.includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Usá PNG, JPG, SVG o WEBP.",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    setUploadingBanner(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${negocioId}/banner-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("negocio-logos")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (upErr) throw upErr;

      const { data } = supabase.storage.from("negocio-logos").getPublicUrl(path);
      const publicUrl = data.publicUrl;

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
      toast({
        title: "Error subiendo banner",
        description: err?.message || "Intentá de nuevo.",
        variant: "destructive",
      });
    } finally {
      setUploadingBanner(false);
      e.target.value = "";
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("getsolo:onboarding-refresh"));
    }
  }

  async function removeLogo() {
    try {
      const res = await fetch("/api/negocio/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logo_url: null }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudo quitar el logo");

      setLogoUrl(null);
      toast({ title: "Logo eliminado" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message,
        variant: "destructive",
      });
    }
  }

  async function removeBanner() {
    try {
      const res = await fetch("/api/negocio/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banner_url: null }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudo quitar el banner");

      setBannerUrl(null);
      toast({ title: "Banner eliminado" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message,
        variant: "destructive",
      });
    }
  }

  async function onSaveColors() {
    const p = primary.trim();
    const s = secondary.trim();

    if (!isValidHex(p) || !isValidHex(s)) {
      toast({
        title: "Colores inválidos",
        description: "Usá formato #RRGGBB.",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: err?.message || "Intentá de nuevo.",
        variant: "destructive",
      });
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
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
            className="hidden"
            onChange={onFileChange}
          />

          <div className="grid gap-6 md:grid-cols-2">
            {/* Izquierda: Dropzone */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Tu logo</p>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-white">
                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-1">
                  Arrastrá o seleccioná el archivo
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, SVG o WEBP (máx. 2MB)
                </p>

                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={onPickFile}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    "Subir archivo"
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Recomendado: <strong>512×512</strong> o mayor (cuadrado). Fondo
                transparente si es posible.
              </p>
            </div>

            {/* Derecha: Preview grande */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Previsualización
              </p>

              <div className="rounded-xl border bg-white overflow-hidden flex items-center justify-center min-h-[190px]">
                {logoUrl ? (
                  <div className="relative">
                    {/* ✅ PRO: preview usando PublicLogo */}
                    <PublicLogo
                      name={negocioNombre}
                      src={logoUrl}
                      primary={primary}
                      secondary={secondary}
                      size={170}
                      className="border border-gray-200 bg-white"
                    />

                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center text-gray-500 hover:text-red-600"
                      aria-label="Quitar logo"
                      title="Quitar logo"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-sm text-gray-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                    Sin logo
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BANNER */}
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

          <div className="grid gap-6 md:grid-cols-2">
            {/* Izquierda: Dropzone */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Tu banner</p>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-white">
                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-1">
                  Arrastrá o seleccioná el archivo
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, SVG o WEBP (máx. 2MB)
                </p>

                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={onPickBanner}
                  disabled={uploadingBanner}
                >
                  {uploadingBanner ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    "Subir archivo"
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Recomendado: <strong>1600×600</strong> (relación{" "}
                <strong>16:5</strong>). Evitá texto pegado a los bordes.
              </p>
            </div>

            {/* Derecha: Preview grande (16/5) */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Previsualización
              </p>

              <div className="rounded-xl border bg-white overflow-hidden">
                <div
                  className="relative w-full bg-gray-100"
                  style={{ aspectRatio: "16/5" }}
                >
                  {bannerUrl ? (
                    <div className="absolute inset-0">
                      <Image
                        src={bannerUrl}
                        alt={`Banner ${negocioNombre}`}
                        fill
                        sizes="700px"
                        className="object-cover object-top"
                        onError={(e) => {
                          // si se rompe, lo limpiamos visualmente
                          const el = e.currentTarget as any;
                          if (el?.style) el.style.display = "none";
                        }}
                      />

                      <button
                        type="button"
                        onClick={removeBanner}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center text-gray-500 hover:text-red-600"
                        aria-label="Quitar banner"
                        title="Quitar banner"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                        Sin banner
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* COLORES + PREVIEW EN VIVO */}
      <Card>
        <CardHeader>
          <CardTitle>Colores del Negocio</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Principal
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Secundario
            </label>
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

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Preview:</span>
              <div className="w-6 h-6 rounded" style={{ background: primary }} />
              <div className="w-6 h-6 rounded" style={{ background: secondary }} />
            </div>
          </div>

          {/* Vista previa */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Vista previa en vivo
              </p>
              <p className="text-xs text-gray-400">Cambia los colores y mirá el resultado</p>
            </div>

            <PublicMiniPreview
              negocioNombre={negocioNombre}
              logoUrl={logoUrl}
              bannerUrl={bannerUrl}
              primary={primary}
              secondary={secondary}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
