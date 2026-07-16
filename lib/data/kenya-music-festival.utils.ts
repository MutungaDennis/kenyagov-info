// lib/data/kenya-music-festival.utils.ts

import { kmfEditions, type KmfEdition } from "./kenya-music-festival";

export type EventHighlightStatus = "upcoming" | "ongoing" | "recent";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseIso(date: string): Date {
  return startOfDay(new Date(date + "T12:00:00"));
}

export function formatKmfDateRange(startDate: string, endDate: string): string {
  const start = parseIso(startDate);
  const end = parseIso(endDate);
  if (start.getTime() === end.getTime()) {
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

function panelCandidates(): KmfEdition[] {
  return kmfEditions.filter((e) => e.status !== "cancelled");
}

export function getUpcomingKmf(today: Date = new Date()): KmfEdition | null {
  const upcoming = panelCandidates()
    .filter((e) => isFuture(e.startDate, today))
    .sort(
      (a, b) =>
        parseIso(a.startDate).getTime() - parseIso(b.startDate).getTime(),
    );
  return upcoming[0] ?? null;
}

export function getOngoingKmf(today: Date = new Date()): KmfEdition | null {
  return (
    panelCandidates().find((e) => isOngoing(e.startDate, e.endDate, today)) ??
    null
  );
}

export function getLatestKmf(today: Date = new Date()): KmfEdition | null {
  const started = panelCandidates()
    .filter((e) => parseIso(e.startDate) <= startOfDay(today))
    .sort(
      (a, b) => parseIso(b.endDate).getTime() - parseIso(a.endDate).getTime(),
    );
  return started[0] ?? null;
}

/**
 * Green-panel highlight: ongoing → next upcoming → most recent past.
 */
export function getKmfHighlight(today: Date = new Date()): {
  edition: KmfEdition;
  status: EventHighlightStatus;
} | null {
  const ongoing = getOngoingKmf(today);
  if (ongoing) return { edition: ongoing, status: "ongoing" };

  const upcoming = getUpcomingKmf(today);
  if (upcoming) return { edition: upcoming, status: "upcoming" };

  const latest = getLatestKmf(today);
  if (latest) return { edition: latest, status: "recent" };

  return null;
}

/** Past held editions, most recent first. */
export function getPastKmf(today: Date = new Date()): KmfEdition[] {
  return panelCandidates()
    .filter((e) => isPastEnd(e.endDate, today))
    .sort(
      (a, b) => parseIso(b.endDate).getTime() - parseIso(a.endDate).getTime(),
    );
}

export function getCancelledKmf(): KmfEdition[] {
  return kmfEditions
    .filter((e) => e.status === "cancelled")
    .sort((a, b) => b.year - a.year);
}

export function formatKmfVenue(edition: KmfEdition): string {
  if (!edition.venue && !edition.hostCounty) return "—";
  if (edition.venue && edition.hostCounty) {
    return `${edition.venue}, ${edition.hostCounty} County`;
  }
  return edition.venue ?? `${edition.hostCounty} County`;
}

export function formatKmfTheme(edition: KmfEdition): string {
  return edition.theme ?? "Theme not recorded";
}

export function daysUntilKmfStart(
  startDate: string,
  today: Date = new Date(),
): number {
  const t = startOfDay(today).getTime();
  const s = parseIso(startDate).getTime();
  return Math.round((s - t) / (1000 * 60 * 60 * 24));
}
