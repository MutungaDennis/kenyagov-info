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

type Ctx = { params: Promise<{ id: string }> };

/** Columns that may not exist until migrations are applied */
const OPTIONAL_LEADER_COLUMNS = new Set([
  "academic_qualifications",
  "education",
  "name_titles",
  "national_honours",
  "social_media",
  "gender",
  "date_of_birth",
  "sub_category",
  "is_active",
  "status",
  "category",
  "level",
  "contact_email",
  "phone",
  "official_website",
  "image_url",
  "bio",
]);

function missingColumnFromError(message: string): string | null {
  // PGRST204: Could not find the 'name_titles' column of 'leaders' in the schema cache
  const m =
    message.match(/Could not find the '([^']+)' column/i) ||
    message.match(/column ["']?([a-z0-9_]+)["']? (?:of relation )?.*does not exist/i) ||
    message.match(/column\s+([a-z0-9_]+)\s+does not exist/i);
  return m?.[1] || null;
}

async function updateLeadersWithFallback(
  supabase: {
    from: (t: string) => {
      update: (v: Record<string, unknown>) => {
        eq: (c: string, id: string) => {
          select: (s: string) => {
            single: () => PromiseLike<{
              data: Record<string, unknown> | null;
              error: { message: string } | null;
            }>;
          };
        };
      };
    };
  },
  id: string,
  patch: Record<string, unknown>,
): Promise<{
  data: Record<string, unknown> | null;
  error: string | null;
  dropped: string[];
}> {
  const working = { ...patch };
  const dropped: string[] = [];
  let lastError: string | null = null;

  for (let attempt = 0; attempt < 20; attempt++) {
    const { data, error } = await supabase
      .from("leaders")
      .update(working)
      .eq("id", id)
      .select(
        "id, slug, full_name, first_name, other_names, surname, title, bio, level, current_party, current_constituency, current_county, current_organization, is_active, social_media",
      )
      .single();

    if (!error) {
      return { data: data as Record<string, unknown>, error: null, dropped };
    }

    lastError = error.message;
    const col = missingColumnFromError(error.message);
    const isSchema =
      /column|schema cache|PGRST204|does not exist/i.test(error.message) ||
      Boolean(col);

    if (!isSchema) {
      return { data: null, error: lastError, dropped };
    }

    if (col && col in working) {
      delete working[col];
      dropped.push(col);
      continue;
    }

    // Drop next optional key still in patch
    let removed = false;
    for (const k of OPTIONAL_LEADER_COLUMNS) {
      if (k in working) {
        delete working[k];
        dropped.push(k);
        removed = true;
        break;
      }
    }
    if (!removed) {
      // Last resort: only core name fields
      const core = [
        "first_name",
        "other_names",
        "surname",
        "slug",
        "title",
        "current_party",
        "current_constituency",
        "current_county",
        "current_organization",
        "bio",
        "image_url",
        "contact_email",
        "phone",
        "official_website",
        "level",
        "is_active",
      ];
      const slim: Record<string, unknown> = {};
      for (const k of core) {
        if (k in working) slim[k] = working[k];
      }
      if (Object.keys(slim).length === 0) {
        return { data: null, error: lastError, dropped };
      }
      // Replace working with slim only once
      for (const k of Object.keys(working)) {
        if (!(k in slim)) {
          dropped.push(k);
          delete working[k];
        }
      }
      // if nothing new dropped, stop
      if (Object.keys(working).length === Object.keys(slim).length && attempt > 0) {
        // try slim update once more then exit
        const retry = await supabase
          .from("leaders")
          .update(slim)
          .eq("id", id)
          .select(
            "id, slug, full_name, first_name, other_names, surname, title, bio",
          )
          .single();
        if (!retry.error) {
          return {
            data: retry.data as Record<string, unknown>,
            error: null,
            dropped,
          };
        }
        return { data: null, error: retry.error.message, dropped };
      }
    }
  }

  return { data: null, error: lastError || "Update failed", dropped };
}

export async function GET(_request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;

  const { data, error } = await auth.supabase
    .from("leaders")
    .select(
      `*,
      leader_roles (
        id, title, organization, constituency, county, ward, party,
        term_start_date, term_end_date, status, entry_type,
        official_email, office_location, committees
      )`,
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    const basic = await auth.supabase
      .from("leaders")
      .select("*")
      .eq("id", id)
      .single();
    if (basic.error || !basic.data) {
      return NextResponse.json(
        { error: error?.message || basic.error?.message || "Not found" },
        { status: 404 },
      );
    }
    const roles = await auth.supabase
      .from("leader_roles")
      .select("*")
      .eq("leader_id", id)
      .order("term_start_date", { ascending: false });
    return NextResponse.json({
      data: { ...basic.data, leader_roles: roles.data || [] },
    });
  }

  return NextResponse.json({ data });
}

/**
 * full_name is a GENERATED column in Supabase — never update it.
 * Write first_name / other_names / surname instead.
 */
export async function PATCH(request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const allowed = [
    "first_name",
    "other_names",
    "surname",
    "slug",
    "title",
    "current_party",
    "current_constituency",
    "current_county",
    "current_organization",
    "level",
    "category",
    "sub_category",
    "bio",
    "image_url",
    "contact_email",
    "phone",
    "official_website",
    "is_active",
    "status",
    "gender",
    "date_of_birth",
    "academic_qualifications",
    "education",
    "name_titles",
    "national_honours",
    "social_media",
  ] as const;

  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) {
      if (key === "is_active") {
        patch[key] = body[key] !== false && body[key] !== "false";
      } else if (key === "academic_qualifications") {
        patch[key] = body[key];
      } else if (key === "name_titles") {
        patch.name_titles = sortNameTitles(parseNameTitles(body.name_titles));
      } else if (key === "national_honours") {
        patch.national_honours = sortNationalHonours(
          parseNationalHonours(body.national_honours),
        );
      } else if (key === "social_media") {
        const links = parseSocialLinks(body.social_media).map((l) => ({
          platform: l.platform,
          url: normalizeSocialUrl(l.url),
        }));
        patch.social_media = socialLinksToRecord(links);
      } else if (body[key] === "" || body[key] === undefined) {
        patch[key] = null;
      } else {
        patch[key] = body[key];
      }
    }
  }

  if (body.full_name && typeof body.full_name === "string") {
    const parts = splitFullName(body.full_name);
    if (!("first_name" in body)) patch.first_name = parts.first_name;
    if (!("other_names" in body)) patch.other_names = parts.other_names;
    if (!("surname" in body)) patch.surname = parts.surname;
  }

  if ((patch.first_name || patch.surname) && !patch.slug && !body.slug) {
    const forSlug = nameForSlug({
      first_name: (patch.first_name as string) || undefined,
      other_names: (patch.other_names as string) || undefined,
      surname: (patch.surname as string) || undefined,
    });
    if (forSlug && forSlug !== "Unknown") patch.slug = slugify(forSlug);
  }

  if (typeof patch.slug === "string") {
    patch.slug =
      slugify(
        String(patch.slug)
          .replace(
            /^(h-?e|rt-?hon|hon|sen|prof|dr|eng|rev|mr|mrs|ms|miss|amb)-+/i,
            "",
          )
          .replace(
            /^(he|rthon|hon|sen|prof|dr|eng|rev|mr|mrs|ms|miss|amb)-+/i,
            "",
          ),
      ) || patch.slug;
  }

  if (body.sync_current_from_role && typeof body.sync_current_from_role === "object") {
    const r = body.sync_current_from_role as Record<string, unknown>;
    if (r.title) patch.title = r.title;
    if (r.party) patch.current_party = r.party;
    if (r.constituency) patch.current_constituency = r.constituency;
    if (r.county) patch.current_county = r.county;
    if (r.organization) patch.current_organization = r.organization;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  delete (patch as { full_name?: unknown }).full_name;

  // Dual-write academics only if we also try academic_qualifications
  if (patch.academic_qualifications != null && !("education" in patch)) {
    try {
      patch.education =
        typeof patch.academic_qualifications === "string"
          ? patch.academic_qualifications
          : JSON.stringify(patch.academic_qualifications);
    } catch {
      /* ignore */
    }
  }

  const { data, error, dropped } = await updateLeadersWithFallback(
    auth.supabase as Parameters<typeof updateLeadersWithFallback>[0],
    id,
    patch,
  );

  if (error || !data) {
    return NextResponse.json(
      {
        error: error || "Update failed",
        dropped,
        hint:
          error &&
          (error.includes("full_name") || error.includes("DEFAULT"))
            ? "full_name is generated — update first_name / other_names / surname only."
            : dropped.length
              ? `Some columns are missing in Supabase (${dropped.join(", ")}). Run lib/supabase/migrations/fix_leaders_missing_columns.sql in the SQL editor, then retry.`
              : "Check Supabase RLS and that SUPABASE_SERVICE_ROLE_KEY is set for admin APIs.",
      },
      { status: 500 },
    );
  }

  const warnings: string[] = [];
  if (dropped.includes("name_titles")) {
    warnings.push(
      "Titles/honorifics were not saved: column name_titles is missing. Run fix_leaders_missing_columns.sql in Supabase.",
    );
  }
  if (dropped.includes("national_honours")) {
    warnings.push(
      "National honours (E.G.H., O.G.W., etc.) were not saved: run lib/supabase/migrations/add_national_honours.sql in Supabase.",
    );
  }
  if (dropped.includes("academic_qualifications") || dropped.includes("education")) {
    warnings.push(
      "Academic qualifications were not saved: column academic_qualifications is missing. Run the SQL migration in Supabase.",
    );
  }
  if (dropped.length && !warnings.length) {
    warnings.push(
      `Saved without optional columns: ${dropped.join(", ")}. Run fix_leaders_missing_columns.sql to enable them.`,
    );
  }

  return NextResponse.json({
    data,
    dropped: dropped.length ? dropped : undefined,
    warnings: warnings.length ? warnings : undefined,
  });
}

export async function DELETE(_request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;

  const { error } = await auth.supabase.from("leaders").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
