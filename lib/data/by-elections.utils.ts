// lib/data/by-elections.utils.ts
// Date-aware classification — same pattern as ask-shows.utils.ts

import { byElections, type ByElection } from "./by-elections";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseIso(date: string): Date {
  return startOfDay(new Date(date + "T12:00:00"));
}

function endDateOf(e: ByElection): string {
  return e.endDate || e.date;
}

export type ByElectionStatus = "upcoming" | "happening" | "past";

export function getByElectionStatus(
  e: ByElection,
  today: Date = new Date(),
): ByElectionStatus {
  const t = startOfDay(today);
  const start = parseIso(e.date);
  const end = parseIso(endDateOf(e));
  if (start <= t && end >= t) return "happening";
  if (start > t) return "upcoming";
  return "past";
}

export function getAllByElections(): ByElection[] {
  return [...byElections].sort(
    (a, b) => parseIso(b.date).getTime() - parseIso(a.date).getTime(),
  );
}

export function getUpcomingByElections(today: Date = new Date()): ByElection[] {
  return getAllByElections()
    .filter((e) => getByElectionStatus(e, today) === "upcoming")
    .sort((a, b) => parseIso(a.date).getTime() - parseIso(b.date).getTime());
}

export function getHappeningByElections(today: Date = new Date()): ByElection[] {
  return getAllByElections().filter(
    (e) => getByElectionStatus(e, today) === "happening",
  );
}

export function getPastByElections(today: Date = new Date()): ByElection[] {
  return getAllByElections().filter(
    (e) => getByElectionStatus(e, today) === "past",
  );
}

/** Highlight panel: happening → next upcoming → most recent past */
export function getByElectionHighlight(today: Date = new Date()): {
  election: ByElection;
  status: ByElectionStatus;
} | null {
  const happening = getHappeningByElections(today)[0];
  if (happening) return { election: happening, status: "happening" };

  const upcoming = getUpcomingByElections(today)[0];
  if (upcoming) return { election: upcoming, status: "upcoming" };

  const past = getPastByElections(today)[0];
  if (past) return { election: past, status: "past" };

  return null;
}

export function formatByElectionDate(iso: string): string {
  const d = parseIso(iso);
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function daysUntilByElection(
  e: ByElection,
  today: Date = new Date(),
): number {
  const t = startOfDay(today).getTime();
  const s = parseIso(e.date).getTime();
  return Math.ceil((s - t) / (24 * 60 * 60 * 1000));
}

export function byElectionTitle(e: ByElection): string {
  return `${e.area}, ${e.county} County`;
}
