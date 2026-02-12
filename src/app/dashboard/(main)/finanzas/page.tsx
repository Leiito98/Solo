import { PageHeader } from "@/components/dashboard/page-header";
import FinanzasDashboardClient from "@/components/finanzas/FinanzasDashboardClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function FinanzasPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Finanzas"
        description="Resumen de ingresos, egresos y acciones pendientes."
      />
      <FinanzasDashboardClient />
    </div>
  );
}
