/**
 * Public admin URL prefix (obscurity layer — still use strong passwords + is_admin).
 *
 * Production default is a non-guessable path. Override with NEXT_PUBLIC_ADMIN_BASE_PATH
 * on Cloudflare if you rotate it. Local `next dev` keeps /admin for convenience
 * unless you set the env var.
 */

/** Baked-in production path (also set this on Cloudflare for consistency). */
export const DEFAULT_PRODUCTION_ADMIN_BASE = "/cg-ke-a5wkqciyjpg940u3";

const DEV_FALLBACK = "/admin";

function normalizeBase(raw: string): string {
  let p = raw.trim();
  if (!p.startsWith("/")) p = `/${p}`;
  p = p.replace(/\/+$/, "");
  if (!p || p === "/") {
    return isProd() ? DEFAULT_PRODUCTION_ADMIN_BASE : DEV_FALLBACK;
  }
  return p;
}

function isProd(): boolean {
  // OpenNext / Cloudflare production builds set NODE_ENV=production
  return process.env.NODE_ENV === "production";
}

/** Public URL prefix admins use in the browser. */
export function getAdminBasePath(): string {
  const fromEnv = process.env.NEXT_PUBLIC_ADMIN_BASE_PATH?.trim();
  if (fromEnv) return normalizeBase(fromEnv);

  // Production: never expose well-known /admin
  if (isProd()) return DEFAULT_PRODUCTION_ADMIN_BASE;

  return DEV_FALLBACK;
}

/** Join base + subpath, e.g. adminPath('login') → /cg-…/login */
export function adminPath(subpath = ""): string {
  const base = getAdminBasePath();
  const sub = subpath.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!sub) return base;
  return `${base}/${sub}`;
}

export function isAdminPublicPath(pathname: string): boolean {
  const base = getAdminBasePath();
  return pathname === base || pathname.startsWith(`${base}/`);
}

/** Internal Next.js app folder paths under app/admin */
export function isAdminFilesystemPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/** True when public path is not /admin — bare /admin must 404. */
export function isCustomAdminPathEnabled(): boolean {
  return getAdminBasePath() !== DEV_FALLBACK;
}
