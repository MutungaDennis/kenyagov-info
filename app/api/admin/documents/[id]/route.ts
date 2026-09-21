import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin-api";

const EDITABLE_FIELDS = [
  "title",
  "short_title",
  "slug",
  "document_type_id",
  "publication_date",
  "publisher_text",
  "summary",
  "description",
  "status",
  "official_source_url",
] as const;

type EditableField = (typeof EDITABLE_FIELDS)[number];

type DocumentUpdate = Partial<Record<EditableField, unknown>> & {
  published_at?: string | null;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;
  const body = await request.json();
  const update: DocumentUpdate = {};

  for (const key of EDITABLE_FIELDS) {
    if (key in body) {
      update[key] = body[key] || null;
    }
  }

  if (body.status === "Draft") {
    update.published_at = null;
  }

  const { error } = await auth.supabase
    .from("documents")
    .update(update)
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    );
  }

  return NextResponse.json({ id });
}
