import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type DayRow = {
  dia_semana: number; // 0-6
  cerrado: boolean;
  hora_inicio: string | null; // "09:00" o "09:00:00"
  hora_fin: string | null;    // "20:00" o "20:00:00"
};

function normalizeTime(t: string | null) {
  if (!t) return null;
  const s = String(t).trim();
  if (!s) return null;
  if (/^\d{2}:\d{2}$/.test(s)) return `${s}:00`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s;
  return null;
}

export async function GET() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ Verifico ownership con el client normal (respeta RLS)
  const { data: negocio, error: negErr } = await supabase
    .from("negocios")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (negErr || !negocio) {
    return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
  }

  // ✅ Leo horarios con ADMIN para evitar que un SELECT bloqueado te devuelva []
  const { data: rows, error: rowsErr } = await admin
    .from("negocio_horarios")
    .select("dia_semana,cerrado,hora_inicio,hora_fin")
    .eq("negocio_id", negocio.id)
    .order("dia_semana", { ascending: true });

  if (rowsErr) {
    return NextResponse.json(
      { error: "Error leyendo horarios", details: rowsErr.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ negocio_id: negocio.id, horarios: rows || [] });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: negocio, error: negErr } = await supabase
    .from("negocios")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (negErr || !negocio) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as { horarios?: DayRow[]; seed_default?: boolean };

  // Seed default
  if (body.seed_default) {
    const defaults: DayRow[] = [
      { dia_semana: 0, cerrado: true,  hora_inicio: null,    hora_fin: null },
      { dia_semana: 1, cerrado: false, hora_inicio: "09:00", hora_fin: "20:00" },
      { dia_semana: 2, cerrado: false, hora_inicio: "09:00", hora_fin: "20:00" },
      { dia_semana: 3, cerrado: false, hora_inicio: "09:00", hora_fin: "20:00" },
      { dia_semana: 4, cerrado: false, hora_inicio: "09:00", hora_fin: "20:00" },
      { dia_semana: 5, cerrado: false, hora_inicio: "09:00", hora_fin: "20:00" },
      { dia_semana: 6, cerrado: false, hora_inicio: "09:00", hora_fin: "18:00" },
    ];

    const payload = defaults.map((d) => ({
      negocio_id: negocio.id,
      dia_semana: d.dia_semana,
      cerrado: d.cerrado,
      hora_inicio: normalizeTime(d.hora_inicio),
      hora_fin: normalizeTime(d.hora_fin),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await admin.from("negocio_horarios").upsert(payload, {
      onConflict: "negocio_id,dia_semana",
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  const horarios = Array.isArray(body.horarios) ? body.horarios : null;
  if (!horarios) return NextResponse.json({ error: "Missing horarios" }, { status: 400 });

  for (const h of horarios) {
    if (!Number.isInteger(h.dia_semana) || h.dia_semana < 0 || h.dia_semana > 6) {
      return NextResponse.json({ error: "dia_semana inválido" }, { status: 400 });
    }
    if (h.cerrado) continue;

    const hi = normalizeTime(h.hora_inicio);
    const hf = normalizeTime(h.hora_fin);
    if (!hi || !hf) return NextResponse.json({ error: "Horas inválidas" }, { status: 400 });
    if (hf <= hi) return NextResponse.json({ error: "hora_fin debe ser mayor a hora_inicio" }, { status: 400 });
  }

  const payload = horarios.map((d) => ({
    negocio_id: negocio.id,
    dia_semana: d.dia_semana,
    cerrado: !!d.cerrado,
    hora_inicio: d.cerrado ? null : normalizeTime(d.hora_inicio),
    hora_fin: d.cerrado ? null : normalizeTime(d.hora_fin),
    updated_at: new Date().toISOString(),
  }));

  const { error } = await admin.from("negocio_horarios").upsert(payload, {
    onConflict: "negocio_id,dia_semana",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
