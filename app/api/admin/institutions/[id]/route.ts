import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, slugify } from "@/lib/admin-api";
import {
  buildInstitutionRow,
  enumErrorFromMessage,
  missingColumnFromError,
} from "@/lib/institutions/fields";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;

  const { data, error } = await auth.supabase
    .from("institutions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({ data });
}

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

  console.error(`=== INSTITUTION UPDATE PAYLOAD (ID: ${id}) ===`);
  console.error(JSON.stringify(body, null, 2));

  let patch = buildInstitutionRow(body);

  // Legacy cleanup
  delete patch.board_type;
  delete patch.has_board;

  // Slug handling
  if (patch.name && !patch.slug && !body.slug) {
    patch.slug = slugify(String(patch.name));
  }
  if (typeof patch.slug === "string") {
    patch.slug = slugify(String(patch.slug)) || patch.slug;
  }

  // === CRITICAL: Fix date fields (same as POST) ===
  const DATE_KEYS = [
    "established_date",
    "operational_date",
    "status_effective_date",
    "head_appointment_date",
  ];
  for (const key of DATE_KEYS) {
    if (patch[key] === "null" || patch[key] === "" || patch[key] == null) {
      patch[key] = null;
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  let working = { ...patch };
  let lastError: any = null;
  const dropped: string[] = [];

  for (let attempt = 0; attempt < 25; attempt++) {
    const { data, error } = await auth.supabase
      .from("institutions")
      .update(working)
      .eq("id", id)
      .select("id, slug, name")
      .single();

    if (!error) {
      console.log("✅ Institution updated successfully:", data);
      return NextResponse.json({
        data,
        dropped: dropped.length ? dropped : undefined,
      });
    }

    lastError = error;
    console.error(`Update attempt ${attempt + 1} failed:`, error);

    // Unique violation
    if (error?.code === "23505") {
      return NextResponse.json(
        {
          error: "Slug or name conflict",
          detail: error.message,
          hint: "The slug is already taken by another institution.",
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

      let droppedEnum: string | null = null;
      const enumToCol: Record<string, string> = {
        institution_nature: "institution_nature",
        operational_model: "operational_model",
        institution_category: "institution_category",
        government_level: "government_level",
        arm_of_government: "arm_of_government",
        constitutional_status: "constitutional_status",
        funding_model: "funding_model",
        verification_status: "verification_status",
        status: "status",
      };

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
          "operational_model",
          "legal_basis_type",
          "funding_model",
          "constitutional_status",
          "institution_category",
          "verification_status",
          "status",
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
        {
          error: enumHint,
          detail: error.message,
          hint: "Value not allowed in database enum.",
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
      const keys = Object.keys(working);
      if (keys.length) {
        const drop = keys[keys.length - 1];
        delete working[drop];
        dropped.push(drop);
        continue;
      }
    }

    break;
  }

  console.error("❌ Final update failure:", lastError);

  return NextResponse.json(
    {
      error: lastError?.message || "Update failed",
      code: lastError?.code,
      detail: lastError?.details,
      dropped: dropped.length ? dropped : undefined,
    },
    { status: 500 },
  );
}

export async function DELETE(_request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;

  const { error } = await auth.supabase
    .from("institutions")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}