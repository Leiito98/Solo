import { PageHeader } from "@/components/dashboard/page-header";
import { HorariosLocalConfig } from "@/components/dashboard/configuracion/horarios-local-config";

export default function HorariosSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Horario del local"
        description="Esto se muestra en la landing/footer. No afecta los horarios de los profesionales."
      />
      <HorariosLocalConfig />
    </div>
  );
}
