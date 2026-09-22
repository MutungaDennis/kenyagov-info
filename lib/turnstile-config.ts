/** Production protection cannot be disabled by a flag. */
export function isTurnstileEnabled(hostname?: string): boolean {
  const runtimeEnv = process.env;
  if (process.env.NODE_ENV !== "production" && hostname && ["localhost", "127.0.0.1", "[::1]", "::1"].includes(hostname.toLowerCase())) return false;
  return process.env.NODE_ENV === "production" || runtimeEnv.NEXT_PUBLIC_TURNSTILE_ENABLED !== "false";
}

export function isTurnstileTestKey(key: string): boolean {
  return /^[123]x0{10}/.test(key);
}

export function getTurnstilePublicConfig(hostname?: string) {
  // Indirect lookup avoids Next.js inlining a local development key in the
  // server endpoint. This value must come from the deployed Worker runtime.
  const runtimeEnv = process.env;
  const siteKey = runtimeEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "";
  return {
    enabled: isTurnstileEnabled(hostname),
    siteKey: process.env.NODE_ENV === "production" && isTurnstileTestKey(siteKey) ? "" : siteKey,
  };
}
