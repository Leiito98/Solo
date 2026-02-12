import { PageHeader } from "@/components/dashboard/page-header";

export default function NotificacionesSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificaciones"
        description="Confirmaciones, recordatorios, cancelaciones y mensajes automáticos."
      />
      <div className="text-sm text-gray-600">
        (Pendiente) Emails + WhatsApp + plantillas.
      </div>
    </div>
  );
}
