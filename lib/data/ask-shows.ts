/**
 * Agricultural Society of Kenya (ASK) — types + loaders.
 * Profiles/calendar: public/data/ask-shows.json (not embedded in Worker).
 */

import { loadStaticJson } from "@/lib/data/load-static-json";

export type AskShowTier =
  | "international"
  | "national"
  | "regional"
  | "satellite"
  | "yfck"
  | "meeting"
  | "contest"
  | "conference";

export type AskFeeRow = {
  item: string;
  amount: string;
  note?: string;
};

export type AskShowProfile = {
  slug: string;
  name: string;
  shortName?: string;
  tier: AskShowTier;
  location: string;
  countiesServed?: string[];
  history?: string[];
  locationNotes?: string[];
  standRates?: AskFeeRow[];
  gateCharges?: AskFeeRow[];
  otherCharges?: AskFeeRow[];
  membership?: AskFeeRow[];
  notes?: string[];
  relatedHref?: string;
};

export type AskCalendarEvent = {
  id: string;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  venue: string;
  place: string;
  tier: AskShowTier;
  profileSlug?: string;
  calendarOrder: number;
};

/** 2026 ASK national theme (English + Kiswahili from ASK calendar). */
export const askTheme2026 = {
  year: 2026,
  english:
    "Promoting Climate Smart Agriculture and Trade Initiatives for Sustainable Economic Growth",
  kiswahili:
    "Ukuzaji wa ukulima unaozingatia hali ya hewa thabiti na mipango mahususi ya biashara ili kudumisha uchumi endelevu",
  sourceNote:
    "Calendar of Events for the Year 2026 as published by the Agricultural Society of Kenya.",
};

export const askTierLabels: Record<AskShowTier, string> = {
  international: "International show",
  national: "National show",
  regional: "Regional / branch show",
  satellite: "Satellite show",
  yfck: "Young Farmers (Y.F.C.K)",
  meeting: "Society meeting",
  contest: "National contest",
  conference: "Conference",
};

type Bundle = {
  theme2026?: typeof askTheme2026;
  profiles: AskShowProfile[];
  calendarByYear: Record<string, AskCalendarEvent[]>;
  tierLabels?: Record<string, string>;
};

let cache: Bundle | null = null;

export async function loadAskShowsBundle(): Promise<Bundle> {
  if (cache) return cache;
  cache = await loadStaticJson<Bundle>("data/ask-shows.json");
  return cache;
}

/** Filled by ensureAskShowsLoaded() for sync utils. */
export let askShowProfiles: AskShowProfile[] = [];
/** Filled by ensureAskShowsLoaded() for sync utils. Keys may be string years in JSON. */
export let askCalendarByYear: Record<number, AskCalendarEvent[]> = {};

export async function ensureAskShowsLoaded(): Promise<Bundle> {
  const b = await loadAskShowsBundle();
  askShowProfiles = b.profiles ?? [];
  // JSON keys are strings; normalise to numbers for utils
  const cal: Record<number, AskCalendarEvent[]> = {};
  const raw = b.calendarByYear ?? {};
  for (const [k, v] of Object.entries(raw)) {
    cal[Number(k)] = v as AskCalendarEvent[];
  }
  askCalendarByYear = cal;
  return b;
}

export async function getAskProfile(
  slug: string,
): Promise<AskShowProfile | undefined> {
  await ensureAskShowsLoaded();
  return askShowProfiles.find((p) => p.slug === slug);
}

export async function getAllAskProfileSlugs(): Promise<string[]> {
  await ensureAskShowsLoaded();
  return askShowProfiles.map((p) => p.slug);
}

export async function getProfilesByTier(
  tier: AskShowTier,
): Promise<AskShowProfile[]> {
  await ensureAskShowsLoaded();
  return askShowProfiles.filter((p) => p.tier === tier);
}
