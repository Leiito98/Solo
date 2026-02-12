"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Profesional = { id: string; nombre: string; comision_pct: number };

type Servicio = { id: string; nombre: string; precio: number };

type Row = {
  servicio_id: string;
  nombre: string;
  precio: number;
  porcentaje: number | null; // null => sin override (usa fallback)
};

export function ConfigurarComisionesDialog({
  profesional,
  onClose,
}: {
  profesional: Profesional;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/profesionales/comisiones-config?profesional_id=${profesional.id}`, {
          cache: "no-store",
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || "Error cargando configuración");

        const servicios: Servicio[] = Array.isArray(json?.servicios) ? json.servicios : [];
        const overrides = new Map<string, number>(
          (Array.isArray(json?.overrides) ? json.overrides : []).map((x: any) => [x.servicio_id, Number(x.porcentaje)])
        );

        const next: Row[] = servicios.map((s) => ({
          servicio_id: s.id,
          nombre: s.nombre,
          precio: Number(s.precio ?? 0),
          porcentaje: overrides.has(s.id) ? overrides.get(s.id)! : null,
        }));

        if (mounted) setRows(next);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Error");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [profesional.id]);

  function updatePct(servicio_id: string, v: string) {
    const cleaned = v.replace(",", ".").trim();
    const n = cleaned === "" ? null : Number(cleaned);
    const pct = n === null || Number.isNaN(n) ? null : Math.max(0, Math.min(100, n));

    setRows((prev) => prev.map((r) => (r.servicio_id === servicio_id ? { ...r, porcentaje: pct } : r)));
  }

  async function save() {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/profesionales/comisiones-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profesional_id: profesional.id,
          overrides: rows.map((r) => ({
            servicio_id: r.servicio_id,
            porcentaje: r.porcentaje, // null => borrar override
          })),
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Error guardando");

      setOpen(false);
      onClose();
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Comisiones por servicio • {profesional.nombre}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-sm text-gray-500 py-6">Cargando servicios…</div>
        ) : error ? (
          <div className="text-sm text-red-600 py-2">{error}</div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-gray-500 py-6">No hay servicios creados.</div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto rounded-lg border">
            <div className="divide-y">
              {rows.map((r) => (
                <div key={r.servicio_id} className="grid grid-cols-12 items-center gap-2 p-3">
                  <div className="col-span-7">
                    <div className="text-sm font-medium text-gray-900">{r.nombre}</div>
                    <div className="text-xs text-gray-500">Precio: ${Math.round(r.precio).toLocaleString("es-AR")}</div>
                  </div>

                  <div className="col-span-5 flex justify-end">
                    <Input
                      value={r.porcentaje ?? ""}
                      onChange={(e) => updatePct(r.servicio_id, e.target.value)}
                      placeholder={`Ej 50`}
                      inputMode="decimal"
                      className="h-9 w-28 text-right"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => { setOpen(false); onClose(); }} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={saving || loading}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
