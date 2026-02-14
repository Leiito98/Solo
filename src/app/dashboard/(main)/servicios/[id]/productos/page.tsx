//app/dashboard/servicios/[id]/productos/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft } from "lucide-react";

import { ServicioProductosConfig } from "@/components/dashboard/servicios/servicio-productos-config";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

type Producto = {
  id: string;
  nombre: string;
  unidad: string;
  cantidad: number;
  precio_unitario: number;
  contenido_por_unidad: number | null;
};

type ProductoAsociado = {
  id: string;
  producto_id: string;
  cantidad_por_uso: number;
  productos: Producto; // ✅ NO null
};


export default async function ServicioProductosPage({ params }: PageProps) {
  const { id: servicioId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: negocio } = await supabase
    .from("negocios")
    .select("id, nombre, slug")
    .eq("owner_id", user.id)
    .single();

  if (!negocio) redirect("/dashboard");

  const { data: servicio } = await supabase
    .from("servicios")
    .select("id, nombre")
    .eq("id", servicioId)
    .eq("negocio_id", negocio.id)
    .single();

  if (!servicio) redirect("/dashboard/servicios");

  const { data: productosRaw } = await supabase
    .from("productos")
    .select("id, nombre, unidad, cantidad, precio_unitario, contenido_por_unidad")
    .eq("negocio_id", negocio.id)
    .order("nombre");

  // ✅ NORMALIZAR para que SIEMPRE llegue contenido_por_unidad
  const productos: Producto[] = (productosRaw || []).map((p: any) => ({
    id: p.id,
    nombre: p.nombre,
    unidad: p.unidad,
    cantidad: Number(p.cantidad ?? 0),
    precio_unitario: Number(p.precio_unitario ?? 0),
    contenido_por_unidad:
      p.contenido_por_unidad === null || p.contenido_por_unidad === undefined
        ? null
        : Number(p.contenido_por_unidad),
  }));

  const { data: asociados } = await supabase
    .from("servicio_productos")
    .select(`
      id,
      producto_id,
      cantidad_por_uso,
      productos:productos (
        id,
        nombre,
        unidad,
        cantidad,
        precio_unitario,
        contenido_por_unidad
      )
    `)
    .eq("negocio_id", negocio.id)
    .eq("servicio_id", servicioId);

  const productosAsociados: ProductoAsociado[] = (asociados || [])
  .map((x: any) => {
    const p = Array.isArray(x.productos) ? x.productos[0] : x.productos;
    if (!p) return null; // ✅ si no vino el join, lo descartamos

    return {
      id: x.id,
      producto_id: x.producto_id,
      cantidad_por_uso: Number(x.cantidad_por_uso) || 0,
      productos: {
        id: p.id,
        nombre: p.nombre,
        unidad: p.unidad,
        cantidad: Number(p.cantidad ?? 0),
        precio_unitario: Number(p.precio_unitario ?? 0),
        contenido_por_unidad:
          p.contenido_por_unidad === null || p.contenido_por_unidad === undefined
            ? null
            : Number(p.contenido_por_unidad),
      },
    } as ProductoAsociado;
  })
  .filter(Boolean) as ProductoAsociado[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6" />
          <div>
            <h1 className="text-xl font-semibold">Productos del servicio</h1>
            <p className="text-sm text-gray-500">{servicio.nombre}</p>
          </div>
        </div>

        <Button asChild variant="outline">
          <Link href="/dashboard/servicios">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Link>
        </Button>
      </div>

      <ServicioProductosConfig
        servicioId={servicioId}
        negocioId={negocio.id}
        productos={productos}
        productosAsociados={productosAsociados}
      />
    </div>
  );
}
