/**
 * Normalize leader_roles values to match live Supabase enums / constraints.
 *
 * Confirmed on project:
 * - level (leader_level, NOT NULL): national | county | ward
 * - seat_type (leader_seat_type, NOT NULL): Elected | Nominated | Ex-Officio | Appointed
 * - status (leader_status): Active | Former | Suspended
 * - term_start_date: NOT NULL
 * - position_id / government_level_id are UUID — do not send integer IDs from
 *   positions / government_levels tables
 */

export const LEADER_LEVELS = ["national", "county", "ward"] as const;
export type LeaderLevel = (typeof LEADER_LEVELS)[number];

export const SEAT_TYPES = [
  "Elected",
  "Nominated",
  "Ex-Officio",
  "Appointed",
] as const;
export type SeatType = (typeof SEAT_TYPES)[number];

export const ROLE_STATUSES = ["Active", "Former", "Suspended"] as const;
export type RoleStatus = (typeof ROLE_STATUSES)[number];

export function normalizeLeaderLevel(
  raw?: string | null,
  positionTitle?: string | null,
): LeaderLevel {
  const s = (raw || "").toLowerCase().trim();
  if (s === "national" || s.includes("national")) return "national";
  if (s === "county" || s.includes("county") || s.includes("devolution")) {
    return "county";
  }
  if (s === "ward" || s.includes("ward") || s.includes("mca")) return "ward";

  const t = (positionTitle || "").toLowerCase();
  if (/\b(mca|county assembly|ward)\b/.test(t)) return "ward";
  if (/\b(governor|deputy governor|senator|women rep)\b/.test(t)) return "county";
  return "national";
}

export function normalizeSeatType(
  raw?: string | null,
  entryType?: string | null,
  positionTitle?: string | null,
): SeatType {
  const candidates = [raw, entryType].filter(Boolean).map((x) =>
    String(x).toLowerCase().trim(),
  );
  for (const c of candidates) {
    if (c === "elected" || c.includes("elect")) return "Elected";
    if (c === "nominated" || c.includes("nominat")) return "Nominated";
    if (
      c === "ex-officio" ||
      c === "ex officio" ||
      c.includes("ex-officio") ||
      c.includes("ex officio")
    ) {
      return "Ex-Officio";
    }
    if (c === "appointed" || c.includes("appoint")) return "Appointed";
  }
  const t = (positionTitle || "").toLowerCase();
  if (/\b(cabinet secretary|principal secretary|judge|justice|commission)\b/.test(t)) {
    return "Appointed";
  }
  if (/\bnominat/.test(t)) return "Nominated";
  if (/\b(mp|senator|governor|mca|women rep|member of parliament)\b/.test(t)) {
    return "Elected";
  }
  return "Appointed";
}

export function normalizeRoleStatus(
  raw?: string | null,
  termEndDate?: string | null,
): RoleStatus {
  const s = (raw || "").toLowerCase().trim();
  if (s === "suspended") return "Suspended";
  if (
    s === "former" ||
    s === "ended" ||
    s === "inactive" ||
    s === "completed" ||
    s === "past"
  ) {
    return "Former";
  }
  if (s === "active" || s === "current" || s === "serving") return "Active";
  // Date is source of truth when status blank
  if (termEndDate) return "Former";
  return "Active";
}

/** Only pass UUID strings through to UUID columns; drop integers / empty. */
export function uuidOrOmit(v: unknown): string | null {
  if (v == null || v === "") return null;
  const s = String(v).trim();
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      s,
    )
  ) {
    return s;
  }
  return null; // e.g. positions.id = 1 — cannot store in uuid column
}

/**
 * Build a leader_roles row that satisfies NOT NULL + enums.
 * Strips invalid UUID FKs.
 */
export function buildLeaderRoleRow(input: {
  leaderId: string;
  title: string;
  organization?: string | null;
  constituency?: string | null;
  county?: string | null;
  ward?: string | null;
  party?: string | null;
  level?: string | null;
  term_start_date?: string | null;
  term_end_date?: string | null;
  status?: string | null;
  entry_type?: string | null;
  seat_type?: string | null;
  official_email?: string | null;
  office_location?: string | null;
  position_id?: unknown;
  institution_id?: unknown;
  party_id?: unknown;
  county_id?: unknown;
  constituency_id?: unknown;
  ward_id?: unknown;
  government_level_id?: unknown;
  house?: string | null;
}): Record<string, unknown> {
  const title = input.title.trim();
  const level = normalizeLeaderLevel(input.level, title);
  const seat_type = normalizeSeatType(
    input.seat_type,
    input.entry_type,
    title,
  );
  const term_start_date = input.term_start_date
    ? String(input.term_start_date).slice(0, 10)
    : null;
  const term_end_date = input.term_end_date
    ? String(input.term_end_date).slice(0, 10)
    : null;
  const status = normalizeRoleStatus(input.status, term_end_date);

  if (!term_start_date) {
    throw new Error("term_start_date is required");
  }

  const row: Record<string, unknown> = {
    leader_id: input.leaderId,
    title,
    organization: input.organization || null,
    constituency: input.constituency || null,
    county: input.county || null,
    ward: input.ward || null,
    party: input.party || null,
    level,
    seat_type,
    term_start_date,
    term_end_date,
    status,
    entry_type: input.entry_type || null,
    official_email: input.official_email || null,
    office_location: input.office_location || null,
  };

  if (input.house) row.house = input.house;

  const uuidFields: Array<[string, unknown]> = [
    ["institution_id", input.institution_id],
    ["party_id", input.party_id],
    ["county_id", input.county_id],
    ["constituency_id", input.constituency_id],
    ["ward_id", input.ward_id],
    // position_id / government_level_id only if already UUID
    ["position_id", input.position_id],
    ["government_level_id", input.government_level_id],
  ];
  for (const [k, v] of uuidFields) {
    const u = uuidOrOmit(v);
    if (u) row[k] = u;
    // omit invalid rather than send null/int
  }

  return row;
}

/** Infer house for parliamentary roles */
export function inferHouse(title?: string | null): string | null {
  const t = (title || "").toLowerCase();
  if (/\bsenator\b/.test(t)) return "senate";
  if (
    /\b(member of parliament|national assembly|\bmp\b|women rep|nominated mp)\b/.test(
      t,
    )
  ) {
    return "national-assembly";
  }
  return null;
}
