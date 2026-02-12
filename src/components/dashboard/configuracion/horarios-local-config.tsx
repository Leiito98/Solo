"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

type DayRow = {
  dia_semana: number; // 0..6 (0=Domingo)
  cerrado: boolean;
  hora_inicio: string | null; // "09:00:00"
  hora_fin: string | null; // "20:00:00"
};

const DAY_LABEL: Record<number, string> = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

function toHHMM(v: string | null) {
  if (!v) return "";
  return String(v).slice(0, 5); // "HH:MM"
}

function toHHMMSS(v: string) {
  if (!v) return null;
  if (/^\d{2}:\d{2}$/.test(v)) return `${v}:00`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(v)) return v;
  return null;
}

/**
 * ✅ Normaliza SIEMPRE a 7 días.
 * Si en DB falta algún día, lo agregamos como cerrado.
 */
function normalize7Days(input: DayRow[]) {
  const byDay = new Map<number, DayRow>();
  for (const r of input || []) byDay.set(Number(r.dia_semana), r);

  return Array.from({ length: 7 }, (_, d) => {
    const found = byDay.get(d);
    return (
      found || {
        dia_semana: d,
        cerrado: true,
        hora_inicio: null,
        hora_fin: null,
      }
    );
  });
}

export function HorariosLocalConfig() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<DayRow[]>([]);

  const rowsByDay = useMemo(() => {
    const m = new Map<number, DayRow>();
    rows.forEach((r) => m.set(Number(r.dia_semana), r));
    return m;
  }, [rows]);

  async function fetchHorarios() {
    const res = await fetch("/api/configuracion/horarios", { cache: "no-store" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || "Error cargando horarios");
    const got = (json.horarios || []) as DayRow[];
    setRows(normalize7Days(got));
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await fetchHorarios();
      } catch (e) {
        toast({
          title: "Error",
          description: e instanceof Error ? e.message : "Error",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  function updateDay(dia: number, patch: Partial<DayRow>) {
    setRows((prev) =>
      prev.map((r) => (r.dia_semana === dia ? { ...r, ...patch } : r))
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      // ✅ Payload limpio: lo que está en state, sin inventar.
      const payload = rows.map((r) => ({
        dia_semana: r.dia_semana,
        cerrado: !!r.cerrado,
        hora_inicio: r.cerrado ? null : r.hora_inicio,
        hora_fin: r.cerrado ? null : r.hora_fin,
      }));

      const res = await fetch("/api/configuracion/horarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ horarios: payload }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "No se pudo guardar");

      toast({ title: "Guardado", description: "Horario del local actualizado." });

      // ✅ refrescar UI con DB real (para evitar desfasajes)
      await fetchHorarios();
      router.refresh();
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Horario del local</CardTitle>
          <CardDescription>
            Se usa para mostrar “Horarios” en el footer/landing. La disponibilidad real de
            reservas sigue usando horarios de profesionales.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <Button onClick={handleSave} disabled={loading || saving} className="gap-2">
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar cambios
            </Button>
          </div>

          {loading ? (
            <div className="py-10 flex items-center justify-center text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando...
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: 7 }, (_, dia) => {
                const r =
                  rowsByDay.get(dia) || ({
                    dia_semana: dia,
                    cerrado: true,
                    hora_inicio: null,
                    hora_fin: null,
                  } as DayRow);

                return (
                  <div
                    key={dia}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border bg-white"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{DAY_LABEL[dia]}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-gray-600">Cerrado</Label>
                      <Switch
                        checked={!!r.cerrado}
                        onCheckedChange={(cerrado) => {
                          if (cerrado) {
                            updateDay(dia, { cerrado: true, hora_inicio: null, hora_fin: null });
                          } else {
                            // ✅ Si abre un día que estaba cerrado (nulls), ponemos defaults razonables
                            const defaultInicio = r.hora_inicio || "09:00:00";
                            const defaultFin =
                              r.hora_fin || (dia === 6 ? "18:00:00" : "20:00:00");
                            updateDay(dia, {
                              cerrado: false,
                              hora_inicio: defaultInicio,
                              hora_fin: defaultFin,
                            });
                          }
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        className="border rounded-md px-3 py-2 text-sm"
                        disabled={r.cerrado}
                        value={toHHMM(r.hora_inicio)}
                        onChange={(e) => {
                          const v = toHHMMSS(e.target.value);
                          updateDay(dia, { hora_inicio: v });
                        }}
                      />
                      <span className="text-sm text-gray-400">—</span>
                      <input
                        type="time"
                        className="border rounded-md px-3 py-2 text-sm"
                        disabled={r.cerrado}
                        value={toHHMM(r.hora_fin)}
                        onChange={(e) => {
                          const v = toHHMMSS(e.target.value);
                          updateDay(dia, { hora_fin: v });
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
