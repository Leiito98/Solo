import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: prof } = await supabase
    .from("profesionales")
    .select("id, nombre")
    .eq("auth_user_id", user.id)
    .single();

  if (!prof) redirect("/login");

  // RLS hace el filtro solo
  const { data: turnos } = await supabase
    .from("turnos")
    .select("id, fecha, hora_inicio, hora_fin, estado, pago_estado, pago_monto")
    .order("fecha", { ascending: true })
    .limit(10);

  const { data: comisiones } = await supabase
    .from("comisiones")
    .select("monto_comision, estado")
    .limit(200);

  const total = (comisiones || []).reduce((acc, c: any) => acc + Number(c.monto_comision || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hola, {prof.nombre}</h1>
        <p className="text-sm text-gray-500">Este es tu panel personal.</p>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <div className="text-sm text-gray-500">Ganancias (comisiones)</div>
        <div className="text-2xl font-bold">${Math.round(total).toLocaleString("es-AR")}</div>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="p-4 border-b font-semibold">Próximos turnos</div>
        <div className="p-4 space-y-2">
          {(turnos || []).length === 0 ? (
            <div className="text-sm text-gray-500">No tenés turnos próximos.</div>
          ) : (
            (turnos || []).map((t: any) => (
              <div key={t.id} className="flex justify-between text-sm">
                <span>{t.fecha} {String(t.hora_inicio).slice(0,5)} - {String(t.hora_fin).slice(0,5)}</span>
                <span className="text-gray-500">{t.estado}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
