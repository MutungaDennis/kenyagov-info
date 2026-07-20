/**
 * Resolve reference-table IDs into denormalized text on leader_roles / leaders.
 * Keeps public pages working with text columns while admin picks from DB lists.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildLeaderRoleRow,
  inferHouse,
  normalizeLeaderLevel,
  uuidOrOmit,
} from "@/lib/leaders/role-normalize";

export type ResolvedRoleRefs = {
  title: string | null;
  organization: string | null;
  party: string | null;
  county: string | null;
  constituency: string | null;
  ward: string | null;
  level: string | null;
  position_id?: string | number | null;
  institution_id?: string | number | null;
  party_id?: string | number | null;
  county_id?: string | number | null;
  constituency_id?: string | number | null;
  ward_id?: string | number | null;
  government_level_id?: string | number | null;
};

function emptyToNull(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s || null;
}

function idOrNull(v: unknown): string | number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v).trim();
  if (!s) return null;
  if (/^\d+$/.test(s)) return Number(s);
  return s;
}

async function fetchOne(
  supabase: SupabaseClient,
  table: string,
  id: string | number,
  columns: string,
): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase
    .from(table)
    .select(columns)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as Record<string, unknown>;
}

/**
 * Given body fields (IDs and/or free text), produce display text + optional FKs.
 */
export async function resolveRolePayload(
  supabase: SupabaseClient,
  body: Record<string, unknown>,
): Promise<ResolvedRoleRefs & Record<string, unknown>> {
  const out: ResolvedRoleRefs & Record<string, unknown> = {
    title: emptyToNull(body.title),
    organization: emptyToNull(body.organization),
    party: emptyToNull(body.party),
    county: emptyToNull(body.county),
    constituency: emptyToNull(body.constituency),
    ward: emptyToNull(body.ward),
    level: emptyToNull(body.level),
  };

  const position_id = idOrNull(body.position_id);
  const institution_id = idOrNull(body.institution_id);
  const party_id = idOrNull(body.party_id);
  const county_id = idOrNull(body.county_id);
  const constituency_id = idOrNull(body.constituency_id);
  const ward_id = idOrNull(body.ward_id);
  const government_level_id = idOrNull(body.government_level_id);

  // positions.id is integer — resolve title only; do not store as UUID position_id
  if (position_id != null) {
    const pos = await fetchOne(
      supabase,
      "positions",
      position_id,
      "id, title, code, level",
    );
    if (pos) {
      if (!out.title && pos.title) out.title = String(pos.title);
      if (!out.level && pos.level) {
        out.level = normalizeLeaderLevel(String(pos.level), out.title);
      }
    }
    // Only keep position_id if it is already a UUID (unlikely from positions table)
    const asUuid = uuidOrOmit(position_id);
    if (asUuid) out.position_id = asUuid;
  }

  if (institution_id != null) {
    const asUuid = uuidOrOmit(institution_id);
    if (asUuid) out.institution_id = asUuid;
    const inst = await fetchOne(
      supabase,
      "institutions",
      institution_id,
      "id, name, short_name, government_level",
    );
    if (inst) {
      out.organization =
        (inst.name ? String(inst.name) : null) ||
        (inst.short_name ? String(inst.short_name) : null) ||
        out.organization;
      if (!out.level && inst.government_level) {
        out.level = normalizeLeaderLevel(
          String(inst.government_level),
          out.title,
        );
      }
    }
  }

  if (party_id != null) {
    const asUuid = uuidOrOmit(party_id);
    if (asUuid) out.party_id = asUuid;
    const party = await fetchOne(
      supabase,
      "political_parties",
      party_id,
      "id, name, abbreviation",
    );
    if (party) {
      out.party =
        (party.abbreviation ? String(party.abbreviation) : null) ||
        (party.name ? String(party.name) : null) ||
        out.party;
    }
  }

  if (county_id != null) {
    const asUuid = uuidOrOmit(county_id);
    if (asUuid) out.county_id = asUuid;
    const county = await fetchOne(
      supabase,
      "counties",
      county_id,
      "id, name, code",
    );
    if (county?.name) out.county = String(county.name);
  }

  if (constituency_id != null) {
    const asUuid = uuidOrOmit(constituency_id);
    if (asUuid) out.constituency_id = asUuid;
    const c = await fetchOne(
      supabase,
      "constituencies",
      constituency_id,
      "id, name, county_id",
    );
    if (c?.name) out.constituency = String(c.name);
    if (!out.county && c?.county_id != null) {
      const cid = c.county_id as string | number;
      const asCountyUuid = uuidOrOmit(cid);
      if (asCountyUuid) out.county_id = asCountyUuid;
      const county = await fetchOne(supabase, "counties", cid, "id, name");
      if (county?.name) out.county = String(county.name);
    }
  }

  if (ward_id != null) {
    const asUuid = uuidOrOmit(ward_id);
    if (asUuid) out.ward_id = asUuid;
    const w = await fetchOne(
      supabase,
      "wards",
      ward_id,
      "id, name, constituency_id",
    );
    if (w?.name) out.ward = String(w.name);
  }

  // government_levels.id is integer — only use for text level, never as UUID FK
  if (government_level_id != null) {
    const asUuid = uuidOrOmit(government_level_id);
    if (asUuid) out.government_level_id = asUuid;
    else {
      const lvl = await fetchOne(
        supabase,
        "government_levels",
        government_level_id,
        "id, name, code",
      );
      if (lvl?.name || lvl?.code) {
        out.level = normalizeLeaderLevel(
          String(lvl.name || lvl.code),
          out.title,
        );
      }
    }
  }

  // Normalize level from free text / government_level_id label
  if (out.level || body.level) {
    out.level = normalizeLeaderLevel(
      String(out.level || body.level || ""),
      out.title,
    );
  }

  return out;
}

function missingColumnFromError(message: string): string | null {
  const m =
    message.match(/Could not find the '([^']+)' column/i) ||
    message.match(/column ["']?([a-z0-9_]+)["']? .*does not exist/i) ||
    message.match(/null value in column "([^"]+)"/i);
  return m?.[1] || null;
}

export async function insertRoleWithFallback(
  supabase: SupabaseClient,
  row: Record<string, unknown>,
): Promise<{
  data: Record<string, unknown> | null;
  error: { message: string } | null;
  dropped?: string[];
}> {
  const working = { ...row };
  const dropped: string[] = [];

  for (let attempt = 0; attempt < 15; attempt++) {
    const { data, error } = await supabase
      .from("leader_roles")
      .insert(working)
      .select("*")
      .single();

    if (!error) {
      return { data: data as Record<string, unknown>, error: null, dropped };
    }

    const msg = error.message || "";
    const col = missingColumnFromError(msg);

    // Invalid UUID / enum on a specific field
    const enumMatch = msg.match(/invalid input value for enum \w+: "([^"]+)"/i);
    const uuidMatch = msg.match(/invalid input syntax for type uuid: "([^"]+)"/i);

    if (uuidMatch) {
      // Drop any field whose value equals the bad uuid string
      const bad = uuidMatch[1];
      let removed = false;
      for (const [k, v] of Object.entries(working)) {
        if (v != null && String(v) === bad) {
          delete working[k];
          dropped.push(k);
          removed = true;
        }
      }
      if (removed) continue;
    }

    if (enumMatch && col) {
      // Should not happen if we normalize — drop field as last resort
      if (col in working && col !== "level" && col !== "seat_type" && col !== "status") {
        delete working[col];
        dropped.push(col);
        continue;
      }
    }

    if (col && col in working && !["leader_id", "title", "level", "seat_type", "term_start_date"].includes(col)) {
      delete working[col];
      dropped.push(col);
      continue;
    }

    if (/schema cache|column|does not exist/i.test(msg)) {
      const optional = [
        "entry_type",
        "position_id",
        "institution_id",
        "party_id",
        "county_id",
        "constituency_id",
        "ward_id",
        "government_level_id",
        "house",
        "official_email",
        "office_location",
        "description",
      ];
      let removed = false;
      for (const k of optional) {
        if (k in working) {
          delete working[k];
          dropped.push(k);
          removed = true;
          break;
        }
      }
      if (removed) continue;
    }

    return { data: null, error: { message: msg }, dropped };
  }

  return {
    data: null,
    error: { message: "Insert failed after retries" },
    dropped,
  };
}

export async function updateRoleWithFallback(
  supabase: SupabaseClient,
  leaderId: string,
  roleId: string,
  patch: Record<string, unknown>,
): Promise<{
  data: Record<string, unknown> | null;
  error: { message: string } | null;
  dropped?: string[];
}> {
  const working = { ...patch };
  const dropped: string[] = [];

  for (let attempt = 0; attempt < 15; attempt++) {
    const { data, error } = await supabase
      .from("leader_roles")
      .update(working)
      .eq("id", roleId)
      .eq("leader_id", leaderId)
      .select("*")
      .single();

    if (!error) {
      return { data: data as Record<string, unknown>, error: null, dropped };
    }

    const msg = error.message || "";
    const col = missingColumnFromError(msg);
    const uuidMatch = msg.match(/invalid input syntax for type uuid: "([^"]+)"/i);

    if (uuidMatch) {
      const bad = uuidMatch[1];
      let removed = false;
      for (const [k, v] of Object.entries(working)) {
        if (v != null && String(v) === bad) {
          delete working[k];
          dropped.push(k);
          removed = true;
        }
      }
      if (removed) continue;
    }

    if (col && col in working) {
      delete working[col];
      dropped.push(col);
      continue;
    }

    if (/schema cache|column|does not exist/i.test(msg)) {
      const optional = [
        "entry_type",
        "position_id",
        "institution_id",
        "party_id",
        "county_id",
        "constituency_id",
        "ward_id",
        "government_level_id",
        "house",
      ];
      let removed = false;
      for (const k of optional) {
        if (k in working) {
          delete working[k];
          dropped.push(k);
          removed = true;
          break;
        }
      }
      if (removed) continue;
    }

    return { data: null, error: { message: msg }, dropped };
  }

  return {
    data: null,
    error: { message: "Update failed after retries" },
    dropped,
  };
}

/** Convenience: resolve body + build enum-safe insert row */
export async function prepareRoleInsert(
  supabase: SupabaseClient,
  leaderId: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const resolved = await resolveRolePayload(supabase, body);
  const title = String(resolved.title || "").trim();
  if (!title) {
    throw new Error(
      "title or position_id is required (pick a position from the list)",
    );
  }

  const row = buildLeaderRoleRow({
    leaderId,
    title,
    organization: resolved.organization,
    constituency: resolved.constituency,
    county: resolved.county,
    ward: resolved.ward,
    party: resolved.party,
    level: resolved.level || (body.level as string) || null,
    term_start_date: body.term_start_date
      ? String(body.term_start_date).slice(0, 10)
      : null,
    term_end_date: body.term_end_date
      ? String(body.term_end_date).slice(0, 10)
      : null,
    status: body.status ? String(body.status) : null,
    entry_type: body.entry_type ? String(body.entry_type) : null,
    seat_type: body.seat_type ? String(body.seat_type) : null,
    official_email: body.official_email ? String(body.official_email) : null,
    office_location: body.office_location
      ? String(body.office_location)
      : null,
    position_id: resolved.position_id,
    institution_id: resolved.institution_id,
    party_id: resolved.party_id,
    county_id: resolved.county_id,
    constituency_id: resolved.constituency_id,
    ward_id: resolved.ward_id,
    government_level_id: resolved.government_level_id,
    house: body.house
      ? String(body.house)
      : inferHouse(title) || null,
  });

  return row;
}
