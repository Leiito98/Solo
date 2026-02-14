"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Facebook, Instagram, Link as LinkIcon } from "lucide-react";

function normalizeUrl(input: string) {
  const v = String(input || "").trim();
  if (!v) return "";
  // si el user pega sin protocolo, le agregamos https://
  if (!/^https?:\/\//i.test(v)) return `https://${v}`;
  return v;
}

function isValidHttpUrl(input: string) {
  if (!input) return true; // vacío es válido
  try {
    const u = new URL(input);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function RedesSocialesClient({
  negocioId,
  negocioNombre,
  initialFacebook,
  initialInstagram,
}: {
  negocioId: string;
  negocioNombre: string;
  initialFacebook: string;
  initialInstagram: string;
}) {
  const { toast } = useToast();

  const [facebook, setFacebook] = useState(initialFacebook);
  const [instagram, setInstagram] = useState(initialInstagram);
  const [saving, setSaving] = useState(false);

  const facebookNorm = normalizeUrl(facebook);
  const instagramNorm = normalizeUrl(instagram);

  async function onSave() {
    const fb = facebookNorm;
    const ig = instagramNorm;

    if (!isValidHttpUrl(fb)) {
      toast({
        title: "Link inválido",
        description: "Facebook debe ser una URL válida (http/https).",
        variant: "destructive",
      });
      return;
    }
    if (!isValidHttpUrl(ig)) {
      toast({
        title: "Link inválido",
        description: "Instagram debe ser una URL válida (http/https).",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/negocio/redes-sociales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          negocioId,
          facebook: fb || null,
          instagram: ig || null,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "No se pudo guardar");

      // Mantener en inputs la versión normalizada
      setFacebook(fb);
      setInstagram(ig);

      toast({
        title: "Guardado",
        description: "Tus redes sociales se actualizaron correctamente.",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "No se pudo guardar",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  function onReset() {
    setFacebook(initialFacebook);
    setInstagram(initialInstagram);
    toast({ title: "Cambios descartados", description: "Volvimos a los valores anteriores." });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Links de redes</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{negocioNombre}</span>
            <span className="text-gray-500"> · </span>
            Estos links se verán en tu landing pública.
          </div>

          {/* FACEBOOK */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Facebook className="w-4 h-4 text-gray-500" />
              Facebook
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/tu-pagina"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {facebookNorm ? (
                <a
                  href={facebookNorm}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 transition"
                >
                  Ver
                </a>
              ) : null}
            </div>
            {facebookNorm && !isValidHttpUrl(facebookNorm) && (
              <p className="text-xs text-red-500">URL inválida.</p>
            )}
          </div>

          {/* INSTAGRAM */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Instagram className="w-4 h-4 text-gray-500" />
              Instagram
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/tu_usuario"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {instagramNorm ? (
                <a
                  href={instagramNorm}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 transition"
                >
                  Ver
                </a>
              ) : null}
            </div>
            {instagramNorm && !isValidHttpUrl(instagramNorm) && (
              <p className="text-xs text-red-500">URL inválida.</p>
            )}
          </div>

          <div className="pt-2 flex gap-3">
            <Button onClick={onSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>

            <Button variant="outline" onClick={onReset} disabled={saving}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
