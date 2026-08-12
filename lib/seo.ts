/**
 * Site-wide SEO / Open Graph helpers — Cloudflare-friendly.
 * Prefer absolute image URLs and consistent siteName (like GOV.UK previews).
 */

import type { Metadata } from "next";

export const SITE_URL = "https://www.citizenguide.ke";
export const SITE_NAME = "CitizenGuide.KE";
export const SITE_TAGLINE = "Your guide to Kenyan governance";
export const DEFAULT_TITLE =
  "CitizenGuide.KE — Informational guide to Kenyan governance";
export const DEFAULT_DESCRIPTION =
  "Find clear, factual information about the Government of Kenya — institutions, leaders, counties, public services, elections, and the Constitution of Kenya 2010.";

/** Default share card — 1200×630 static asset (WhatsApp-friendly size). */
export const DEFAULT_OG_IMAGE = {
  url: `${SITE_URL}/og-image.png`,
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
  type: "image/png" as const,
};

export type PageMetaInput = {
  title: string;
  description: string;
  /** Path starting with / e.g. /government/people/william-samoei-ruto */
  path: string;
  /** Optional override image (absolute or site-relative) */
  image?: string | null;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  type?: "website" | "article" | "profile";
  noIndex?: boolean;
  keywords?: string[];
};

function absoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

/**
 * Build Metadata with full Open Graph + Twitter cards for social sharing.
 */
export function buildPageMetadata(input: PageMetaInput): Metadata {
  const pageUrl = absoluteUrl(input.path);
  const title = input.title.includes(SITE_NAME)
    ? input.title
    : input.title;
  // Full title for OG (platforms ignore template)
  const ogTitle = title.includes(SITE_NAME)
    ? title
    : `${title} | ${SITE_NAME}`;

  const images = input.image
    ? [
        {
          url: absoluteUrl(input.image),
          width: input.imageWidth ?? 1200,
          height: input.imageHeight ?? 630,
          alt: input.imageAlt || ogTitle,
        },
        // Fallback brand card (some crawlers pick first; secondary helps)
        DEFAULT_OG_IMAGE,
      ]
    : [DEFAULT_OG_IMAGE];

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: {
      canonical: pageUrl,
    },
    robots: input.noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      type: input.type === "profile" ? "profile" : input.type === "article" ? "article" : "website",
      locale: "en_KE",
      url: pageUrl,
      siteName: SITE_NAME,
      title: ogTitle,
      description: input.description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: input.description,
      images: [images[0].url],
    },
  };
}
