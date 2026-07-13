import { createClient, type SanityClient } from "next-sanity";

/**
 * Shared Sanity client factory with safe defaults so module evaluation
 * during `next build` does not crash when env vars are briefly unavailable.
 *
 * Always set NEXT_PUBLIC_SANITY_PROJECT_ID in production (Cloudflare build + runtime).
 */
export function getSanityProjectId(): string {
  return (
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    process.env.SANITY_STUDIO_PROJECT_ID ||
    "egkekbgr"
  );
}

export function getSanityDataset(): string {
  return (
    process.env.NEXT_PUBLIC_SANITY_DATASET ||
    process.env.SANITY_STUDIO_DATASET ||
    "production"
  );
}

export function createSanityClient(options?: {
  useCdn?: boolean;
  token?: string | null;
  apiVersion?: string;
}): SanityClient {
  return createClient({
    projectId: getSanityProjectId(),
    dataset: getSanityDataset(),
    apiVersion: options?.apiVersion ?? "2024-01-01",
    useCdn: options?.useCdn ?? true,
    token:
      options?.token === null
        ? undefined
        : options?.token ?? process.env.SANITY_API_TOKEN,
  });
}

/** Write-capable client (mutations). useCdn: false */
export function createSanityWriteClient(): SanityClient {
  return createSanityClient({
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
  });
}
