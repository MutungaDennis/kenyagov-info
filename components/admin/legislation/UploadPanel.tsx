"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type County = { id: string; name: string; slug: string };

type Props = {
  counties: County[];
  onSaved?: () => void;
};

type Metadata = {
  houseOfOrigin: "nationalAssembly" | "senate" | "countyAssembly";
  countyName: string;
  countySlug: string;
  title: string;
  shortTitle: string;
  citation: string;
  yearEnacted: string;
  capNumber: string;
  status: string;
  dateOfAssent: string;
  dateOfCommencement: string;
  globalSummary: string;
};

const emptyMeta: Metadata = {
  houseOfOrigin: "nationalAssembly",
  countyName: "",
  countySlug: "",
  title: "",
  shortTitle: "",
  citation: "",
  yearEnacted: String(new Date().getFullYear()),
  capNumber: "",
  status: "active",
  dateOfAssent: "",
  dateOfCommencement: "",
  globalSummary: "",
};

export default function LegislationUploadPanel({ counties, onSaved }: Props) {
  const [meta, setMeta] = useState<Metadata>(emptyMeta);
  const [pastedText, setPastedText] = useState("");
  const [structured, setStructured] = useState<{
    parts: unknown[];
    schedules: unknown[];
    detectedTitle?: string | null;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [publicPath, setPublicPath] = useState<string | null>(null);
  /** Last Grok-proposed Plain English summary (admin may use or replace) */
  const [suggestedSummary, setSuggestedSummary] = useState<string | null>(null);

  const sectionCount = useMemo(() => {
    if (!structured?.parts) return 0;
    return (structured.parts as Array<{ sections?: unknown[] }>).reduce(
      (n, p) => n + (Array.isArray(p.sections) ? p.sections.length : 0),
      0,
    );
  }, [structured]);

  const validateMeta = (): string | null => {
    if (!meta.title.trim() || !meta.shortTitle.trim() || !meta.citation.trim()) {
      return "Full title, short title and legal citation are required";
    }
    if (!meta.yearEnacted.trim() || !Number.isFinite(Number(meta.yearEnacted))) {
      return "Year enacted is required";
    }
    if (meta.houseOfOrigin === "countyAssembly" && !meta.countyName.trim()) {
      return "Select a county for County Assembly Acts";
    }
    return null;
  };

  const handleProcess = async () => {
    const metaErr = validateMeta();
    if (metaErr) {
      setError(metaErr);
      return;
    }
    if (pastedText.trim().length < 80) {
      setError("Paste at least ~80 characters of the Act");
      return;
    }
    setIsProcessing(true);
    setError(null);
    setStructured(null);
    setSuggestedSummary(null);
    setSaveMessage(null);
    setPublicPath(null);
    try {
      const res = await fetch("/api/admin/legislation/process", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: {
            ...meta,
            yearEnacted: Number(meta.yearEnacted),
          },
          text: pastedText.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.structured) {
        throw new Error(json.error || "Processing failed");
      }
      setStructured(json.structured);
      const grokSummary = String(
        json.suggestedSummary || json.structured.globalSummary || "",
      ).trim();
      if (grokSummary) {
        setSuggestedSummary(grokSummary);
        // Prefill when empty; if admin already typed a summary, keep theirs
        setMeta((m) =>
          m.globalSummary.trim()
            ? m
            : { ...m, globalSummary: grokSummary },
        );
      }
      if (json.structured.detectedTitle && !meta.title) {
        setMeta((m) => ({ ...m, title: json.structured.detectedTitle }));
      }
      setTimeout(() => {
        document
          .getElementById("legislation-preview")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    const metaErr = validateMeta();
    if (metaErr) {
      setError(metaErr);
      return;
    }
    if (!structured?.parts?.length) {
      setError("Process the Act first");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/legislation/save", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: {
            ...meta,
            yearEnacted: Number(meta.yearEnacted),
          },
          structured,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Save failed");
      }
      setSaveMessage(json.message);
      setPublicPath(json.publicPath);
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h2 className="govuk-heading-l">Paste an Act</h2>
      <p className="govuk-body">
        Fill the identity fields first (they distinguish one law from another),
        then paste official text. Grok will propose Parts, Sections, and a{" "}
        <strong>Plain English summary</strong> you can keep, edit, or replace
        with your own before saving.
      </p>

      {error && (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">There is a problem</h2>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">{error}</p>
          </div>
        </div>
      )}
      {saveMessage && (
        <div
          className="govuk-notification-banner govuk-notification-banner--success"
          role="status"
        >
          <div className="govuk-notification-banner__header">
            <h2 className="govuk-notification-banner__title">Success</h2>
          </div>
          <div className="govuk-notification-banner__content">
            <p className="govuk-body">{saveMessage}</p>
            {publicPath && (
              <p className="govuk-body">
                <Link href={publicPath} className="govuk-link" target="_blank">
                  View public Act page
                </Link>
              </p>
            )}
          </div>
        </div>
      )}

      <h3 className="govuk-heading-m">1. Identity</h3>
      <div className="govuk-form-group">
        <fieldset className="govuk-fieldset">
          <legend className="govuk-fieldset__legend">Legislature *</legend>
          <div className="govuk-radios">
            {(
              [
                ["nationalAssembly", "National Assembly"],
                ["senate", "Senate"],
                ["countyAssembly", "County Assembly"],
              ] as const
            ).map(([value, label]) => (
              <div className="govuk-radios__item" key={value}>
                <input
                  className="govuk-radios__input"
                  id={`house_${value}`}
                  type="radio"
                  name="house"
                  checked={meta.houseOfOrigin === value}
                  onChange={() =>
                    setMeta({
                      ...meta,
                      houseOfOrigin: value,
                      countyName:
                        value === "countyAssembly" ? meta.countyName : "",
                      countySlug:
                        value === "countyAssembly" ? meta.countySlug : "",
                    })
                  }
                />
                <label
                  className="govuk-label govuk-radios__label"
                  htmlFor={`house_${value}`}
                >
                  {label}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      {meta.houseOfOrigin === "countyAssembly" && (
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="leg_county">
            County *
          </label>
          <select
            id="leg_county"
            className="govuk-select"
            value={meta.countySlug}
            onChange={(e) => {
              const c = counties.find((x) => x.slug === e.target.value);
              setMeta({
                ...meta,
                countySlug: e.target.value,
                countyName: c?.name || "",
              });
            }}
            required
          >
            <option value="">— Select county —</option>
            {counties.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="leg_title">
          Official full title *
        </label>
        <input
          id="leg_title"
          className="govuk-input"
          value={meta.title}
          onChange={(e) => setMeta({ ...meta, title: e.target.value })}
        />
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="leg_short">
              Short title *
            </label>
            <input
              id="leg_short"
              className="govuk-input"
              value={meta.shortTitle}
              onChange={(e) => setMeta({ ...meta, shortTitle: e.target.value })}
            />
          </div>
        </div>
        <div className="govuk-grid-column-one-half">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="leg_cite">
              Legal citation *
            </label>
            <input
              id="leg_cite"
              className="govuk-input"
              value={meta.citation}
              onChange={(e) => setMeta({ ...meta, citation: e.target.value })}
              placeholder="Act No. 24 of 2019"
            />
          </div>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-quarter">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="leg_year">
              Year *
            </label>
            <input
              id="leg_year"
              className="govuk-input"
              type="number"
              value={meta.yearEnacted}
              onChange={(e) => setMeta({ ...meta, yearEnacted: e.target.value })}
            />
          </div>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="leg_cap">
              Cap. (optional)
            </label>
            <input
              id="leg_cap"
              className="govuk-input"
              value={meta.capNumber}
              onChange={(e) => setMeta({ ...meta, capNumber: e.target.value })}
            />
          </div>
        </div>
        <div className="govuk-grid-column-one-half">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="leg_status">
              Status *
            </label>
            <select
              id="leg_status"
              className="govuk-select"
              value={meta.status}
              onChange={(e) => setMeta({ ...meta, status: e.target.value })}
            >
              <option value="active">Active / In force</option>
              <option value="amended">Amended</option>
              <option value="repealed">Repealed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="leg_summary">
          Plain English summary (optional)
        </label>
        <div className="govuk-hint">
          After you process the paste, Grok fills this when empty. You can edit
          it or paste your own summary instead.
        </div>
        <textarea
          id="leg_summary"
          className="govuk-textarea"
          rows={5}
          value={meta.globalSummary}
          onChange={(e) => setMeta({ ...meta, globalSummary: e.target.value })}
        />
        {suggestedSummary &&
          meta.globalSummary.trim() !== suggestedSummary.trim() && (
            <p className="govuk-body-s govuk-!-margin-top-2">
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
                onClick={() =>
                  setMeta((m) => ({ ...m, globalSummary: suggestedSummary }))
                }
              >
                Use Grok’s generated summary
              </button>
              {" · "}
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
                onClick={() => setMeta((m) => ({ ...m, globalSummary: "" }))}
              >
                Clear summary
              </button>
            </p>
          )}
      </div>

      <h3 className="govuk-heading-m">2. Paste official text</h3>
      <div className="govuk-form-group">
        <textarea
          className="govuk-textarea"
          rows={16}
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Paste the Act / County Act body (Parts, Sections, Schedules)…"
        />
      </div>

      <button
        type="button"
        className="govuk-button"
        disabled={isProcessing}
        onClick={() => void handleProcess()}
      >
        {isProcessing ? "Grok is reading the Act…" : "Process with Grok"}
      </button>

      {structured && (
        <div id="legislation-preview" className="govuk-!-margin-top-8">
          <h3 className="govuk-heading-m">
            Preview — {sectionCount} section
            {sectionCount === 1 ? "" : "s"}
            {structured.schedules?.length
              ? `, ${structured.schedules.length} schedule(s)`
              : ""}
          </h3>
          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              Check that section numbers and titles look right. You can still
              edit identity fields above before saving.
            </p>
          </div>
          <ol className="govuk-list">
            {(structured.parts as Array<Record<string, unknown>>).map(
              (part, pi) => (
                <li key={pi} className="govuk-!-margin-bottom-4">
                  <strong>
                    {part.partNumber
                      ? `Part ${String(part.partNumber)}`
                      : "Part"}
                    {part.partTitle ? ` — ${String(part.partTitle)}` : ""}
                  </strong>
                  <ul className="govuk-list govuk-list--bullet">
                    {(Array.isArray(part.sections) ? part.sections : []).map(
                      (sec: Record<string, unknown>, si: number) => (
                        <li key={si}>
                          s. {String(sec.sectionNumber || "?")}{" "}
                          {String(sec.sectionTitle || "")}
                          <span className="govuk-hint">
                            {" "}
                            (
                            {Array.isArray(sec.officialText)
                              ? sec.officialText.length
                              : 0}{" "}
                            para
                            {Array.isArray(sec.officialText) &&
                            sec.officialText.length === 1
                              ? ""
                              : "s"}
                            )
                          </span>
                        </li>
                      ),
                    )}
                  </ul>
                </li>
              ),
            )}
          </ol>

          <button
            type="button"
            className="govuk-button"
            disabled={isSaving}
            onClick={() => void handleSave()}
          >
            {isSaving ? "Saving…" : "Save Act to Sanity"}
          </button>
        </div>
      )}
    </div>
  );
}
