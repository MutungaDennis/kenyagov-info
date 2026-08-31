/**
 * National Assembly / Senate member lists from Supabase leaders + leader_roles.
 */

import {
  createPublicClient,
  isPublicSupabaseConfigured,
} from "@/lib/supabase/public";

export type ParliamentMember = {
  id: string;
  name: string;
  seat: string;
  party: string;
  type: string;
  slug: string | null;
};

function displayName(leader: {
  first_name?: string | null;
  other_names?: string | null;
  surname?: string | null;
  full_name?: string | null;
}): string {
  const parts = [leader.first_name, leader.other_names, leader.surname].filter(
    Boolean,
  );
  return parts.join(" ").trim() || leader.full_name || "Unknown";
}

function isActiveStatus(status: string | null | undefined): boolean {
  const s = (status || "").toLowerCase().trim();
  if (s === "former" || s === "ended" || s === "suspended" || s === "vacant") {
    return false;
  }
  return true;
}

function classifyNaType(title: string, seatType: string | null): string {
  const t = title.toLowerCase();
  const st = (seatType || "").toLowerCase();
  if (t.includes("woman") || st.includes("woman")) return "Women Representative";
  if (t.includes("nominat") || st.includes("nominat")) return "Nominated";
  return "Constituency";
}

function classifySenateType(title: string, seatType: string | null): string {
  const t = title.toLowerCase();
  const st = (seatType || "").toLowerCase();
  if (t.includes("nominat") || st.includes("nominat")) return "Nominated";
  return "Elected";
}

type RoleRow = {
  title: string | null;
  status: string | null;
  party: string | null;
  county: string | null;
  constituency: string | null;
  seat_type: string | null;
  leaders:
    | {
        id: string;
        slug: string | null;
        first_name: string | null;
        other_names: string | null;
        surname: string | null;
        full_name: string | null;
        current_party: string | null;
      }
    | Array<{
        id: string;
        slug: string | null;
        first_name: string | null;
        other_names: string | null;
        surname: string | null;
        full_name: string | null;
        current_party: string | null;
      }>
    | null;
};

function unwrapLeader(raw: RoleRow["leaders"]) {
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] || null : raw;
}

export async function fetchNationalAssemblyMembers(): Promise<
  ParliamentMember[]
> {
  if (!isPublicSupabaseConfigured()) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("leader_roles")
    .select(
      `
      title, status, party, county, constituency, seat_type,
      leaders!leader_roles_leader_id_fkey (
        id, slug, first_name, other_names, surname, full_name, current_party
      )
    `,
    )
    .or(
      "title.ilike.%member of parliament%,title.ilike.%woman representative%,title.ilike.%county woman representative%",
    )
    .limit(800);

  if (error) {
    console.error("[na-members]", error);
    throw new Error(error.message);
  }

  const seen = new Set<string>();
  const out: ParliamentMember[] = [];

  for (const row of (data || []) as RoleRow[]) {
    if (!isActiveStatus(row.status)) continue;
    const leader = unwrapLeader(row.leaders);
    if (!leader?.id) continue;
    if (seen.has(leader.id)) continue;
    seen.add(leader.id);

    const title = row.title || "";
    const type = classifyNaType(title, row.seat_type);
    const seat =
      type === "Women Representative"
        ? row.county
          ? `${row.county} (CWR)`
          : "County Woman Representative"
        : type === "Nominated"
          ? "Nominated"
          : row.constituency || row.county || "—";

    out.push({
      id: leader.id,
      name: displayName(leader),
      seat,
      party: row.party || leader.current_party || "—",
      type,
      slug: leader.slug,
    });
  }

  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

export async function fetchSenateMembers(): Promise<ParliamentMember[]> {
  if (!isPublicSupabaseConfigured()) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("leader_roles")
    .select(
      `
      title, status, party, county, constituency, seat_type,
      leaders!leader_roles_leader_id_fkey (
        id, slug, first_name, other_names, surname, full_name, current_party
      )
    `,
    )
    .ilike("title", "%senator%")
    .limit(400);

  if (error) {
    console.error("[senate-members]", error);
    throw new Error(error.message);
  }

  const seen = new Set<string>();
  const out: ParliamentMember[] = [];

  for (const row of (data || []) as RoleRow[]) {
    if (!isActiveStatus(row.status)) continue;
    const leader = unwrapLeader(row.leaders);
    if (!leader?.id) continue;
    if (seen.has(leader.id)) continue;
    seen.add(leader.id);

    const title = row.title || "";
    const type = classifySenateType(title, row.seat_type);

    out.push({
      id: leader.id,
      name: displayName(leader),
      seat: row.county || (type === "Nominated" ? "National Representation" : "—"),
      party: row.party || leader.current_party || "—",
      type,
      slug: leader.slug,
    });
  }

  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

/** Lightweight county name list for dropdowns (not the bloated static roster). */
export async function fetchCountyNames(): Promise<string[]> {
  if (!isPublicSupabaseConfigured()) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("counties")
    .select("name")
    .order("name", { ascending: true });
  if (error) {
    console.error("[county-names]", error);
    return [];
  }
  return (data || [])
    .map((c) => c.name)
    .filter((n): n is string => Boolean(n));
}
