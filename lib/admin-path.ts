/**
 * Obscure admin URL prefix.
 *
 * Set NEXT_PUBLIC_ADMIN_BASE_PATH to a long random path (e.g. /cg-ke-m8p4w2q9x1n7).
 * Middleware rewrites that path to the internal /admin app routes and returns 404
 * for bare /admin when a custom path is configured.
 *
 * Security note: this is obscurity, not a substitute for strong passwords + admin RLS.
 */

const FALLBACK = "/admin";

function normalizeBase(raw: string | undefined): string {
  let p = (raw || FALLBACK).trim();
  if (!p.startsWith("/")) p = `/${p}`;
  p = p.replace(/\/+$/, "");
  if (!p || p === "/") return FALLBACK;
  return p;
}

/** Public URL prefix admins use in the browser (and robots.txt). */
export function getAdminBasePath(): string {
  return normalizeBase(process.env.NEXT_PUBLIC_ADMIN_BASE_PATH);
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

/** True when a custom secret path is in use (so /admin should 404). */
export function isCustomAdminPathEnabled(): boolean {
  return getAdminBasePath() !== FALLBACK;
}
