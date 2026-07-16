// lib/data/kndff.utils.ts

import { kndffEditions, type KndffEdition } from "./kndff";

export type EventHighlightStatus = "upcoming" | "ongoing" | "recent";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseIso(date: string): Date {
  return startOfDay(new Date(date + "T12:00:00"));
}

export function formatKndffDateRange(
  startDate: string,
  endDate: string,
  opts?: { approximate?: boolean },
): string {
  const start = parseIso(startDate);
  const end = parseIso(endDate);
  const sameDay = start.getTime() === end.getTime();

  // Year-only style when start/end are placeholder April spans without day precision
  // For cancelled single-day placeholders, show year only.
  if (sameDay && opts?.approximate) {
    return String(start.getFullYear());
  }

  if (sameDay) {
    return start.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${start.toLocaleDateString("en-GB", { day: "numeric" })}–${end.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`;
  }

  return `${start.toLocaleDateString("en-GB", { day: "numeric", month: "long" })} – ${end.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`;
}

/** Held or scaled editions only (not cancelled). */
export function getHeldKndffEditions(): KndffEdition[] {
  return kndffEditions.filter((e) => e.status !== "cancelled");
}

function isOngoing(
  startDate: string,
  endDate: string,
  today: Date = new Date(),
): boolean {
  const t = startOfDay(today);
  return parseIso(startDate) <= t && parseIso(endDate) >= t;
}

function isFuture(startDate: string, today: Date = new Date()): boolean {
  return parseIso(startDate) > startOfDay(today);
}

function isPastEnd(endDate: string, today: Date = new Date()): boolean {
  return parseIso(endDate) < startOfDay(today);
}

/** Editions that can appear in the green panel (held or scaled, not cancelled). */
function panelCandidates(): KndffEdition[] {
  return kndffEditions.filter((e) => e.status !== "cancelled");
}

export function getUpcomingKndff(
  today: Date = new Date(),
): KndffEdition | null {
  const upcoming = panelCandidates()
    .filter((e) => isFuture(e.startDate, today))
    .sort(
      (a, b) =>
        parseIso(a.startDate).getTime() - parseIso(b.startDate).getTime(),
    );
  return upcoming[0] ?? null;
}

export function getOngoingKndff(
  today: Date = new Date(),
): KndffEdition | null {
  return (
    panelCandidates().find((e) => isOngoing(e.startDate, e.endDate, today)) ??
    null
  );
}

/** Most recent festival that has already started (includes ongoing). */
export function getLatestKndff(today: Date = new Date()): KndffEdition | null {
  const started = panelCandidates()
    .filter((e) => parseIso(e.startDate) <= startOfDay(today))
    .sort(
      (a, b) => parseIso(b.endDate).getTime() - parseIso(a.endDate).getTime(),
    );
  return started[0] ?? null;
}

/**
 * Green-panel highlight: ongoing → next upcoming → most recent past.
 * Most recent finishes on top of the page when nothing is upcoming.
 */
export function getKndffHighlight(today: Date = new Date()): {
  edition: KndffEdition;
  status: EventHighlightStatus;
} | null {
  const ongoing = getOngoingKndff(today);
  if (ongoing) return { edition: ongoing, status: "ongoing" };

  const upcoming = getUpcomingKndff(today);
  if (upcoming) return { edition: upcoming, status: "upcoming" };

  const latest = getLatestKndff(today);
  if (latest) return { edition: latest, status: "recent" };

  return null;
}

/** Past held/scaled editions (finished), most recent first. */
export function getPastKndff(today: Date = new Date()): KndffEdition[] {
  return panelCandidates()
    .filter((e) => isPastEnd(e.endDate, today))
    .sort(
      (a, b) => parseIso(b.endDate).getTime() - parseIso(a.endDate).getTime(),
    );
}

/** Cancelled years, newest first. */
export function getCancelledKndff(): KndffEdition[] {
  return kndffEditions
    .filter((e) => e.status === "cancelled")
    .sort((a, b) => b.year - a.year);
}

export function formatKndffVenue(edition: KndffEdition): string {
  if (!edition.venue && !edition.hostCounty) return "—";
  if (edition.venue && edition.hostCounty) {
    return `${edition.venue}, ${edition.hostCounty} County`;
  }
  return edition.venue ?? `${edition.hostCounty} County`;
}

export function formatKndffTheme(edition: KndffEdition): string {
  return edition.theme ?? "Theme not recorded in open sources";
}

export function formatKndffWinner(edition: KndffEdition): string {
  if (edition.status === "cancelled") return "—";
  return edition.secondaryPlayWinner ?? "Not recorded";
}

