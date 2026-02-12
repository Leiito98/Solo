import { PageHeader } from "@/components/dashboard/page-header";
import { ProfesionalesComisionesClient } from "@/components/dashboard/profesionales/comisiones/ProfesionalesComisionesClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ProfesionalesComisionesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Comisiones por servicio"
        description="Asigná un % distinto por profesional según el servicio que realice."
      />
      <ProfesionalesComisionesClient />
    </div>
  );
}
