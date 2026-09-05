import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

type LeaderRow = {
  id: string;
  slug: string;
  full_name: string | null;
  first_name: string | null;
  other_names: string | null;
  surname: string | null;
  title: string | null;
  current_organization: string | null;
  is_active: boolean | null;
};

type RoleRow = {
  id: string;
  leader_id: string;
  title: string | null;
  organization: string | null;
  constituency: string | null;
  county: string | null;
  ward: string | null;
  party: string | null;
  status: string | null;
  term_start_date: string | null;
  term_end_date: string | null;
};

type InstitutionRow = {
  id: string;
  slug: string;
  name: string;
  short_name: string | null;
  official_name: string | null;
  former_names: string[] | null;
  aliases: string[] | null;
  common_misspellings: string[] | null;
  institution_type: string | null;
  institution_category: string | null;
  government_level: string | null;
  established_date: string | null;
  operational_date: string | null;
  status: string | null;
  predecessor_institution_id: string | null;
  successor_institution_id: string | null;
};

function clean(value: string) {
  return value.replace(/[%_,]/g, " ").replace(/\s+/g, " ").trim();
}

function dateMatchesRole(
  noticeDate: string | null,
  start: string | null,
  end: string | null,
) {
  if (!noticeDate) return false;
  const date = noticeDate.slice(0, 10);
  if (start && date < start.slice(0, 10)) return false;
  if (end && date > end.slice(0, 10)) return false;
  return true;
}

function leaderName(row: LeaderRow) {
  return (
    [row.first_name, row.other_names, row.surname]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    row.full_name ||
    "Unknown"
  );
}

function termLabel(start: string | null, end: string | null) {
  if (!start && !end) return "Dates not recorded";
  if (start && !end) return `${start} – present`;
  if (!start && end) return `Ended ${end}`;
  return `${start} – ${end}`;
}

function normaliseArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const q = clean(searchParams.get("q") || "");
  const kind = searchParams.get("kind") || "people";
  const noticeDate = searchParams.get("notice_date") || null;

  if (q.length < 2) {
    return NextResponse.json({ data: [] });
  }

  if (kind === "people") {
    const tokens = q
      .replace(/[(),]/g, " ")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 2);

    if (tokens.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Build the leaders query so multi-word names work across separate fields.
    // Example: "Martha Koome" can match first_name=Martha AND surname=Koome.
    let leaderMatchQuery = auth.supabase
      .from("leaders")
      .select(
        "id, slug, full_name, first_name, other_names, surname, title, current_organization, is_active",
      );

    for (const token of tokens) {
      leaderMatchQuery = leaderMatchQuery.or(
        `full_name.ilike.%${token}%,first_name.ilike.%${token}%,other_names.ilike.%${token}%,surname.ilike.%${token}%,title.ilike.%${token}%,current_organization.ilike.%${token}%`,
      );
    }

    // Search historical roles separately. All these searched columns are text.
    // Chaining one OR group per token gives useful multi-word matching such as
    // "Chief Justice" or "National Treasury".
    let roleMatchQuery = auth.supabase
      .from("leader_roles")
      .select(
        "id, leader_id, title, organization, constituency, county, ward, party, status, term_start_date, term_end_date",
      );

    for (const token of tokens) {
      roleMatchQuery = roleMatchQuery.or(
        `title.ilike.%${token}%,organization.ilike.%${token}%,constituency.ilike.%${token}%,county.ilike.%${token}%,ward.ilike.%${token}%,party.ilike.%${token}%`,
      );
    }

    // IMPORTANT:
    // mcas.assembly_role is an enum in the current schema, so do NOT use ILIKE
    // against it. Search only text name fields here. Once an MCA matches, their
    // assembly_role is still returned for display.
    let mcaMatchQuery = auth.supabase
      .from("mcas")
      .select(
        "id, slug, first_name, other_names, surname, assembly_role, status, term_start_date, term_end_date, county_id, ward_id",
      );

    for (const token of tokens) {
      mcaMatchQuery = mcaMatchQuery.or(
        `first_name.ilike.%${token}%,other_names.ilike.%${token}%,surname.ilike.%${token}%`,
      );
    }

    const [leaderMatchRes, roleMatchRes, mcaRes] = await Promise.all([
      leaderMatchQuery.limit(60),
      roleMatchQuery.limit(300),
      mcaMatchQuery.limit(60),
    ]);

    // Do not allow an MCA-only search problem to hide valid leaders.
    // Leaders are the primary result set here.
    if (leaderMatchRes.error) {
      console.error("Gazette leader search failed:", leaderMatchRes.error);
      return NextResponse.json(
        {
          error: leaderMatchRes.error.message,
          source: "leaders",
        },
        { status: 500 },
      );
    }

    if (roleMatchRes.error) {
      console.error("Gazette leader role search failed:", roleMatchRes.error);
      return NextResponse.json(
        {
          error: roleMatchRes.error.message,
          source: "leader_roles",
        },
        { status: 500 },
      );
    }

    if (mcaRes.error) {
      console.error("Gazette MCA search failed:", mcaRes.error);
      // Continue with leaders rather than returning an empty People search.
    }

    const matchedLeaderIds = new Set<string>();

    for (const row of leaderMatchRes.data || []) {
      matchedLeaderIds.add(row.id);
    }

    for (const row of roleMatchRes.data || []) {
      if (row.leader_id) matchedLeaderIds.add(row.leader_id);
    }

    const leadersRes =
      matchedLeaderIds.size > 0
        ? await auth.supabase
            .from("leaders")
            .select(
              "id, slug, full_name, first_name, other_names, surname, title, current_organization, is_active",
            )
            .in("id", Array.from(matchedLeaderIds))
        : { data: [], error: null };

    if (leadersRes.error) {
      return NextResponse.json(
        {
          error: leadersRes.error.message,
          source: "leaders_hydration",
        },
        { status: 500 },
      );
    }

    // Fetch ALL roles for matched people, not only the role that matched the
    // search phrase. This is what allows the same person to appear once for
    // every current/former position and lets the editor choose the correct
    // historical capacity.
    const allRoleRes =
      matchedLeaderIds.size > 0
        ? await auth.supabase
            .from("leader_roles")
            .select(
              "id, leader_id, title, organization, constituency, county, ward, party, status, term_start_date, term_end_date",
            )
            .in("leader_id", Array.from(matchedLeaderIds))
            .order("term_start_date", { ascending: false })
        : { data: [], error: null };

    if (allRoleRes.error) {
      return NextResponse.json(
        {
          error: allRoleRes.error.message,
          source: "leader_roles_hydration",
        },
        { status: 500 },
      );
    }

    const leaders = (leadersRes.data || []) as LeaderRow[];
    const roles = (allRoleRes.data || []) as RoleRow[];
    const roleMap = new Map<string, RoleRow[]>();

    for (const role of roles) {
      const existing = roleMap.get(role.leader_id) || [];
      existing.push(role);
      roleMap.set(role.leader_id, existing);
    }

    const results: Array<Record<string, unknown>> = [];

    for (const leader of leaders) {
      const personRoles = roleMap.get(leader.id) || [];

      // Keep a useful fallback result even if this leader has no leader_roles
      // rows yet.
      if (personRoles.length === 0) {
        results.push({
          kind: "leader",
          id: `leader:${leader.id}:snapshot`,
          person_id: leader.id,
          slug: leader.slug,
          name: leaderName(leader),
          role_id: null,
          role_title: leader.title,
          organization: leader.current_organization,
          term_start_date: null,
          term_end_date: null,
          status: leader.is_active === false ? "Inactive" : "Active",
          matches_notice_date: false,
          description:
            [leader.title, leader.current_organization, "Current profile snapshot"]
              .filter(Boolean)
              .join(" · ") || "Government official",
          public_url: `/government/people/${leader.slug}`,
        });
        continue;
      }

      for (const role of personRoles) {
        const matchesDate = dateMatchesRole(
          noticeDate,
          role.term_start_date,
          role.term_end_date,
        );

        results.push({
          kind: "leader",
          id: `leader:${leader.id}:role:${role.id}`,
          person_id: leader.id,
          slug: leader.slug,
          name: leaderName(leader),
          role_id: role.id,
          role_title: role.title,
          organization: role.organization,
          constituency: role.constituency,
          county: role.county,
          ward: role.ward,
          party: role.party,
          term_start_date: role.term_start_date,
          term_end_date: role.term_end_date,
          status: role.status,
          matches_notice_date: matchesDate,
          description: [
            role.title,
            role.organization,
            role.constituency || role.county || role.ward,
            termLabel(role.term_start_date, role.term_end_date),
            role.status,
          ]
            .filter(Boolean)
            .join(" · "),
          public_url: `/government/people/${leader.slug}`,
        });
      }
    }

    // MCAs still appear in the unified People resolver, but an MCA search
    // failure can no longer prevent leaders from appearing.
    if (!mcaRes.error) {
      for (const mca of mcaRes.data || []) {
        results.push({
          kind: "mca",
          id: `mca:${mca.id}`,
          person_id: mca.id,
          slug: mca.slug,
          name: [mca.first_name, mca.other_names, mca.surname]
            .filter(Boolean)
            .join(" ")
            .trim(),
          role_id: null,
          role_title: mca.assembly_role,
          organization: null,
          term_start_date: mca.term_start_date,
          term_end_date: mca.term_end_date,
          status: mca.status,
          matches_notice_date: dateMatchesRole(
            noticeDate,
            mca.term_start_date,
            mca.term_end_date,
          ),
          description: [
            mca.assembly_role,
            termLabel(mca.term_start_date, mca.term_end_date),
            mca.status,
          ]
            .filter(Boolean)
            .join(" · "),
          public_url: `/government/people/${mca.slug}`,
        });
      }
    }

    // Gazette-date role first, then person name, then newest role first.
    results.sort((a, b) => {
      const aDateMatch = a.matches_notice_date ? 1 : 0;
      const bDateMatch = b.matches_notice_date ? 1 : 0;

      if (aDateMatch !== bDateMatch) {
        return bDateMatch - aDateMatch;
      }

      const nameCompare = String(a.name || "").localeCompare(
        String(b.name || ""),
      );

      if (nameCompare !== 0) return nameCompare;

      return String(b.term_start_date || "").localeCompare(
        String(a.term_start_date || ""),
      );
    });

    return NextResponse.json({
      data: results.slice(0, 120),
      meta: {
        matched_leaders: leaders.length,
        matched_roles: roles.length,
        mca_search_available: !mcaRes.error,
      },
    });
  }

  if (kind === "institutions") {
    let primaryQuery = auth.supabase
      .from("institutions")
      .select(
        `id, slug, name, short_name, official_name, former_names, aliases,
         common_misspellings, institution_type, institution_category,
         government_level, established_date, operational_date, status,
         predecessor_institution_id, successor_institution_id`,
      )
      .limit(50);

    // Reuse the same search_vector approach already used by the main institution admin.
    primaryQuery = primaryQuery.textSearch("search_vector", q, {
      type: "plain",
      config: "english",
    });

    let { data, error } = await primaryQuery;

    // Fallback for databases where the search vector has not yet been refreshed.
    if (error || !data?.length) {
      const fallback = await auth.supabase
        .from("institutions")
        .select(
          `id, slug, name, short_name, official_name, former_names, aliases,
           common_misspellings, institution_type, institution_category,
           government_level, established_date, operational_date, status,
           predecessor_institution_id, successor_institution_id`,
        )
        .or(
          `name.ilike.%${q}%,short_name.ilike.%${q}%,official_name.ilike.%${q}%`,
        )
        .limit(50);

      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const results: Array<Record<string, unknown>> = [];

    for (const row of (data || []) as InstitutionRow[]) {
      const aliases = [
        ...normaliseArray(row.former_names).map((name) => ({
          value: name,
          type: "Former name",
        })),
        ...normaliseArray(row.aliases).map((name) => ({
          value: name,
          type: "Alias",
        })),
        ...normaliseArray(row.common_misspellings).map((name) => ({
          value: name,
          type: "Common spelling",
        })),
      ];

      // Current identity.
      results.push({
        kind: "institution",
        id: `${row.id}:current`,
        institution_id: row.id,
        slug: row.slug,
        name: row.name,
        historical_label: row.name,
        name_type: "Current name",
        institution_type: row.institution_type,
        institution_category: row.institution_category,
        government_level: row.government_level,
        established_date: row.established_date,
        operational_date: row.operational_date,
        status: row.status,
        predecessor_institution_id: row.predecessor_institution_id,
        successor_institution_id: row.successor_institution_id,
        description: [
          "Current name",
          row.institution_type,
          row.government_level,
          row.status,
        ]
          .filter(Boolean)
          .join(" · "),
        public_url: `/government/institutions/${row.slug}`,
      });

      // Historical/alternate identities all point to the same institution UUID.
      for (const alias of aliases) {
        results.push({
          kind: "institution",
          id: `${row.id}:${alias.type}:${alias.value}`,
          institution_id: row.id,
          slug: row.slug,
          name: alias.value,
          historical_label: alias.value,
          current_name: row.name,
          name_type: alias.type,
          institution_type: row.institution_type,
          institution_category: row.institution_category,
          government_level: row.government_level,
          established_date: row.established_date,
          operational_date: row.operational_date,
          status: row.status,
          predecessor_institution_id: row.predecessor_institution_id,
          successor_institution_id: row.successor_institution_id,
          description: [
            alias.type,
            `Current record: ${row.name}`,
            row.institution_type,
          ]
            .filter(Boolean)
            .join(" · "),
          public_url: `/government/institutions/${row.slug}`,
        });
      }
    }

    const qLower = q.toLowerCase();
    results.sort((a, b) => {
      const aStarts = String(a.name || "").toLowerCase().startsWith(qLower)
        ? 1
        : 0;
      const bStarts = String(b.name || "").toLowerCase().startsWith(qLower)
        ? 1
        : 0;
      if (aStarts !== bStarts) return bStarts - aStarts;

      const aCurrent = a.name_type === "Current name" ? 1 : 0;
      const bCurrent = b.name_type === "Current name" ? 1 : 0;
      if (aCurrent !== bCurrent) return bCurrent - aCurrent;

      return String(a.name || "").localeCompare(String(b.name || ""));
    });

    return NextResponse.json({ data: results.slice(0, 100) });
  }


  if (kind === "notices") {
    const numeric = /^\d+$/.test(q) ? Number(q) : null;

    let noticeQuery = auth.supabase
      .from("gazette_notices")
      .select("id, notice_number, title, issue_id")
      .limit(50);

    noticeQuery =
      numeric !== null
        ? noticeQuery.eq("notice_number", numeric)
        : noticeQuery.ilike("title", `%${q}%`);

    const { data: notices, error: noticeError } = await noticeQuery;

    if (noticeError) {
      return NextResponse.json(
        { error: noticeError.message },
        { status: 500 },
      );
    }

    const issueIds = Array.from(
      new Set((notices || []).map((row) => row.issue_id).filter(Boolean)),
    );

    const issueMap = new Map<string, any>();

    if (issueIds.length > 0) {
      const { data: issues, error: issueError } = await auth.supabase
        .from("gazette_issues")
        .select("id, year, volume, issue_number, date")
        .in("id", issueIds);

      if (issueError) {
        return NextResponse.json(
          { error: issueError.message },
          { status: 500 },
        );
      }

      for (const issue of issues || []) {
        issueMap.set(issue.id, issue);
      }
    }

    return NextResponse.json({
      data: (notices || []).map((row) => {
        const issue = issueMap.get(row.issue_id);

        return {
          kind: "notice",
          id: row.id,
          name: `Gazette Notice No. ${row.notice_number}`,
          description: issue
            ? `${row.title} · ${issue.year} Issue ${issue.issue_number}`
            : row.title,
          public_url: issue
            ? `/kenya-gazette/${issue.year}/${issue.issue_number}/notice/${row.notice_number}`
            : null,
        };
      }),
    });
  }

  if (kind === "corrigenda") {
    const { data: sections, error: sectionError } = await auth.supabase
      .from("gazette_issue_sections")
      .select("id, title, section_type, issue_id")
      .eq("section_type", "corrigenda")
      .order("created_at", { ascending: false })
      .limit(100);

    if (sectionError) {
      return NextResponse.json(
        { error: sectionError.message },
        { status: 500 },
      );
    }

    const issueIds = Array.from(
      new Set((sections || []).map((row) => row.issue_id).filter(Boolean)),
    );

    const issueMap = new Map<string, any>();

    if (issueIds.length > 0) {
      const { data: issues, error: issueError } = await auth.supabase
        .from("gazette_issues")
        .select("id, year, volume, issue_number, date")
        .in("id", issueIds);

      if (issueError) {
        return NextResponse.json(
          { error: issueError.message },
          { status: 500 },
        );
      }

      for (const issue of issues || []) {
        issueMap.set(issue.id, issue);
      }
    }

    return NextResponse.json({
      data: (sections || []).map((row) => {
        const issue = issueMap.get(row.issue_id);

        return {
          kind: "corrigenda",
          id: row.id,
          name: issue
            ? `Corrigenda — ${issue.year} Issue ${issue.issue_number}`
            : row.title,
          description: issue
            ? `Kenya Gazette Vol. ${issue.volume} No. ${issue.issue_number} · ${issue.date}`
            : "Gazette Corrigenda section",
          public_url: issue
            ? `/kenya-gazette/${issue.year}/${issue.issue_number}`
            : null,
        };
      }),
    });
  }

  return NextResponse.json({ data: [] });
}
