// src/app/negocio/[slug]/page.tsx
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function NegocioPage({ params }: PageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data: negocio, error: nErr } = await supabase
    .from("negocios")
    .select(
      "id,nombre,slug,vertical,logo_url,color_primario,color_secundario,direccion,telefono,email"
    )
    .eq("slug", slug)
    .single();

  if (nErr || !negocio) {
    return <div className="p-10">Negocio no encontrado</div>;
  }

  const { data: servicios, error: sErr } = await supabase
    .from("servicios")
    .select("id,nombre,descripcion,duracion_min,precio")
    .eq("negocio_id", negocio.id)
    .order("nombre");

  if (sErr) {
    return (
      <main className="p-10">
        <h1 className="text-3xl font-bold">{negocio.nombre}</h1>
        <p className="mt-4">Error cargando servicios.</p>
      </main>
    );
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">{negocio.nombre}</h1>
      <p className="mt-2 text-muted-foreground">Vertical: {negocio.vertical}</p>

      <h2 className="mt-8 text-xl font-semibold">Servicios</h2>
      <div className="mt-3 space-y-3">
        {(servicios ?? []).map((s) => (
          <div key={s.id} className="rounded-xl border p-4">
            <div className="font-medium">{s.nombre}</div>
            {s.descripcion && (
              <div className="text-sm text-muted-foreground">{s.descripcion}</div>
            )}
            <div className="text-sm mt-2">
              {s.duracion_min} min · ${Number(s.precio).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
