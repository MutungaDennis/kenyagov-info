"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { defaultChapterTitle } from "@/lib/constitution/chapters";

type ParsedArticle = {
  partNumber?: number | null;
  partTitle?: string | null;
  articleNumber: number;
  articleTitle: string;
  officialText: string[];
};

type StructuredChapter = {
  chapter: number;
  chapterTitle: string;
  articles: ParsedArticle[];
};

export default function ConstitutionUploadPanel() {
  const [chapter, setChapter] = useState(10);
  const [chapterTitle, setChapterTitle] = useState(defaultChapterTitle(10));
  const [pastedText, setPastedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [structured, setStructured] = useState<StructuredChapter | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [publicPath, setPublicPath] = useState<string | null>(null);

  useEffect(() => {
    setChapterTitle(defaultChapterTitle(chapter));
  }, [chapter]);

  const handleProcess = async () => {
    if (pastedText.trim().length < 80) {
      setError("Paste at least ~80 characters of official Constitution text");
      return;
    }
    setIsProcessing(true);
    setError(null);
    setStructured(null);
    setSaveMessage(null);
    setPublicPath(null);

    try {
      const res = await fetch("/api/admin/constitution/process", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapter,
          chapterTitle: chapterTitle.trim(),
          text: pastedText.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.structured) {
        throw new Error(json.error || "Processing failed");
      }
      setStructured(json.structured as StructuredChapter);
      setChapterTitle(json.structured.chapterTitle || chapterTitle);
      setTimeout(() => {
        document
          .getElementById("constitution-preview")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const updateArticle = (index: number, patch: Partial<ParsedArticle>) => {
    if (!structured) return;
    const articles = structured.articles.map((a, i) =>
      i === index ? { ...a, ...patch } : a,
    );
    setStructured({ ...structured, articles });
  };

  const removeArticle = (index: number) => {
    if (!structured) return;
    setStructured({
      ...structured,
      articles: structured.articles.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    if (!structured?.articles.length) {
      setError("Nothing to save — process a chapter first");
      return;
    }
    setIsSaving(true);
    setError(null);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/admin/constitution/save", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapter: structured.chapter,
          chapterTitle: structured.chapterTitle || chapterTitle,
          articles: structured.articles,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Save failed");
      }
      setSaveMessage(json.message || `Saved ${json.saved} articles`);
      setPublicPath(json.publicPath || `/constitution/chapter/${structured.chapter}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h2 className="govuk-heading-l">Paste Constitution chapter</h2>
      <p className="govuk-body">
        Paste the <strong>official</strong> text for one chapter (start with
        Chapter 10 — Judiciary). Grok will split it into articles for you to
        review, then save into Sanity — same flow as Hansard paste upload.
      </p>

      {error && (
        <div
          className="govuk-error-summary"
          role="alert"
          style={{ marginBottom: 24 }}
        >
          <h2 className="govuk-error-summary__title">There is a problem</h2>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">{error}</p>
          </div>
        </div>
      )}

      {saveMessage && (
        <div className="govuk-notification-banner govuk-notification-banner--success" role="status">
          <div className="govuk-notification-banner__header">
            <h2 className="govuk-notification-banner__title">Success</h2>
          </div>
          <div className="govuk-notification-banner__content">
            <p className="govuk-body">{saveMessage}</p>
            {publicPath && (
              <p className="govuk-body">
                <Link href={publicPath} className="govuk-link" target="_blank">
                  View public chapter page
                </Link>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-quarter">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="const_chapter">
              Chapter number
            </label>
            <input
              id="const_chapter"
              className="govuk-input"
              type="number"
              min={0}
              max={18}
              value={chapter}
              onChange={(e) => setChapter(Number(e.target.value) || 0)}
            />
          </div>
        </div>
        <div className="govuk-grid-column-three-quarters">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="const_chapter_title">
              Chapter title
            </label>
            <input
              id="const_chapter_title"
              className="govuk-input"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="const_paste">
          Official chapter text
        </label>
        <div className="govuk-hint">
          Include article headings (e.g. “Article 159. Judicial authority”) and
          full clauses. Do not paste Plain English here.
        </div>
        <textarea
          id="const_paste"
          className="govuk-textarea"
          rows={16}
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="CHAPTER TEN — JUDICIARY&#10;&#10;Article 159. Judicial authority&#10;(1) Judicial authority is derived from the people…"
        />
      </div>

      <button
        type="button"
        className="govuk-button"
        disabled={isProcessing || pastedText.trim().length < 80}
        onClick={() => void handleProcess()}
      >
        {isProcessing ? "Grok is reading the chapter…" : "Process with Grok"}
      </button>

      {structured && (
        <div id="constitution-preview" className="govuk-!-margin-top-8">
          <h3 className="govuk-heading-m">
            Preview — Chapter {structured.chapter}: {structured.chapterTitle} (
            {structured.articles.length} articles)
          </h3>
          <p className="govuk-body">
            Review titles and text. Remove any mis-split rows, then save to
            Sanity.
          </p>

          <ol className="govuk-list">
            {structured.articles.map((article, index) => (
              <li
                key={`${article.articleNumber}-${index}`}
                className="govuk-!-margin-bottom-6"
                style={{
                  border: "1px solid #b1b4b6",
                  padding: 16,
                  background: "#fff",
                }}
              >
                <div className="govuk-grid-row">
                  <div className="govuk-grid-column-one-quarter">
                    <div className="govuk-form-group">
                      <label className="govuk-label" htmlFor={`art-num-${index}`}>
                        Article #
                      </label>
                      <input
                        id={`art-num-${index}`}
                        className="govuk-input"
                        type="number"
                        value={article.articleNumber}
                        onChange={(e) =>
                          updateArticle(index, {
                            articleNumber: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="govuk-grid-column-three-quarters">
                    <div className="govuk-form-group">
                      <label
                        className="govuk-label"
                        htmlFor={`art-title-${index}`}
                      >
                        Title
                      </label>
                      <input
                        id={`art-title-${index}`}
                        className="govuk-input"
                        value={article.articleTitle}
                        onChange={(e) =>
                          updateArticle(index, {
                            articleTitle: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {(article.partNumber != null || article.partTitle) && (
                  <p className="govuk-hint govuk-!-margin-bottom-2">
                    Part {article.partNumber}
                    {article.partTitle ? ` — ${article.partTitle}` : ""}
                  </p>
                )}

                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor={`art-text-${index}`}>
                    Official text (one paragraph per blank line)
                  </label>
                  <textarea
                    id={`art-text-${index}`}
                    className="govuk-textarea"
                    rows={6}
                    value={(article.officialText || []).join("\n\n")}
                    onChange={(e) =>
                      updateArticle(index, {
                        officialText: e.target.value
                          .split(/\n\s*\n/)
                          .map((p) => p.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>

                <button
                  type="button"
                  className="govuk-button govuk-button--warning govuk-!-margin-bottom-0"
                  onClick={() => removeArticle(index)}
                >
                  Remove article
                </button>
              </li>
            ))}
          </ol>

          <button
            type="button"
            className="govuk-button"
            disabled={isSaving || structured.articles.length === 0}
            onClick={() => void handleSave()}
          >
            {isSaving
              ? "Saving to Sanity…"
              : `Save ${structured.articles.length} articles to Sanity`}
          </button>
        </div>
      )}
    </div>
  );
}
