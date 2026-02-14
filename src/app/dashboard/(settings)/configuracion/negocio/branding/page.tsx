import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BrandingClient from "./BrandingClient";

export const dynamic = "force-dynamic";

export default async function BrandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Traemos el negocio del owner (ajustá si tu esquema es distinto)
  const { data: negocio, error } = await supabase
    .from("negocios")
    .select("id, nombre, logo_url, banner_url, color_primario, color_secundario")
    .eq("owner_id", user.id)
    .single();

  if (error || !negocio) {
    return (
      <div className="space-y-6">
        <PageHeader title="Branding y Logo" description="Personalizá la identidad visual de tu negocio" />
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              No se pudo cargar el negocio. {error?.message || ""}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Branding y Logo" description="Personalizá la identidad visual de tu negocio" />

      <BrandingClient
        negocioId={negocio.id}
        negocioNombre={negocio.nombre}
        initialLogoUrl={negocio.logo_url}
        initialBannerUrl={negocio.banner_url}
        initialPrimary={negocio.color_primario || "#3b82f6"}
        initialSecondary={negocio.color_secundario || "#8b5cf6"}
      />
    </div>
  );
}
