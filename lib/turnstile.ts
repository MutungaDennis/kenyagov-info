/**
 * Cloudflare Turnstile helpers.
 *
 * Temporarily DISABLED so contact / feedback / bug reports work without
 * the "Security check is initializing" failure mode.
 *
 * Re-enable by setting NEXT_PUBLIC_TURNSTILE_ENABLED=true and ensuring
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY + TURNSTILE_SECRET_KEY are set.
 */

import { headers } from "next/headers";

export function isTurnstileEnabled(): boolean {
  return process.env.NEXT_PUBLIC_TURNSTILE_ENABLED === "true";
}

/** Client-safe (NEXT_PUBLIC_ inlined at build). */
export function isTurnstileEnabledClient(): boolean {
  return process.env.NEXT_PUBLIC_TURNSTILE_ENABLED === "true";
}

/**
 * Server-side verify. Returns true when Turnstile is disabled.
 */
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  if (!isTurnstileEnabled()) {
    return true;
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error("CONFIG ERROR: TURNSTILE_SECRET_KEY is missing");
    return false;
  }

  const headersList = await headers();
  const remoteIp =
    headersList.get("cf-connecting-ip") ||
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "";

  const isDev = process.env.NODE_ENV === "development";
  const isTestKey = secretKey.includes(
    "000000000000000000000000000000000000000",
  );

  if (isDev || isTestKey) {
    return !!token && token.length > 8;
  }

  if (!token) return false;

  try {
    const payload = new URLSearchParams();
    payload.append("secret", secretKey);
    payload.append("response", token);
    if (remoteIp) payload.append("remoteip", remoteIp);

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload.toString(),
      },
    );

    const data = (await response.json()) as { success?: boolean };
    return data.success === true;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}
