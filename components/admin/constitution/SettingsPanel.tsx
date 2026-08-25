"use client";

import { useMemo, useState } from "react";
import {
  CONSTITUTION_CHAPTER_TITLES,
  defaultChapterTitle,
} from "@/lib/constitution/chapters";
import type { ConstitutionSettings } from "@/lib/constitution/plain-english";

type Props = {
  initialSettings: ConstitutionSettings;
  existingChapters: number[];
};

export default function ConstitutionSettingsPanel({
  initialSettings,
  existingChapters,
}: Props) {
  const [globalOn, setGlobalOn] = useState(
    initialSettings.showPlainEnglishGlobal !== false,
  );
  const [overrides, setOverrides] = useState<
    Record<number, boolean | undefined>
  >(() => {
    const map: Record<number, boolean | undefined> = {};
    for (const row of initialSettings.chapterPlainEnglish || []) {
      map[Number(row.chapter)] = Boolean(row.showPlainEnglish);
    }
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const chapters = useMemo(() => {
    const set = new Set<number>([
      ...existingChapters,
      ...Object.keys(overrides).map(Number),
      ...Object.keys(CONSTITUTION_CHAPTER_TITLES).map(Number),
    ]);
    return Array.from(set)
      .filter((n) => n >= 0 && n <= 18)
      .sort((a, b) => a - b);
  }, [existingChapters, overrides]);

  const effectiveFor = (chapter: number): boolean => {
    if (typeof overrides[chapter] === "boolean") return overrides[chapter]!;
    return globalOn;
  };

  const setChapterOverride = (chapter: number, show: boolean) => {
    setOverrides((prev) => ({ ...prev, [chapter]: show }));
  };

  const clearChapterOverride = (chapter: number) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[chapter];
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const chapterPlainEnglish = Object.entries(overrides)
        .filter(([, v]) => typeof v === "boolean")
        .map(([chapter, showPlainEnglish]) => ({
          chapter: Number(chapter),
          showPlainEnglish: Boolean(showPlainEnglish),
        }));

      const res = await fetch("/api/admin/constitution/settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showPlainEnglishGlobal: globalOn,
          chapterPlainEnglish,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save settings");
      }
      setMessage(json.message || "Settings saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="govuk-heading-l">Plain English visibility</h2>
      <p className="govuk-body">
        Control whether the public article pages show the{" "}
        <strong>Plain English Explanation</strong> accordion. Turning it off
        hides the UI only — content in Sanity is kept.
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

      <div className="govuk-form-group">
        <fieldset className="govuk-fieldset">
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
            All chapters
          </legend>
          <div className="govuk-checkboxes">
            <div className="govuk-checkboxes__item">
              <input
                className="govuk-checkboxes__input"
                id="pe-global"
                type="checkbox"
                checked={globalOn}
                onChange={(e) => setGlobalOn(e.target.checked)}
              />
              <label className="govuk-label govuk-checkboxes__label" htmlFor="pe-global">
                Show Plain English Explanation by default
              </label>
            </div>
          </div>
        </fieldset>
      </div>

      <h3 className="govuk-heading-m">Per-chapter overrides</h3>
      <p className="govuk-hint">
        Set an override to force a chapter on or off regardless of the global
        default. “Use global” clears the override.
      </p>

      <table className="govuk-table">
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th scope="col" className="govuk-table__header">
              Chapter
            </th>
            <th scope="col" className="govuk-table__header">
              Effective
            </th>
            <th scope="col" className="govuk-table__header">
              Override
            </th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {chapters.map((ch) => {
            const hasOverride = typeof overrides[ch] === "boolean";
            return (
              <tr key={ch} className="govuk-table__row">
                <th scope="row" className="govuk-table__header">
                  {ch === 0 ? "Preamble" : `${ch}. ${defaultChapterTitle(ch)}`}
                </th>
                <td className="govuk-table__cell">
                  {effectiveFor(ch) ? (
                    <strong className="govuk-tag govuk-tag--green">On</strong>
                  ) : (
                    <strong className="govuk-tag govuk-tag--grey">Off</strong>
                  )}
                </td>
                <td className="govuk-table__cell">
                  <div className="govuk-radios govuk-radios--inline govuk-radios--small">
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id={`pe-${ch}-on`}
                        type="radio"
                        name={`pe-${ch}`}
                        checked={hasOverride && overrides[ch] === true}
                        onChange={() => setChapterOverride(ch, true)}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor={`pe-${ch}-on`}
                      >
                        On
                      </label>
                    </div>
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id={`pe-${ch}-off`}
                        type="radio"
                        name={`pe-${ch}`}
                        checked={hasOverride && overrides[ch] === false}
                        onChange={() => setChapterOverride(ch, false)}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor={`pe-${ch}-off`}
                      >
                        Off
                      </label>
                    </div>
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id={`pe-${ch}-global`}
                        type="radio"
                        name={`pe-${ch}`}
                        checked={!hasOverride}
                        onChange={() => clearChapterOverride(ch)}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor={`pe-${ch}-global`}
                      >
                        Use global
                      </label>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button
        type="button"
        className="govuk-button"
        disabled={saving}
        onClick={() => void handleSave()}
      >
        {saving ? "Saving…" : "Save Plain English settings"}
      </button>
    </div>
  );
}
