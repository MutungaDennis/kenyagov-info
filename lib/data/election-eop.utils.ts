// lib/data/election-eop.utils.ts
// Date-aware status for IEBC Election Operation Plan activities

import {
  eopActivities2027,
  EOP_SECTIONS,
  type EopActivity,
  type EopSection,
} from "./election-eop";

export type EopStatus = "upcoming" | "happening" | "past" | "unknown";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseIso(date: string): Date {
  return startOfDay(new Date(date + "T12:00:00"));
}

function effectiveStart(a: EopActivity): string | null {
  return a.startDate ?? a.endDate;
}

function effectiveEnd(a: EopActivity): string | null {
  return a.endDate ?? a.startDate;
}

export function getEopActivityStatus(
  a: EopActivity,
  today: Date = new Date(),
): EopStatus {
  const start = effectiveStart(a);
  const end = effectiveEnd(a);
  if (!start && !end) return "unknown";
  const t = startOfDay(today);
  const s = parseIso(start!);
  const e = parseIso(end!);
  if (s <= t && e >= t) return "happening";
  if (s > t) return "upcoming";
  return "past";
}

export function getAllEopActivities(): EopActivity[] {
  return eopActivities2027;
}

export function getEopSections(): EopSection[] {
  return EOP_SECTIONS;
}

export function getActivitiesForSection(sectionId: string): EopActivity[] {
  return eopActivities2027.filter((a) => a.sectionId === sectionId);
}

export function getPublicInterestActivities(
  today: Date = new Date(),
): EopActivity[] {
  return eopActivities2027
    .filter((a) => a.publicInterest)
    .sort(compareByStart);
}

export function getUpcomingPublicActivities(
  today: Date = new Date(),
  limit = 12,
): EopActivity[] {
  return getPublicInterestActivities(today)
    .filter((a) => {
      const st = getEopActivityStatus(a, today);
      return st === "upcoming" || st === "happening";
    })
    .slice(0, limit);
}

export function getHappeningPublicActivities(
  today: Date = new Date(),
): EopActivity[] {
  return getPublicInterestActivities(today).filter(
    (a) => getEopActivityStatus(a, today) === "happening",
  );
}

export function getNextPublicActivity(
  today: Date = new Date(),
): EopActivity | null {
  const happening = getHappeningPublicActivities(today)[0];
  if (happening) return happening;
  return (
    getPublicInterestActivities(today).find(
      (a) => getEopActivityStatus(a, today) === "upcoming",
    ) ?? null
  );
}

function compareByStart(a: EopActivity, b: EopActivity): number {
  const as = effectiveStart(a) ?? "9999-12-31";
  const bs = effectiveStart(b) ?? "9999-12-31";
  if (as !== bs) return as.localeCompare(bs);
  return a.ref.localeCompare(b.ref, undefined, { numeric: true });
}

export function formatEopDate(iso: string): string {
  return parseIso(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatEopDateRange(
  start: string | null,
  end: string | null,
): string {
  if (!start && !end) return "Date to be confirmed";
  if (start && end && start === end) return formatEopDate(start);
  if (start && !end) return `From ${formatEopDate(start)}`;
  if (!start && end) return `By ${formatEopDate(end)}`;
  return `${formatEopDate(start!)} – ${formatEopDate(end!)}`;
}

export function daysUntilEopActivity(
  a: EopActivity,
  today: Date = new Date(),
): number | null {
  const start = effectiveStart(a);
  if (!start) return null;
  const t = startOfDay(today).getTime();
  const s = parseIso(start).getTime();
  return Math.ceil((s - t) / (24 * 60 * 60 * 1000));
}

export function eopStatusLabel(status: EopStatus): string {
  if (status === "happening") return "Happening now";
  if (status === "upcoming") return "Upcoming";
  if (status === "past") return "Past";
  return "Date TBC";
}

export function eopStatusTagClass(status: EopStatus): string {
  if (status === "happening") return "govuk-tag--green";
  if (status === "upcoming") return "govuk-tag--blue";
  if (status === "past") return "govuk-tag--grey";
  return "govuk-tag--yellow";
}

/** Count activities by status within a section */
export function sectionStatusCounts(
  sectionId: string,
  today: Date = new Date(),
): { happening: number; upcoming: number; past: number } {
  const items = getActivitiesForSection(sectionId);
  let happening = 0;
  let upcoming = 0;
  let past = 0;
  for (const a of items) {
    const st = getEopActivityStatus(a, today);
    if (st === "happening") happening++;
    else if (st === "upcoming") upcoming++;
    else if (st === "past") past++;
  }
  return { happening, upcoming, past };
}
