import Link from "next/link";

import styles from "./constitution-admin.module.css";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function reviewTag(status: string | null) {
  if (status === "Reviewed") return "govuk-tag--green";
  if (status === "Needs attention") return "govuk-tag--red";
  if (status === "Partially linked") return "govuk-tag--blue";
  if (status === "Not reviewed") return "govuk-tag--grey";
  return "govuk-tag--grey";
}

export default async function ConstitutionAdminPage() {
  const supabase = await createClient();

  const [
    { count: articles },
    { count: reviewed },
    { count: attention },
    { count: relationshipsReviewed },
  ] = await Promise.all([
    supabase
      .from("constitution_articles")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("constitution_articles")
      .select("id", { count: "exact", head: true })
      .eq("review_status", "Reviewed"),

    supabase
      .from("constitution_articles")
      .select("id", { count: "exact", head: true })
      .eq("review_status", "Needs attention"),

    supabase
      .from("constitution_articles")
      .select("id", { count: "exact", head: true })
      .eq("relationship_review_status", "Reviewed"),
  ]);

  const { data: rows, error } = await supabase
    .from("constitution_articles")
    .select(`
      id,
      article_number,
      title,
      review_status,
      relationship_review_status,
      legal_provision_id
    `)
    .order("article_number");

  return (
    <main className="govuk-width-container govuk-!-padding-top-6 govuk-!-padding-bottom-9">
      <span className="govuk-caption-xl">CitizenGuide admin</span>

      <h1 className="govuk-heading-xl">Constitution</h1>

      <p className="govuk-body-l">
        Review and manage the Constitution of Kenya, edit Article content and
        connect constitutional provisions to people, institutions and other
        legal material.
      </p>

      <div className={`${styles.stats} govuk-!-margin-bottom-8`}>
        <Stat label="Articles" value={articles || 0} />
        <Stat label="Content reviewed" value={reviewed || 0} />
        <Stat label="Relationships reviewed" value={relationshipsReviewed || 0} />
        <Stat label="Needs attention" value={attention || 0} />
      </div>

      <div className="govuk-button-group govuk-!-margin-bottom-8">
        <Link
          href="/constitution"
          target="_blank"
          className="govuk-button govuk-button--secondary"
        >
          View public Constitution
        </Link>
      </div>

      <h2 className="govuk-heading-l">Articles</h2>

      {error && (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">
            Constitution articles could not be loaded
          </h2>

          <div className="govuk-error-summary__body">
            <p className="govuk-body">{error.message}</p>
          </div>
        </div>
      )}

      {!error && (
        <div className={styles.tableWrapper}>
          <table className="govuk-table">
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th className="govuk-table__header" scope="col">
                  Article
                </th>

                <th className="govuk-table__header" scope="col">
                  Title
                </th>

                <th className="govuk-table__header" scope="col">
                  Content review
                </th>

                <th className="govuk-table__header" scope="col">
                  Linking review
                </th>

                <th className="govuk-table__header" scope="col">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="govuk-table__body">
              {(rows || []).map((article) => (
                <tr className="govuk-table__row" key={article.id}>
                  <td className="govuk-table__cell">
                    <strong>{article.article_number}</strong>
                  </td>

                  <td className="govuk-table__cell">
                    {article.title}
                  </td>

                  <td className="govuk-table__cell">
                    <strong
                      className={`govuk-tag ${reviewTag(
                        article.review_status,
                      )}`}
                    >
                      {article.review_status}
                    </strong>
                  </td>

                  <td className="govuk-table__cell">
                    <strong
                      className={`govuk-tag ${reviewTag(
                        article.relationship_review_status,
                      )}`}
                    >
                      {article.relationship_review_status || "Not reviewed"}
                    </strong>
                  </td>

                  <td className="govuk-table__cell">
                    <div className={styles.actions}>
                      <Link
                        className="govuk-link"
                        href={`/admin/constitution/articles/${article.id}`}
                      >
                        Edit
                      </Link>

                      <Link
                        className="govuk-link"
                        href={`/admin/constitution/articles/${article.id}/relationships`}
                      >
                        Relationships
                      </Link>

                      <Link
                        className="govuk-link"
                        target="_blank"
                        href={`/constitution/article/${article.article_number}`}
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className={styles.stat}>
      <span className="govuk-heading-l govuk-!-margin-bottom-1">
        {value}
      </span>

      <span className="govuk-body-s">
        {label}
      </span>
    </div>
  );
}