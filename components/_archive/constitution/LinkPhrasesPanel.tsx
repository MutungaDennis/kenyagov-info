"use client";

import { useCallback, useEffect, useState } from "react";
import type { LinkPhrase } from "@/lib/constitution/link-phrases";

type ApplyResult = {
  dryRun: boolean;
  articlesScanned?: number;
  articlesTouched: number;
  matchCount: number;
  samples?: Array<{
    chapter: number;
    articleNumber: number;
    title?: string;
    matches: number;
  }>;
  message?: string;
};

export default function ConstitutionLinkPhrasesPanel() {
  const [phrases, setPhrases] = useState<LinkPhrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [target, setTarget] = useState<"chapters" | "schedules" | "both">(
    "chapters",
  );
  const [chapter, setChapter] = useState<string>("10");
  const [scheduleSlug, setScheduleSlug] = useState<string>("all");
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<ApplyResult | null>(null);

  const [form, setForm] = useState({
    phrase: "",
    internalHref: "",
    externalHref: "",
    externalLabel: "",
    constitutionChapter: "",
    constitutionArticle: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/constitution/link-phrases", {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load phrases");
      }
      setPhrases(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const seed = async () => {
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/constitution/link-phrases", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Seed failed");
      setPhrases(json.data || []);
      setMessage(json.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Seed failed");
    }
  };

  const createPhrase = async () => {
    if (!form.phrase.trim()) {
      setError("Enter a phrase to match");
      return;
    }
    setError(null);
    try {
      const res = await fetch("/api/admin/constitution/link-phrases", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phrase: form.phrase.trim(),
          internalHref: form.internalHref.trim() || null,
          externalHref: form.externalHref.trim() || null,
          externalLabel: form.externalLabel.trim() || null,
          constitutionChapter: form.constitutionChapter || null,
          constitutionArticle: form.constitutionArticle || null,
          enabled: true,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Save failed");
      setPhrases(json.data || []);
      setForm({
        phrase: "",
        internalHref: "",
        externalHref: "",
        externalLabel: "",
        constitutionChapter: "",
        constitutionArticle: "",
      });
      setMessage(json.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  const removePhrase = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this link phrase?")) return;
    try {
      const res = await fetch("/api/admin/constitution/link-phrases", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Delete failed");
      setPhrases(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const runApply = async (dryRun: boolean) => {
    setApplying(true);
    setError(null);
    setApplyResult(null);
    try {
      const res = await fetch("/api/admin/constitution/link-phrases/apply", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target,
          chapter: chapter === "all" ? null : Number(chapter),
          scheduleSlug,
          dryRun,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Apply failed");
      setApplyResult(json as ApplyResult);
      setMessage(json.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Apply failed");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div>
      <h2 className="govuk-heading-l">Link phrases</h2>
      <p className="govuk-body">
        Maintain a glossary of phrases (e.g. <strong>National Assembly</strong>
        ) that link to CitizenGuide pages and optionally an official source ↗.
        Apply them to a chapter after a dry-run preview. For one-off edits, use
        Sanity Studio annotations on the article text.
      </p>

      {error && (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">There is a problem</h2>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">{error}</p>
          </div>
        </div>
      )}
      {message && (
        <div
          className="govuk-notification-banner govuk-notification-banner--success"
          role="status"
        >
          <div className="govuk-notification-banner__header">
            <h2 className="govuk-notification-banner__title">Success</h2>
          </div>
          <div className="govuk-notification-banner__content">
            <p className="govuk-body">{message}</p>
          </div>
        </div>
      )}

      <div className="govuk-button-group">
        <button
          type="button"
          className="govuk-button govuk-button--secondary"
          onClick={() => void seed()}
        >
          Seed starter glossary
        </button>
        <button
          type="button"
          className="govuk-button govuk-button--secondary"
          onClick={() => void load()}
        >
          Refresh
        </button>
      </div>

      <h3 className="govuk-heading-m">Add phrase</h3>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="lp_phrase">
              Phrase
            </label>
            <input
              id="lp_phrase"
              className="govuk-input"
              value={form.phrase}
              onChange={(e) => setForm({ ...form, phrase: e.target.value })}
              placeholder="National Assembly"
            />
          </div>
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="lp_internal">
              Internal path
            </label>
            <input
              id="lp_internal"
              className="govuk-input"
              value={form.internalHref}
              onChange={(e) =>
                setForm({ ...form, internalHref: e.target.value })
              }
              placeholder="/government/legislature/…"
            />
          </div>
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="lp_external">
              Official URL (optional ↗)
            </label>
            <input
              id="lp_external"
              className="govuk-input"
              value={form.externalHref}
              onChange={(e) =>
                setForm({ ...form, externalHref: e.target.value })
              }
              placeholder="https://www.parliament.go.ke/"
            />
          </div>
        </div>
        <div className="govuk-grid-column-one-half">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="lp_extlabel">
              Official site label
            </label>
            <input
              id="lp_extlabel"
              className="govuk-input"
              value={form.externalLabel}
              onChange={(e) =>
                setForm({ ...form, externalLabel: e.target.value })
              }
              placeholder="Parliament of Kenya"
            />
          </div>
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="lp_ch">
              Or constitution chapter (cross-ref)
            </label>
            <input
              id="lp_ch"
              className="govuk-input"
              type="number"
              value={form.constitutionChapter}
              onChange={(e) =>
                setForm({ ...form, constitutionChapter: e.target.value })
              }
              placeholder="4"
            />
          </div>
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="lp_art">
              Constitution article (optional)
            </label>
            <input
              id="lp_art"
              className="govuk-input"
              type="number"
              value={form.constitutionArticle}
              onChange={(e) =>
                setForm({ ...form, constitutionArticle: e.target.value })
              }
              placeholder="35"
            />
          </div>
        </div>
      </div>
      <button
        type="button"
        className="govuk-button"
        onClick={() => void createPhrase()}
      >
        Save phrase
      </button>

      <h3 className="govuk-heading-m govuk-!-margin-top-8">Glossary</h3>
      {loading ? (
        <p className="govuk-body">Loading…</p>
      ) : phrases.length === 0 ? (
        <p className="govuk-body">
          No phrases yet. Click <strong>Seed starter glossary</strong>.
        </p>
      ) : (
        <table className="govuk-table">
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th scope="col" className="govuk-table__header">
                Phrase
              </th>
              <th scope="col" className="govuk-table__header">
                Links
              </th>
              <th scope="col" className="govuk-table__header">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {phrases.map((p) => (
              <tr key={p._id || p.phrase} className="govuk-table__row">
                <th scope="row" className="govuk-table__header">
                  {p.phrase}
                  {p.enabled === false ? (
                    <span className="govuk-tag govuk-tag--grey govuk-!-margin-left-2">
                      Off
                    </span>
                  ) : null}
                </th>
                <td className="govuk-table__cell govuk-body-s">
                  {p.constitutionChapter != null ? (
                    <span>
                      Constitution Ch {p.constitutionChapter}
                      {p.constitutionArticle != null
                        ? ` Art ${p.constitutionArticle}`
                        : ""}
                    </span>
                  ) : (
                    <span>
                      {p.internalHref || "—"}
                      {p.externalHref ? " · ↗" : ""}
                    </span>
                  )}
                </td>
                <td className="govuk-table__cell">
                  <button
                    type="button"
                    className="govuk-link"
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      font: "inherit",
                      cursor: "pointer",
                      color: "#d4351c",
                    }}
                    onClick={() => void removePhrase(p._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 className="govuk-heading-m govuk-!-margin-top-8">
        Apply to Constitution text
      </h3>
      <p className="govuk-hint">
        Public pages also link phrases live (first hit per paragraph). Apply is
        optional for Studio-visible marks. Schedules are included when selected.
      </p>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="lp_target">
          Content type
        </label>
        <select
          id="lp_target"
          className="govuk-select"
          value={target}
          onChange={(e) =>
            setTarget(e.target.value as "chapters" | "schedules" | "both")
          }
        >
          <option value="chapters">Chapters / articles</option>
          <option value="schedules">Schedules</option>
          <option value="both">Chapters and schedules</option>
        </select>
      </div>
      {(target === "chapters" || target === "both") && (
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="lp_apply_ch">
            Chapter
          </label>
          <select
            id="lp_apply_ch"
            className="govuk-select"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
          >
            <option value="all">All uploaded chapters</option>
            {Array.from({ length: 19 }, (_, i) => (
              <option key={i} value={String(i)}>
                Chapter {i}
              </option>
            ))}
          </select>
        </div>
      )}
      {(target === "schedules" || target === "both") && (
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="lp_apply_sched">
            Schedule
          </label>
          <select
            id="lp_apply_sched"
            className="govuk-select"
            value={scheduleSlug}
            onChange={(e) => setScheduleSlug(e.target.value)}
          >
            <option value="all">All schedules</option>
            <option value="first">First</option>
            <option value="second">Second</option>
            <option value="third">Third</option>
            <option value="fourth">Fourth</option>
            <option value="fifth">Fifth</option>
            <option value="sixth">Sixth</option>
          </select>
        </div>
      )}
      <div className="govuk-button-group">
        <button
          type="button"
          className="govuk-button govuk-button--secondary"
          disabled={applying}
          onClick={() => void runApply(true)}
        >
          {applying ? "Working…" : "Dry run (preview)"}
        </button>
        <button
          type="button"
          className="govuk-button"
          disabled={applying}
          onClick={() => {
            if (
              confirm(
                "Apply link phrases permanently to official text? Existing links are kept; new matches are annotated.",
              )
            ) {
              void runApply(false);
            }
          }}
        >
          Apply for real
        </button>
      </div>

      {applyResult && (
        <div className="govuk-inset-text">
          <p className="govuk-body">
            <strong>{applyResult.message}</strong>
          </p>
          <p className="govuk-body-s">
            Scanned {applyResult.articlesScanned ?? "—"} articles · Touched{" "}
            {applyResult.articlesTouched} · Matches {applyResult.matchCount}
            {applyResult.dryRun ? " (dry run)" : ""}
          </p>
          {applyResult.samples && applyResult.samples.length > 0 && (
            <ul className="govuk-list govuk-list--bullet">
              {applyResult.samples.map((s) => (
                <li key={`${s.chapter}-${s.articleNumber}`}>
                  Ch {s.chapter} Art {s.articleNumber}
                  {s.title ? ` — ${s.title}` : ""} ({s.matches} match
                  {s.matches === 1 ? "" : "es"})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
