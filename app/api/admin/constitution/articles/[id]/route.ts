import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAdminApi } from "@/lib/admin-api";

type Ctx = {
  params: Promise<{
    id: string;
  }>;
};

const VALID_REVIEW_STATUSES = [
  "Imported",
  "Reviewed",
  "Needs attention",
];

const VALID_RELATIONSHIP_STATUSES = [
  "Not reviewed",
  "Partially linked",
  "Reviewed",
  "Needs attention",
];

export async function GET(
  _request: NextRequest,
  context: Ctx,
) {
  const auth = await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  const { data, error } = await auth.supabase
    .from("constitution_articles")
    .select(`
      id,
      constitution_id,
      chapter_id,
      part_id,
      legal_provision_id,
      article_number,
      title,
      body_text,
      body_html,
      source_start_line,
      source_end_line,
      review_status,
      relationship_review_status,
      updated_at
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Article not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    data,
  });
}

export async function PATCH(
  request: NextRequest,
  context: Ctx,
) {
  const auth = await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const { data: existing, error: existingError } =
    await auth.supabase
      .from("constitution_articles")
      .select(`
        id,
        legal_provision_id,
        article_number,
        title
      `)
      .eq("id", id)
      .maybeSingle();

  if (existingError) {
    return NextResponse.json(
      { error: existingError.message },
      { status: 500 },
    );
  }

  if (!existing) {
    return NextResponse.json(
      { error: "Article not found" },
      { status: 404 },
    );
  }

  const update: Record<string, unknown> = {};

  if ("title" in body) {
    const title = String(body.title || "").trim();

    if (!title) {
      return NextResponse.json(
        { error: "title cannot be empty" },
        { status: 400 },
      );
    }

    update.title = title;
  }

  if ("body_text" in body) {
    const value = String(body.body_text || "");

    if (!value.trim()) {
      return NextResponse.json(
        { error: "body_text cannot be empty" },
        { status: 400 },
      );
    }

    update.body_text = value;
  }

  if ("body_html" in body) {
    const value = String(body.body_html || "");

    if (!value.trim()) {
      return NextResponse.json(
        { error: "body_html cannot be empty" },
        { status: 400 },
      );
    }

    update.body_html = value;
  }

  if ("review_status" in body) {
    const status = String(body.review_status || "");

    if (!VALID_REVIEW_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid review_status" },
        { status: 400 },
      );
    }

    update.review_status = status;
  }

  if ("relationship_review_status" in body) {
    const status = String(
      body.relationship_review_status || "",
    );

    if (
      !VALID_RELATIONSHIP_STATUSES.includes(status)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid relationship_review_status",
        },
        { status: 400 },
      );
    }

    update.relationship_review_status = status;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      {
        error:
          "No supported Article fields were supplied",
      },
      { status: 400 },
    );
  }

  update.updated_at =
    new Date().toISOString();

  const { data, error } = await auth.supabase
    .from("constitution_articles")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    );
  }

  /*
   * Keep legal_provisions heading in sync with the
   * Article title.
   */
  if (
    existing.legal_provision_id &&
    typeof update.title === "string"
  ) {
    const { error: provisionError } =
      await auth.supabase
        .from("legal_provisions")
        .update({
          heading: update.title,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          existing.legal_provision_id,
        );

    if (provisionError) {
      console.error(
        "Article updated but legal provision heading did not sync:",
        provisionError,
      );
    }
  }

  return NextResponse.json({
    data,
  });
}

export async function DELETE(
  _request: NextRequest,
  context: Ctx,
) {
  const auth = await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  const { data: article, error: articleError } =
    await auth.supabase
      .from("constitution_articles")
      .select(`
        id,
        article_number,
        legal_provision_id
      `)
      .eq("id", id)
      .maybeSingle();

  if (articleError) {
    return NextResponse.json(
      { error: articleError.message },
      { status: 500 },
    );
  }

  if (!article) {
    return NextResponse.json(
      { error: "Article not found" },
      { status: 404 },
    );
  }

  const provisionId =
    article.legal_provision_id;

  const { error: deleteArticleError } =
    await auth.supabase
      .from("constitution_articles")
      .delete()
      .eq("id", id);

  if (deleteArticleError) {
    return NextResponse.json(
      {
        error:
          deleteArticleError.message,
      },
      { status: 400 },
    );
  }

  /*
   * constitution_articles points TO legal_provisions.
   * Deleting the Article does not automatically delete
   * that provision, so remove it explicitly.
   *
   * This also cleans up graph relationships whose FKs
   * cascade from legal_provisions.
   */
  if (provisionId) {
    const { error: provisionError } =
      await auth.supabase
        .from("legal_provisions")
        .delete()
        .eq("id", provisionId);

    if (provisionError) {
      console.error(
        "Article deleted but orphaned legal_provision could not be deleted:",
        provisionError,
      );
    }
  }

  return NextResponse.json({
    success: true,
    article_number:
      article.article_number,
  });
}