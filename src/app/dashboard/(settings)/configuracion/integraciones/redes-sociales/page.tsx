// src/app/dashboard/configuraciones/integraciones/redes-sociales/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RedesSocialesClient from "@/components/dashboard/integraciones/redes-sociales-client";

export const runtime = "nodejs";

export default async function RedesSocialesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Traer el negocio del owner (ajustá si tenés múltiples negocios por user)
  const { data: negocio, error } = await supabase
    .from("negocios")
    .select("id, nombre, facebook, instagram")
    .eq("owner_id", user.id)
    .single();

  if (error || !negocio) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Redes Sociales</h1>
        <p className="text-sm text-gray-500">
          Agregá tus enlaces para que se vean en tu landing pública.
        </p>
      </div>

      <RedesSocialesClient
        negocioId={negocio.id}
        negocioNombre={negocio.nombre}
        initialFacebook={negocio.facebook ?? ""}
        initialInstagram={negocio.instagram ?? ""}
      />
    </div>
  );
}
