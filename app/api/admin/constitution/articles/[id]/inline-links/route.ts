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

function escapeRegex(
  value: string,
) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
}

function markerRegex(
  id: string,
) {
  const safe =
    escapeRegex(id);

  return new RegExp(
    `<span[^>]*data-constitution-inline-link=["']${safe}["'][^>]*>([\\s\\S]*?)<\\/span>`,
    "gi",
  );
}

export async function GET(
  _request: NextRequest,
  context: Ctx,
) {
  const auth = await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  const { id: articleId } =
    await context.params;

  const { data, error } =
    await auth.supabase
      .from(
        "constitution_inline_links",
      )
      .select(`
        *,
        leaders (
          id,
          slug,
          first_name,
          other_names,
          surname
        ),
        mcas (
          id,
          slug,
          first_name,
          other_names,
          surname
        ),
        institutions (
          id,
          slug,
          name,
          short_name
        )
      `)
      .eq("article_id", articleId)
      .order("created_at");

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data: data || [],
  });
}

export async function POST(
  request: NextRequest,
  context: Ctx,
) {
  const auth = await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  const { id: articleId } =
    await context.params;

  let body: Record<string, any>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const id = String(
    body.id || "",
  ).trim();

  const linkType = String(
    body.link_type || "",
  );

  const selectedText =
    String(
      body.selected_text || "",
    ).trim();

  const bodyHtml = String(
    body.body_html || "",
  );

  if (
    !id ||
    !selectedText ||
    !bodyHtml
  ) {
    return NextResponse.json(
      {
        error:
          "id, selected_text and body_html are required",
      },
      { status: 400 },
    );
  }

  if (
    ![
      "person",
      "institution",
    ].includes(linkType)
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid link_type",
      },
      { status: 400 },
    );
  }

  if (
    !bodyHtml.includes(
      `data-constitution-inline-link="${id}"`,
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Submitted Article HTML does not contain the inline-link marker.",
      },
      { status: 400 },
    );
  }

  const row =
    linkType === "person"
      ? {
          id,

          article_id:
            articleId,

          link_type:
            "person",

          leader_id:
            body.person_kind ===
            "mca"
              ? null
              : body.person_id,

          mca_id:
            body.person_kind ===
            "mca"
              ? body.person_id
              : null,

          leader_role_id:
            body.leader_role_id ||
            null,

          institution_id:
            null,

          selected_text:
            selectedText,

          historical_label:
            body.historical_label ||
            selectedText,

          semantic_role:
            body.semantic_role ||
            "mentioned_person",

          capacity_title:
            body.capacity_title ||
            null,

          organization_name:
            body.organization_name ||
            null,

          role_start_date:
            body.role_start_date ||
            null,

          role_end_date:
            body.role_end_date ||
            null,

          verification_status:
            "Verified",
        }
      : {
          id,

          article_id:
            articleId,

          link_type:
            "institution",

          leader_id:
            null,

          mca_id:
            null,

          leader_role_id:
            null,

          institution_id:
            body.institution_id,

          selected_text:
            selectedText,

          historical_label:
            body.historical_label ||
            selectedText,

          semantic_role:
            body.semantic_role ||
            "mentions",

          capacity_title:
            null,

          organization_name:
            body.organization_name ||
            null,

          role_start_date:
            null,

          role_end_date:
            null,

          verification_status:
            "Verified",
        };

  const { data, error } =
    await auth.supabase
      .from(
        "constitution_inline_links",
      )
      .insert(row)
      .select("*")
      .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    );
  }

  /*
   * Persist the marker into the canonical Article HTML.
   */
  const { error: articleError } =
    await auth.supabase
      .from(
        "constitution_articles",
      )
      .update({
        body_html:
          bodyHtml,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", articleId);

  if (articleError) {
    /*
     * Roll back the link record if the HTML update fails.
     */
    await auth.supabase
      .from(
        "constitution_inline_links",
      )
      .delete()
      .eq("id", id);

    return NextResponse.json(
      {
        error:
          articleError.message,

        hint:
          "The inline-link row was rolled back because body_html could not be updated.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { data },
    { status: 201 },
  );
}

export async function DELETE(
  request: NextRequest,
  context: Ctx,
) {
  const auth = await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  const { id: articleId } =
    await context.params;

  const { searchParams } =
    new URL(request.url);

  const linkId =
    String(
      searchParams.get(
        "link_id",
      ) || "",
    );

  if (!linkId) {
    return NextResponse.json(
      {
        error:
          "link_id is required",
      },
      { status: 400 },
    );
  }

  const { data: article, error } =
    await auth.supabase
      .from(
        "constitution_articles",
      )
      .select("body_html")
      .eq("id", articleId)
      .maybeSingle();

  if (error || !article) {
    return NextResponse.json(
      {
        error:
          error?.message ||
          "Article not found",
      },
      { status: 404 },
    );
  }

  const currentHtml =
    String(
      article.body_html || "",
    );

  /*
   * Unwrap the marker while preserving the exact
   * constitutional wording inside it.
   */
  const nextHtml =
    currentHtml.replace(
      markerRegex(linkId),
      "$1",
    );

  const { error: htmlError } =
    await auth.supabase
      .from(
        "constitution_articles",
      )
      .update({
        body_html:
          nextHtml,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", articleId);

  if (htmlError) {
    return NextResponse.json(
      {
        error:
          htmlError.message,
      },
      { status: 400 },
    );
  }

  const { error: deleteError } =
    await auth.supabase
      .from(
        "constitution_inline_links",
      )
      .delete()
      .eq("id", linkId)
      .eq(
        "article_id",
        articleId,
      );

  if (deleteError) {
    return NextResponse.json(
      {
        error:
          deleteError.message,
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    body_html: nextHtml,
  });
}