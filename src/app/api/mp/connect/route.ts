import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export const runtime = "nodejs";

function base64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function hmacSHA256(data: string, secret: string) {
  return base64url(crypto.createHmac("sha256", secret).update(data).digest());
}

/**
 * state firmado:
 * state = base64url(payloadJSON) + "." + base64url(hmac(payloadB64, secret))
 */
function signState(payload: object, secret: string) {
  const payloadB64 = base64url(JSON.stringify(payload));
  const sig = hmacSHA256(payloadB64, secret);
  return `${payloadB64}.${sig}`;
}

function getEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(new URL("/login", getEnv("NEXT_PUBLIC_SITE_URL") || "https://getsolo.site"));
    }

    // Buscar negocio del owner (como venís haciendo en otras rutas)
    const { data: negocio, error } = await supabase
      .from("negocios")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (error || !negocio?.id) {
      return NextResponse.redirect(
        new URL("/dashboard?mp_error=negocio_no_encontrado", getEnv("NEXT_PUBLIC_SITE_URL") || "https://getsolo.site")
      );
    }

    const clientId = getEnv("MP_OAUTH_CLIENT_ID");
    const redirectUri = getEnv("MP_OAUTH_REDIRECT_URI");
    const stateSecret = getEnv("MP_OAUTH_STATE_SECRET");

    // state con vencimiento corto (15 min)
    const payload = {
      negocioId: negocio.id,
      userId: user.id,
      exp: Date.now() + 15 * 60 * 1000,
      nonce: crypto.randomBytes(16).toString("hex"),
    };

    const state = signState(payload, stateSecret);

    // URL OAuth MP (AR)
    const url = new URL("https://auth.mercadopago.com.ar/authorization");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("platform_id", "mp");
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("state", state);

    return NextResponse.redirect(url.toString());
  } catch (e: any) {
    const msg = encodeURIComponent(e?.message || "mp_connect_error");
    return NextResponse.redirect(
      new URL(`/dashboard/configuraciones/integraciones/mercadopago?error=${msg}`, process.env.NEXT_PUBLIC_SITE_URL || "https://getsolo.site")
    );
  }
}
