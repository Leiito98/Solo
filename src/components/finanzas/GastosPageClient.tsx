"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { RefreshCw, CheckCircle2, AlertTriangle, Plus, Pencil, Power } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function ars(n: number) {
  return `$${Math.round(Number(n || 0)).toLocaleString("es-AR")}`;
}
function currentPeriodo() {
  return format(new Date(), "yyyy-MM");
}
function safeNumber(x: any) {
  const v = Number(x);
  return Number.isFinite(v) ? v : 0;
}

type GastoEstado = "pendiente" | "pagado";
type GastoCategoria = string;

type PagoGastoItem = {
  id: string;
  periodo: string;
  monto: number;
  estado: GastoEstado;
  fecha_vencimiento: string; // YYYY-MM-DD
  fecha_pago: string | null;
  nota: string | null;
  gastos_fijos: {
    id: string;
    nombre: string;
    categoria: GastoCategoria;
    dia_vencimiento: number;
    monto_mensual: number;
    activo: boolean;
  } | null;
};

type GastoFijoItem = {
  id: string;
  nombre: string;
  categoria: GastoCategoria;
  monto_mensual: number;
  dia_vencimiento: number;
  activo: boolean;
};

type EstadoFiltro = "pendiente" | "pagado" | "todos";

function isVencido(fechaVenc: string) {
  // fechaVenc: YYYY-MM-DD
  const hoy = format(new Date(), "yyyy-MM-dd");
  return fechaVenc < hoy;
}

const CAT_OPTIONS = [
  "alquiler",
  "servicios",
  "sueldos",
  "impuestos",
  "marketing",
  "insumos",
  "otros",
];

export default function GastosPageClient() {
  const [periodo, setPeriodo] = useState<string>(() => currentPeriodo());
  const [estado, setEstado] = useState<EstadoFiltro>("pendiente");

  const [items, setItems] = useState<PagoGastoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- CRUD gastos fijos ----
  const [gastosFijos, setGastosFijos] = useState<GastoFijoItem[]>([]);
  const [loadingFijos, setLoadingFijos] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GastoFijoItem | null>(null);
  const [savingFijo, setSavingFijo] = useState(false);

  const [fNombre, setFNombre] = useState("");
  const [fCategoria, setFCategoria] = useState<GastoCategoria>("otros");
  const [fMonto, setFMonto] = useState<string>("0");
  const [fDia, setFDia] = useState<string>("10");

  const resumen = useMemo(() => {
    const pend = items.filter((i) => i.estado === "pendiente");
    const pag = items.filter((i) => i.estado === "pagado");

    const totalPend = pend.reduce((s, i) => s + safeNumber(i.monto), 0);
    const totalPag = pag.reduce((s, i) => s + safeNumber(i.monto), 0);
    const vencidos = pend.filter((i) => isVencido(i.fecha_vencimiento)).length;

    return { totalPend, totalPag, vencidos };
  }, [items]);

  async function fetchPagos() {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ periodo, estado });
      const res = await fetch(`/api/finanzas/gastos?${qs.toString()}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Error cargando gastos");
      setItems(Array.isArray(json?.items) ? json.items : []);
    } catch (e: any) {
      setError(e?.message || "Error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function marcarPagado(pagoId: string) {
    setError(null);
    try {
      const res = await fetch(`/api/finanzas/gastos/marcar-pagado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pago_id: pagoId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Error marcando pagado");
      await fetchPagos();
    } catch (e: any) {
      setError(e?.message || "Error");
    }
  }

  async function fetchGastosFijos() {
    setLoadingFijos(true);
    setError(null);
    try {
      const res = await fetch(`/api/finanzas/gastos-fijos`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Error cargando gastos fijos");
      setGastosFijos(Array.isArray(json?.items) ? json.items : []);
    } catch (e: any) {
      setError(e?.message || "Error");
      setGastosFijos([]);
    } finally {
      setLoadingFijos(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setFNombre("");
    setFCategoria("otros");
    setFMonto("0");
    setFDia("10");
    setModalOpen(true);
  }

  function openEdit(g: GastoFijoItem) {
    setEditing(g);
    setFNombre(g.nombre || "");
    setFCategoria((g.categoria as any) || "otros");
    setFMonto(String(g.monto_mensual ?? 0));
    setFDia(String(g.dia_vencimiento ?? 10));
    setModalOpen(true);
  }

  async function saveGastoFijo() {
    setSavingFijo(true);
    setError(null);
    try {
      const payload = {
        nombre: fNombre.trim(),
        categoria: fCategoria,
        monto_mensual: safeNumber(fMonto),
        dia_vencimiento: Math.max(1, Math.min(31, Math.floor(safeNumber(fDia) || 10))),
      };

      if (!payload.nombre) throw new Error("Nombre requerido");

      const res = await fetch(
        editing ? `/api/finanzas/gastos-fijos/${editing.id}` : `/api/finanzas/gastos-fijos`,
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Error guardando");

      setModalOpen(false);
      await fetchGastosFijos();
      // importante: refrescar pagos del período por si agregaste un gasto fijo nuevo
      await fetchPagos();
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setSavingFijo(false);
    }
  }

  async function toggleActivo(g: GastoFijoItem) {
    setError(null);
    try {
      const res = await fetch(`/api/finanzas/gastos-fijos/${g.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !g.activo }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Error actualizando");
      await fetchGastosFijos();
      await fetchPagos();
    } catch (e: any) {
      setError(e?.message || "Error");
    }
  }

  useEffect(() => {
    fetchPagos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo, estado]);

  useEffect(() => {
    fetchGastosFijos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
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
            onChange={(e) => setEstado(e.target.value as EstadoFiltro)}
            className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm"
          >
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="todos">Todos</option>
          </select>
        </div>

        <Button variant="outline" onClick={fetchPagos} disabled={loading} className="gap-2">
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
            <CardTitle className="text-sm text-gray-600">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{ars(resumen.totalPend)}</div>
            <p className="text-xs text-gray-500 mt-1">Pagos del período no marcados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Pagados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{ars(resumen.totalPag)}</div>
            <p className="text-xs text-gray-500 mt-1">Pagos confirmados del período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Vencidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-gray-500" />
              <div className="text-2xl font-semibold">{resumen.vencidos}</div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Pendientes con vencimiento pasado</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de pagos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pagos del período</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-sm text-gray-500">No hay pagos para este filtro.</div>
          ) : (
            <div className="space-y-2">
              {items.map((it) => {
                const nombre = it.gastos_fijos?.nombre || "Gasto";
                const cat = it.gastos_fijos?.categoria || "otros";
                const vencido = it.estado === "pendiente" && isVencido(it.fecha_vencimiento);

                return (
                  <div
                    key={it.id}
                    className="rounded-lg border border-gray-100 bg-white p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-[280px]">
                      <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        {nombre}
                        <Badge variant="secondary" className="text-xs">
                          {cat}
                        </Badge>
                        {vencido ? (
                          <Badge variant="destructive" className="text-xs">
                            vencido
                          </Badge>
                        ) : null}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Vence: <b>{it.fecha_vencimiento}</b> · Período: <b>{it.periodo}</b>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-lg font-bold">{ars(it.monto)}</div>

                      <Badge variant={it.estado === "pagado" ? "default" : "secondary"} className="text-sm px-3 py-1">
                        {it.estado}
                      </Badge>

                      {it.estado === "pendiente" ? (
                        <Button className="gap-2" onClick={() => marcarPagado(it.id)}>
                          <CheckCircle2 className="h-4 w-4" />
                          Marcar pagado
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gastos fijos (CRUD) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Gastos fijos</CardTitle>
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nuevo
          </Button>
        </CardHeader>
        <CardContent>
          {loadingFijos ? (
            <div className="text-sm text-gray-500">Cargando…</div>
          ) : gastosFijos.length === 0 ? (
            <div className="text-sm text-gray-500">Todavía no tenés gastos fijos.</div>
          ) : (
            <div className="space-y-2">
              {gastosFijos.map((g) => (
                <div
                  key={g.id}
                  className="rounded-lg border border-gray-100 bg-white p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="text-sm font-semibold flex items-center gap-2">
                      {g.nombre}
                      <Badge variant="secondary" className="text-xs">
                        {g.categoria}
                      </Badge>
                      {!g.activo ? (
                        <Badge variant="destructive" className="text-xs">
                          inactivo
                        </Badge>
                      ) : null}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Monto mensual: <b>{ars(g.monto_mensual)}</b> · Vence día <b>{g.dia_vencimiento}</b>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => openEdit(g)}>
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => toggleActivo(g)}
                      title={g.activo ? "Desactivar" : "Activar"}
                    >
                      <Power className="h-4 w-4" />
                      {g.activo ? "Desactivar" : "Activar"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator className="my-4" />
          <p className="text-xs text-gray-500">
            Nota: al crear/activar un gasto fijo, el sistema genera automáticamente el pago del período seleccionado.
          </p>
        </CardContent>
      </Card>

      {/* Modal Alta/Edición */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar gasto fijo" : "Nuevo gasto fijo"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600">Nombre</label>
              <Input value={fNombre} onChange={(e) => setFNombre(e.target.value)} placeholder="Ej: Alquiler" />
            </div>

            <div>
              <label className="text-xs text-gray-600">Categoría</label>
              <select
                value={fCategoria}
                onChange={(e) => setFCategoria(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm"
              >
                {CAT_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600">Monto mensual (ARS)</label>
                <Input value={fMonto} onChange={(e) => setFMonto(e.target.value)} inputMode="decimal" />
              </div>

              <div>
                <label className="text-xs text-gray-600">Día vencimiento</label>
                <Input value={fDia} onChange={(e) => setFDia(e.target.value)} inputMode="numeric" />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setModalOpen(false)} disabled={savingFijo}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={saveGastoFijo} disabled={savingFijo}>
                {savingFijo ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
