"use client";

import { useEffect, useState } from "react";
import { ProfesionalesComisionesTable } from "./ProfesionalesComisionesTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

type Profesional = {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  especialidad: string | null;
  foto_url: string | null;
  activo: boolean;
  comision_pct: number;
};

export function ProfesionalesComisionesClient() {
  const [items, setItems] = useState<Profesional[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchProfesionales() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/profesionales", { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Error cargando profesionales");

      setItems(Array.isArray(json?.items) ? json.items : []);
    } catch (e: any) {
      setError(e?.message || "Error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfesionales();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={fetchProfesionales} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>

        {error ? (
          <Badge variant="destructive" className="ml-auto">
            {error}
          </Badge>
        ) : null}
      </div>

      <ProfesionalesComisionesTable profesionales={items} />
    </div>
  );
}
