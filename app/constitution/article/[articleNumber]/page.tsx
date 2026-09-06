import type { Metadata } from "next";
import Link from "next/link";

import ConstitutionShell from "@/components/constitution/ConstitutionShell";
import ReaderNavigation from "@/components/constitution/ReaderNavigation";
import { getArticle } from "@/lib/constitution/data";
import { linkInternalConstitutionReferences } from "@/lib/constitution/link-internal-references";

type ArticlePageProps = {
  params: Promise<{
    articleNumber: string;
  }>;
};

function parseArticleNumber(value: string): number | null {
  const number = Number(value);

  if (!Number.isInteger(number) || number < 1 || number > 264) {
    return null;
  }

  return number;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { articleNumber } = await params;
  const number = parseArticleNumber(articleNumber);

  if (!number) {
    return {
      title: "Article | Constitution of Kenya, 2010",
    };
  }

  const data = await getArticle(number);

  if (!data) {
    return {
      title: `Article ${number} | Constitution of Kenya, 2010`,
    };
  }

  return {
    title: `Article ${data.article.article_number}: ${data.article.title}`,
    description: `Read Article ${data.article.article_number} of the Constitution of Kenya, 2010 — ${data.article.title}.`,
    alternates: {
      canonical: `/constitution/article/${data.article.article_number}`,
    },
  };
}

export default async function ArticlePage({
  params,
}: ArticlePageProps) {
  const { articleNumber } = await params;
  const number = parseArticleNumber(articleNumber);

  if (!number) {
    return (
      <ConstitutionShell
        title="Article not found"
        caption="Constitution of Kenya, 2010"
      >
        <p className="govuk-body">
          The Constitution contains Articles 1 to 264.
        </p>

        <Link className="govuk-link" href="/constitution">
          Return to the Constitution contents
        </Link>
      </ConstitutionShell>
    );
  }

  const data = await getArticle(number);

  if (!data) {
    return (
      <ConstitutionShell
        title={`Article ${number}`}
        caption="Constitution of Kenya, 2010"
      >
        <div className="govuk-notification-banner" role="region">
          <div className="govuk-notification-banner__header">
            <h2 className="govuk-notification-banner__title">
              Article data could not be loaded
            </h2>
          </div>

          <div className="govuk-notification-banner__content">
            <p className="govuk-body">
              Article {number} was not returned from the Constitution database.
            </p>

            <p className="govuk-body govuk-!-margin-bottom-0">
              <Link className="govuk-link" href="/constitution">
                Return to the Constitution contents
              </Link>
            </p>
          </div>
        </div>
      </ConstitutionShell>
    );
  }

  const {
    article,
    prev,
    next,
    citations,
  } = data;

  const chapter = article.constitution_chapters ?? null;
  const part = article.constitution_parts ?? null;

  const rawHtml =
    typeof article.body_html === "string"
      ? article.body_html.trim()
      : "";

  const bodyHtml = rawHtml
    ? linkInternalConstitutionReferences(rawHtml)
    : "";

  return (
    <ConstitutionShell
      title={article.title || `Article ${article.article_number}`}
      caption={`Article ${article.article_number} · Constitution of Kenya, 2010`}
    >
      <div className="constitution-reader-layout">
        <article className="constitution-reading-column">
          {(chapter || part) ? (
            <nav
              className="constitution-context govuk-!-margin-bottom-5"
              aria-label="Article context"
            >
              {chapter ? (
                <p className="govuk-body-s govuk-!-margin-bottom-2">
                  <Link
                    className="govuk-link govuk-link--no-visited-state"
                    href={`/constitution/chapter/${chapter.chapter_number}`}
                  >
                    Chapter {chapter.chapter_number}: {chapter.title}
                  </Link>
                </p>
              ) : null}

              {part ? (
                <p className="govuk-body-s govuk-!-margin-bottom-0">
                  Part {part.part_number}: {part.title}
                </p>
              ) : null}
            </nav>
          ) : null}

          {bodyHtml ? (
            <div
              id="constitution-article-text"
              className="constitution-article-text"
              dangerouslySetInnerHTML={{
                __html: bodyHtml,
              }}
            />
          ) : article.body_text ? (
            <div
              id="constitution-article-text"
              className="constitution-article-text"
            >
              {article.body_text
                .split(/\n{2,}/)
                .filter(Boolean)
                .map((paragraph: string, index: number) => (
                  <p className="govuk-body" key={index}>
                    {paragraph}
                  </p>
                ))}
            </div>
          ) : (
            <p className="govuk-body">
              Article text is not available.
            </p>
          )}

          {citations.length > 0 ? (
            <aside
              className="govuk-!-margin-top-8"
              aria-labelledby="related-provisions-heading"
            >
              <h2
                id="related-provisions-heading"
                className="govuk-heading-m"
              >
                Articles referenced here
              </h2>

              <ul className="govuk-list govuk-list--bullet">
                {citations.map((citation: any) => {
                  const target = Array.isArray(citation.legal_provisions)
                    ? citation.legal_provisions[0] ?? null
                    : citation.legal_provisions ?? null;

                  if (!target?.canonical_path) {
                    return null;
                  }

                  return (
                    <li key={citation.id}>
                      <Link
                        className="govuk-link govuk-link--no-visited-state"
                        href={target.canonical_path}
                      >
                        {target.number_label || citation.reference_text || "Referenced provision"}
                        {target.heading ? `: ${target.heading}` : ""}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </aside>
          ) : null}

          <ReaderNavigation
            prev={prev}
            next={next}
          />
        </article>

        <aside className="constitution-reader-tools">
          <nav aria-label="Constitution navigation">
            <h2 className="govuk-heading-s">
              In this Constitution
            </h2>

            <ul className="govuk-list govuk-body-s">
              <li>
                <Link
                  className="govuk-link govuk-link--no-visited-state"
                  href="/constitution"
                >
                  Table of contents
                </Link>
              </li>

              {chapter ? (
                <li>
                  <Link
                    className="govuk-link govuk-link--no-visited-state"
                    href={`/constitution/chapter/${chapter.chapter_number}`}
                  >
                    Chapter {chapter.chapter_number}
                  </Link>
                </li>
              ) : null}
            </ul>

            <h2 className="govuk-heading-s govuk-!-margin-top-6">
              Citation
            </h2>

            <code className="constitution-citation-code">
              Article {article.article_number}, Constitution of Kenya, 2010
            </code>
          </nav>
        </aside>
      </div>
    </ConstitutionShell>
  );
}
