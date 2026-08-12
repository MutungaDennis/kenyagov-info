/**
 * Load JSON from /public without bundling it into the Cloudflare Worker.
 *
 * Static `import x from './file.json'` is traced into handler.mjs and burns
 * the Free plan 3 MiB gzip limit. Runtime fetch / ASSETS / disk keep data in
 * Workers Static Assets instead.
 */

export async function loadStaticJson<T>(publicPath: string): Promise<T> {
  const path = publicPath.startsWith("/") ? publicPath : `/${publicPath}`;

  // Browser
  if (typeof window !== "undefined") {
    const res = await fetch(path);
    if (!res.ok) {
      throw new Error(`loadStaticJson: ${path} → ${res.status}`);
    }
    return (await res.json()) as T;
  }

  // Cloudflare Workers (OpenNext) — serve from ASSETS binding
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    const assets = (
      ctx as { env?: { ASSETS?: { fetch: (r: Request) => Promise<Response> } } }
    )?.env?.ASSETS;
    if (assets) {
      const res = await assets.fetch(new Request(`https://assets.local${path}`));
      if (res.ok) return (await res.json()) as T;
    }
  } catch {
    /* not on CF, or context unavailable during build */
  }

  // Local `next dev` / `next build` — read public/ from disk (not shipped to Worker)
  try {
    const fs = await import(/* webpackIgnore: true */ "node:fs/promises");
    const pathMod = await import(/* webpackIgnore: true */ "node:path");
    const file = pathMod.join(process.cwd(), "public", path.replace(/^\//, ""));
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    /* fall through */
  }

  // Last resort: absolute fetch (production origin)
  const origin = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.citizenguide.ke"
  ).replace(/\/$/, "");
  const res = await fetch(`${origin}${path}`, {
    // Avoid locking build to a network dependency when possible
    cache: "force-cache",
  });
  if (!res.ok) {
    throw new Error(`loadStaticJson: ${origin}${path} → ${res.status}`);
  }
  return (await res.json()) as T;
}
