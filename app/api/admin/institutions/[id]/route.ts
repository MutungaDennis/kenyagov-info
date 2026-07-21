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

  const patch = buildInstitutionRow(body);
  delete patch.board_type;
  delete patch.has_board;

  if (patch.name && !patch.slug && !body.slug) {
    patch.slug = slugify(String(patch.name));
  }
  if (typeof patch.slug === "string") {
    patch.slug = slugify(String(patch.slug)) || patch.slug;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  let working = { ...patch };
  let lastError: string | null = null;
  const dropped: string[] = [];

  for (let attempt = 0; attempt < 25; attempt++) {
    const { data, error } = await auth.supabase
      .from("institutions")
      .update(working)
      .eq("id", id)
      .select("id, slug, name")
      .single();

    if (!error) {
      return NextResponse.json({
        data,
        dropped: dropped.length ? dropped : undefined,
      });
    }

    lastError = error.message;
    const enumHint = enumErrorFromMessage(error.message);
    if (enumHint) {
      const badValMatch = error.message.match(
        /invalid input value for enum (\w+): "([^"]+)"/i,
      );
      let droppedEnum: string | null = null;
      for (const col of [
        "institution_nature",
        "legal_basis_type",
        "operational_model",
        "funding_model",
        "constitutional_status",
        "institution_category",
        "government_level",
        "arm_of_government",
        "status",
        "verification_status",
        "current_head_id",
      ]) {
        if (col in working && badValMatch?.[2] === String(working[col])) {
          delete working[col];
          dropped.push(col);
          droppedEnum = col;
          break;
        }
      }
      if (droppedEnum) continue;
      return NextResponse.json(
        {
          error: enumHint,
          detail: error.message,
          hint: "That value is not in the database enum yet. Use a suggested value, or add the new enum label in Supabase.",
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
      if (!keys.length) break;
      const drop = keys[keys.length - 1];
      delete working[drop];
      dropped.push(drop);
      continue;
    }
    break;
  }

  return NextResponse.json(
    {
      error: lastError || "Update failed",
      dropped,
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
