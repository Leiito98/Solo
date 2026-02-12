"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

type Estado = "pendiente" | "pagada" | "adelantada";

type TurnoLite = { fecha: string; hora_inicio: string; hora_fin: string };

type ComisionItem = {
  id: string;
  turno_id: string;
  profesional_id: string;
  monto_servicio: number;
  porcentaje: number;
  monto_comision: number;
  estado: Estado;
  fecha_generada: string;
  fecha_pago: string | null;
  profesionales: { nombre: string } | null;

  // ✅ puede venir null / objeto / array (según PostgREST join)
  turnos: TurnoLite | TurnoLite[] | null;
};

function ars(n: number) {
  return `$${Math.round(n).toLocaleString("es-AR")}`;
}

function currentPeriodo() {
  return format(new Date(), "yyyy-MM");
}

function safeNumber(x: any) {
  const v = Number(x);
  return Number.isFinite(v) ? v : 0;
}

function firstOrSelf<T>(x: any): T | null {
  if (!x) return null;
  return Array.isArray(x) ? (x[0] ?? null) : x;
}

type Group = {
  profesional_id: string;
  nombre: string;
  total: number;
  count: number;
  items: ComisionItem[];
};

export default function ComisionesPageClient() {
  const [periodo, setPeriodo] = useState<string>(() => currentPeriodo());
  const [estado, setEstado] = useState<Estado>("pendiente");

  const [items, setItems] = useState<ComisionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [paying, setPaying] = useState<Record<string, boolean>>({});

  const groups: Group[] = useMemo(() => {
    const map = new Map<string, Group>();

    for (const it of items) {
      const pid = it.profesional_id || "unknown";
      const nombre = it.profesionales?.nombre || "Profesional";

      const g = map.get(pid) || {
        profesional_id: pid,
        nombre,
        total: 0,
        count: 0,
        items: [],
      };

      g.items.push(it);
      g.count += 1;
      g.total += safeNumber(it.monto_comision);

      map.set(pid, g);
    }

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [items]);

  const totalPeriodo = useMemo(() => {
    return groups.reduce((s, g) => s + g.total, 0);
  }, [groups]);

  async function fetchComisiones() {
    setLoading(true);
    setError(null);

    try {
      const qs = new URLSearchParams({ periodo, estado });

      const res = await fetch(`/api/finanzas/comisiones?${qs.toString()}`, {
        cache: "no-store",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Error cargando comisiones");

      const list = Array.isArray(json?.items) ? (json.items as ComisionItem[]) : [];
      setItems(list);
      setExpanded({});
    } catch (e: any) {
      setError(e?.message || "Error");
      setItems([]);
      setExpanded({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComisiones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo, estado]);

  function toggleExpand(pid: string) {
    setExpanded((prev) => ({ ...prev, [pid]: !prev[pid] }));
  }

  async function pagarProfesional(pid: string) {
    if (estado !== "pendiente") return;

    setPaying((p) => ({ ...p, [pid]: true }));
    setError(null);

    try {
      const res = await fetch(`/api/finanzas/comisiones/pagar-profesional`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profesional_id: pid, periodo }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Error pagando comisiones");

      await fetchComisiones();
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setPaying((p) => ({ ...p, [pid]: false }));
    }
  }

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Período</span>
          <input
            type="month"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Estado</span>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as Estado)}
            className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm"
          >
            <option value="pendiente">Pendiente</option>
            <option value="pagada">Pagada</option>
            <option value="adelantada">Adelantada</option>
          </select>
        </div>

        <Button variant="outline" onClick={fetchComisiones} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>

        {error ? (
          <Badge variant="destructive" className="ml-auto">
            {error}
          </Badge>
        ) : null}
      </div>

      {/* Resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Total del período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{ars(totalPeriodo)}</div>
            <p className="text-xs text-gray-500 mt-1">Suma de todos los profesionales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Profesionales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{groups.length}</div>
            <p className="text-xs text-gray-500 mt-1">con comisiones en el filtro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Acción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Badge variant="secondary">{estado === "pendiente" ? "Pagable" : "Solo lectura"}</Badge>
            <p className="text-xs text-gray-500">
              El pago es por profesional y solo del período seleccionado.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista agrupada */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Por profesional</CardTitle>
        </CardHeader>

        <CardContent>
          {groups.length === 0 ? (
            <div className="text-sm text-gray-500">No hay comisiones para el filtro actual.</div>
          ) : (
            <div className="space-y-3">
              {groups.map((g) => {
                const isOpen = Boolean(expanded[g.profesional_id]);
                const isPaying = Boolean(paying[g.profesional_id]);

                return (
                  <div key={g.profesional_id} className="rounded-lg border border-gray-100 bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">{g.nombre}</div>
                        <div className="text-xs text-gray-500">
                          {g.count} comisiones · Total: <b>{ars(g.total)}</b>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => toggleExpand(g.profesional_id)}
                          className="gap-2"
                        >
                          {isOpen ? (
                            <>
                              <ChevronUp className="h-4 w-4" /> Ocultar
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" /> Ver detalle
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={() => pagarProfesional(g.profesional_id)}
                          disabled={estado !== "pendiente" || isPaying}
                          className="gap-2"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {isPaying ? "Pagando..." : "Pagar"}
                        </Button>
                      </div>
                    </div>

                    {isOpen ? (
                      <>
                        <Separator className="my-3" />
                        <div className="space-y-2">
                          {g.items.map((it) => {
                            const trow = firstOrSelf<TurnoLite>(it.turnos);

                            const fecha = trow?.fecha
                              ? new Date(`${trow.fecha}T00:00:00`).toLocaleDateString("es-AR", {
                                  weekday: "short",
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })
                              : "Sin fecha";

                            const horario =
                              trow?.hora_inicio && trow?.hora_fin
                                ? `${String(trow.hora_inicio).slice(0, 5)} – ${String(trow.hora_fin).slice(0, 5)}`
                                : "Sin horario";

                            return (
                              <div
                                key={it.id}
                                className="flex flex-col gap-2 rounded-lg border border-gray-100 p-3 md:flex-row md:items-center md:justify-between"
                              >
                                {/* Fecha + horario */}
                                <div className="min-w-[220px]">
                                  <div className="text-sm font-semibold text-gray-900">{fecha}</div>
                                  <div className="text-sm text-gray-600">{horario}</div>
                                </div>

                                {/* Cálculo grande */}
                                <div className="flex flex-wrap items-baseline gap-2">
                                  <div className="text-base font-semibold text-gray-900">
                                    {ars(safeNumber(it.monto_servicio))}
                                  </div>
                                  <div className="text-sm text-gray-500">·</div>
                                  <div className="text-base font-semibold text-gray-900">
                                    {safeNumber(it.porcentaje)}%
                                  </div>
                                  <div className="text-sm text-gray-500">·</div>
                                  <div className="text-lg font-bold text-gray-900">
                                    {ars(safeNumber(it.monto_comision))}
                                  </div>
                                </div>

                                {/* Estado */}
                                <div className="flex justify-end">
                                  <Badge
                                    className="text-sm px-3 py-1"
                                    variant={it.estado === "pagada" ? "default" : "secondary"}
                                  >
                                    {it.estado}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : null}
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
