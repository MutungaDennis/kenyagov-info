import Link from "next/link";

import ArticleEditor from "@/components/constitution/admin/ArticleEditor";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    articleId: string;
  }>;
};

export default async function ConstitutionArticleAdminPage({
  params,
}: Props) {
  const { articleId } = await params;
  const supabase = await createClient();

  const { data: article, error } = await supabase
    .from("constitution_articles")
    .select(`
      id,
      article_number,
      title,
      body_text,
      body_html,
      review_status,
      relationship_review_status,
      legal_provision_id,
      source_start_line,
      source_end_line,
      chapter_id,
      part_id
    `)
    .eq("id", articleId)
    .maybeSingle();

  if (error || !article) {
    return (
      <main className="govuk-width-container govuk-!-padding-top-6 govuk-!-padding-bottom-9">
        <Link
          href="/admin/constitution"
          className="govuk-back-link"
        >
          Back to Constitution
        </Link>

        <h1 className="govuk-heading-xl">
          Article not found
        </h1>

        {error && (
          <p className="govuk-body">
            {error.message}
          </p>
        )}
      </main>
    );
  }

  return (
    <main className="govuk-width-container govuk-!-padding-top-6 govuk-!-padding-bottom-9">
      <Link
        href="/admin/constitution"
        className="govuk-back-link"
      >
        Back to Constitution
      </Link>

      <span className="govuk-caption-xl">
        Constitution of Kenya, 2010
      </span>

      <h1 className="govuk-heading-xl">
        Article {article.article_number}
      </h1>

      <div className="govuk-button-group govuk-!-margin-bottom-7">
        <Link
          href={`/admin/constitution/articles/${article.id}/relationships`}
          className="govuk-button govuk-button--secondary"
        >
          Relationships
        </Link>

        <Link
          href={`/admin/constitution/articles/${article.id}/inline-links`}
          className="govuk-button govuk-button--secondary"
        >
          Inline linking
        </Link>

        <Link
          target="_blank"
          href={`/constitution/article/${article.article_number}`}
          className="govuk-button govuk-button--secondary"
        >
          View public
        </Link>
      </div>

      <ArticleEditor article={article} />
    </main>
  );
}