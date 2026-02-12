import { PageHeader } from "@/components/dashboard/page-header";
import GastosPageClient from "@/components/finanzas/GastosPageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function GastosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Gastos"
        description="Controlá gastos fijos, vencimientos y marcá pagos."
      />
      <GastosPageClient />
    </div>
  );
}
