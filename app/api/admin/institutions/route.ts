import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, slugify } from "@/lib/admin-api";
import {
  buildInstitutionRow,
  enumErrorFromMessage,
  missingColumnFromError,
} from "@/lib/institutions/fields";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const limit = Math.min(
    500,
    Math.max(1, parseInt(searchParams.get("limit") || "200", 10)),
  );
  const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10));

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

  if (q.length >= 2) {
    query = query.or(
      `name.ilike.%${q}%,short_name.ilike.%${q}%,description.ilike.%${q}%,official_name.ilike.%${q}%`,
    );
  }

  const { data, error, count } = await query;
  if (error) {
    // Fallback minimal columns
    const fallback = await auth.supabase
      .from("institutions")
      .select(
        `id, slug, name, short_name, institution_type, government_level,
         arm_of_government, mtef_sector, is_active, description`,
        { count: "exact" },
      )
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1);
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
    });
  }

  return NextResponse.json({
    data: data || [],
    total: count ?? 0,
    limit,
    offset,
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
