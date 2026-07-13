/**
 * Sanity env — soft defaults so Cloudflare/CI builds do not crash when
 * NEXT_PUBLIC_* are injected only at runtime. Prefer real env vars in production.
 */
export const apiVersion =
  process.env.SANITY_STUDIO_API_VERSION ||
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ||
  "2026-05-09";

export const dataset =
  process.env.SANITY_STUDIO_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  "production";

export const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID ||
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  "egkekbgr";
