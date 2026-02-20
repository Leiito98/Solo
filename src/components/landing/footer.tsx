import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Heart,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type HorarioRow = {
  dia_semana: number; // 0=Dom ... 6=Sab
  cerrado: boolean;
  hora_inicio: string | null; // "10:00:00"
  hora_fin: string | null; // "20:30:00"
};

interface FooterProps {
  negocio: {
    id: string; // ✅ necesario para leer negocio_horarios
    nombre: string;
    direccion?: string | null;
    telefono?: string | null;
    email?: string | null;
  };
}

const DAY_LABEL: Record<number, string> = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

function hhmm(v: string | null) {
  if (!v) return "";
  return String(v).slice(0, 5); // "HH:MM"
}

function sameHours(a: HorarioRow, b: HorarioRow) {
  return (
    a.cerrado === b.cerrado &&
    hhmm(a.hora_inicio) === hhmm(b.hora_inicio) &&
    hhmm(a.hora_fin) === hhmm(b.hora_fin)
  );
}

function displayHours(r: HorarioRow) {
  if (r.cerrado) return { text: "Cerrado", isClosed: true };
  const hi = hhmm(r.hora_inicio);
  const hf = hhmm(r.hora_fin);
  return { text: `${hi} - ${hf}`, isClosed: false };
}

export async function Footer({ negocio }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("negocio_horarios")
    .select("dia_semana,cerrado,hora_inicio,hora_fin")
    .eq("negocio_id", negocio.id)
    .order("dia_semana", { ascending: true });

  // fallback seguro (si hay error o no hay datos)
  const full: HorarioRow[] = Array.from({ length: 7 }, (_, d) => {
    const found = (rows || []).find((x) => x.dia_semana === d);
    return (
      found || {
        dia_semana: d,
        cerrado: true,
        hora_inicio: null,
        hora_fin: null,
      }
    );
  });

  // ¿Podemos agrupar Lun–Vie?
  const monFri = [1, 2, 3, 4, 5].map((d) => full[d]);
  const canGroupMonFri =
    monFri.length === 5 && monFri.every((r) => sameHours(r, monFri[0]));

  const sab = full[6];
  const dom = full[0];

  // Si Lun–Vie no son iguales, mostramos los 7 días
  const showAllDays = !canGroupMonFri;

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Columna 1: Info del negocio */}
          <div className="space-y-6 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {negocio.nombre}
              </h3>
            </div>

            <p className="text-gray-400 leading-relaxed max-w-md">
              Reserva tu turno online de forma rápida y sencilla. Atención
              profesional garantizada con los mejores especialistas.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-4">
              <a
                href="#"
                className="group w-11 h-11 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all hover:scale-110 border border-white/10"
              >
                <Instagram className="w-5 h-5 text-gray-400 group-hover:text-pink-400 transition-colors" />
              </a>
              <a
                href="#"
                className="group w-11 h-11 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all hover:scale-110 border border-white/10"
              >
                <Facebook className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
              </a>
            </div>

            {/* Si querés ver errores en dev */}
            {process.env.NODE_ENV !== "production" && error ? (
              <p className="text-xs text-red-300">
                ⚠️ Error horarios: {error.message}
              </p>
            ) : null}
          </div>

          {/* Columna 2: Contacto */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
              Contacto
            </h4>
            <div className="space-y-4">
              {negocio.direccion && (
                <a
                  href="#"
                  className="group flex items-start gap-3 text-gray-400 hover:text-white transition-all"
                >
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-0.5">
                      Dirección
                    </p>
                    <p className="text-sm leading-relaxed">{negocio.direccion}</p>
                  </div>
                </a>
              )}

              {negocio.telefono && (
                <a
                  href={`tel:${negocio.telefono}`}
                  className="group flex items-start gap-3 text-gray-400 hover:text-white transition-all"
                >
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/20 transition-colors">
                    <Phone className="w-5 h-5 group-hover:text-green-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-0.5">
                      Teléfono
                    </p>
                    <p className="text-sm">{negocio.telefono}</p>
                  </div>
                </a>
              )}

              {negocio.email && (
                <a
                  href={`mailto:${negocio.email}`}
                  className="group flex items-start gap-3 text-gray-400 hover:text-white transition-all"
                >
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                    <Mail className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-0.5">
                      Email
                    </p>
                    <p className="text-sm">{negocio.email}</p>
                  </div>
                </a>
              )}
            </div>
          </div>

          {/* Columna 3: Horarios (DINÁMICOS) */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
              Horarios
            </h4>

            <div className="space-y-3">
              {showAllDays ? (
                full.map((r) => {
                  const d = displayHours(r);
                  return (
                    <div
                      key={r.dia_semana}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <span className="text-sm font-semibold text-gray-400">
                        {DAY_LABEL[r.dia_semana]}:
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          d.isClosed ? "text-red-400" : "text-white"
                        }`}
                      >
                        {d.text}
                      </span>
                    </div>
                  );
                })
              ) : (
                <>
                  {/* Lun-Vie */}
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-sm font-semibold text-gray-400">
                      Lun - Vie:
                    </span>
                    <span className="text-sm font-bold text-white">
                      {displayHours(monFri[0]).text}
                    </span>
                  </div>

                  {/* Sábado */}
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-sm font-semibold text-gray-400">
                      Sábado:
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        displayHours(sab).isClosed ? "text-red-400" : "text-white"
                      }`}
                    >
                      {displayHours(sab).text}
                    </span>
                  </div>

                  {/* Domingo */}
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-sm font-semibold text-gray-400">
                      Domingo:
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        displayHours(dom).isClosed ? "text-red-400" : "text-white"
                      }`}
                    >
                      {displayHours(dom).text}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Quick CTA */}
            <div className="pt-4">
              <Link
                href="/reservar"
                className="block text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Reservar Ahora
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8" />

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400 text-center md:text-left">
            © {currentYear} {negocio.nombre}. Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Powered by</span>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                GetSolo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Hecho en Argentina</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
