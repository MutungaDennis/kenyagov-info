/**
 * National events — types + helpers.
 * Catalogues: public/data/national-events.json (not embedded in Worker).
 */

import { loadStaticJson } from "@/lib/data/load-static-json";

export type NationalEventLink = {
  text: string;
  href: string;
  external?: boolean;
};

export type NationalEventSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  links?: NationalEventLink[];
};

export type NationalEvent = {
  slug: string;
  title: string;
  summary: string;
  categorySlug: string;
  meta?: string;
  lead?: string;
  sections: NationalEventSection[];
  relatedLinks?: NationalEventLink[];
  lastUpdated?: string;
};

export type NationalEventCategory = {
  slug: string;
  title: string;
  description: string;
  order: number;
};

type Bundle = {
  categories: NationalEventCategory[];
  events: NationalEvent[];
};

let cache: Bundle | null = null;

export async function loadNationalEventsBundle(): Promise<Bundle> {
  if (cache) return cache;
  cache = await loadStaticJson<Bundle>("data/national-events.json");
  return cache;
}

/** Empty at module init — use loadNationalEventsBundle(). */
export const nationalEventCategories: NationalEventCategory[] = [];
/** Empty at module init — use loadNationalEventsBundle(). */
export const nationalEvents: NationalEvent[] = [];

const BASE = "/national-events";

export function nationalEventHref(slug: string): string {
  return `${BASE}/${slug}`;
}

export async function getNationalEventBySlug(
  slug: string,
): Promise<NationalEvent | undefined> {
  const { events } = await loadNationalEventsBundle();
  return events.find((e) => e.slug === slug);
}

export async function getAllNationalEventSlugs(): Promise<string[]> {
  const { events } = await loadNationalEventsBundle();
  return events.map((e) => e.slug);
}

export async function getEventsForCategory(
  categorySlug: string,
): Promise<NationalEvent[]> {
  const { events } = await loadNationalEventsBundle();
  return events.filter(
    (e) => e.categorySlug === categorySlug && e.slug !== categorySlug,
  );
}

export async function getCategoryBySlug(
  slug: string,
): Promise<NationalEventCategory | undefined> {
  const { categories } = await loadNationalEventsBundle();
  return categories.find((c) => c.slug === slug);
}

export async function getSortedCategories(): Promise<NationalEventCategory[]> {
  const { categories } = await loadNationalEventsBundle();
  return [...categories].sort((a, b) => a.order - b.order);
}

export async function getHubCategoryItems(
  categorySlug: string,
): Promise<
  Array<{
    title: string;
    href: string;
    description: string;
    meta?: string;
  }>
> {
  const events = await getEventsForCategory(categorySlug);
  return events.map((child) => ({
    title: child.title,
    href: nationalEventHref(child.slug),
    description: child.summary,
    meta: child.meta,
  }));
}
