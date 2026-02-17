import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function base64urlToString(b64url: string) {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  return Buffer.from(b64 + pad, "base64").toString("utf8");
}

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

function verifyAndParseState(state: string, secret: string) {
  const parts = String(state || "").split(".");
  if (parts.length !== 2) throw new Error("Invalid state format");

  const [payloadB64, sig] = parts;
  const expected = hmacSHA256(payloadB64, secret);

  // timing safe
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error("Invalid state signature");
  }

  const payloadJson = base64urlToString(payloadB64);
  const payload = JSON.parse(payloadJson) as {
    negocioId: string;
    userId: string;
    exp: number;
    nonce?: string;
  };

  if (!payload?.negocioId || !payload?.userId || !payload?.exp) {
    throw new Error("Invalid state payload");
  }

  if (Date.now() > payload.exp) throw new Error("State expired");

  return payload;
}

function getEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

async function exchangeCodeForToken(params: {
  code: string;
  redirectUri: string;
  clientId: string;
  clientSecret: string;
}) {
  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("client_id", params.clientId);
  body.set("client_secret", params.clientSecret);
  body.set("code", params.code);
  body.set("redirect_uri", params.redirectUri);

  const res = await fetch("https://api.mercadopago.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const detail = json?.message || json?.error || "mp_token_exchange_failed";
    throw new Error(detail);
  }

  return json as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
    user_id?: number;
    public_key?: string;
    live_mode?: boolean;
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";
  const err = url.searchParams.get("error");
  const errDesc = url.searchParams.get("error_description");

  const baseSite = process.env.NEXT_PUBLIC_SITE_URL || "https://getsolo.site";
  const redirectBase = new URL("/dashboard/configuracion/integraciones/mercadopago", baseSite);

  try {
    if (err) {
      redirectBase.searchParams.set("error", err);
      if (errDesc) redirectBase.searchParams.set("error_description", errDesc);
      return NextResponse.redirect(redirectBase);
    }

    if (!code || !state) {
      redirectBase.searchParams.set("error", "missing_code_or_state");
      return NextResponse.redirect(redirectBase);
    }

    const stateSecret = getEnv("MP_OAUTH_STATE_SECRET");
    const payload = verifyAndParseState(state, stateSecret);

    const clientId = getEnv("MP_OAUTH_CLIENT_ID");
    const clientSecret = getEnv("MP_OAUTH_CLIENT_SECRET");
    const redirectUri = getEnv("MP_OAUTH_REDIRECT_URI");

    const token = await exchangeCodeForToken({
      code,
      redirectUri,
      clientId,
      clientSecret,
    });

    if (!token.access_token) throw new Error("Missing access_token");

    const admin = createAdminClient();

    // 1) Guardar tokens en tabla segura
    const { error: upsertErr } = await admin
      .from("negocio_mp_tokens")
      .upsert(
        {
          negocio_id: payload.negocioId,
          mp_access_token: token.access_token,
          mp_refresh_token: token.refresh_token || null,
          mp_connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "negocio_id" }
      );

    if (upsertErr) throw new Error(upsertErr.message);

    // 2) Marcar conectado en negocios (para UI)
    const { error: negocioErr } = await admin
      .from("negocios")
      .update({ mp_connected_at: new Date().toISOString() })
      .eq("id", payload.negocioId);

    if (negocioErr) throw new Error(negocioErr.message);

    redirectBase.searchParams.set("connected", "1");
    return NextResponse.redirect(redirectBase);
  } catch (e: any) {
    redirectBase.searchParams.set("error", encodeURIComponent(e?.message || "mp_callback_error"));
    return NextResponse.redirect(redirectBase);
  }
}
