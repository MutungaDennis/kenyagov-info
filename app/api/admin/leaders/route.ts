import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, slugify } from "@/lib/admin-api";
import { nameForSlug, splitFullName } from "@/lib/leaders/display";
import {
  normalizeSocialUrl,
  parseNameTitles,
  parseNationalHonours,
  parseSocialLinks,
  socialLinksToRecord,
  sortNameTitles,
  sortNationalHonours,
} from "@/lib/leaders/titles-social";

export const dynamic = "force-dynamic";

// Explicit FK — multiple relationships exist between leaders and leader_roles
const LEADER_ROLES_EMBED = `leader_roles!leader_roles_leader_id_fkey (
  id, title, organization, status, term_start_date, term_end_date
)`;

const LEADER_LIST_SELECT = `id, slug, full_name, first_name, other_names, surname, title,
       current_party, current_constituency, current_county, current_organization,
       level, image_url, is_active, status, updated_at,
       ${LEADER_ROLES_EMBED}`;

const LEADER_LIST_SELECT_BASIC = `id, slug, full_name, first_name, other_names, surname, title,
         current_party, current_constituency, current_county, current_organization,
         level, image_url, is_active, status, updated_at`;

/**
 * Admin leaders list / create.
 * full_name is GENERATED — insert first_name + surname only.
 *
 * Query params:
 * - q: search name, org, seat, party, role title (via roles)
 * - organization: filter by organisation (current_organization or any leader_roles.organization)
 * - sort: default | az | za
 * - active: 1 = active only
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const organization = searchParams.get("organization")?.trim() || "";
  const sort = (searchParams.get("sort") || "default").toLowerCase();
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "50", 10)),
  );
  const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10));
  const activeOnly = searchParams.get("active") === "1";

  // --- Organisation FILTER (value from dropdown) ---
  // Collect leader IDs that hold/held this organisation via leader_roles
  // or leaders.current_organization. Use eq first; also ilike for trim/case variants.
  let orgLeaderIds: string[] | null = null;
  if (organization.length >= 1) {
    const ids = new Set<string>();
    const orgSafe = organization.replace(/[%_]/g, " ").trim();

    const { data: roleEq } = await auth.supabase
      .from("leader_roles")
      .select("leader_id")
      .eq("organization", organization)
      .limit(3000);
    for (const r of roleEq || []) {
      if (r.leader_id) ids.add(String(r.leader_id));
    }
    // Broader match if exact returned nothing (whitespace / casing)
    if (ids.size === 0) {
      const { data: roleLike } = await auth.supabase
        .from("leader_roles")
        .select("leader_id")
        .ilike("organization", orgSafe)
        .limit(3000);
      for (const r of roleLike || []) {
        if (r.leader_id) ids.add(String(r.leader_id));
      }
    }
    if (ids.size === 0) {
      const { data: roleContains } = await auth.supabase
        .from("leader_roles")
        .select("leader_id")
        .ilike("organization", `%${orgSafe}%`)
        .limit(3000);
      for (const r of roleContains || []) {
        if (r.leader_id) ids.add(String(r.leader_id));
      }
    }

    const { data: snapEq } = await auth.supabase
      .from("leaders")
      .select("id")
      .eq("current_organization", organization)
      .limit(2000);
    for (const r of snapEq || []) {
      if (r.id) ids.add(String(r.id));
    }
    if (ids.size === 0) {
      const { data: snapLike } = await auth.supabase
        .from("leaders")
        .select("id")
        .ilike("current_organization", `%${orgSafe}%`)
        .limit(2000);
      for (const r of snapLike || []) {
        if (r.id) ids.add(String(r.id));
      }
    }
    orgLeaderIds = Array.from(ids);
  }

  // --- Free-text search via roles (org/title/seat) ---
  let searchRoleIds: string[] = [];
  if (q.length >= 2) {
    const qSafe = q.replace(/[%_,]/g, " ").trim();
    const { data: roleRows } = await auth.supabase
      .from("leader_roles")
      .select("leader_id")
      .or(
        `organization.ilike.%${qSafe}%,title.ilike.%${qSafe}%,constituency.ilike.%${qSafe}%,county.ilike.%${qSafe}%,party.ilike.%${qSafe}%`,
      )
      .limit(2000);
    for (const r of roleRows || []) {
      if (r.leader_id) searchRoleIds.push(String(r.leader_id));
    }
    searchRoleIds = Array.from(new Set(searchRoleIds));
  }

  // default and az: surname A–Z; za: reverse
  const orderAsc = sort === "za" ? false : true;

  let query = auth.supabase
    .from("leaders")
    .select(LEADER_LIST_SELECT, { count: "exact" })
    .order("surname", { ascending: orderAsc })
    .order("first_name", { ascending: orderAsc })
    .range(offset, offset + limit - 1);

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  // Organisation filter: restrict to leaders in orgLeaderIds (or none)
  if (organization.length >= 1) {
    if (!orgLeaderIds || orgLeaderIds.length === 0) {
      // No matches — return empty without query
      return NextResponse.json({
        data: [],
        total: 0,
        limit,
        offset,
        sort,
        organization,
        q: q || undefined,
        organizations: undefined,
      });
    }
    // PostgREST: filter id in list
    query = query.in("id", orgLeaderIds.slice(0, 500));
  }

  // Free-text search (ANDed with organisation filter when both set)
  if (q.length >= 2) {
    const qSafe = q.replace(/[%_,]/g, " ").trim();
    const leaderText = [
      `full_name.ilike.%${qSafe}%`,
      `first_name.ilike.%${qSafe}%`,
      `other_names.ilike.%${qSafe}%`,
      `surname.ilike.%${qSafe}%`,
      `current_constituency.ilike.%${qSafe}%`,
      `current_county.ilike.%${qSafe}%`,
      `current_party.ilike.%${qSafe}%`,
      `current_organization.ilike.%${qSafe}%`,
      `title.ilike.%${qSafe}%`,
      `slug.ilike.%${qSafe}%`,
    ];
    if (searchRoleIds.length > 0) {
      const idList = searchRoleIds.slice(0, 200).join(",");
      leaderText.push(`id.in.(${idList})`);
    }
    query = query.or(leaderText.join(","));
  }

  let { data, error, count } = await query;

  // If ambiguous embed or other select issue, retry with explicit FK embed variants
  if (error && /relationship|embed|leader_roles/i.test(error.message)) {
    const retrySelect = `id, slug, full_name, first_name, other_names, surname, title,
       current_party, current_constituency, current_county, current_organization,
       level, image_url, is_active, status, updated_at,
       leader_roles!leader_id ( id, title, organization, status, term_start_date, term_end_date )`;
    let qRetry = auth.supabase
      .from("leaders")
      .select(retrySelect, { count: "exact" })
      .order("surname", { ascending: orderAsc })
      .order("first_name", { ascending: orderAsc })
      .range(offset, offset + limit - 1);
    if (activeOnly) qRetry = qRetry.eq("is_active", true);
    if (organization.length >= 1 && orgLeaderIds?.length) {
      qRetry = qRetry.in("id", orgLeaderIds.slice(0, 500));
    }
    if (q.length >= 2) {
      const qSafe = q.replace(/[%_,]/g, " ").trim();
      const leaderText = [
        `full_name.ilike.%${qSafe}%`,
        `first_name.ilike.%${qSafe}%`,
        `other_names.ilike.%${qSafe}%`,
        `surname.ilike.%${qSafe}%`,
        `current_organization.ilike.%${qSafe}%`,
        `title.ilike.%${qSafe}%`,
      ];
      if (searchRoleIds.length > 0) {
        leaderText.push(`id.in.(${searchRoleIds.slice(0, 200).join(",")})`);
      }
      qRetry = qRetry.or(leaderText.join(","));
    }
    const resRetry = await qRetry;
    data = resRetry.data;
    error = resRetry.error;
    count = resRetry.count;
  }

  if (error) {
    // Final fallback: no roles embed, but KEEP organisation filter via id list
    let q2 = auth.supabase
      .from("leaders")
      .select(LEADER_LIST_SELECT_BASIC, { count: "exact" })
      .order("surname", { ascending: orderAsc })
      .range(offset, offset + limit - 1);
    if (activeOnly) q2 = q2.eq("is_active", true);
    if (organization.length >= 1) {
      if (!orgLeaderIds || orgLeaderIds.length === 0) {
        return NextResponse.json({
          data: [],
          total: 0,
          limit,
          offset,
          sort,
          organization,
          q: q || undefined,
        });
      }
      q2 = q2.in("id", orgLeaderIds.slice(0, 500));
    }
    if (q.length >= 2) {
      const qSafe = q.replace(/[%_,]/g, " ").trim();
      const leaderText = [
        `full_name.ilike.%${qSafe}%`,
        `first_name.ilike.%${qSafe}%`,
        `surname.ilike.%${qSafe}%`,
        `current_organization.ilike.%${qSafe}%`,
        `current_constituency.ilike.%${qSafe}%`,
        `title.ilike.%${qSafe}%`,
      ];
      if (searchRoleIds.length > 0) {
        leaderText.push(`id.in.(${searchRoleIds.slice(0, 200).join(",")})`);
      }
      q2 = q2.or(leaderText.join(","));
    }
    const res2 = await q2;
    if (res2.error) {
      return NextResponse.json({ error: res2.error.message }, { status: 500 });
    }
    // Attach roles in a second query for list display
    const rows = res2.data || [];
    const ids = rows.map((r: { id: string }) => r.id);
    let rolesByLeader: Record<string, unknown[]> = {};
    if (ids.length) {
      const { data: roleRows } = await auth.supabase
        .from("leader_roles")
        .select(
          "id, leader_id, title, organization, status, term_start_date, term_end_date",
        )
        .in("leader_id", ids);
      for (const r of roleRows || []) {
        const lid = String((r as { leader_id: string }).leader_id);
        if (!rolesByLeader[lid]) rolesByLeader[lid] = [];
        rolesByLeader[lid].push(r);
      }
    }
    const merged = rows.map((r: { id: string }) => ({
      ...r,
      leader_roles: rolesByLeader[r.id] || [],
    }));
    return NextResponse.json({
      data: merged,
      total: res2.count ?? 0,
      limit,
      offset,
      sort,
      organization: organization || undefined,
      q: q || undefined,
    });
  }

  return NextResponse.json({
    data: data || [],
    total: count ?? 0,
    limit,
    offset,
    sort,
    organization: organization || undefined,
    q: q || undefined,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let first_name = body.first_name ? String(body.first_name).trim() : "";
  let other_names = body.other_names ? String(body.other_names).trim() : null;
  let surname = body.surname ? String(body.surname).trim() : "";

  if ((!first_name || !surname) && body.full_name) {
    const parts = splitFullName(String(body.full_name));
    if (!first_name) first_name = parts.first_name;
    if (!other_names) other_names = parts.other_names;
    if (!surname) surname = parts.surname;
  }

  if (!first_name || !surname) {
    return NextResponse.json(
      {
        error:
          "first_name and surname are required (full_name is generated by the database).",
      },
      { status: 400 },
    );
  }

  // Slug without honorifics — name parts only
  const forSlug = nameForSlug({ first_name, other_names, surname });
  let slug = String(body.slug || "").trim() || slugify(forSlug);
  if (!slug) slug = `leader-${Date.now()}`;

  const row: Record<string, unknown> = {
    first_name,
    other_names: other_names || null,
    surname,
    slug,
    title: body.title ? String(body.title) : null,
    current_party: body.current_party ? String(body.current_party) : null,
    current_constituency: body.current_constituency
      ? String(body.current_constituency)
      : null,
    current_county: body.current_county ? String(body.current_county) : null,
    current_organization: body.current_organization
      ? String(body.current_organization)
      : null,
    level: body.level ? String(body.level) : null,
    bio: body.bio ? String(body.bio) : null,
    image_url: body.image_url ? String(body.image_url) : null,
    contact_email: body.contact_email ? String(body.contact_email) : null,
    phone: body.phone ? String(body.phone) : null,
    official_website: body.official_website
      ? String(body.official_website)
      : null,
    is_active: body.is_active !== false,
    status: body.status ? String(body.status) : "Active",
  };

  if (body.name_titles != null) {
    row.name_titles = sortNameTitles(parseNameTitles(body.name_titles));
  }
  if (body.national_honours != null) {
    row.national_honours = sortNationalHonours(
      parseNationalHonours(body.national_honours),
    );
  }
  if (body.social_media != null) {
    const links = parseSocialLinks(body.social_media).map((l) => ({
      platform: l.platform,
      url: normalizeSocialUrl(l.url),
    }));
    row.social_media = socialLinksToRecord(links);
  }
  if (body.academic_qualifications != null) {
    row.academic_qualifications = body.academic_qualifications;
  }

  const { data, error } = await auth.supabase
    .from("leaders")
    .insert(row)
    .select("id, slug, full_name, first_name, surname")
    .single();

  if (error) {
    delete row.academic_qualifications;
    delete row.name_titles;
    delete row.national_honours;
    delete row.social_media;
    delete row.is_active;
    delete row.status;
    const res2 = await auth.supabase
      .from("leaders")
      .insert(row)
      .select("id, slug, full_name, first_name, surname")
      .single();
    if (res2.error) {
      return NextResponse.json(
        {
          error: res2.error.message,
          hint: "Do not send full_name — it is generated from first_name and surname.",
        },
        { status: 500 },
      );
    }
    return NextResponse.json({ data: res2.data }, { status: 201 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
