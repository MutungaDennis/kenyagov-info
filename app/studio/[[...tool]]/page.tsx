import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSanityStudioUrl } from "@/lib/sanity/studioUrl";

/**
 * Studio is hosted by Sanity (managed), not inside the Cloudflare Worker.
 * Embedding NextStudio / full `sanity` package blows past the free 3 MiB Worker limit.
 *
 * Set NEXT_PUBLIC_SANITY_STUDIO_URL after `npx sanity@latest deploy`
 * (e.g. https://your-hostname.sanity.studio).
 */
export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default function StudioRedirectPage() {
  redirect(getSanityStudioUrl());
}
