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

/* ====================== GET (unchanged) ====================== */
export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const arm = searchParams.get("arm")?.trim() || "";
  const type = searchParams.get("type")?.trim() || "";
  const activeOnly = searchParams.get("active") === "1";
  const wantFacets = searchParams.get("facets") === "1";

  if (wantFacets) {
    const sets: Record<string, Set<string>> = {};
    for (const col of FACET_COLUMNS) sets[col] = new Set();
    const PAGE = 1000;
    let offset = 0;

    const FACET_SELECT = `
      arm_of_government, institution_category, institution_type, institution_subtype,
      institution_nature, government_level, constitutional_status, mtef_sector,
      operational_model, legal_basis_type, funding_model, jurisdiction_scope,
      cofog_division, cofog_group, status, verification_status, head_title
    `;
    const FACET_SELECT_MINIMAL = `
      arm_of_government, institution_category, institution_type,
      mtef_sector, institution_nature, status
    `;

    for (let i = 0; i < 50; i++) {
      const { data, error } = await auth.supabase
        .from("institutions")
        .select(FACET_SELECT)
        .range(offset, offset + PAGE - 1);

      if (error) {
        const fb = await auth.supabase
          .from("institutions")
          .select(FACET_SELECT_MINIMAL)
          .range(offset, offset + PAGE - 1);
        if (fb.error) {
          return NextResponse.json({ error: fb.error.message }, { status: 500 });
        }
        const fbRows = (fb.data ?? []) as unknown as FacetRow[];
        for (const row of fbRows) {
          for (const key of Object.keys(row)) collectFacet(sets, row, key);
        }
        if (fbRows.length < PAGE) break;
        offset += fbRows.length;
        continue;
      }

      const rows = (data ?? []) as unknown as FacetRow[];
      for (const row of rows) {
        for (const col of FACET_COLUMNS) collectFacet(sets, row, col);
      }
      if (rows.length < PAGE) break;
      offset += rows.length;
    }

    const sorted = (key: string) =>
      Array.from(sets[key] || []).sort((a, b) => a.localeCompare(b));

    return NextResponse.json({
      arms: sorted("arm_of_government").length
        ? [
            ...new Set([
              ...sorted("arm_of_government"),
              ...sorted("institution_category"),
            ]),
          ].sort((a, b) => a.localeCompare(b))
        : sorted("institution_category"),
      types: sorted("institution_type"),
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
      qy = qy.or(
        `arm_of_government.eq.${armQ},institution_category.eq.${armQ}`,
      );
    }
    if (type.length >= 1) {
      qy = qy.eq("institution_type", type);
    }
    if (activeOnly) {
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

/* ====================== POST Handler ====================== */
export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.error("=== INSTITUTION CREATE PAYLOAD ===");
  console.error(JSON.stringify(body, null, 2));

  const name = String(body.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  let row = buildInstitutionRow(body, { defaults: true });
  row.name = name;
  row.slug =
    String(body.slug || "").trim() ||
    slugify(name) ||
    `institution-${Date.now()}`;

  if (typeof row.slug === "string") {
    row.slug = slugify(String(row.slug)) || row.slug;
  }

  // === CRITICAL FIX: Clean date fields that come as string "null" ===
  const DATE_KEYS = [
    "established_date",
    "operational_date",
    "status_effective_date",
    "head_appointment_date",
  ];
  for (const key of DATE_KEYS) {
    if (row[key] === "null" || row[key] === "" || row[key] == null) {
      row[key] = null;
    }
  }

  delete row.board_type;
  delete row.has_board;

  let working = { ...row };
  let lastError: any = null;
  const dropped: string[] = [];

  for (let attempt = 0; attempt < 25; attempt++) {
    const { data, error } = await auth.supabase
      .from("institutions")
      .insert(working)
      .select("id, slug, name")
      .single();

    if (!error) {
      console.log("✅ Institution created successfully:", data);
      return NextResponse.json(
        { data, dropped: dropped.length ? dropped : undefined },
        { status: 201 },
      );
    }

    lastError = error;
    console.error(`Attempt ${attempt + 1} failed:`, error);

    if (error?.code === "23505") {
      return NextResponse.json(
        {
          error: "Institution with this name or slug already exists",
          detail: error.message,
          hint: "Try a different name or provide a custom unique slug.",
        },
        { status: 409 },
      );
    }

    const enumHint = enumErrorFromMessage(error.message);
    if (enumHint) {
      const badValMatch = error.message.match(
        /invalid input value for enum (\w+): "([^"]+)"/i,
      );
      const enumName = badValMatch?.[1]?.toLowerCase() || "";

      const enumToCol: Record<string, string> = {
        institution_nature: "institution_nature",
        legal_basis_type: "legal_basis_type",
        operational_model: "operational_model",
        institution_category: "institution_category",
        government_level: "government_level",
        arm_of_government: "arm_of_government",
        constitutional_status: "constitutional_status",
        funding_model: "funding_model",
        verification_status: "verification_status",
        institution_status: "status",
      };

      let droppedEnum: string | null = null;
      for (const [key, col] of Object.entries(enumToCol)) {
        if (enumName.includes(key.replace(/_enum$/, "")) && col in working) {
          delete working[col];
          dropped.push(col);
          droppedEnum = col;
          break;
        }
      }

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

      if (droppedEnum) continue;

      return NextResponse.json(
        { error: enumHint, detail: error.message, dropped },
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
      const optional = Object.keys(working).filter(
        (k) => !["name", "slug"].includes(k),
      );
      if (optional.length) {
        const drop = optional[optional.length - 1];
        delete working[drop];
        dropped.push(drop);
        continue;
      }
    }

    break;
  }

  console.error("❌ Final insert failure:", lastError);

  return NextResponse.json(
    {
      error: lastError?.message || "Failed to create institution",
      code: lastError?.code,
      detail: lastError?.details,
      dropped,
      hint: "Check terminal for full payload.",
    },
    { status: 500 },
  );
}