// lib/data/devolution-events.utils.ts

import {
  devolutionConferences,
  dswEditions,
  type DevolutionConferenceEdition,
  type DswEdition,
} from "./devolution-events";

/** Dynamic panel state: future, in progress, or last held. */
export type EventHighlightStatus = "upcoming" | "ongoing" | "recent";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseIso(date: string): Date {
  return startOfDay(new Date(date + "T12:00:00"));
}

export function formatDevolutionDateRange(
  startDate: string,
  endDate: string,
  precision: "exact" | "year-only" = "exact",
): string {
  if (precision === "year-only") {
    return String(parseIso(startDate).getFullYear());
  }
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

/** Most recent conference that has already started (includes ongoing). */
export function getLatestDevolutionConference(
  today: Date = new Date(),
): DevolutionConferenceEdition | null {
  const sorted = [...devolutionConferences].sort(
    (a, b) => b.edition - a.edition,
  );
  const started = sorted.filter(
    (c) => parseIso(c.startDate) <= startOfDay(today),
  );
  return started[0] ?? sorted[0] ?? null;
}

/** Next conference that has not started yet. */
export function getUpcomingDevolutionConference(
  today: Date = new Date(),
): DevolutionConferenceEdition | null {
  const upcoming = devolutionConferences
    .filter((c) => isFuture(c.startDate, today))
    .sort(
      (a, b) =>
        parseIso(a.startDate).getTime() - parseIso(b.startDate).getTime(),
    );
  return upcoming[0] ?? null;
}

export function getOngoingDevolutionConference(
  today: Date = new Date(),
): DevolutionConferenceEdition | null {
  return (
    devolutionConferences.find((c) =>
      isOngoing(c.startDate, c.endDate, today),
    ) ?? null
  );
}

/**
 * Green-panel highlight: ongoing → next upcoming → most recent past.
 * Stays correct as dates move without page rewrites.
 */
export function getDevolutionConferenceHighlight(
  today: Date = new Date(),
): {
  edition: DevolutionConferenceEdition;
  status: EventHighlightStatus;
} | null {
  const ongoing = getOngoingDevolutionConference(today);
  if (ongoing) return { edition: ongoing, status: "ongoing" };

  const upcoming = getUpcomingDevolutionConference(today);
  if (upcoming) return { edition: upcoming, status: "upcoming" };

  const latest = getLatestDevolutionConference(today);
  if (latest) return { edition: latest, status: "recent" };

  return null;
}

export function getPastDevolutionConferences(
  today: Date = new Date(),
): DevolutionConferenceEdition[] {
  return [...devolutionConferences]
    .filter((c) => isPastEnd(c.endDate, today))
    .sort((a, b) => b.edition - a.edition);
}

/** Most recent DSW that has already started (includes ongoing). */
export function getLatestDsw(today: Date = new Date()): DswEdition | null {
  const sorted = [...dswEditions].sort((a, b) => b.edition - a.edition);
  const started = sorted.filter(
    (e) => parseIso(e.startDate) <= startOfDay(today),
  );
  return started[0] ?? sorted[0] ?? null;
}

/** Next DSW that has not started yet. */
export function getUpcomingDsw(today: Date = new Date()): DswEdition | null {
  const upcoming = dswEditions
    .filter((e) => {
      if (e.precision === "year-only") {
        // Treat year-only as past once that calendar year has ended
        return parseIso(e.endDate) >= startOfDay(today) && isFuture(e.startDate, today);
      }
      return isFuture(e.startDate, today);
    })
    .sort(
      (a, b) =>
        parseIso(a.startDate).getTime() - parseIso(b.startDate).getTime(),
    );

  const exactUpcoming = upcoming.filter((e) => e.precision === "exact");
  return exactUpcoming[0] ?? upcoming[0] ?? null;
}

export function getOngoingDsw(today: Date = new Date()): DswEdition | null {
  return (
    dswEditions.find(
      (e) =>
        e.precision === "exact" &&
        isOngoing(e.startDate, e.endDate, today),
    ) ?? null
  );
}

/**
 * Green-panel highlight: ongoing → next upcoming → most recent past.
 */
export function getDswHighlight(today: Date = new Date()): {
  edition: DswEdition;
  status: EventHighlightStatus;
} | null {
  const ongoing = getOngoingDsw(today);
  if (ongoing) return { edition: ongoing, status: "ongoing" };

  const upcoming = getUpcomingDsw(today);
  if (upcoming) return { edition: upcoming, status: "upcoming" };

  const latest = getLatestDsw(today);
  if (latest) return { edition: latest, status: "recent" };

  return null;
}

export function getPastDsw(today: Date = new Date()): DswEdition[] {
  return [...dswEditions]
    .filter((e) => isPastEnd(e.endDate, today))
    .sort((a, b) => b.edition - a.edition);
}

export function getAllDswChronological(): DswEdition[] {
  return [...dswEditions].sort((a, b) => a.edition - b.edition);
}

export function daysUntil(
  startDate: string,
  today: Date = new Date(),
): number {
  const t = startOfDay(today).getTime();
  const s = parseIso(startDate).getTime();
  return Math.round((s - t) / (1000 * 60 * 60 * 24));
}
