import { PageHeader } from "@/components/dashboard/page-header";
import ComisionesPageClient from "@/components/finanzas/ComisionesPageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ComisionesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Comisiones"
        description="Controlá lo pendiente y marcá pagos a profesionales."
      />
      <ComisionesPageClient />
    </div>
  );
}
