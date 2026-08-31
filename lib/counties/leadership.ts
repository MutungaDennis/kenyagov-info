/**
 * Resolve current County Governor / Deputy Governor from leader_roles
 * (same rules as county institution overview).
 */

export type CountyLeaderPerson = {
  id: string;
  slug: string | null;
  displayName: string;
  party: string | null;
};

export type CountyLeadershipRow = {
  countyId: string;
  countySlug: string;
  countyName: string;
  countyCode: number | null;
  region: string | null;
  headquarters: string | null;
  governor: CountyLeaderPerson | null;
  deputyGovernor: CountyLeaderPerson | null;
};

type RoleRow = {
  title: string | null;
  status: string | null;
  party: string | null;
  county: string | null;
  county_id: string | null;
  term_end_date: string | null;
  seat_type: string | null;
  entry_type: string | null;
  leaders:
    | {
        id: string;
        slug: string | null;
        first_name: string | null;
        other_names: string | null;
        surname: string | null;
        full_name: string | null;
      }
    | Array<{
        id: string;
        slug: string | null;
        first_name: string | null;
        other_names: string | null;
        surname: string | null;
        full_name: string | null;
      }>
    | null;
};

function norm(s: string | null | undefined): string {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function isRoleActive(role: RoleRow): boolean {
  const s = norm(role.status);
  if (s === "active") return true;
  if (s === "former" || s === "ended" || s === "suspended" || s === "vacant") {
    return false;
  }
  if (!role.term_end_date && (!s || s === "current")) return true;
  return false;
}

function displayName(leader: {
  first_name: string | null;
  other_names: string | null;
  surname: string | null;
  full_name: string | null;
}): string {
  const parts = [leader.first_name, leader.other_names, leader.surname].filter(
    Boolean,
  );
  return parts.join(" ").trim() || leader.full_name || "Unknown";
}

function unwrapLeader(raw: RoleRow["leaders"]) {
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] || null : raw;
}

function classifyExecRole(role: RoleRow): "Governor" | "Deputy Governor" | null {
  const t = norm(role.title);
  if (t.includes("deputy governor")) return "Deputy Governor";
  if (t.includes("governor")) return "Governor";
  return null;
}

type CountyRow = {
  id: string;
  slug: string;
  name: string;
  code: number | null;
  region: string | null;
  headquarters: string | null;
};

/**
 * Join counties with Active Governor / Deputy Governor roles.
 */
export function buildCountyLeadership(
  counties: CountyRow[],
  roles: RoleRow[],
): CountyLeadershipRow[] {
  const byCountyId = new Map<
    string,
    { governor: CountyLeaderPerson | null; deputy: CountyLeaderPerson | null }
  >();
  const byCountyName = new Map<
    string,
    { governor: CountyLeaderPerson | null; deputy: CountyLeaderPerson | null }
  >();

  const ensure = (map: typeof byCountyId, key: string) => {
    if (!map.has(key)) map.set(key, { governor: null, deputy: null });
    return map.get(key)!;
  };

  for (const role of roles || []) {
    if (!isRoleActive(role)) continue;
    const kind = classifyExecRole(role);
    if (!kind) continue;
    const leader = unwrapLeader(role.leaders);
    if (!leader) continue;

    const person: CountyLeaderPerson = {
      id: leader.id,
      slug: leader.slug,
      displayName: displayName(leader),
      party: role.party?.trim() || null,
    };

    if (role.county_id) {
      const bucket = ensure(byCountyId, String(role.county_id));
      if (kind === "Governor" && !bucket.governor) bucket.governor = person;
      if (kind === "Deputy Governor" && !bucket.deputy) bucket.deputy = person;
    }
    if (role.county?.trim()) {
      const key = norm(role.county);
      const bucket = ensure(byCountyName, key);
      if (kind === "Governor" && !bucket.governor) bucket.governor = person;
      if (kind === "Deputy Governor" && !bucket.deputy) bucket.deputy = person;
    }
  }

  return (counties || []).map((c) => {
    const fromId = byCountyId.get(String(c.id));
    const fromName = byCountyName.get(norm(c.name));
    return {
      countyId: String(c.id),
      countySlug: c.slug,
      countyName: c.name,
      countyCode: c.code,
      region: c.region,
      headquarters: c.headquarters,
      governor: fromId?.governor || fromName?.governor || null,
      deputyGovernor: fromId?.deputy || fromName?.deputy || null,
    };
  });
}
