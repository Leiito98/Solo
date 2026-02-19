import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent } from "@/components/ui/card"
import EmailNotificacionesClient from "./EmailNotificacionesClient"

export const dynamic = "force-dynamic"

export default async function EmailNotificacionesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: negocio } = await supabase
    .from("negocios")
    .select(
      "id, email, notif_email_cliente_confirm, notif_email_owner_new_booking, notif_email_reply_to"
    )
    .eq("owner_id", user.id)
    .single()

  if (!negocio) redirect("/register")

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificaciones por Email"
        description="Elegí qué mails se envían automáticamente cuando entran reservas."
      />

      <EmailNotificacionesClient
        negocioId={negocio.id}
        ownerEmailDestino={negocio.email || null}
        initialClienteConfirm={Boolean(negocio.notif_email_cliente_confirm ?? true)}
        initialOwnerNewBooking={Boolean(negocio.notif_email_owner_new_booking ?? true)}
        initialReplyTo={(negocio.notif_email_reply_to as string | null) ?? null}
      />

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            Tip: el “Email del negocio” se usa como destino de avisos de reserva. Si está vacío,
            no se puede notificar por email aunque el toggle esté activado.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
