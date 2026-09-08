import type { Metadata } from "next";
import Link from "next/link";

import ConstitutionShell from "@/components/constitution/ConstitutionShell";
import ReaderNavigation from "@/components/constitution/ReaderNavigation";
import CopyButton from "@/components/constitution/CopyButton";
import ConstitutionArticleContent from "@/components/constitution/ConstitutionArticleContent";

import { getArticle } from "@/lib/constitution/data";

type ArticlePageProps = {
  params: Promise<{
    articleNumber: string;
  }>;
};

const CITIZENGUIDE_BASE_URL =
  "https://citizenguide.ke";

const PARLIAMENT_PDF =
  "https://www.parliament.go.ke/sites/default/files/2023-03/The_Constitution_of_Kenya_2010.pdf";

const KENYA_LAW_SOURCE =
  "https://kenyalaw.org/akn/ke/act/2010/constitution/eng@2010-09-03";

function parseArticleNumber(
  value: string,
): number | null {
  const number = Number(value);

  if (
    !Number.isInteger(number) ||
    number < 1 ||
    number > 264
  ) {
    return null;
  }

  return number;
}

/* =========================================================
   Metadata
   ========================================================= */

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { articleNumber } =
    await params;

  const number =
    parseArticleNumber(
      articleNumber,
    );

  if (!number) {
    return {
      title:
        "Article | Constitution of Kenya, 2010",
    };
  }

  const data =
    await getArticle(number);

  if (!data) {
    return {
      title:
        `Article ${number} | Constitution of Kenya, 2010`,
    };
  }

  return {
    title:
      `Article ${data.article.article_number}: ${data.article.title}`,

    description:
      `Read Article ${data.article.article_number} of the Constitution of Kenya, 2010 — ${data.article.title}.`,

    alternates: {
      canonical:
        `/constitution/article/${data.article.article_number}`,
    },
  };
}

/* =========================================================
   Page
   ========================================================= */

export default async function ArticlePage({
  params,
}: ArticlePageProps) {
  const { articleNumber } =
    await params;

  const number =
    parseArticleNumber(
      articleNumber,
    );

  /* ---------------------------------------------------------
     Invalid Article number
     --------------------------------------------------------- */

  if (!number) {
    return (
      <ConstitutionShell
        title="Article not found"
        caption="Constitution of Kenya, 2010"
      >
        <p className="govuk-body">
          The Constitution contains
          Articles 1 to 264.
        </p>

        <Link
          className="govuk-link"
          href="/constitution"
        >
          Return to the Constitution
          contents
        </Link>
      </ConstitutionShell>
    );
  }

  const data =
    await getArticle(number);

  /* ---------------------------------------------------------
     Article not returned
     --------------------------------------------------------- */

  if (!data) {
    return (
      <ConstitutionShell
        title={`Article ${number}`}
        caption="Constitution of Kenya, 2010"
      >
        <div
          className="govuk-notification-banner"
          role="region"
          aria-labelledby="article-not-loaded-title"
        >
          <div className="govuk-notification-banner__header">
            <h2
              id="article-not-loaded-title"
              className="govuk-notification-banner__title"
            >
              Article data could not be
              loaded
            </h2>
          </div>

          <div className="govuk-notification-banner__content">
            <p className="govuk-body">
              Article {number} was not
              returned from the
              Constitution database.
            </p>

            <p className="govuk-body govuk-!-margin-bottom-0">
              <Link
                className="govuk-link"
                href="/constitution"
              >
                Return to the
                Constitution contents
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

  const chapter =
    article.constitution_chapters ??
    null;

  const part =
    article.constitution_parts ??
    null;

  const bodyHtml =
    typeof article.body_html ===
      "string"
      ? article.body_html.trim()
      : "";

  /* ---------------------------------------------------------
     Citation / copy information
     --------------------------------------------------------- */

  const articleUrl =
    `${CITIZENGUIDE_BASE_URL}/constitution/article/${article.article_number}`;

  const citation =
    `Article ${article.article_number}, Constitution of Kenya, 2010`;

  const articlePlainText =
    typeof article.body_text ===
    "string"
      ? article.body_text
          .replace(
            /\r\n/g,
            "\n",
          )
          .replace(
            /\n{3,}/g,
            "\n\n",
          )
          .trim()
      : "";

  const fullArticleCopyText =
    [
      `Article ${article.article_number}: ${article.title}`,
      "",
      articlePlainText ||
        "Article text unavailable.",
      "",
      citation,
      "",
      `Copied from: ${articleUrl}`,
      "",
      "Official sources:",
      `Parliament of Kenya: ${PARLIAMENT_PDF}`,
      `Kenya Law: ${KENYA_LAW_SOURCE}`,
    ].join("\n");

  const citationCopyText =
    [
      citation,
      `CitizenGuide: ${articleUrl}`,
      `Official source — Parliament of Kenya: ${PARLIAMENT_PDF}`,
      `Official source — Kenya Law: ${KENYA_LAW_SOURCE}`,
    ].join("\n");

  return (
    <ConstitutionShell
      title={
        article.title ||
        `Article ${article.article_number}`
      }
      caption={`Article ${article.article_number} · Constitution of Kenya, 2010`}
    >
      <div className="constitution-reader-layout">
        <article className="constitution-reading-column">

          {/* =================================================
              Chapter / Part context
              ================================================= */}

          {chapter || part ? (
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
                    Chapter{" "}
                    {chapter.chapter_number}:{" "}
                    {chapter.title}
                  </Link>
                </p>
              ) : null}

              {part ? (
                <p className="govuk-body-s govuk-!-margin-bottom-0">
                  Part {part.part_number}:{" "}
                  {part.title}
                </p>
              ) : null}
            </nav>
          ) : null}

          {/* =================================================
              Copy Article
              ================================================= */}

          <div className="constitution-copy-bar govuk-!-margin-bottom-5">
            <CopyButton
              text={
                fullArticleCopyText
              }
              label="Copy Article"
              copiedLabel="Article copied"
            />

            <p className="govuk-body-s govuk-!-margin-bottom-0">
              Copies the full Article
              text, citation,
              CitizenGuide URL and
              official-source links.
            </p>
          </div>

          {/* =================================================
              Article text and relationship links
              ================================================= */}

          {bodyHtml ||
          article.body_text ? (
            <div
              id="constitution-article-text"
              className="constitution-article-text"
            >
              <ConstitutionArticleContent
                articleId={
                  article.id
                }
                bodyHtml={
                  bodyHtml
                }
                bodyText={
                  article.body_text
                }
              />
            </div>
          ) : (
            <p className="govuk-body">
              Article text is not
              available.
            </p>
          )}

          {/* =================================================
              Link behaviour
              ================================================= */}

          <p className="govuk-body-s govuk-!-margin-top-5">
            Links within the Article may open related CitizenGuide people,
            institutions, Acts or other CitizenGuide pages. Links marked with
            <span aria-hidden="true"> ↗</span> lead to an external official source.
          </p>

          {/* =================================================
              Source accordion / GOV.UK details component
              ================================================= */}

          <details className="govuk-details govuk-!-margin-top-7">
            <summary className="govuk-details__summary">
              <span className="govuk-details__summary-text">
                Source and official
                versions
              </span>
            </summary>

            <div className="govuk-details__text">
              <p className="govuk-body-s">
                Accessible HTML
                version:{" "}
                <a
                  className="govuk-link"
                  href={articleUrl}
                >
                  {articleUrl}
                </a>
              </p>

              <p className="govuk-body-s govuk-!-margin-bottom-2">
                Original full
                Constitution:
              </p>

              <ul className="govuk-list govuk-list--bullet govuk-body-s">
                <li>
                  <a
                    className="govuk-link"
                    href={
                      PARLIAMENT_PDF
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Parliament of Kenya
                    — Constitution of
                    Kenya, 2010 PDF{" "}
                    <span
                      aria-hidden="true"
                    >
                      ↗
                    </span>
                    <span className="govuk-visually-hidden">
                      {" "}
                      (opens in a new
                      tab)
                    </span>
                  </a>
                </li>

                <li>
                  <a
                    className="govuk-link"
                    href={
                      KENYA_LAW_SOURCE
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Kenya Law —
                    Constitution of
                    Kenya, 2010{" "}
                    <span
                      aria-hidden="true"
                    >
                      ↗
                    </span>
                    <span className="govuk-visually-hidden">
                      {" "}
                      (opens in a new
                      tab)
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </details>

          {/* =================================================
              Legal citations / referenced provisions
              ================================================= */}

          {citations.length > 0 ? (
            <aside
              className="govuk-!-margin-top-8"
              aria-labelledby="related-provisions-heading"
            >
              <h2
                id="related-provisions-heading"
                className="govuk-heading-m"
              >
                Articles referenced
                here
              </h2>

              <ul className="govuk-list govuk-list--bullet">
                {citations.map(
                  (
                    citationRow: any,
                  ) => {
                    const target =
                      Array.isArray(
                        citationRow.legal_provisions,
                      )
                        ? citationRow
                            .legal_provisions[0] ??
                          null
                        : citationRow.legal_provisions ??
                          null;

                    if (
                      !target?.canonical_path
                    ) {
                      return null;
                    }

                    return (
                      <li
                        key={
                          citationRow.id
                        }
                      >
                        <Link
                          className="govuk-link govuk-link--no-visited-state"
                          href={
                            target.canonical_path
                          }
                        >
                          {target.number_label ||
                            citationRow.reference_text ||
                            "Referenced provision"}

                          {target.heading
                            ? `: ${target.heading}`
                            : ""}
                        </Link>
                      </li>
                    );
                  },
                )}
              </ul>
            </aside>
          ) : null}

          {/* =================================================
              Previous / Next
              ================================================= */}

          <ReaderNavigation
            prev={prev}
            next={next}
          />
        </article>

        {/* ===================================================
            Reader tools
            =================================================== */}

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
                    Chapter{" "}
                    {chapter.chapter_number}
                  </Link>
                </li>
              ) : null}
            </ul>

            {/* ===============================================
                Citation panel
                =============================================== */}

            <div className="constitution-citation-panel govuk-!-margin-top-6">
              <h2 className="govuk-heading-s govuk-!-margin-bottom-2">
                Citation
              </h2>

              <code className="constitution-citation-code">
                {citation}
              </code>

              <div className="govuk-!-margin-top-3">
                <CopyButton
                  text={
                    citationCopyText
                  }
                  label="Copy citation"
                  copiedLabel="Citation copied"
                />
              </div>
            </div>
          </nav>
        </aside>
      </div>
    </ConstitutionShell>
  );
}