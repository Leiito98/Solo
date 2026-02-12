import { PageHeader } from "@/components/dashboard/page-header";

export default function PoliticasSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Políticas"
        description="Reglas de cancelación, tolerancia, seña y no-show."
      />
      <div className="text-sm text-gray-600">
        (Pendiente) Configurar: cancelación hasta X horas antes, tolerancia X min, etc.
      </div>
    </div>
  );
}
