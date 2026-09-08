import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireAdminApi,
} from "@/lib/admin-api";

export const dynamic =
  "force-dynamic";

type Ctx = {
  params: Promise<{
    articleId: string;
  }>;
};

function markerRegex(
  id: string,
) {
  const escaped =
    id.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );

  /*
   * Global because one logical selection may consist
   * of more than one marked text fragment.
   */
  return new RegExp(
    `<span\\s+[^>]*data-constitution-inline-link=["']${escaped}["'][^>]*>([\\s\\S]*?)<\\/span>`,
    "gi",
  );
}

function personName(
  row: any,
) {
  return (
    [
      row?.first_name,
      row?.other_names,
      row?.surname,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    row?.full_name ||
    null
  );
}

/* =========================================================
   GET
   ========================================================= */

export async function GET(
  _request: NextRequest,
  context: Ctx,
) {
  const auth =
    await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  const {
    articleId,
  } =
    await context.params;

  const {
    data: article,
    error:
      articleError,
  } =
    await auth.supabase
      .from(
        "constitution_articles",
      )
      .select(`
        id,
        constitution_id,
        article_number,
        title,
        body_text,
        body_html,
        legal_provision_id,
        relationship_review_status
      `)
      .eq(
        "id",
        articleId,
      )
      .maybeSingle();

  if (
    articleError
  ) {
    return NextResponse.json(
      {
        error:
          articleError.message,
      },
      {
        status: 500,
      },
    );
  }

  if (!article) {
    return NextResponse.json(
      {
        error:
          "Constitution Article not found.",
      },
      {
        status: 404,
      },
    );
  }

  /*
   * Admin navigation is scoped to the same Constitution record.
   * This keeps previous/next correct even if another Constitution
   * version is imported later with the same Article numbers.
   */
  const [
    previousResult,
    nextResult,
  ] =
    await Promise.all([
      auth.supabase
        .from(
          "constitution_articles",
        )
        .select(`
          id,
          article_number,
          title
        `)
        .eq(
          "constitution_id",
          article.constitution_id,
        )
        .lt(
          "article_number",
          article.article_number,
        )
        .order(
          "article_number",
          {
            ascending: false,
          },
        )
        .limit(1)
        .maybeSingle(),

      auth.supabase
        .from(
          "constitution_articles",
        )
        .select(`
          id,
          article_number,
          title
        `)
        .eq(
          "constitution_id",
          article.constitution_id,
        )
        .gt(
          "article_number",
          article.article_number,
        )
        .order(
          "article_number",
          {
            ascending: true,
          },
        )
        .limit(1)
        .maybeSingle(),
    ]);

  if (
    previousResult.error ||
    nextResult.error
  ) {
    return NextResponse.json(
      {
        error:
          previousResult.error?.message ||
          nextResult.error?.message ||
          "Could not load Article navigation.",
      },
      {
        status: 500,
      },
    );
  }

  const {
    data: rows,
    error:
      linksError,
  } =
    await auth.supabase
      .from(
        "constitution_inline_links",
      )
      .select("*")
      .eq(
        "article_id",
        articleId,
      )
      .order(
        "created_at",
        {
          ascending:
            true,
        },
      );

  if (
    linksError
  ) {
    return NextResponse.json(
      {
        error:
          linksError.message,
      },
      {
        status: 500,
      },
    );
  }

  const links =
    rows ?? [];

  const leaderIds =
    Array.from(
      new Set(
        links
          .map(
            (
              row: any,
            ) =>
              row.leader_id,
          )
          .filter(Boolean),
      ),
    );

  const mcaIds =
    Array.from(
      new Set(
        links
          .map(
            (
              row: any,
            ) =>
              row.mca_id,
          )
          .filter(Boolean),
      ),
    );

  const institutionIds =
    Array.from(
      new Set(
        links
          .map(
            (
              row: any,
            ) =>
              row.institution_id,
          )
          .filter(Boolean),
      ),
    );

  const documentIds =
    Array.from(
      new Set(
        links
          .map(
            (
              row: any,
            ) =>
              row.target_document_id,
          )
          .filter(Boolean),
      ),
    );

  const provisionIds =
    Array.from(
      new Set(
        links
          .map(
            (
              row: any,
            ) =>
              row.target_provision_id,
          )
          .filter(Boolean),
      ),
    );

  const [
    leadersResult,
    mcasResult,
    institutionsResult,
    documentsResult,
    provisionsResult,
  ] =
    await Promise.all([
      leaderIds.length
        ? auth.supabase
            .from(
              "leaders",
            )
            .select(`
              id,
              slug,
              full_name,
              first_name,
              other_names,
              surname
            `)
            .in(
              "id",
              leaderIds,
            )
        : Promise.resolve(
            {
              data: [],
              error: null,
            },
          ),

      mcaIds.length
        ? auth.supabase
            .from(
              "mcas",
            )
            .select(`
              id,
              slug,
              first_name,
              other_names,
              surname
            `)
            .in(
              "id",
              mcaIds,
            )
        : Promise.resolve(
            {
              data: [],
              error: null,
            },
          ),

      institutionIds.length
        ? auth.supabase
            .from(
              "institutions",
            )
            .select(`
              id,
              slug,
              name,
              short_name
            `)
            .in(
              "id",
              institutionIds,
            )
        : Promise.resolve(
            {
              data: [],
              error: null,
            },
          ),

      documentIds.length
        ? auth.supabase
            .from(
              "legal_documents",
            )
            .select(`
              id,
              document_type,
              title,
              short_title,
              citation,
              slug,
              year,
              metadata
            `)
            .in(
              "id",
              documentIds,
            )
        : Promise.resolve(
            {
              data: [],
              error: null,
            },
          ),

      provisionIds.length
        ? auth.supabase
            .from(
              "legal_provisions",
            )
            .select(`
              id,
              document_id,
              provision_type,
              provision_key,
              number_label,
              heading,
              canonical_path
            `)
            .in(
              "id",
              provisionIds,
            )
        : Promise.resolve(
            {
              data: [],
              error: null,
            },
          ),
    ]);

  const hydrateError =
    leadersResult.error ||
    mcasResult.error ||
    institutionsResult.error ||
    documentsResult.error ||
    provisionsResult.error;

  if (
    hydrateError
  ) {
    return NextResponse.json(
      {
        error:
          hydrateError.message,
      },
      {
        status: 500,
      },
    );
  }

  const leaderMap =
    new Map(
      (
        leadersResult.data ??
        []
      ).map(
        (
          row: any,
        ) => [
          row.id,
          row,
        ],
      ),
    );

  const mcaMap =
    new Map(
      (
        mcasResult.data ??
        []
      ).map(
        (
          row: any,
        ) => [
          row.id,
          row,
        ],
      ),
    );

  const institutionMap =
    new Map(
      (
        institutionsResult.data ??
        []
      ).map(
        (
          row: any,
        ) => [
          row.id,
          row,
        ],
      ),
    );

  const documentMap =
    new Map(
      (
        documentsResult.data ??
        []
      ).map(
        (
          row: any,
        ) => [
          row.id,
          row,
        ],
      ),
    );

  const provisionMap =
    new Map(
      (
        provisionsResult.data ??
        []
      ).map(
        (
          row: any,
        ) => [
          row.id,
          row,
        ],
      ),
    );

  const hydratedLinks =
    links.map(
      (
        row: any,
      ) => {
        const leader =
          row.leader_id
            ? leaderMap.get(
                row.leader_id,
              ) ??
              null
            : null;

        const mca =
          row.mca_id
            ? mcaMap.get(
                row.mca_id,
              ) ??
              null
            : null;

        const institution =
          row.institution_id
            ? institutionMap.get(
                row.institution_id,
              ) ??
              null
            : null;

        const legalDocument =
          row.target_document_id
            ? documentMap.get(
                row.target_document_id,
              ) ??
              null
            : null;

        const legalProvision =
          row.target_provision_id
            ? provisionMap.get(
                row.target_provision_id,
              ) ??
              null
            : null;

        let targetName:
          | string
          | null =
          null;

        if (
          row.link_type ===
          "person"
        ) {
          targetName =
            personName(
              leader ??
                mca,
            ) ||
            row.historical_label ||
            row.selected_text;
        }

        if (
          row.link_type ===
          "institution"
        ) {
          targetName =
            institution?.short_name ||
            institution?.name ||
            row.historical_label ||
            row.selected_text;
        }

        if (
          row.link_type ===
          "law"
        ) {
          targetName =
            legalProvision
              ?.number_label ||
            legalDocument
              ?.short_title ||
            legalDocument
              ?.title ||
            row.historical_label ||
            row.selected_text;
        }

        if (
          row.link_type === "internal" ||
          row.link_type === "external"
        ) {
          targetName =
            row.target_label ||
            row.selected_text;
        }

        let targetHref: string | null = null;

        if (row.link_type === "person") {
          const person = leader ?? mca;
          if (person?.slug) {
            targetHref = `/leaders/${person.slug}`;
          }
        }

        if (row.link_type === "institution" && institution?.slug) {
          targetHref = `/institutions/${institution.slug}`;
        }

        if (row.link_type === "law") {
          targetHref =
            legalProvision?.canonical_path ||
            (legalDocument?.slug ? `/acts/parliament/${legalDocument.slug}` : null);
        }

        if (row.link_type === "internal" || row.link_type === "external") {
          targetHref = row.target_url || null;
        }

        return {
          ...row,

          leader,
          mca,
          institution,

          legal_document:
            legalDocument,

          legal_provision:
            legalProvision,

          target_name:
            targetName,

          target_href:
            targetHref,
        };
      },
    );

  return NextResponse.json(
    {
      data: {
        article,

        previous:
          previousResult.data ??
          null,

        next:
          nextResult.data ??
          null,

        links:
          hydratedLinks,
      },
    },
  );
}

/* =========================================================
   POST
   ========================================================= */

export async function POST(
  request: NextRequest,
  context: Ctx,
) {
  const auth =
    await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  const {
    articleId,
  } =
    await context.params;

  let body:
    Record<
      string,
      any
    >;

  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "Invalid JSON.",
      },
      {
        status: 400,
      },
    );
  }

  const id =
    String(
      body.id || "",
    ).trim();

  const linkType =
    String(
      body.link_type ||
        "",
    ).trim();

  const selectedText =
    String(
      body.selected_text ||
        "",
    ).trim();

  /*
   * This must be the HTML AFTER the temporary marker
   * has been converted to data-constitution-inline-link.
   */
  const contentHtml =
    String(
      body.content_html ||
        "",
    );

  if (
    !id ||
    !selectedText ||
    !contentHtml
  ) {
    return NextResponse.json(
      {
        error:
          "id, selected_text and content_html are required.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    ![
      "person",
      "institution",
      "law",
      "internal",
      "external",
    ].includes(
      linkType,
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid link_type.",
      },
      {
        status: 400,
      },
    );
  }

  /*
   * CRITICAL:
   * Verify the permanent marker is actually present
   * in the HTML being persisted.
   */
  if (
    !contentHtml.includes(
      `data-constitution-inline-link="${id}"`,
    )
  ) {
    return NextResponse.json(
      {
        error:
          "The submitted Article HTML does not contain the permanent Constitution inline-link marker.",
      },
      {
        status: 400,
      },
    );
  }

  /*
   * Ensure Article exists.
   */
  const {
    data: article,
    error:
      articleError,
  } =
    await auth.supabase
      .from(
        "constitution_articles",
      )
      .select(`
        id,
        legal_provision_id,
        body_html
      `)
      .eq(
        "id",
        articleId,
      )
      .maybeSingle();

  if (
    articleError
  ) {
    return NextResponse.json(
      {
        error:
          articleError.message,
      },
      {
        status: 500,
      },
    );
  }

  if (!article) {
    return NextResponse.json(
      {
        error:
          "Constitution Article not found.",
      },
      {
        status: 404,
      },
    );
  }

  /* -------------------------------------------------------
     Validate target
     ------------------------------------------------------- */

  if (
    linkType ===
    "person"
  ) {
    if (
      !body.person_id ||
      ![
        "leader",
        "mca",
      ].includes(
        String(
          body.person_kind,
        ),
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A valid person target is required.",
        },
        {
          status: 400,
        },
      );
    }
  }

  if (
    linkType ===
      "institution" &&
    !body.institution_id
  ) {
    return NextResponse.json(
      {
        error:
          "A valid institution target is required.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    linkType ===
      "law" &&
    !body.target_document_id
  ) {
    return NextResponse.json(
      {
        error:
          "A valid legal document target is required.",
      },
      {
        status: 400,
      },
    );
  }

  if (linkType === "internal") {
    const targetUrl = String(body.target_url || "").trim();
    if (!targetUrl.startsWith("/") || targetUrl.startsWith("//")) {
      return NextResponse.json(
        {
          error:
            "Internal CitizenGuide links must be a relative path beginning with a single /.",
        },
        { status: 400 },
      );
    }
  }

  if (linkType === "external") {
    const targetUrl = String(body.target_url || "").trim();
    try {
      const parsed = new URL(targetUrl);
      if (parsed.protocol !== "https:") {
        throw new Error("https only");
      }
    } catch {
      return NextResponse.json(
        {
          error:
            "External official sources must be a valid HTTPS URL.",
        },
        { status: 400 },
      );
    }
  }

  /* -------------------------------------------------------
     Build inline-link row
     ------------------------------------------------------- */

  let row:
    Record<
      string,
      any
    >;

  if (
    linkType ===
    "person"
  ) {
    row = {
      id,

      article_id:
        articleId,

      link_type:
        "person",

      leader_id:
        body.person_kind ===
        "leader"
          ? body.person_id
          : null,

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

      target_document_id:
        null,

      target_provision_id:
        null,

      target_url:
        null,

      target_label:
        null,

      external_source_name:
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

      verification_status:
        body.verification_status ||
        "Verified",

      notes:
        body.notes ||
        null,
    };
  } else if (
    linkType ===
    "institution"
  ) {
    row = {
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

      target_document_id:
        null,

      target_provision_id:
        null,

      target_url:
        null,

      target_label:
        null,

      external_source_name:
        null,

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

      verification_status:
        body.verification_status ||
        "Verified",

      notes:
        body.notes ||
        null,
    };
  } else if (
    linkType ===
    "law"
  ) {
    row = {
      id,

      article_id:
        articleId,

      link_type:
        "law",

      leader_id:
        null,

      mca_id:
        null,

      leader_role_id:
        null,

      institution_id:
        null,

      target_document_id:
        body.target_document_id,

      target_provision_id:
        body.target_provision_id ||
        null,

      target_url:
        null,

      target_label:
        null,

      external_source_name:
        null,

      selected_text:
        selectedText,

      historical_label:
        body.historical_label ||
        selectedText,

      semantic_role:
        body.semantic_role ||
        "references",

      capacity_title:
        null,

      organization_name:
        null,

      verification_status:
        body.verification_status ||
        "Verified",

      notes:
        body.notes ||
        null,
    };
  } else if (linkType === "internal") {
    row = {
      id,
      article_id: articleId,
      link_type: "internal",
      leader_id: null,
      mca_id: null,
      leader_role_id: null,
      institution_id: null,
      target_document_id: null,
      target_provision_id: null,
      target_url: String(body.target_url || "").trim(),
      target_label: body.target_label || selectedText,
      external_source_name: null,
      selected_text: selectedText,
      historical_label: body.historical_label || selectedText,
      semantic_role: body.semantic_role || "related_internal",
      capacity_title: null,
      organization_name: null,
      verification_status: body.verification_status || "Verified",
      notes: body.notes || null,
    };
  } else {
    row = {
      id,
      article_id: articleId,
      link_type: "external",
      leader_id: null,
      mca_id: null,
      leader_role_id: null,
      institution_id: null,
      target_document_id: null,
      target_provision_id: null,
      target_url: String(body.target_url || "").trim(),
      target_label: body.target_label || selectedText,
      external_source_name: body.external_source_name || null,
      selected_text: selectedText,
      historical_label: body.historical_label || selectedText,
      semantic_role: body.semantic_role || "official_source",
      capacity_title: null,
      organization_name: null,
      verification_status: body.verification_status || "Verified",
      notes: body.notes || null,
    };
  }

  /*
   * Step 1:
   * insert relationship row.
   */
  const {
    data: link,
    error:
      linkError,
  } =
    await auth.supabase
      .from(
        "constitution_inline_links",
      )
      .insert(
        row,
      )
      .select("*")
      .single();

  if (
    linkError
  ) {
    return NextResponse.json(
      {
        error:
          linkError.message,
      },
      {
        status: 400,
      },
    );
  }

  /*
   * Step 2:
   * persist the HTML containing the permanent marker.
   *
   * This is the part that makes the linked highlight survive
   * a refresh and makes public rendering possible.
   */
  const {
    error:
      htmlError,
  } =
    await auth.supabase
      .from(
        "constitution_articles",
      )
      .update({
        body_html:
          contentHtml,
      })
      .eq(
        "id",
        articleId,
      );

  if (
    htmlError
  ) {
    /*
     * Exactly like Gazette:
     * rollback the relationship row if HTML persistence fails.
     */
    await auth.supabase
      .from(
        "constitution_inline_links",
      )
      .delete()
      .eq(
        "id",
        id,
      );

    return NextResponse.json(
      {
        error:
          htmlError.message,

        hint:
          "The inline-link row was rolled back because constitution_articles.body_html could not be updated.",
      },
      {
        status: 400,
      },
    );
  }

  /*
   * Step 3:
   * for law links also register the legal graph.
   *
   * Failure here does not undo the visible inline link.
   */
  let warning:
    | string
    | null =
    null;

  if (
    linkType ===
      "law" &&
    article.legal_provision_id
  ) {
    const {
      error:
        citationError,
    } =
      await auth.supabase
        .from(
          "legal_citations",
        )
        .insert({
          source_type:
            "constitution_article",

          source_id:
            articleId,

          source_provision_id:
            article.legal_provision_id,

          target_document_id:
            body.target_document_id,

          target_provision_id:
            body.target_provision_id ||
            null,

          relationship_type:
            body.semantic_role ||
            "references",

          reference_text:
            selectedText,

          source_excerpt:
            selectedText,

          verification_status:
            "Verified",

          confidence:
            1,

          metadata: {
            inline_link_id:
              id,

            curated_from:
              "constitution_admin",
          },
        });

    if (
      citationError
    ) {
      warning =
        `The inline law link was saved, but the legal graph relationship could not be created: ${citationError.message}`;
    }
  }

  return NextResponse.json(
    {
      data:
        link,

      warning,

      content_html:
        contentHtml,
    },
    {
      status: 201,
    },
  );
}

/* =========================================================
   DELETE
   ========================================================= */

export async function DELETE(
  request: NextRequest,
  context: Ctx,
) {
  const auth =
    await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  const {
    articleId,
  } =
    await context.params;

  const {
    searchParams,
  } =
    new URL(
      request.url,
    );

  const linkId =
    String(
      searchParams.get(
        "link_id",
      ) || "",
    ).trim();

  if (!linkId) {
    return NextResponse.json(
      {
        error:
          "link_id is required.",
      },
      {
        status: 400,
      },
    );
  }

  const {
    data: article,
    error:
      articleError,
  } =
    await auth.supabase
      .from(
        "constitution_articles",
      )
      .select(
        "body_html",
      )
      .eq(
        "id",
        articleId,
      )
      .maybeSingle();

  if (
    articleError ||
    !article
  ) {
    return NextResponse.json(
      {
        error:
          articleError?.message ||
          "Constitution Article not found.",
      },
      {
        status: 404,
      },
    );
  }

  const currentHtml =
    String(
      article.body_html ||
        "",
    );

  /*
   * Remove every span fragment carrying this relationship UUID,
   * while preserving the exact constitutional wording inside.
   */
  const nextHtml =
    currentHtml.replace(
      markerRegex(
        linkId,
      ),
      "$1",
    );

  /*
   * Update HTML first.
   */
  const {
    error:
      htmlError,
  } =
    await auth.supabase
      .from(
        "constitution_articles",
      )
      .update({
        body_html:
          nextHtml,
      })
      .eq(
        "id",
        articleId,
      );

  if (
    htmlError
  ) {
    return NextResponse.json(
      {
        error:
          htmlError.message,
      },
      {
        status: 400,
      },
    );
  }

  /*
   * Delete legal citation generated by this inline law link.
   */
  const {
    data:
      linkRow,
  } =
    await auth.supabase
      .from(
        "constitution_inline_links",
      )
      .select(
        "link_type",
      )
      .eq(
        "id",
        linkId,
      )
      .eq(
        "article_id",
        articleId,
      )
      .maybeSingle();

  if (
    linkRow?.link_type ===
    "law"
  ) {
    /*
     * jsonb containment finds:
     * metadata.inline_link_id == linkId
     */
    await auth.supabase
      .from(
        "legal_citations",
      )
      .delete()
      .contains(
        "metadata",
        {
          inline_link_id:
            linkId,
        },
      );
  }

  const {
    error:
      deleteError,
  } =
    await auth.supabase
      .from(
        "constitution_inline_links",
      )
      .delete()
      .eq(
        "id",
        linkId,
      )
      .eq(
        "article_id",
        articleId,
      );

  if (
    deleteError
  ) {
    return NextResponse.json(
      {
        error:
          deleteError.message,
      },
      {
        status: 500,
      },
    );
  }

  return NextResponse.json(
    {
      success:
        true,

      content_html:
        nextHtml,
    },
  );
}

/* =========================================================
   PATCH review status
   ========================================================= */

export async function PATCH(
  request: NextRequest,
  context: Ctx,
) {
  const auth =
    await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  const {
    articleId,
  } =
    await context.params;

  let body:
    Record<
      string,
      any
    >;

  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "Invalid JSON.",
      },
      {
        status: 400,
      },
    );
  }

  const status =
    String(
      body.relationship_review_status ||
        "",
    );

  const allowed = [
    "Not reviewed",
    "Partially linked",
    "Reviewed",
    "Needs attention",
  ];

  if (
    !allowed.includes(
      status,
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid relationship review status.",
      },
      {
        status: 400,
      },
    );
  }

  const {
    error,
  } =
    await auth.supabase
      .from(
        "constitution_articles",
      )
      .update({
        relationship_review_status:
          status,
      })
      .eq(
        "id",
        articleId,
      );

  if (error) {
    return NextResponse.json(
      {
        error:
          error.message,
      },
      {
        status: 400,
      },
    );
  }

  return NextResponse.json(
    {
      success:
        true,

      relationship_review_status:
        status,
    },
  );
}