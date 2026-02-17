import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ProLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Si es owner, mandalo al dashboard normal
  const { data: negocioOwner } = await supabase
    .from("negocios")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (negocioOwner) redirect("/dashboard");

  // Si es profesional, ok
  const { data: prof } = await supabase
    .from("profesionales")
    .select("id, nombre, negocio_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!prof) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      <Toaster />
    </div>
  );
}
