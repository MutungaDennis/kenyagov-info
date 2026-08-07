// lib/data/election-timeline.utils.ts
// Upcoming / happening now / past — same pattern as ask-shows and by-elections

import {
  electionTimelinesByYear,
  GENERAL_ELECTION_2027,
  type ElectionTimelineMilestone,
} from "./election-timeline";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseIso(date: string): Date {
  return startOfDay(new Date(date + "T12:00:00"));
}

function endOf(m: ElectionTimelineMilestone): string {
  return m.endDate || m.date;
}

export type TimelineStatus = "upcoming" | "happening" | "past";

export function getMilestoneStatus(
  m: ElectionTimelineMilestone,
  today: Date = new Date(),
): TimelineStatus {
  const t = startOfDay(today);
  const start = parseIso(m.date);
  const end = parseIso(endOf(m));
  if (start <= t && end >= t) return "happening";
  if (start > t) return "upcoming";
  return "past";
}

export function getTimelineYears(): number[] {
  return Object.keys(electionTimelinesByYear)
    .map(Number)
    .sort((a, b) => a - b);
}

export function getMilestonesForYear(year: number): ElectionTimelineMilestone[] {
  const list = electionTimelinesByYear[year] ?? [];
  return [...list].sort((a, b) => {
    const d = parseIso(a.date).getTime() - parseIso(b.date).getTime();
    if (d !== 0) return d;
    return a.sortOrder - b.sortOrder;
  });
}

/** Prefer the nearest general-election year that still has future milestones, else latest year. */
export function getDefaultTimelineYear(today: Date = new Date()): number {
  const years = getTimelineYears();
  if (!years.length) return GENERAL_ELECTION_2027.year;
  const withUpcoming = years.find((y) =>
    getMilestonesForYear(y).some(
      (m) => getMilestoneStatus(m, today) !== "past",
    ),
  );
  return withUpcoming ?? years[years.length - 1];
}

export function getUpcomingMilestones(
  year?: number,
  today: Date = new Date(),
): ElectionTimelineMilestone[] {
  const y = year ?? getDefaultTimelineYear(today);
  return getMilestonesForYear(y).filter(
    (m) => getMilestoneStatus(m, today) === "upcoming",
  );
}

export function getHappeningMilestones(
  year?: number,
  today: Date = new Date(),
): ElectionTimelineMilestone[] {
  const y = year ?? getDefaultTimelineYear(today);
  return getMilestonesForYear(y).filter(
    (m) => getMilestoneStatus(m, today) === "happening",
  );
}

export function getPastMilestones(
  year?: number,
  today: Date = new Date(),
): ElectionTimelineMilestone[] {
  const y = year ?? getDefaultTimelineYear(today);
  return getMilestonesForYear(y)
    .filter((m) => getMilestoneStatus(m, today) === "past")
    .reverse();
}

export function getTimelineHighlight(
  year?: number,
  today: Date = new Date(),
): {
  milestone: ElectionTimelineMilestone;
  status: TimelineStatus;
} | null {
  const y = year ?? getDefaultTimelineYear(today);
  const happening = getHappeningMilestones(y, today)[0];
  if (happening) return { milestone: happening, status: "happening" };
  const upcoming = getUpcomingMilestones(y, today)[0];
  if (upcoming) return { milestone: upcoming, status: "upcoming" };
  const past = getPastMilestones(y, today)[0];
  if (past) return { milestone: past, status: "past" };
  return null;
}

export function formatTimelineDate(iso: string): string {
  return parseIso(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTimelineDateRange(
  start: string,
  end?: string,
): string {
  if (!end || end === start) return formatTimelineDate(start);
  const s = parseIso(start);
  const e = parseIso(end);
  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();
  if (sameMonth) {
    return `${s.getDate()}–${e.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`;
  }
  return `${formatTimelineDate(start)} – ${formatTimelineDate(end)}`;
}

export function daysUntilMilestone(
  m: ElectionTimelineMilestone,
  today: Date = new Date(),
): number {
  const t = startOfDay(today).getTime();
  const s = parseIso(m.date).getTime();
  return Math.ceil((s - t) / (24 * 60 * 60 * 1000));
}

/** Next general election day milestone if still future / today */
export function getNextGeneralElectionDay(
  today: Date = new Date(),
): ElectionTimelineMilestone | null {
  const all = Object.values(electionTimelinesByYear)
    .flat()
    .filter((m) => m.kind === "election-day")
    .sort(
      (a, b) => parseIso(a.date).getTime() - parseIso(b.date).getTime(),
    );
  const t = startOfDay(today);
  return (
    all.find((m) => parseIso(endOf(m)) >= t) ?? all[all.length - 1] ?? null
  );
}

export function statusLabel(status: TimelineStatus): string {
  if (status === "happening") return "Happening now";
  if (status === "upcoming") return "Upcoming";
  return "Past";
}

export function statusTagClass(status: TimelineStatus): string {
  if (status === "happening") return "govuk-tag--green";
  if (status === "upcoming") return "govuk-tag--blue";
  return "govuk-tag--grey";
}
