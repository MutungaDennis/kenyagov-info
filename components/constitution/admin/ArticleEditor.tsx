"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Article = {
  id: string;
  article_number: number;
  title: string;
  body_text: string;
  body_html: string;
  review_status: string;
  relationship_review_status: string | null;
  legal_provision_id: string | null;
  source_start_line: number | null;
  source_end_line: number | null;
};

type Props = {
  article: Article;
};

export default function ArticleEditor({ article }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(article.title);
  const [bodyText, setBodyText] = useState(article.body_text);
  const [bodyHtml, setBodyHtml] = useState(article.body_html);
  const [reviewStatus, setReviewStatus] = useState(article.review_status);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/admin/constitution/articles/${article.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            body_text: bodyText,
            body_html: bodyHtml,
            review_status: reviewStatus,
          }),
        },
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Article could not be updated");
      }

      setMessage("Article updated.");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Article could not be updated",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteArticle() {
    const confirmed = window.confirm(
      `Delete Article ${article.article_number}?\n\nThis is a destructive action and cannot be undone.`,
    );

    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/admin/constitution/articles/${article.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Article could not be deleted");
      }

      router.push("/admin/constitution");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Article could not be deleted",
      );

      setDeleting(false);
    }
  }

  return (
    <>
      {error && (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">
            There is a problem
          </h2>

          <div className="govuk-error-summary__body">
            <p className="govuk-body">{error}</p>
          </div>
        </div>
      )}

      {message && (
        <div className="govuk-notification-banner govuk-notification-banner--success">
          <div className="govuk-notification-banner__content">
            <p className="govuk-body">{message}</p>
          </div>
        </div>
      )}

      <form onSubmit={save}>
        <div className="govuk-form-group">
          <label
            className="govuk-label govuk-label--m"
            htmlFor="article-number"
          >
            Article number
          </label>

          <div id="article-number-hint" className="govuk-hint">
            The Article number is the canonical legal identifier and cannot be
            changed here.
          </div>

          <input
            id="article-number"
            className="govuk-input govuk-input--width-5"
            value={article.article_number}
            disabled
            aria-describedby="article-number-hint"
          />
        </div>

        <div className="govuk-form-group">
          <label
            className="govuk-label govuk-label--m"
            htmlFor="article-title"
          >
            Title
          </label>

          <input
            id="article-title"
            className="govuk-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>

        <div className="govuk-form-group">
          <label
            className="govuk-label govuk-label--m"
            htmlFor="body-text"
          >
            Plain text
          </label>

          <div id="body-text-hint" className="govuk-hint">
            Used for search, indexing and source comparison.
          </div>

          <textarea
            id="body-text"
            className="govuk-textarea"
            rows={18}
            value={bodyText}
            onChange={(event) => setBodyText(event.target.value)}
            required
            aria-describedby="body-text-hint"
          />
        </div>

        <div className="govuk-form-group">
          <label
            className="govuk-label govuk-label--m"
            htmlFor="body-html"
          >
            Rendered HTML
          </label>

          <div id="body-html-hint" className="govuk-hint">
            This is the HTML displayed on the public Article page.
          </div>

          <textarea
            id="body-html"
            className="govuk-textarea"
            rows={24}
            value={bodyHtml}
            onChange={(event) => setBodyHtml(event.target.value)}
            required
            aria-describedby="body-html-hint"
          />
        </div>

        <div className="govuk-form-group">
          <label
            className="govuk-label govuk-label--m"
            htmlFor="review-status"
          >
            Content review
          </label>

          <select
            id="review-status"
            className="govuk-select"
            value={reviewStatus}
            onChange={(event) => setReviewStatus(event.target.value)}
          >
            <option value="Imported">Imported</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Needs attention">Needs attention</option>
          </select>
        </div>

        {(article.source_start_line || article.source_end_line) && (
          <div className="govuk-inset-text">
            Imported source lines: {article.source_start_line || "?"} –{" "}
            {article.source_end_line || "?"}
          </div>
        )}

        <button
          type="submit"
          className="govuk-button"
          disabled={saving}
        >
          {saving ? "Saving…" : "Save Article"}
        </button>
      </form>

      <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />

      <h2 className="govuk-heading-l">Delete Article</h2>

      <p className="govuk-body">
        Use this only if the Article record itself should be removed. For normal
        corrections, edit and save the Article instead.
      </p>

      <button
        type="button"
        className="govuk-button govuk-button--warning"
        disabled={deleting}
        onClick={deleteArticle}
      >
        {deleting
          ? "Deleting…"
          : `Delete Article ${article.article_number}`}
      </button>
    </>
  );
}