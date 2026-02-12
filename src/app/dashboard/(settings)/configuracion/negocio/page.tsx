import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Store,
  Image as ImageIcon,
  Users,
  Briefcase,
  CreditCard,
  Clock,
  Bell,
  Shield,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

export default async function ConfiguracionHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: negocio } = await supabase
    .from("negocios")
    .select("id, nombre, slug, mp_access_token")
    .eq("owner_id", user.id)
    .single();

  if (!negocio) redirect("/register");

  const hasMp = !!negocio.mp_access_token;
  const publicUrl = `https://${negocio.slug}.getsolo.site`;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Configuración"
        description="Ajustá el negocio, integraciones, horarios y reglas de reservas."
      />

      {/* Resumen rápido */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Store className="w-4 h-4 text-gray-500" />
              Negocio
            </CardTitle>
            <CardDescription>Tu identidad pública</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Nombre:</span> {negocio.nombre}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">URL:</span>{" "}
              <a className="underline" href={publicUrl} target="_blank" rel="noreferrer">
                {negocio.slug}.getsolo.site
              </a>
            </p>
            <Button asChild variant="outline" size="sm" className="gap-2 mt-2">
              <a href={publicUrl} target="_blank" rel="noreferrer">
                Ver mi página <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-500" />
              MercadoPago
            </CardTitle>
            <CardDescription>Pagos online para señas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className={`text-sm ${hasMp ? "text-green-700" : "text-amber-700"}`}>
              {hasMp ? "✅ Conectado" : "⚠️ No configurado"}
            </p>
            <Button asChild size="sm" className="gap-2">
              <Link href="/dashboard/configuracion/mercadopago">
                {hasMp ? "Administrar" : "Configurar"} <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              Horario del local
            </CardTitle>
            <CardDescription>Se muestra en el footer y en la landing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-600">
              Configurá el horario general (distinto a los horarios de cada profesional).
            </p>
            <Button asChild size="sm" variant="outline" className="gap-2">
              <Link href="/dashboard/configuracion/horarios">
                Configurar <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Perfil del negocio (lo principal) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-gray-500" />
            Perfil del negocio
          </CardTitle>
          <CardDescription>
            Esto impacta en la landing pública: logo, imágenes, presentación y contenido visible.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          {/* Branding */}
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gray-500" />
                Logo + portada
              </CardTitle>
              <CardDescription>
                Logo para el header y una imagen destacada (hero/portada).
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <p className="text-sm text-gray-600">
                Recomendado para que la página se vea profesional.
              </p>
              <Button asChild size="sm" className="gap-2">
                <Link href="/dashboard/configuracion/negocio">
                  Configurar <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Fotos servicios */}
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-500" />
                Fotos de servicios
              </CardTitle>
              <CardDescription>
                Imagen por servicio (Corte, Barba, etc). Aparece en el catálogo.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <p className="text-sm text-gray-600">
                Mejora conversión: el cliente entiende rápido qué reservar.
              </p>
              <Button asChild size="sm" variant="outline" className="gap-2">
                <Link href="/dashboard/servicios">
                  Ir a Servicios <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Fotos profesionales */}
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                Fotos de profesionales
              </CardTitle>
              <CardDescription>
                Foto de perfil y especialidad (se muestra en la landing y en reservas).
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <p className="text-sm text-gray-600">
                Aumenta confianza del cliente y hace la experiencia más “humana”.
              </p>
              <Button asChild size="sm" variant="outline" className="gap-2">
                <Link href="/dashboard/profesionales">
                  Ir a Profesionales <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Extras recomendados */}
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-500" />
                Reglas y políticas
              </CardTitle>
              <CardDescription>
                Cancelación, tolerancia, seña, confirmación, no-show, etc.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <p className="text-sm text-gray-600">
                Reduce problemas: el cliente ve reglas claras antes de reservar.
              </p>
              <Button asChild size="sm" variant="outline" className="gap-2">
                <Link href="/dashboard/configuracion/politicas">
                  Configurar <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Otros módulos de configuración */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-500" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Emails/WhatsApp: confirmación, recordatorios, cancelación, etc.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-600">Se agregará en breve.</p>
            <Button asChild size="sm" variant="outline" className="gap-2">
              <Link href="/dashboard/configuracion/notificaciones">
                Configurar <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-500" />
              Integraciones
            </CardTitle>
            <CardDescription>Pagos y herramientas externas</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              MercadoPago hoy, después podés sumar otras integraciones.
            </p>
            <Button asChild size="sm" className="gap-2">
              <Link href="/dashboard/configuracion/mercadopago">
                MercadoPago <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
