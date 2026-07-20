/**
 * Parliamentary office tenure for Hansard pulse / accountability.
 * Anchors activity calendars to time in office (incl. continuous terms, mid-term starts).
 */

export type RoleTermInput = {
  title?: string | null;
  party?: string | null;
  constituency?: string | null;
  term_start_date?: string | null;
  term_end_date?: string | null;
  /** Optional: general-election | by-election | nomination | other */
  entry_type?: string | null;
  status?: string | null;
};

export type TenureSegment = {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD (today if open-ended)
  title?: string | null;
  constituency?: string | null;
  party?: string | null;
  entryType?: string | null;
  openEnded: boolean;
};

export type MemberTenure = {
  /** Earliest day treated as in office (merged continuous service) */
  tenureStart: string | null;
  /** Latest day in office (today if still serving) */
  tenureEnd: string | null;
  /** Still in office (open-ended end) */
  stillServing: boolean;
  /** Source of dates */
  source: "roles" | "hansard-activity" | "mixed" | "none";
  segments: TenureSegment[];
  /** Calendar years covered (inclusive), for year tabs */
  years: number[];
  /** Human summary for captions */
  summaryLabel: string;
  /** Coverage note when Hansard data is narrower than legal tenure */
  coverageNote: string | null;
  entryHints: string[];
};

function todayYmd(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toYmd(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = String(raw).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

function parseYmd(ymd: string): Date {
  return new Date(ymd + "T12:00:00");
}

function addDays(ymd: string, n: number): string {
  const d = parseYmd(ymd);
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplay(ymd: string): string {
  return parseYmd(ymd).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Prefer legislative-style roles when filtering (soft). */
export function looksLikeLegislativeRole(title?: string | null): boolean {
  if (!title) return true;
  const t = title.toLowerCase();
  if (/minister|cabinet|governor|ambassador|judge|chief justice/.test(t)) {
    // Still allow if also MP-like
    if (!/member|mp|senator|mca|parliament|assembly|whip|leader of/.test(t)) {
      return false;
    }
  }
  return true;
}

function inferEntryHint(seg: TenureSegment): string | null {
  if (seg.entryType) {
    const e = seg.entryType.toLowerCase().replace(/_/g, "-");
    if (e.includes("by-election") || e.includes("byelection")) {
      return `Entered via by-election (${formatDisplay(seg.start)})`;
    }
    if (e.includes("general")) {
      return `General election term from ${formatDisplay(seg.start)}`;
    }
    if (e.includes("nominat")) {
      return `Nominated seat from ${formatDisplay(seg.start)}`;
    }
  }
  // Soft heuristic: start not in Aug–Sep of typical general election years → likely mid-term
  const month = Number(seg.start.slice(5, 7));
  if (month >= 1 && month <= 6) {
    return `Seat assumed ${formatDisplay(seg.start)} (may be by-election or mid-term start — confirm against official records)`;
  }
  return null;
}

/**
 * Merge overlapping / contiguous term intervals (re-election without gap).
 * Gap of 0–1 days counts as continuous.
 */
export function mergeTenureSegments(segments: TenureSegment[]): TenureSegment[] {
  if (!segments.length) return [];
  const sorted = [...segments].sort((a, b) => a.start.localeCompare(b.start));
  const out: TenureSegment[] = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i];
    const last = out[out.length - 1];
    const bridge = addDays(last.end, 1);
    if (cur.start <= bridge) {
      if (cur.end > last.end) {
        last.end = cur.end;
        last.openEnded = last.openEnded || cur.openEnded;
      }
      if (!last.constituency && cur.constituency) {
        last.constituency = cur.constituency;
      }
      if (!last.title && cur.title) last.title = cur.title;
    } else {
      out.push({ ...cur });
    }
  }
  return out;
}

export function buildMemberTenure(options: {
  roles?: RoleTermInput[] | null;
  /** First floor-contribution sitting date on this site */
  activityFirst?: string | null;
  /** Last floor-contribution sitting date on this site */
  activityLast?: string | null;
}): MemberTenure {
  const today = todayYmd();
  const activityFirst = toYmd(options.activityFirst);
  const activityLast = toYmd(options.activityLast);

  const rawSegments: TenureSegment[] = [];
  for (const r of options.roles || []) {
    if (!looksLikeLegislativeRole(r.title)) continue;
    const start = toYmd(r.term_start_date);
    if (!start) continue;
    const endRaw = toYmd(r.term_end_date);
    const openEnded = !endRaw;
    let end = endRaw || today;
    if (end > today) end = today;
    if (end < start) end = start;
    rawSegments.push({
      start,
      end,
      title: r.title,
      constituency: r.constituency,
      party: r.party,
      entryType: r.entry_type,
      openEnded,
    });
  }

  let source: MemberTenure["source"] = "none";
  let segments = mergeTenureSegments(rawSegments);

  if (segments.length > 0) {
    source = "roles";
  }

  // Fallback / extend from Hansard activity
  if (activityFirst && activityLast) {
    if (segments.length === 0) {
      segments = [
        {
          start: activityFirst,
          end: activityLast > today ? today : activityLast,
          openEnded: activityLast >= addDays(today, -90),
          title: null,
          constituency: null,
          party: null,
        },
      ];
      source = "hansard-activity";
    } else {
      // Mixed: if activity starts before first role, note coverage; don't invent earlier legal start
      source = "mixed";
    }
  }

  if (segments.length === 0) {
    return {
      tenureStart: null,
      tenureEnd: null,
      stillServing: false,
      source: "none",
      segments: [],
      years: [],
      summaryLabel: "Office tenure not recorded",
      coverageNote:
        "No term dates or Hansard activity yet — pulse cannot be anchored to time in office.",
      entryHints: [],
    };
  }

  const tenureStart = segments[0].start;
  const lastSeg = segments[segments.length - 1];
  const tenureEnd = lastSeg.end > today ? today : lastSeg.end;
  const stillServing = lastSeg.openEnded || lastSeg.end >= today;

  const startYear = Number(tenureStart.slice(0, 4));
  const endYear = Number(tenureEnd.slice(0, 4));
  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) years.push(y);

  const entryHints = segments
    .map(inferEntryHint)
    .filter((h): h is string => Boolean(h));

  let coverageNote: string | null = null;
  if (source === "hansard-activity") {
    coverageNote =
      "Tenure dates are estimated from Hansard sittings published on this site, not official gazetted term dates.";
  } else if (activityFirst && activityFirst > tenureStart) {
    coverageNote = `Official term may start ${formatDisplay(tenureStart)}; floor speeches on this site begin ${formatDisplay(activityFirst)}.`;
  } else if (source === "roles" && !activityFirst) {
    coverageNote =
      "Term dates are from leadership records. No floor contributions linked on this site yet.";
  }

  const summaryLabel = stillServing
    ? `${formatDisplay(tenureStart)} – present`
    : `${formatDisplay(tenureStart)} – ${formatDisplay(tenureEnd)}`;

  return {
    tenureStart,
    tenureEnd,
    stillServing,
    source,
    segments,
    years,
    summaryLabel,
    coverageNote,
    entryHints: Array.from(new Set(entryHints)),
  };
}

/** Years that have at least one activity day (for default tab preference). */
export function yearsWithActivity(
  days: Array<{ date: string; count: number }>,
  tenureYears: number[],
): number[] {
  const set = new Set<number>();
  for (const d of days) {
    if (d.count <= 0) continue;
    const y = Number(d.date.slice(0, 4));
    if (tenureYears.includes(y)) set.add(y);
  }
  return Array.from(set).sort((a, b) => a - b);
}

export function resolvePulseYear(
  requested: string | undefined,
  tenureYears: number[],
  activityYears: number[],
): number | null {
  if (!tenureYears.length) return null;
  const pref = requested ? Number(requested) : NaN;
  if (Number.isFinite(pref) && tenureYears.includes(pref)) return pref;

  const todayY = new Date().getFullYear();
  if (tenureYears.includes(todayY)) return todayY;

  // Prefer latest year with activity, else latest tenure year
  if (activityYears.length) return activityYears[activityYears.length - 1];
  return tenureYears[tenureYears.length - 1];
}

/** Intersection of calendar year with tenure (and not after today). */
export function yearWindowInTenure(
  year: number,
  tenureStart: string,
  tenureEnd: string,
): { rangeStart: string; rangeEnd: string } | null {
  const today = todayYmd();
  const yStart = `${year}-01-01`;
  const yEnd = `${year}-12-31`;
  let rangeStart = yStart < tenureStart ? tenureStart : yStart;
  let rangeEnd = yEnd > tenureEnd ? tenureEnd : yEnd;
  if (rangeEnd > today) rangeEnd = today;
  if (rangeStart > rangeEnd) return null;
  return { rangeStart, rangeEnd };
}

export function isDateInAnySegment(
  ymd: string,
  segments: TenureSegment[],
): boolean {
  return segments.some((s) => ymd >= s.start && ymd <= s.end);
}
