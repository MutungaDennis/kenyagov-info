import "server-only";
import { headers } from "next/headers";
import { isTurnstileEnabled, isTurnstileTestKey } from "@/lib/turnstile-config";
export { isTurnstileEnabled } from "@/lib/turnstile-config";

/** Public forms verify here; Supabase verifies authentication CAPTCHA tokens. */
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  if (!isTurnstileEnabled()) return true;
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret || (process.env.NODE_ENV === "production" && isTurnstileTestKey(secret))) {
    console.error("Turnstile requires a production secret key.");
    return false;
  }
  if (typeof token !== "string" || !token.trim() || token.length > 2048) return false;
  try {
    const requestHeaders = await headers();
    const payload = new URLSearchParams({ secret, response: token });
    const remoteIp = requestHeaders.get("cf-connecting-ip");
    if (remoteIp) payload.set("remoteip", remoteIp);
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return false;
    const result = await response.json() as { success?: boolean; hostname?: string; action?: string };
    if (result.success !== true || result.action !== "turnstile-spin-v2") return false;
    if (process.env.NODE_ENV === "production") {
      const hosts = (process.env.TURNSTILE_ALLOWED_HOSTNAMES || "citizenguide.ke,www.citizenguide.ke")
        .split(",").map(host => host.trim().toLowerCase()).filter(Boolean);
      if (!result.hostname || !hosts.includes(result.hostname.toLowerCase())) return false;
    }
    return true;
  } catch {
    console.error("Turnstile verification unavailable.");
    return false;
  }
}
