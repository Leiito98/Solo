import { PageHeader } from "@/components/dashboard/page-header";
import { ProfesionalesFotosClient } from "@/components/dashboard/profesionales/fotos/ProfesionalesFotosClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ProfesionalesFotosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Fotos de perfil"
        description="Subí o actualizá la foto de cada profesional para que aparezca en el sistema."
      />
      <ProfesionalesFotosClient />
    </div>
  );
}