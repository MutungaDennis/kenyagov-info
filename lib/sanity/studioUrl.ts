/**
 * Hosted Sanity Studio URL (managed by Sanity — not embedded in this Next app).
 *
 * Prefer NEXT_PUBLIC_SANITY_STUDIO_URL after `npx sanity deploy`, e.g.
 *   https://citizenguide.sanity.studio
 * Fallback: Sanity Manage project dashboard.
 */
export function getSanityProjectId(): string {
  return (
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    process.env.SANITY_STUDIO_PROJECT_ID ||
    "egkekbgr"
  );
}

export function getSanityStudioUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  // Manage UI always works; after `sanity deploy` set NEXT_PUBLIC_SANITY_STUDIO_URL
  // to the assigned https://*.sanity.studio hostname.
  return `https://www.sanity.io/manage/project/${getSanityProjectId()}`;
}
