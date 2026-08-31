"use client";

import { useCallback, useEffect, useState } from "react";

type Phrase = {
  _id?: string;
  phrase: string;
  matchMode?: string;
  internalHref?: string;
  externalHref?: string;
  externalLabel?: string;
  enabled?: boolean;
  sortOrder?: number;
};

export default function ServicesLinkPhrasesPanel() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState<Phrase>({
    phrase: "",
    matchMode: "caseInsensitive",
    internalHref: "",
    externalHref: "",
    externalLabel: "",
    enabled: true,
    sortOrder: 100,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/services/link-phrases", {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Load failed");
      setPhrases(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/services/link-phrases", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Save failed");
      setPhrases(json.data || []);
      setDraft({
        phrase: "",
        matchMode: "caseInsensitive",
        internalHref: "",
        externalHref: "",
        externalLabel: "",
        enabled: true,
        sortOrder: 100,
      });
      setMessage(json.message || "Saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  const seed = async () => {
    const res = await fetch("/api/admin/services/link-phrases", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "seed" }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      setError(json.error || "Seed failed");
      return;
    }
    setPhrases(json.data || []);
    setMessage(json.message);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this phrase?")) return;
    const res = await fetch("/api/admin/services/link-phrases", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      setError(json.error || "Delete failed");
      return;
    }
    setPhrases(json.data || []);
  };

  const apply = async (write: boolean) => {
    setMessage(null);
    setError(null);
    const res = await fetch("/api/admin/services/link-phrases/apply", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ write, dryRun: !write }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      setError(json.error || "Apply failed");
      return;
    }
    setMessage(json.message);
  };

  return (
    <div>
      <h2 className="govuk-heading-l">Service link phrases</h2>
      <p className="govuk-body">
        Glossary for auto-linking words in service guide body text (separate
        from Constitution phrases). Longest phrase wins; existing marks are kept.
      </p>

      {error && <p className="govuk-error-message">{error}</p>}
      {message && <p className="govuk-body">{message}</p>}

      <div className="govuk-button-group">
        <button type="button" className="govuk-button govuk-button--secondary" onClick={() => void seed()}>
          Seed common phrases
        </button>
        <button type="button" className="govuk-button govuk-button--secondary" onClick={() => void apply(false)}>
          Dry-run apply to all bodies
        </button>
        <button type="button" className="govuk-button" onClick={() => void apply(true)}>
          Apply links to all bodies
        </button>
      </div>

      <fieldset className="govuk-fieldset govuk-!-margin-bottom-6">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
          Add phrase
        </legend>
        <div className="govuk-form-group">
          <label className="govuk-label">Phrase</label>
          <input
            className="govuk-input"
            value={draft.phrase}
            onChange={(e) => setDraft({ ...draft, phrase: e.target.value })}
          />
        </div>
        <div className="govuk-form-group">
          <label className="govuk-label">Internal path</label>
          <input
            className="govuk-input"
            value={draft.internalHref || ""}
            onChange={(e) =>
              setDraft({ ...draft, internalHref: e.target.value })
            }
            placeholder="/ecitizen"
          />
        </div>
        <div className="govuk-form-group">
          <label className="govuk-label">External URL</label>
          <input
            className="govuk-input"
            value={draft.externalHref || ""}
            onChange={(e) =>
              setDraft({ ...draft, externalHref: e.target.value })
            }
          />
        </div>
        <div className="govuk-form-group">
          <label className="govuk-label">External label</label>
          <input
            className="govuk-input"
            value={draft.externalLabel || ""}
            onChange={(e) =>
              setDraft({ ...draft, externalLabel: e.target.value })
            }
          />
        </div>
        <button type="button" className="govuk-button" onClick={() => void save()}>
          Save phrase
        </button>
      </fieldset>

      {loading ? (
        <p className="govuk-body">Loading…</p>
      ) : (
        <table className="govuk-table">
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th className="govuk-table__header">Phrase</th>
              <th className="govuk-table__header">Internal</th>
              <th className="govuk-table__header">External</th>
              <th className="govuk-table__header">Actions</th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {phrases.map((p) => (
              <tr key={p._id} className="govuk-table__row">
                <td className="govuk-table__cell">{p.phrase}</td>
                <td className="govuk-table__cell">{p.internalHref || "—"}</td>
                <td className="govuk-table__cell">{p.externalHref || "—"}</td>
                <td className="govuk-table__cell">
                  {p._id ? (
                    <button
                      type="button"
                      className="govuk-link"
                      onClick={() => void remove(p._id!)}
                    >
                      Delete
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
