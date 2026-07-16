// lib/data/ask-shows.utils.ts

import {
  askCalendarByYear,
  type AskCalendarEvent,
  type AskShowTier,
  askTierLabels,
} from "./ask-shows";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseIso(date: string): Date {
  const d = new Date(date + "T12:00:00");
  return startOfDay(d);
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function getAskYears(): number[] {
  return Object.keys(askCalendarByYear)
    .map(Number)
    .sort((a, b) => a - b);
}

export function getAskEventsForYear(year: number): AskCalendarEvent[] {
  const list = askCalendarByYear[year] ?? [];
  return [...list].sort(
    (a, b) => parseIso(a.startDate).getTime() - parseIso(b.startDate).getTime(),
  );
}

/** Event is still on or upcoming if its end date is today or later. */
export function isAskEventUpcoming(
  event: AskCalendarEvent,
  today: Date = new Date(),
): boolean {
  const t = startOfDay(today);
  return parseIso(event.endDate) >= t;
}

export function isAskEventPast(
  event: AskCalendarEvent,
  today: Date = new Date(),
): boolean {
  return !isAskEventUpcoming(event, today);
}

/** Dynamic panel state: future, in progress, or last held. */
export type AskHighlightStatus = "upcoming" | "ongoing" | "recent";

function isAskOngoing(
  event: AskCalendarEvent,
  today: Date = new Date(),
): boolean {
  const t = startOfDay(today);
  return parseIso(event.startDate) <= t && parseIso(event.endDate) >= t;
}

function isAskFuture(
  event: AskCalendarEvent,
  today: Date = new Date(),
): boolean {
  return parseIso(event.startDate) > startOfDay(today);
}

/** Next event that has not yet finished (includes multi-day shows in progress). */
export function getNextAskEvent(
  today: Date = new Date(),
): AskCalendarEvent | null {
  const all = Object.values(askCalendarByYear)
    .flat()
    .filter((e) => isAskEventUpcoming(e, today))
    .sort(
      (a, b) => parseIso(a.startDate).getTime() - parseIso(b.startDate).getTime(),
    );
  return all[0] ?? null;
}

/** Most recent event that has already started (includes ongoing). */
export function getLatestAskEvent(
  today: Date = new Date(),
): AskCalendarEvent | null {
  const all = Object.values(askCalendarByYear)
    .flat()
    .filter((e) => parseIso(e.startDate) <= startOfDay(today))
    .sort(
      (a, b) =>
        parseIso(b.endDate).getTime() - parseIso(a.endDate).getTime(),
    );
  return all[0] ?? null;
}

/**
 * Green-panel highlight: ongoing → next upcoming → most recent past.
 */
export function getAskHighlight(today: Date = new Date()): {
  event: AskCalendarEvent;
  status: AskHighlightStatus;
} | null {
  const all = Object.values(askCalendarByYear).flat();

  const ongoing = all
    .filter((e) => isAskOngoing(e, today))
    .sort(
      (a, b) =>
        parseIso(a.startDate).getTime() - parseIso(b.startDate).getTime(),
    )[0];
  if (ongoing) return { event: ongoing, status: "ongoing" };

  const upcoming = all
    .filter((e) => isAskFuture(e, today))
    .sort(
      (a, b) =>
        parseIso(a.startDate).getTime() - parseIso(b.startDate).getTime(),
    )[0];
  if (upcoming) return { event: upcoming, status: "upcoming" };

  const latest = getLatestAskEvent(today);
  if (latest) return { event: latest, status: "recent" };

  return null;
}

export function getUpcomingAskEvents(
  year?: number,
  today: Date = new Date(),
): AskCalendarEvent[] {
  const y = year ?? getCurrentYear();
  return getAskEventsForYear(y).filter((e) => isAskEventUpcoming(e, today));
}

export function getPastAskEvents(
  year?: number,
  today: Date = new Date(),
): AskCalendarEvent[] {
  const y = year ?? getCurrentYear();
  return getAskEventsForYear(y)
    .filter((e) => isAskEventPast(e, today))
    .reverse();
}

export function formatAskDateRange(
  startDate: string,
  endDate: string,
): string {
  const start = parseIso(startDate);
  const end = parseIso(endDate);
  const sameDay = start.getTime() === end.getTime();

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
    const dayStart = start.toLocaleDateString("en-GB", { day: "numeric" });
    const dayEnd = end.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return `${dayStart}–${dayEnd}`;
  }

  const a = start.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });
  const b = end.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${a} – ${b}`;
}

export function formatAskDayOfWeek(dateString: string): string {
  return parseIso(dateString).toLocaleDateString("en-GB", { weekday: "long" });
}

export function getAskTierLabel(tier: AskShowTier): string {
  return askTierLabels[tier];
}

export function daysUntilStart(
  event: AskCalendarEvent,
  today: Date = new Date(),
): number {
  const t = startOfDay(today).getTime();
  const s = parseIso(event.startDate).getTime();
  return Math.round((s - t) / (1000 * 60 * 60 * 24));
}

export function profilePath(slug: string): string {
  return `/society-and-culture/national-events/ask-shows/${slug}`;
}
