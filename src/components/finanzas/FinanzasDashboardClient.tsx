"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function ars(n: number) {
  return `$${Math.round(n).toLocaleString("es-AR")}`;
}

function currentPeriodo() {
  return format(new Date(), "yyyy-MM");
}

type Resumen = {
  periodo: string;
  ingresos: number;
  egresos: number;
  balance: number;
  desglose: {
    comisiones: number;
    gastos: number;
  };
  acciones: {
    comisiones_pendientes: number;
    gastos_pendientes: number;
    gastos_vencidos_count: number;
  };
  comparativa: {
    mes_anterior: string;
    cambio_ingresos: number;
    cambio_egresos: number;
    cambio_balance: number;
    datos_anterior: {
      ingresos: number;
      egresos: number;
      balance: number;
    };
  };
  gastos_por_categoria: Record<string, number>;
  historico: Array<{
    periodo: string;
    ingresos: number;
    egresos: number;
    balance: number;
    comisiones: number;
    gastos: number;
  }>;
};

// Colores profesionales
const COLORS = {
  ingresos: "#10b981", // verde
  egresos: "#ef4444", // rojo
  balance: "#3b82f6", // azul
  comisiones: "#f59e0b", // amarillo
  gastos: "#8b5cf6", // morado
};

const CATEGORIA_COLORS = [
  "#3b82f6", // azul
  "#10b981", // verde
  "#f59e0b", // amarillo
  "#ef4444", // rojo
  "#8b5cf6", // morado
  "#ec4899", // rosa
  "#14b8a6", // teal
];

export default function FinanzasDashboardClient() {
  const [periodo, setPeriodo] = useState<string>(() => currentPeriodo());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Resumen | null>(null);
  const [error, setError] = useState<string | null>(null);

  const balanceLabel = useMemo(() => {
    if (!data) return null;
    return data.balance >= 0 ? "Positivo" : "Negativo";
  }, [data]);

  // Preparar datos para gráfico de categorías
  const datosCategorias = useMemo(() => {
    if (!data?.gastos_por_categoria) return [];
    return Object.entries(data.gastos_por_categoria).map(([categoria, monto]) => ({
      name: categoria.charAt(0).toUpperCase() + categoria.slice(1),
      value: Math.round(monto),
    }));
  }, [data]);

  // Preparar datos históricos para gráfico de líneas
  const datosHistorico = useMemo(() => {
    if (!data?.historico) return [];
    return data.historico.map((h) => ({
      mes: format(new Date(h.periodo + "-01"), "MMM", { locale: es }),
      Ingresos: Math.round(h.ingresos),
      Egresos: Math.round(h.egresos),
      Balance: Math.round(h.balance),
    }));
  }, [data]);

  // Datos para gráfico de barras desglose
  const datosDesglose = useMemo(() => {
    if (!data) return [];
    return [
      {
        name: "Comisiones",
        monto: Math.round(data.desglose.comisiones),
        fill: COLORS.comisiones,
      },
      {
        name: "Gastos",
        monto: Math.round(data.desglose.gastos),
        fill: COLORS.gastos,
      },
    ];
  }, [data]);

  async function fetchResumen(p?: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/finanzas/resumen?periodo=${encodeURIComponent(p || periodo)}`, {
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Error");
      setData(json);
    } catch (e: any) {
      setError(e?.message || "Error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResumen(periodo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo]);

  const TrendIcon = ({ value }: { value: number }) => {
    if (value > 0) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

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

        <Button
          variant="outline"
          onClick={() => fetchResumen(periodo)}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>

        {error ? (
          <Badge variant="destructive" className="ml-auto">
            {error}
          </Badge>
        ) : null}
      </div>

      {/* KPIs Principales con Comparativa */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{ars(data?.ingresos || 0)}</div>
            {data?.comparativa && (
              <div className="flex items-center gap-1 mt-2 text-xs">
                <TrendIcon value={data.comparativa.cambio_ingresos} />
                <span className={data.comparativa.cambio_ingresos >= 0 ? "text-green-600" : "text-red-600"}>
                  {data.comparativa.cambio_ingresos >= 0 ? "+" : ""}
                  {data.comparativa.cambio_ingresos.toFixed(1)}%
                </span>
                <span className="text-muted-foreground">vs mes anterior</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Turnos pagados + señas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Egresos</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{ars(data?.egresos || 0)}</div>
            {data?.comparativa && (
              <div className="flex items-center gap-1 mt-2 text-xs">
                <TrendIcon value={data.comparativa.cambio_egresos} />
                <span className={data.comparativa.cambio_egresos >= 0 ? "text-red-600" : "text-green-600"}>
                  {data.comparativa.cambio_egresos >= 0 ? "+" : ""}
                  {data.comparativa.cambio_egresos.toFixed(1)}%
                </span>
                <span className="text-muted-foreground">vs mes anterior</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Comisiones + gastos pagados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div
                className={`text-2xl font-bold ${
                  (data?.balance || 0) >= 0 ? "text-blue-600" : "text-red-600"
                }`}
              >
                {ars(data?.balance || 0)}
              </div>
              {data && (
                <Badge variant={data.balance >= 0 ? "default" : "destructive"} className="text-xs">
                  {balanceLabel}
                </Badge>
              )}
            </div>
            {data?.comparativa && (
              <div className="flex items-center gap-1 mt-2 text-xs">
                <TrendIcon value={data.comparativa.cambio_balance} />
                <span
                  className={
                    data.comparativa.cambio_balance >= 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {data.comparativa.cambio_balance >= 0 ? "+" : ""}
                  {data.comparativa.cambio_balance.toFixed(1)}%
                </span>
                <span className="text-muted-foreground">vs mes anterior</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Ingresos - Egresos</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfico de Evolución */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="text-base">Evolución (Últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datosHistorico}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="mes"
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                  }}
                  formatter={(value: unknown) => ars(Number(value) || 0)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Ingresos"
                  stroke={COLORS.ingresos}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Egresos"
                  stroke={COLORS.egresos}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Balance"
                  stroke={COLORS.balance}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Desglose de Egresos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Desglose de Egresos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={datosDesglose}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                  }}
                  formatter={(value: unknown) => ars(Number(value) || 0)}
                />
                <Bar dataKey="monto" radius={[8, 8, 0, 0]}>
                  {datosDesglose.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Gastos por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gastos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            {datosCategorias.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                <Pie
                  data={datosCategorias}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => {
                    const p = typeof percent === "number" ? percent : 0;
                    return `${name} ${(p * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                    {datosCategorias.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORIA_COLORS[index % CATEGORIA_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                    }}
                    formatter={(value: unknown) => ars(Number(value) || 0)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
                Sin gastos registrados en este período
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Acciones Requeridas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Acciones Requeridas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border bg-amber-50 border-amber-200 p-3">
            <div>
              <div className="text-sm font-medium text-amber-900">Comisiones pendientes</div>
              <div className="text-xs text-amber-700">Lo que debés pagar a profesionales</div>
            </div>
            <div className="text-lg font-bold text-amber-900">
              {ars(data?.acciones.comisiones_pendientes || 0)}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-blue-50 border-blue-200 p-3">
            <div>
              <div className="text-sm font-medium text-blue-900">Gastos pendientes</div>
              <div className="text-xs text-blue-700">Pagos del período aún no marcados</div>
            </div>
            <div className="text-lg font-bold text-blue-900">
              {ars(data?.acciones.gastos_pendientes || 0)}
            </div>
          </div>

          {(data?.acciones.gastos_vencidos_count || 0) > 0 && (
            <div className="flex items-center justify-between rounded-lg border bg-red-50 border-red-200 p-3">
              <div>
                <div className="text-sm font-medium text-red-900">Gastos vencidos</div>
                <div className="text-xs text-red-700">
                  Pendientes con fecha de vencimiento pasada
                </div>
              </div>
              <div className="text-lg font-bold text-red-900">
                {data?.acciones.gastos_vencidos_count}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button asChild variant="outline" size="sm">
              <a href="/dashboard/finanzas/comisiones">Ver comisiones</a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="/dashboard/finanzas/gastos">Ver gastos</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}