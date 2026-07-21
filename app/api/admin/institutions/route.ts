import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, slugify } from "@/lib/admin-api";
import {
  buildInstitutionRow,
  enumErrorFromMessage,
  missingColumnFromError,
} from "@/lib/institutions/fields";

export const dynamic = "force-dynamic";

/** Escape characters that break PostgREST or/ilike filter strings */
function sanitizeFilterValue(value: string): string {
  return value.replace(/[%_,.()]/g, " ").replace(/\s+/g, " ").trim();
}

/** Quote a value for PostgREST filter expressions (handles spaces). */
function quoteFilterValue(value: string): string {
  return `"${value.replace(/"/g, "")}"`;
}

type FacetRow = Record<string, string | null | undefined>;

const FACET_COLUMNS = [
  "arm_of_government",
  "institution_category",
  "institution_type",
  "institution_subtype",
  "institution_nature",
  "government_level",
  "constitutional_status",
  "mtef_sector",
  "operational_model",
  "legal_basis_type",
  "funding_model",
  "jurisdiction_scope",
  "cofog_division",
  "cofog_group",
  "status",
  "verification_status",
  "head_title",
] as const;

function collectFacet(
  sets: Record<string, Set<string>>,
  row: FacetRow,
  key: string,
) {
  const v = row[key];
  if (typeof v === "string" && v.trim()) {
    if (!sets[key]) sets[key] = new Set();
    sets[key].add(v.trim());
  }
}

/**
 * GET /api/admin/institutions
 * Query params:
 * - q: search name / short_name / official_name / description (min 1 char)
 * - arm: filter arm_of_government OR institution_category (exact)
 * - type: filter institution_type (exact)
 * - active: "1" = active only (is_active true or null); omit for all
 * - limit / offset: page size (max 100) and start index
 * - facets: "1" = return distinct option values from DB (grows as admins save new values)
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const arm = searchParams.get("arm")?.trim() || "";
  const type = searchParams.get("type")?.trim() || "";
  const activeOnly = searchParams.get("active") === "1";
  const wantFacets = searchParams.get("facets") === "1";

  // Facets: scan classification columns so free-text values reappear in dropdowns
  if (wantFacets) {
    const sets: Record<string, Set<string>> = {};
    for (const col of FACET_COLUMNS) sets[col] = new Set();
    const PAGE = 1000;
    let offset = 0;
    for (let i = 0; i < 50; i++) {
      const { data, error } = await auth.supabase
        .from("institutions")
        .select(FACET_COLUMNS.join(", "))
        .range(offset, offset + PAGE - 1);
      if (error) {
        // Fallback minimal facets if some columns missing
        const fb = await auth.supabase
          .from("institutions")
          .select(
            "arm_of_government, institution_category, institution_type, mtef_sector, institution_nature, status",
          )
          .range(offset, offset + PAGE - 1);
        if (fb.error) {
          return NextResponse.json({ error: fb.error.message }, { status: 500 });
        }
        for (const row of (fb.data || []) as FacetRow[]) {
          for (const key of Object.keys(row)) collectFacet(sets, row, key);
        }
        if ((fb.data || []).length < PAGE) break;
        offset += (fb.data || []).length;
        continue;
      }
      const rows = (data || []) as FacetRow[];
      for (const row of rows) {
        for (const col of FACET_COLUMNS) collectFacet(sets, row, col);
      }
      if (rows.length < PAGE) break;
      offset += rows.length;
    }

    const sorted = (key: string) =>
      Array.from(sets[key] || []).sort((a, b) => a.localeCompare(b));

    return NextResponse.json({
      // list-page shortcuts
      arms: sorted("arm_of_government").length
        ? [
            ...new Set([
              ...sorted("arm_of_government"),
              ...sorted("institution_category"),
            ]),
          ].sort((a, b) => a.localeCompare(b))
        : sorted("institution_category"),
      types: sorted("institution_type"),
      // full facet map for admin form dropdowns (static + these = growing list)
      facets: {
        arm_of_government: sorted("arm_of_government"),
        institution_category: sorted("institution_category"),
        institution_type: sorted("institution_type"),
        institution_subtype: sorted("institution_subtype"),
        institution_nature: sorted("institution_nature"),
        government_level: sorted("government_level"),
        constitutional_status: sorted("constitutional_status"),
        mtef_sector: sorted("mtef_sector"),
        operational_model: sorted("operational_model"),
        legal_basis_type: sorted("legal_basis_type"),
        funding_model: sorted("funding_model"),
        jurisdiction_scope: sorted("jurisdiction_scope"),
        cofog_division: sorted("cofog_division"),
        cofog_group: sorted("cofog_group"),
        status: sorted("status"),
        verification_status: sorted("verification_status"),
        head_title: sorted("head_title"),
      },
    });
  }

  const MAX_PAGE = 100;
  const limit = Math.min(
    MAX_PAGE,
    Math.max(1, parseInt(searchParams.get("limit") || "50", 10) || 50),
  );
  const offset = Math.max(
    0,
    parseInt(searchParams.get("offset") || "0", 10) || 0,
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applyFilters = (query: any) => {
    let qy = query;
    if (q.length >= 1) {
      const qSafe = sanitizeFilterValue(q);
      if (qSafe.length >= 1) {
        qy = qy.or(
          `name.ilike.%${qSafe}%,short_name.ilike.%${qSafe}%,description.ilike.%${qSafe}%,official_name.ilike.%${qSafe}%,slug.ilike.%${qSafe}%`,
        );
      }
    }
    if (arm.length >= 1) {
      const armQ = quoteFilterValue(arm);
      // Match either arm_of_government or institution_category (same as previous UI)
      qy = qy.or(
        `arm_of_government.eq.${armQ},institution_category.eq.${armQ}`,
      );
    }
    if (type.length >= 1) {
      qy = qy.eq("institution_type", type);
    }
    if (activeOnly) {
      // Treat null as active (legacy rows)
      qy = qy.or("is_active.eq.true,is_active.is.null");
    }
    return qy;
  };

  let query = auth.supabase
    .from("institutions")
    .select(
      `id, slug, name, short_name, official_name, institution_type, institution_category,
       institution_subtype, institution_nature, government_level, arm_of_government,
       constitutional_status, mtef_sector, is_active, status, description, mandate,
       headquarters, website_url, current_head, head_title, verification_status, updated_at`,
      { count: "exact" },
    )
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  query = applyFilters(query);

  const { data, error, count } = await query;
  if (error) {
    // Fallback minimal columns (filters re-applied)
    let fallbackQ = auth.supabase
      .from("institutions")
      .select(
        `id, slug, name, short_name, institution_type, institution_category, government_level,
         arm_of_government, mtef_sector, is_active, description`,
        { count: "exact" },
      )
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1);
    fallbackQ = applyFilters(fallbackQ);

    const fallback = await fallbackQ;
    if (fallback.error) {
      return NextResponse.json(
        { error: fallback.error.message },
        { status: 500 },
      );
    }
    return NextResponse.json({
      data: fallback.data || [],
      total: fallback.count ?? 0,
      limit,
      offset,
      q: q || undefined,
      arm: arm || undefined,
      type: type || undefined,
      active: activeOnly || undefined,
    });
  }

  return NextResponse.json({
    data: data || [],
    total: count ?? 0,
    limit,
    offset,
    q: q || undefined,
    arm: arm || undefined,
    type: type || undefined,
    active: activeOnly || undefined,
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

  const name = String(body.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const row = buildInstitutionRow(body, { defaults: true });
  row.name = name;
  row.slug =
    String(body.slug || "").trim() ||
    slugify(name) ||
    `institution-${Date.now()}`;
  if (typeof row.slug === "string") {
    row.slug = slugify(String(row.slug)) || row.slug;
  }

  // Never send known-bad legacy keys
  delete row.board_type;
  delete row.has_board;

  let working = { ...row };
  let lastError: string | null = null;
  const dropped: string[] = [];

  for (let attempt = 0; attempt < 25; attempt++) {
    const { data, error } = await auth.supabase
      .from("institutions")
      .insert(working)
      .select("id, slug, name")
      .single();

    if (!error) {
      return NextResponse.json(
        {
          data,
          dropped: dropped.length ? dropped : undefined,
        },
        { status: 201 },
      );
    }

    lastError = error.message;
    const enumHint = enumErrorFromMessage(error.message);
    if (enumHint) {
      // Drop the offending enum field and retry so free-text fields that fail
      // do not block the whole save when possible
      const badValMatch = error.message.match(
        /invalid input value for enum (\w+): "([^"]+)"/i,
      );
      // Map postgres enum type names roughly to columns
      const enumToCol: Record<string, string> = {
        institution_nature: "institution_nature",
        institution_nature_enum: "institution_nature",
        legal_basis_type: "legal_basis_type",
        operational_model: "operational_model",
        operational_model_enum: "operational_model",
        institution_category: "institution_category",
        government_level: "government_level",
        arm_of_government: "arm_of_government",
        constitutional_status: "constitutional_status",
        funding_model: "funding_model",
        verification_status: "verification_status",
        institution_status: "status",
      };
      const enumName = badValMatch?.[1]?.toLowerCase() || "";
      let droppedEnum: string | null = null;
      for (const [key, col] of Object.entries(enumToCol)) {
        if (enumName.includes(key.replace(/_enum$/, "")) && col in working) {
          delete working[col];
          dropped.push(col);
          droppedEnum = col;
          break;
        }
      }
      // Heuristic: try common free-text enum columns
      if (!droppedEnum) {
        for (const col of [
          "institution_nature",
          "legal_basis_type",
          "operational_model",
          "funding_model",
          "constitutional_status",
          "institution_category",
        ]) {
          if (col in working && badValMatch?.[2] === String(working[col])) {
            delete working[col];
            dropped.push(col);
            droppedEnum = col;
            break;
          }
        }
      }
      if (droppedEnum) {
        continue; // retry without invalid enum value
      }
      return NextResponse.json(
        {
          error: enumHint,
          detail: error.message,
          hint: "That value is not in the database enum yet. Use a suggested value, or ask a DBA to add the new enum label in Supabase.",
          dropped,
        },
        { status: 400 },
      );
    }
    const col = missingColumnFromError(error.message);
    if (col && col in working) {
      delete working[col];
      dropped.push(col);
      continue;
    }
    if (/schema cache|column|does not exist/i.test(error.message)) {
      // Drop one optional non-required field
      const optional = Object.keys(working).filter(
        (k) => !["name", "slug"].includes(k),
      );
      if (!optional.length) break;
      const drop = optional[optional.length - 1];
      delete working[drop];
      dropped.push(drop);
      continue;
    }
    break;
  }

  return NextResponse.json(
    {
      error: lastError || "Failed to create institution",
      dropped,
      hint: "Removed unknown columns and retried. Ensure name and slug are unique. Enum fields must match DB values.",
    },
    { status: 500 },
  );
}
