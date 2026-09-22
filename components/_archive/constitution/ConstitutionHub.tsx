"use client";

import Link from "next/link";
import { useState } from "react";
import { adminPath } from "@/lib/admin-path";
import { defaultChapterTitle } from "@/lib/constitution/chapters";
import type { ConstitutionSettings } from "@/lib/constitution/plain-english";
import ConstitutionUploadPanel from "@/components/admin/constitution/UploadPanel";
import ConstitutionSettingsPanel from "@/components/admin/constitution/SettingsPanel";
import ConstitutionLinkPhrasesPanel from "@/components/admin/constitution/LinkPhrasesPanel";
import ConstitutionScheduleUploadPanel from "@/components/admin/constitution/ScheduleUploadPanel";

export type ConstitutionArticleRow = {
  _id: string;
  chapter: number;
  chapterTitle?: string | null;
  articleNumber: number;
  articleTitle?: string | null;
  hasPlainEnglish?: boolean;
};

export type ConstitutionTab =
  | "chapters"
  | "upload"
  | "schedules"
  | "links"
  | "settings";

type Props = {
  articles: ConstitutionArticleRow[];
  settings: ConstitutionSettings;
  studioBase: string;
  initialTab?: ConstitutionTab;
};

const TABS: { id: ConstitutionTab; label: string }[] = [
  { id: "chapters", label: "Chapters in Sanity" },
  { id: "upload", label: "Paste chapter" },
  { id: "schedules", label: "Paste schedule" },
  { id: "links", label: "Link phrases" },
  { id: "settings", label: "Plain English settings" },
];

export default function ConstitutionHub({
  articles,
  settings,
  studioBase,
  initialTab = "chapters",
}: Props) {
  const [tab, setTab] = useState<ConstitutionTab>(initialTab);

  const byChapter = articles.reduce(
    (acc: Record<number, ConstitutionArticleRow[]>, row) => {
      const ch = Number(row.chapter);
      if (!acc[ch]) acc[ch] = [];
      acc[ch].push(row);
      return acc;
    },
    {},
  );
  const chapterNumbers = Object.keys(byChapter)
    .map(Number)
    .sort((a, b) => a - b);

  const switchTab = (next: ConstitutionTab) => {
    setTab(next);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", next);
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <div>
      <div className="govuk-!-margin-bottom-6">
        <span className="govuk-caption-l">Law &amp; Constitution</span>
        <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
          Constitution of Kenya 2010
        </h1>
        <p className="govuk-body-l">
          Manage chapters stored in Sanity: inventory what is published, paste
          official text for the next chapter (from Chapter 10), and control
          Plain English visibility.
        </p>
      </div>

      <nav className="govuk-!-margin-bottom-6" aria-label="Constitution admin tabs">
        <ul className="govuk-list" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {TABS.map((t) => (
            <li key={t.id} style={{ margin: 0 }}>
              <button
                type="button"
                className={
                  tab === t.id
                    ? "govuk-button govuk-!-margin-bottom-0"
                    : "govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
                }
                aria-current={tab === t.id ? "page" : undefined}
                onClick={() => switchTab(t.id)}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {tab === "chapters" && (
        <div>
          <h2 className="govuk-heading-l">Chapters in Sanity</h2>
          <p className="govuk-body">
            {articles.length} article document(s) across {chapterNumbers.length}{" "}
            chapter(s). Chapter 9 (Executive) should already be present; continue
            from Chapter 10 using the Paste tab.
          </p>

          {chapterNumbers.length === 0 ? (
            <p className="govuk-body">
              No constitution articles found yet. Use{" "}
              <button
                type="button"
                className="govuk-link"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  font: "inherit",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => switchTab("upload")}
              >
                Paste chapter
              </button>{" "}
              to upload Chapter 10.
            </p>
          ) : (
            chapterNumbers.map((ch) => {
              const rows = byChapter[ch] || [];
              const title =
                rows[0]?.chapterTitle || defaultChapterTitle(ch);
              const withPe = rows.filter((r) => r.hasPlainEnglish).length;
              return (
                <details
                  key={ch}
                  className="govuk-details"
                  open={ch === 9 || ch === 10}
                >
                  <summary className="govuk-details__summary">
                    <span className="govuk-details__summary-text">
                      Chapter {ch}: {title} — {rows.length} articles (
                      {withPe} with Plain English)
                    </span>
                  </summary>
                  <div className="govuk-details__text">
                    <p className="govuk-body">
                      <Link
                        href={`/constitution/chapter/${ch}`}
                        className="govuk-link"
                        target="_blank"
                      >
                        Public chapter page
                      </Link>
                      {" · "}
                      <a
                        href={`${studioBase}/structure/constitutionArticle`}
                        className="govuk-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open in Sanity Studio
                      </a>
                    </p>
                    <table className="govuk-table">
                      <thead className="govuk-table__head">
                        <tr className="govuk-table__row">
                          <th scope="col" className="govuk-table__header">
                            Article
                          </th>
                          <th scope="col" className="govuk-table__header">
                            Title
                          </th>
                          <th scope="col" className="govuk-table__header">
                            Plain English
                          </th>
                        </tr>
                      </thead>
                      <tbody className="govuk-table__body">
                        {rows
                          .slice()
                          .sort(
                            (a, b) =>
                              Number(a.articleNumber) - Number(b.articleNumber),
                          )
                          .map((row) => (
                            <tr key={row._id} className="govuk-table__row">
                              <th
                                scope="row"
                                className="govuk-table__header"
                              >
                                <Link
                                  href={`/constitution/chapter/${ch}/article/${row.articleNumber}`}
                                  className="govuk-link"
                                  target="_blank"
                                >
                                  {row.articleNumber}
                                </Link>
                              </th>
                              <td className="govuk-table__cell">
                                {row.articleTitle || "—"}
                              </td>
                              <td className="govuk-table__cell">
                                {row.hasPlainEnglish ? (
                                  <strong className="govuk-tag govuk-tag--blue">
                                    Yes
                                  </strong>
                                ) : (
                                  <span className="govuk-hint">No</span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              );
            })
          )}

          <p className="govuk-body govuk-!-margin-top-6">
            <Link href={adminPath()} className="govuk-back-link">
              Back to admin dashboard
            </Link>
          </p>
        </div>
      )}

      {tab === "upload" && <ConstitutionUploadPanel />}

      {tab === "schedules" && <ConstitutionScheduleUploadPanel />}

      {tab === "links" && <ConstitutionLinkPhrasesPanel />}

      {tab === "settings" && (
        <ConstitutionSettingsPanel
          initialSettings={settings}
          existingChapters={chapterNumbers}
        />
      )}
    </div>
  );
}
