"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ConstitutionPortableText from "@/components/sanity/ConstitutionPortableText";
import { resolveShowPlainEnglish } from "@/lib/constitution/plain-english";
import type { ConstitutionSettings } from "@/lib/constitution/plain-english";
import type { LinkPhrase } from "@/lib/constitution/link-phrases";

export type ChapterArticle = {
  _id: string;
  chapter: number;
  chapterTitle?: string | null;
  partNumber?: number | null;
  partTitle?: string | null;
  articleNumber: number;
  articleTitle?: string | null;
  officialText?: unknown;
  amplifiedText?: unknown;
};

type Props = {
  chapter: number;
  chapterTitle: string;
  articles: ChapterArticle[];
  settings: ConstitutionSettings | null;
  linkPhrases?: LinkPhrase[] | null;
  prevChapter?: { chapter: number; title: string } | null;
  nextChapter?: { chapter: number; title: string } | null;
};

export default function ChapterReader({
  chapter,
  chapterTitle,
  articles,
  settings,
  linkPhrases = null,
  prevChapter,
  nextChapter,
}: Props) {
  const showPlainEnglish = resolveShowPlainEnglish(settings, chapter);
  const [activeId, setActiveId] = useState<string | null>(
    articles[0] ? `article-${articles[0].articleNumber}` : null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const ids = useMemo(
    () => articles.map((a) => `article-${a.articleNumber}`),
    [articles],
  );

  useEffect(() => {
    if (ids.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.1, 0.25, 0.5],
      },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);

  // Honour hash on load
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace(/^#/, "");
    if (hash && document.getElementById(hash)) {
      setActiveId(hash);
      document.getElementById(hash)?.scrollIntoView({ block: "start" });
    }
  }, []);

  let lastPartKey = "";

  return (
    <div className="app-constitution-reader">
      <div className="app-constitution-reader__sticky govuk-!-display-none-print">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span className="govuk-caption-m govuk-!-margin-bottom-0">
              Constitution of Kenya 2010
            </span>
            <p className="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-0">
              Chapter {chapter}: {chapterTitle}
            </p>
          </div>
          <button
            type="button"
            className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0 app-constitution-reader__mobile-toc"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((v) => !v)}
          >
            {drawerOpen ? "Hide contents" : "Contents"}
          </button>
        </div>

        {drawerOpen && (
          <nav
            className="govuk-!-margin-top-3 app-constitution-reader__mobile-toc"
            aria-label="Chapter contents"
          >
            <ul className="govuk-list">
              {articles.map((a) => {
                const id = `article-${a.articleNumber}`;
                return (
                  <li key={a._id}>
                    <a
                      href={`#${id}`}
                      className={
                        activeId === id
                          ? "app-constitution-toc-link is-active"
                          : "app-constitution-toc-link"
                      }
                      onClick={() => setDrawerOpen(false)}
                    >
                      {a.articleNumber}. {a.articleTitle}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>

      <div className="app-constitution-reader__layout">
        <aside
          className="app-constitution-reader__toc govuk-!-display-none-print"
          aria-label="Chapter contents"
        >
          <h2 className="govuk-heading-s">In this chapter</h2>
          <nav>
            <ul className="govuk-list">
              {articles.map((a) => {
                const id = `article-${a.articleNumber}`;
                return (
                  <li key={a._id}>
                    <a
                      href={`#${id}`}
                      className={
                        activeId === id
                          ? "app-constitution-toc-link is-active"
                          : "app-constitution-toc-link"
                      }
                    >
                      <span className="govuk-!-font-weight-bold">
                        {a.articleNumber}.
                      </span>{" "}
                      {a.articleTitle}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
          <p className="govuk-body-s">
            <Link
              href={`/constitution/chapter/${chapter}/article/${articles[0]?.articleNumber || 1}`}
              className="govuk-link"
            >
              Open first article page
            </Link>
          </p>
        </aside>

        <div className="app-constitution-reader__main">
          {articles.map((article) => {
            const id = `article-${article.articleNumber}`;
            const partKey =
              article.partNumber != null
                ? `${article.partNumber}:${article.partTitle || ""}`
                : "";
            const showPart = Boolean(partKey && partKey !== lastPartKey);
            if (partKey) lastPartKey = partKey;

            return (
              <article
                key={article._id}
                id={id}
                className={
                  activeId === id
                    ? "app-constitution-reader__article is-active"
                    : "app-constitution-reader__article"
                }
              >
                {showPart && (
                  <p className="govuk-caption-m govuk-!-margin-bottom-2">
                    Part {article.partNumber}
                    {article.partTitle ? ` — ${article.partTitle}` : ""}
                  </p>
                )}
                <h2 className="govuk-heading-m app-constitution-reader__article-title">
                  <Link
                    href={`/constitution/chapter/${chapter}/article/${article.articleNumber}`}
                    className="govuk-link govuk-link--no-visited-state"
                  >
                    Article {article.articleNumber}. {article.articleTitle}
                  </Link>
                </h2>

                <p className="govuk-caption-m govuk-!-margin-bottom-3">
                  Official constitutional text
                </p>
                <ConstitutionPortableText
                  content={article.officialText}
                  linkPhrases={linkPhrases}
                />

                {showPlainEnglish && (
                  <details className="govuk-details govuk-!-margin-top-4">
                    <summary className="govuk-details__summary">
                      <span className="govuk-details__summary-text">
                        Plain English Explanation
                      </span>
                    </summary>
                    <div className="govuk-details__text">
                      <p className="govuk-body-s govuk-!-margin-bottom-3">
                        Simplified summary — not the legal text.
                      </p>
                      {article.amplifiedText ? (
                        <ConstitutionPortableText
                          content={article.amplifiedText}
                          linkPhrases={linkPhrases}
                        />
                      ) : (
                        <p className="govuk-body-s">
                          A simplified explanation is being prepared for this
                          article.
                        </p>
                      )}
                    </div>
                  </details>
                )}
              </article>
            );
          })}

          <nav
            className="govuk-!-margin-top-8 govuk-!-margin-bottom-4"
            aria-label="Adjacent chapters"
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                justifyContent: "space-between",
              }}
            >
              {prevChapter ? (
                <Link
                  href={`/constitution/chapter/${prevChapter.chapter}`}
                  className="govuk-button govuk-button--secondary"
                >
                  ← Chapter {prevChapter.chapter}: {prevChapter.title}
                </Link>
              ) : (
                <span />
              )}
              {nextChapter ? (
                <Link
                  href={`/constitution/chapter/${nextChapter.chapter}`}
                  className="govuk-button govuk-button--secondary"
                >
                  Chapter {nextChapter.chapter}: {nextChapter.title} →
                </Link>
              ) : chapter >= 18 ? (
                <Link
                  href="/constitution/schedules"
                  className="govuk-button govuk-button--secondary"
                >
                  Schedules →
                </Link>
              ) : (
                <span />
              )}
            </div>
            <p className="govuk-body govuk-!-margin-top-4">
              <Link href="/constitution" className="govuk-link">
                All chapters
              </Link>
              {" · "}
              <Link href="/constitution/schedules" className="govuk-link">
                Schedules
              </Link>
            </p>
          </nav>
        </div>
      </div>
    </div>
  );
}
