/**
 * Public admin URL configuration.
 *
 * Development:
 *   /admin
 *
 * Production:
 *   /cg-ke-a5wkqciyjpg940u3
 *
 * The hidden production path reduces unsolicited traffic. It is not the
 * authorization mechanism; protected routes must still call requireAdmin().
 */

export const DEFAULT_PRODUCTION_ADMIN_BASE =
  "/cg-ke-a5wkqciyjpg940u3";

const DEVELOPMENT_ADMIN_BASE = "/admin";

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function normalizeBasePath(value: string): string {
  let pathname = value.trim();

  if (!pathname.startsWith("/")) {
    pathname = `/${pathname}`;
  }

  pathname = pathname.replace(/\/+$/, "");

  if (!pathname || pathname === "/") {
    return isProduction()
      ? DEFAULT_PRODUCTION_ADMIN_BASE
      : DEVELOPMENT_ADMIN_BASE;
  }

  return pathname;
}

/**
 * Returns the public admin URL prefix for the current environment.
 */
export function getAdminBasePath(): string {
  const configuredPath =
    process.env.NEXT_PUBLIC_ADMIN_BASE_PATH?.trim();

  if (configuredPath) {
    return normalizeBasePath(configuredPath);
  }

  return isProduction()
    ? DEFAULT_PRODUCTION_ADMIN_BASE
    : DEVELOPMENT_ADMIN_BASE;
}

/**
 * Constructs a public admin URL.
 *
 * Examples:
 *   adminPath()        -> /admin locally
 *   adminPath("login") -> /admin/login locally
 *
 * In production the secret prefix is used instead.
 */
export function adminPath(subpath = ""): string {
  const base = getAdminBasePath();
  const normalizedSubpath = subpath
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  return normalizedSubpath
    ? `${base}/${normalizedSubpath}`
    : base;
}

/**
 * True when pathname is under the public admin prefix for this environment.
 */
export function isAdminPublicPath(pathname: string): boolean {
  const base = getAdminBasePath();

  return pathname === base || pathname.startsWith(`${base}/`);
}

/**
 * True for the internal Next.js app/admin filesystem route.
 */
export function isAdminFilesystemPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/**
 * True when production/custom URLs should hide the internal /admin route.
 */
export function isCustomAdminPathEnabled(): boolean {
  return getAdminBasePath() !== DEVELOPMENT_ADMIN_BASE;
}