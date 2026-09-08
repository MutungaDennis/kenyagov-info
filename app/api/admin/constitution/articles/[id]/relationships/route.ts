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

  const [
    peopleResult,
    institutionResult,
  ] = await Promise.all([
    auth.supabase
      .from(
        "constitution_article_people",
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
        )
      `)
      .eq("article_id", articleId)
      .order("created_at"),

    auth.supabase
      .from(
        "constitution_article_institutions",
      )
      .select(`
        *,
        institutions (
          id,
          slug,
          name,
          short_name
        )
      `)
      .eq("article_id", articleId)
      .order("created_at"),
  ]);

  if (peopleResult.error) {
    return NextResponse.json(
      {
        error:
          peopleResult.error.message,
      },
      { status: 500 },
    );
  }

  if (institutionResult.error) {
    return NextResponse.json(
      {
        error:
          institutionResult.error
            .message,
      },
      { status: 500 },
    );
  }

  const people = (
    peopleResult.data || []
  ).map((row: any) => {
    const person =
      row.leaders ||
      row.mcas ||
      null;

    const parts = [
      person?.first_name,
      person?.other_names,
      person?.surname,
    ].filter(Boolean);

    return {
      ...row,

      person_name:
        parts.join(" ") ||
        "Person",
    };
  });

  const institutions = (
    institutionResult.data || []
  ).map((row: any) => ({
    ...row,

    institution_name:
      row.institutions?.name ||
      row.institutions
        ?.short_name ||
      "Institution",
  }));

  return NextResponse.json({
    data: {
      people,
      institutions,
    },
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

  const kind = String(
    body.kind || "",
  );

  if (kind === "person") {
    const personId = String(
      body.person_id || "",
    );

    if (!personId) {
      return NextResponse.json(
        {
          error:
            "person_id is required",
        },
        { status: 400 },
      );
    }

    const personKind =
      body.person_kind === "mca"
        ? "mca"
        : "leader";

    const row = {
      article_id: articleId,

      leader_id:
        personKind === "leader"
          ? personId
          : null,

      mca_id:
        personKind === "mca"
          ? personId
          : null,

      leader_role_id:
        body.leader_role_id ||
        null,

      relationship_type:
        String(
          body.relationship_type ||
            "mentioned_person",
        ),

      capacity_title:
        body.capacity_title ||
        null,

      position_title:
        body.position_title ||
        null,

      effective_from:
        body.effective_from ||
        null,

      effective_to:
        body.effective_to ||
        null,

      notes:
        body.notes || null,

      verification_status:
        "Verified",
    };

    const { data, error } =
      await auth.supabase
        .from(
          "constitution_article_people",
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

    return NextResponse.json(
      { data },
      { status: 201 },
    );
  }

  if (kind === "institution") {
    const institutionId =
      String(
        body.institution_id ||
          "",
      );

    if (!institutionId) {
      return NextResponse.json(
        {
          error:
            "institution_id is required",
        },
        { status: 400 },
      );
    }

    const { data, error } =
      await auth.supabase
        .from(
          "constitution_article_institutions",
        )
        .insert({
          article_id: articleId,

          institution_id:
            institutionId,

          relationship_type:
            String(
              body.relationship_type ||
                "mentions",
            ),

          notes:
            body.notes || null,

          verification_status:
            "Verified",
        })
        .select("*")
        .single();

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { data },
      { status: 201 },
    );
  }

  return NextResponse.json(
    {
      error:
        "kind must be person or institution",
    },
    { status: 400 },
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

  const kind =
    searchParams.get("kind");

  const linkId =
    searchParams.get("link_id");

  if (!kind || !linkId) {
    return NextResponse.json(
      {
        error:
          "kind and link_id are required",
      },
      { status: 400 },
    );
  }

  let table:
    | "constitution_article_people"
    | "constitution_article_institutions";

  if (kind === "person") {
    table =
      "constitution_article_people";
  } else if (
    kind === "institution"
  ) {
    table =
      "constitution_article_institutions";
  } else {
    return NextResponse.json(
      {
        error:
          "Invalid relationship kind",
      },
      { status: 400 },
    );
  }

  const { error } =
    await auth.supabase
      .from(table)
      .delete()
      .eq("id", linkId)
      .eq("article_id", articleId);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
  });
}