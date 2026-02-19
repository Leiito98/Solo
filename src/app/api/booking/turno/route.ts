import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { randomUUID } from "crypto";
import crypto from "crypto";
import {
  sendConfirmacionReserva,
  sendNuevaReservaOwner,
} from "@/lib/email/send-confirmation";
import {
  sendConfirmacionClienteWA,
  sendNuevaReservaOwnerWA,
} from "@/lib/whatsapp/send-whatsapp";

export const runtime = "nodejs";

const APP_TZ = "America/Argentina/Buenos_Aires";
const MIN_BUFFER_MINUTES = 0; // poné 10 o 15 si querés “no reservar ya mismo”

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "getsolo.site";

function normalizeTime(t: string) {
  const s = String(t || "").trim();

  if (/^\d{2}:\d{2}$/.test(s)) return `${s}:00`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s;

  const m = s.match(/T(\d{2}:\d{2}:\d{2})/);
  if (m) return m[1];

  const parts = s.split(":");
  if (parts.length >= 3) return `${parts[0]}:${parts[1]}:${parts[2]}`;

  throw new Error(`Invalid time format: ${s}`);
}

function addMinutesToTime(timeHHMMSS: string, minutesToAdd: number) {
  const [hh, mm, ss] = timeHHMMSS.split(":").map(Number);
  const baseMinutes = hh * 60 + mm + Math.floor((ss || 0) / 60);
  const total = baseMinutes + minutesToAdd;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

function toHHMMSS(h: string) {
  if (/^\d{2}:\d{2}:\d{2}$/.test(h)) return h;
  if (/^\d{2}:\d{2}$/.test(h)) return `${h}:00`;
  return h;
}

function minutesSinceMidnight(hhmmss: string) {
  const [hh, mm, ss] = hhmmss.split(":").map(Number);
  return hh * 60 + mm + Math.floor((ss || 0) / 60);
}

function dayOfWeek0Sunday(fechaYYYYMMDD: string) {
  const d = new Date(`${fechaYYYYMMDD}T00:00:00`);
  return d.getDay();
}

function normalizeDni(dni: string) {
  return String(dni || "").replace(/\D/g, "").trim();
}

// ── TZ helpers ───────────────────────────────────────────────

function getNowPartsInTZ(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((p) => p.type === type)?.value || "00";

  return {
    y: get("year"),
    m: get("month"),
    d: get("day"),
    hh: get("hour"),
    mm: get("minute"),
  };
}

function isTodayInTZ(fechaYYYYMMDD: string, timeZone: string) {
  const n = getNowPartsInTZ(timeZone);
  const today = `${n.y}-${n.m}-${n.d}`;
  return fechaYYYYMMDD === today;
}

function minutesNowInTZ(timeZone: string) {
  const n = getNowPartsInTZ(timeZone);
  return Number(n.hh) * 60 + Number(n.mm);
}

function signWebhook(turno_id: string, negocio_id: string) {
  const secret = process.env.MP_WEBHOOK_SECRET || "";
  if (!secret) throw new Error("Missing MP_WEBHOOK_SECRET");
  const payload = `${turno_id}.${negocio_id}`;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

async function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

/**
 * ✅ URL del tenant:
 * - Prod: https://{slug}.{ROOT_DOMAIN}
 * - Dev:  http://localhost:3000 (y agregamos ?slug=)
 */
function tenantUrl(baseUrl: string, slug: string, path: string, params?: Record<string, string>) {
  const isLocal = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

  if (isLocal) {
    const url = new URL(`${baseUrl}${path}`);
    url.searchParams.set("slug", slug);
    for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, v);
    return url.toString();
  }

  const url = new URL(`https://${slug}.${ROOT_DOMAIN}${path}`);
  for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, v);
  return url.toString();
}

type Body = {
  negocio_id: string;
  servicio_id: string;
  profesional_id: string;
  fecha: string; // YYYY-MM-DD
  hora_inicio: string; // HH:mm o HH:mm:ss
  cliente: { dni: string; nombre: string; email: string; telefono: string };
  metodo_pago: "online" | "local";
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Body>;

    const negocio_id = String(body.negocio_id || "").trim();
    const servicio_id = String(body.servicio_id || "").trim();
    const profesional_id = String(body.profesional_id || "").trim();
    const fecha = String(body.fecha || "").trim();
    const hora_inicio_raw = String(body.hora_inicio || "").trim();
    const metodo_pago = body.metodo_pago as "online" | "local";
    const cliente = body.cliente as Body["cliente"] | undefined;

    if (!negocio_id || !servicio_id || !profesional_id || !fecha || !hora_inicio_raw) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    if (!cliente?.dni || !cliente?.nombre || !cliente?.email || !cliente?.telefono) {
      return NextResponse.json({ error: "Datos del cliente incompletos" }, { status: 400 });
    }

    if (!metodo_pago || !["online", "local"].includes(metodo_pago)) {
      return NextResponse.json({ error: "Método de pago inválido" }, { status: 400 });
    }

    const dni = normalizeDni(cliente.dni);
    if (!dni || dni.length < 7 || dni.length > 9) {
      return NextResponse.json({ error: "DNI inválido" }, { status: 400 });
    }

    const supabase = await createClient();
    const admin = createAdminClient();

    // 1) Negocio
    const { data: negocio, error: negocioErr } = await supabase
      .from("negocios")
      .select(
        "id, nombre, slug, mp_sena_pct, email, telefono, direccion, owner_id, color_primario, color_secundario, logo_url, mp_connected_at"
      )
      .eq("id", negocio_id)
      .single();

    if (negocioErr || !negocio) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }

    const negocioSlug = String((negocio as any).slug || "").trim();
    if (!negocioSlug) {
      // sin slug no podemos armar URLs tenant correctas
      return NextResponse.json({ error: "Este negocio no tiene slug configurado." }, { status: 422 });
    }

    // 2) Servicio
    const { data: servicio, error: servErr } = await supabase
      .from("servicios")
      .select("id, duracion_min, nombre, precio")
      .eq("id", servicio_id)
      .single();

    if (servErr || !servicio) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }

    const duracionMin = Number((servicio as any).duracion_min || 0);
    if (!Number.isFinite(duracionMin) || duracionMin <= 0) {
      return NextResponse.json({ error: "Duración inválida" }, { status: 400 });
    }

    // 3) Hora fin
    const hora_inicio = normalizeTime(hora_inicio_raw);
    const hora_fin = addMinutesToTime(hora_inicio, duracionMin);

    // 3.1) BLOQUEAR reservar en el pasado (si fecha es HOY en AR)
    if (isTodayInTZ(fecha, APP_TZ)) {
      const nowMin = minutesNowInTZ(APP_TZ) + MIN_BUFFER_MINUTES;
      const startMin = minutesSinceMidnight(toHHMMSS(hora_inicio));
      if (startMin < nowMin) {
        return NextResponse.json({ error: "No podés reservar en un horario pasado." }, { status: 400 });
      }
    }

    // 3.2) VALIDAR que el profesional TRABAJE ese día y que el turno entre en su horario
    const dow = dayOfWeek0Sunday(fecha);

    const { data: pro, error: proErr } = await supabase
      .from("profesionales")
      .select("id, activo, negocio_id")
      .eq("id", profesional_id)
      .eq("negocio_id", negocio_id)
      .maybeSingle();

    if (proErr || !pro || (pro as any).activo === false) {
      return NextResponse.json({ error: "Profesional no válido" }, { status: 400 });
    }

    const { data: horario, error: horErr } = await supabase
      .from("horarios_trabajo")
      .select("hora_inicio, hora_fin")
      .eq("profesional_id", profesional_id)
      .eq("dia_semana", dow)
      .eq("activo", true)
      .maybeSingle();

    if (horErr) {
      console.error("Error horario profesional:", horErr);
      return NextResponse.json({ error: "Error verificando horario" }, { status: 500 });
    }

    if (!horario) {
      return NextResponse.json({ error: "Ese profesional no trabaja ese día." }, { status: 400 });
    }

    const hStart = minutesSinceMidnight(toHHMMSS(String((horario as any).hora_inicio)));
    const hEnd = minutesSinceMidnight(toHHMMSS(String((horario as any).hora_fin)));
    const tStart = minutesSinceMidnight(toHHMMSS(hora_inicio));
    const tEnd = minutesSinceMidnight(toHHMMSS(hora_fin));

    if (!(hEnd > hStart) || tStart < hStart || tEnd > hEnd) {
      return NextResponse.json(
        { error: "Ese horario está fuera del horario laboral del profesional." },
        { status: 400 }
      );
    }

    // 4) Cliente (buscar/crear por DNI dentro del negocio) — ADMIN
    let clienteId: string;

    const { data: clienteExistente, error: clienteExistenteErr } = await admin
      .from("clientes")
      .select("id")
      .eq("negocio_id", negocio_id)
      .eq("dni", dni)
      .maybeSingle();

    if (clienteExistenteErr) {
      console.error("Error searching client:", clienteExistenteErr);
      return NextResponse.json({ error: "Error buscando cliente" }, { status: 500 });
    }

    if (clienteExistente?.id) {
      clienteId = clienteExistente.id;

      const { error: updErr } = await admin
        .from("clientes")
        .update({ dni, nombre: cliente.nombre, email: cliente.email, telefono: cliente.telefono })
        .eq("id", clienteId);

      if (updErr) console.error("Error updating client:", updErr);
    } else {
      const { data: nuevoCliente, error: clienteError } = await admin
        .from("clientes")
        .insert({
          negocio_id,
          dni,
          nombre: cliente.nombre,
          email: cliente.email,
          telefono: cliente.telefono,
          notas: "",
          historial: {},
        })
        .select("id")
        .single();

      if (clienteError || !nuevoCliente) {
        console.error("Error creating client:", clienteError);
        return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 });
      }

      clienteId = nuevoCliente.id;
    }

    // 5) Conflictos (solapamiento)
    const { data: turnosExistentes, error: conflictErr } = await supabase
      .from("turnos")
      .select("id")
      .eq("negocio_id", negocio_id)
      .eq("profesional_id", profesional_id)
      .eq("fecha", fecha)
      .in("estado", ["pendiente", "confirmado"])
      .lt("hora_inicio", hora_fin)
      .gt("hora_fin", hora_inicio);

    if (conflictErr) {
      console.error("Error checking conflicts:", conflictErr);
      return NextResponse.json({ error: "Error verificando disponibilidad" }, { status: 500 });
    }

    if (turnosExistentes && turnosExistentes.length > 0) {
      return NextResponse.json({ error: "El horario ya no está disponible" }, { status: 409 });
    }

    // 6) Montos
    const precioTotal = Number((servicio as any).precio || 0);
    const senaPct = Number((negocio as any).mp_sena_pct ?? 50) / 100;
    const sena = Math.round(precioTotal * senaPct);
    const resto = precioTotal - sena;

    // 7) Estado inicial
    const estadoTurno = "pendiente";
    const estadoPago = "pendiente";
    const montoInicial = 0;

    const cancel_token = randomUUID();

    // 8) Crear turno (ADMIN)
    const { data: turno, error: turnoError } = await admin
      .from("turnos")
      .insert({
        negocio_id,
        servicio_id,
        profesional_id,
        cliente_id: clienteId,
        fecha,
        hora_inicio,
        hora_fin,
        estado: estadoTurno,
        pago_estado: estadoPago,
        pago_monto: montoInicial,
        cancel_token,
      })
      .select("id, fecha, hora_inicio, hora_fin, cancel_token")
      .single();

    if (turnoError || !turno) {
      console.error("Error creating turno:", turnoError);
      return NextResponse.json({ error: "Error al crear turno" }, { status: 500 });
    }

    // 9) Profesional (para respuesta y notificaciones)
    const { data: profesional } = await supabase
      .from("profesionales")
      .select("nombre")
      .eq("id", profesional_id)
      .single();

    const baseUrl = await getBaseUrl();

    // ✅ CANCEL URL: tenant directo (prod subdominio / dev ?slug=)
    const cancel_url = tenantUrl(baseUrl, negocioSlug, "/cancelar", {
      token: String((turno as any).cancel_token),
      turno_id: String((turno as any).id),
    });

    // ── 10) Notificaciones (email + WhatsApp) ────────────────────────────────
    const ownerEmail = (negocio as any).email as string | null;
    const ownerTel = (negocio as any).telefono as string | null;
    const negocioDir = (negocio as any).direccion as string | null;
    const profesionalNombre = (profesional as any)?.nombre || "Tu profesional";
    const horaLabel = String((turno as any).hora_inicio).substring(0, 5);

    const { data: ownerAuthData } = await admin.auth.admin.getUserById((negocio as any).owner_id as string);
    const ownerNombre =
      ownerAuthData?.user?.user_metadata?.nombre || ownerAuthData?.user?.email?.split("@")[0] || "Propietario";

    if (!ownerEmail) {
      console.warn("[turnos] negocio.email está vacío -> no se enviará email al owner", {
        negocio_id,
        negocioSlug,
      });
    }

    const notificaciones: Promise<unknown>[] = [
      // Email al cliente
      sendConfirmacionReserva({
        clienteEmail: cliente.email,
        clienteNombre: cliente.nombre,
        negocioNombre: (negocio as any).nombre,
        servicioNombre: (servicio as any).nombre,
        profesionalNombre,
        fecha: (turno as any).fecha,
        hora: horaLabel,
        negocioDireccion: negocioDir,
        negocioTelefono: ownerTel,
        brandPrimary: (negocio as any).color_primario,
        brandSecondary: (negocio as any).color_secundario,
        brandLogoUrl: (negocio as any).logo_url,
        cancel_url,
      }),

      // WA al cliente
      ...(cliente.telefono
        ? [
            sendConfirmacionClienteWA({
              telefono: cliente.telefono,
              clienteNombre: cliente.nombre,
              negocioNombre: (negocio as any).nombre,
              servicioNombre: (servicio as any).nombre,
              profesionalNombre,
              fecha: (turno as any).fecha,
              hora: horaLabel,
              cancel_url,
            }),
          ]
        : []),

      // Email al owner (si existe)
      ...(ownerEmail
        ? [
            sendNuevaReservaOwner({
              ownerEmail,
              ownerNombre,
              clienteNombre: cliente.nombre,
              clienteEmail: cliente.email,
              clienteTelefono: cliente.telefono,
              servicioNombre: (servicio as any).nombre,
              profesionalNombre,
              fecha: (turno as any).fecha,
              hora: horaLabel,
              metodoPago: metodo_pago,
              negocioNombre: (negocio as any).nombre,
              brandPrimary: (negocio as any).color_primario,
              brandSecondary: (negocio as any).color_secundario,
              brandLogoUrl: (negocio as any).logo_url,
            }),
          ]
        : []),

      // WA al owner
      ...(ownerTel
        ? [
            sendNuevaReservaOwnerWA({
              telefono: ownerTel,
              ownerNombre,
              clienteNombre: cliente.nombre,
              clienteTelefono: cliente.telefono,
              servicioNombre: (servicio as any).nombre,
              profesionalNombre,
              fecha: (turno as any).fecha,
              hora: horaLabel,
            }),
          ]
        : []),
    ];

    Promise.allSettled(notificaciones).then((results) => {
      results.forEach((r, i) => {
        if (r.status === "rejected") console.error(`[Notificaciones] Error en notificación ${i}:`, r.reason);
      });
    });

    // 11) Pago online => crear preferencia MP (token SIEMPRE desde negocio_mp_tokens)
    let payment_url: string | null = null;

    if (metodo_pago === "online") {
      if (!(negocio as any).mp_connected_at) {
        return NextResponse.json(
          { error: "Este negocio aún no configuró MercadoPago. Contactá al negocio." },
          { status: 422 }
        );
      }

      const { data: tokenRow, error: tokenErr } = await admin
        .from("negocio_mp_tokens")
        .select("mp_access_token")
        .eq("negocio_id", negocio_id)
        .maybeSingle();

      if (tokenErr) {
        console.error("Error leyendo token MP:", tokenErr);
        return NextResponse.json({ error: "Error verificando MercadoPago" }, { status: 500 });
      }

      const accessToken = tokenRow?.mp_access_token || "";
      if (!accessToken) {
        return NextResponse.json(
          { error: "Este negocio aún no configuró MercadoPago. Contactá al negocio." },
          { status: 422 }
        );
      }

      try {
        const sig = signWebhook((turno as any).id, negocio_id);
        const notification_url = `${baseUrl}/api/webhooks/mercadopago?turno_id=${(turno as any).id}&negocio_id=${negocio_id}&sig=${sig}`;

        const mpClient = new MercadoPagoConfig({ accessToken });
        const preference = new Preference(mpClient);

        // ✅ back_urls al tenant directo
        const successUrl = tenantUrl(baseUrl, negocioSlug, "/reserva-exitosa", { turno_id: String((turno as any).id) });
        const failureUrl = tenantUrl(baseUrl, negocioSlug, "/reserva-fallida", { turno_id: String((turno as any).id) });
        const pendingUrl = tenantUrl(baseUrl, negocioSlug, "/reserva-pendiente", { turno_id: String((turno as any).id) });

        const pref = await preference.create({
          body: {
            items: [
              {
                id: servicio_id,
                title: `${(servicio as any).nombre} - ${(negocio as any).nombre}`,
                description: `Seña ${Math.round(senaPct * 100)}% - Turno: ${fecha} ${hora_inicio_raw}`,
                quantity: 1,
                unit_price: sena,
                currency_id: "ARS",
              },
            ],
            payer: {
              name: cliente.nombre,
              email: cliente.email,
              phone: { number: cliente.telefono },
            },
            back_urls: {
              success: successUrl,
              failure: failureUrl,
              pending: pendingUrl,
            },
            auto_return: "approved",
            notification_url,
            external_reference: String((turno as any).id),
            metadata: {
              turno_id: String((turno as any).id),
              negocio_id,
              cliente_id: clienteId,
              cancel_token: String((turno as any).cancel_token),
              dni,
            },
          },
        });

        payment_url = (pref as any).init_point || (pref as any).sandbox_init_point || null;

        if ((pref as any).id) {
          await admin.from("turnos").update({ mp_preference_id: String((pref as any).id) }).eq("id", (turno as any).id);
        }
      } catch (mpError) {
        console.error("Error creating MP preference:", mpError);
        return NextResponse.json({ error: "No se pudo generar el link de pago" }, { status: 500 });
      }
    }

    // 12) Respuesta
    return NextResponse.json({
      success: true,
      turno: {
        id: (turno as any).id,
        fecha: (turno as any).fecha,
        hora: String((turno as any).hora_inicio).substring(0, 5),
        servicio: (servicio as any).nombre,
        profesional: (profesional as any)?.nombre || "",
        precio: precioTotal,
        seña: sena,
        resto,
        cancel_url,
      },
      metodo_pago,
      payment_url,
    });
  } catch (error) {
    console.error("Error in POST /api/turnos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
