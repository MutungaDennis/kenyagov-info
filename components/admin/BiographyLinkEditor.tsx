"use client";

import { useMemo, useRef, useState } from "react";
import LinkedBiography from "@/components/site/LinkedBiography";

type InstitutionOption = {
  id: string | number;
  name?: string | null;
  short_name?: string | null;
  slug?: string | null;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  institutions: InstitutionOption[];
};

type TextSelection = {
  start: number;
  end: number;
  text: string;
};

export default function BiographyLinkEditor({ value, onChange, institutions }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [linkType, setLinkType] = useState<"internal" | "external">("internal");
  const [institutionQuery, setInstitutionQuery] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [selection, setSelection] = useState<TextSelection>({ start: 0, end: 0, text: "" });
  const [status, setStatus] = useState("");

  const institutionOptions = useMemo(
    () =>
      institutions
        .filter((institution) => institution.name && institution.slug)
        .slice()
        .sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    [institutions],
  );

  const matchingInstitutions = useMemo(() => {
    const query = institutionQuery.trim().toLocaleLowerCase("en");
    if (!query) return [];

    return institutionOptions
      .filter((institution) =>
        `${institution.name || ""} ${institution.short_name || ""}`
          .toLocaleLowerCase("en")
          .includes(query),
      )
      .slice(0, 8);
  }, [institutionOptions, institutionQuery]);

  const captureSelection = (textarea: HTMLTextAreaElement) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setSelection({ start, end, text: value.slice(start, end) });
    setStatus("");
  };

  const applyLink = (href: string) => {
    const selectedText = selection.text;
    if (!selectedText.trim() || selection.start === selection.end) {
      setStatus("Highlight the words you want to link in the biography first.");
      return;
    }

    const label = selectedText
      .replace(/\\/g, "\\\\")
      .replace(/\[/g, "\\[")
      .replace(/\]/g, "\\]");
    const markdownLink = `[${label}](${href})`;
    const nextValue =
      value.slice(0, selection.start) + markdownLink + value.slice(selection.end);
    const nextCursor = selection.start + markdownLink.length;

    onChange(nextValue);
    setSelection({ start: nextCursor, end: nextCursor, text: "" });
    setStatus(`Added a link for “${selectedText}”.`);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const addInstitutionLink = (institution: InstitutionOption) => {
    if (!institution.slug) return;
    applyLink(`/government/institutions/${encodeURIComponent(institution.slug)}`);
  };

  const addExternalLink = () => {
    try {
      const parsed = new URL(externalUrl.trim());
      if (parsed.protocol !== "https:") throw new Error("HTTPS required");
      const href = parsed.toString().replace(/\(/g, "%28").replace(/\)/g, "%29");
      applyLink(href);
    } catch {
      setStatus("Enter a valid external URL beginning with https://.");
    }
  };

  return (
    <div className="govuk-form-group">
      <label className="govuk-label" htmlFor="bio">
        Biography
      </label>
      <p id="bio-link-help" className="govuk-hint">
        Highlight a phrase, then choose where it should link. Internal institution pages are selected by default.
      </p>
      <textarea
        ref={textareaRef}
        id="bio"
        className="govuk-textarea"
        rows={8}
        value={value}
        onSelect={(event) => captureSelection(event.currentTarget)}
        onKeyUp={(event) => captureSelection(event.currentTarget)}
        onMouseUp={(event) => captureSelection(event.currentTarget)}
        onChange={(event) => {
          onChange(event.target.value);
          setSelection({
            start: event.target.selectionStart,
            end: event.target.selectionEnd,
            text: "",
          });
          setStatus("");
        }}
        aria-describedby="bio-link-help"
      />

      <div className="govuk-inset-text govuk-!-margin-top-4">
        <strong>Selected text</strong>
        <p className="govuk-body govuk-!-margin-bottom-0">
          {selection.text.trim()
            ? `“${selection.text}”`
            : "Highlight a phrase in the biography above to choose link text."}
        </p>
      </div>

      <fieldset className="govuk-fieldset govuk-!-margin-top-4">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
          Link destination
        </legend>
        <div className="govuk-radios govuk-radios--inline">
          <div className="govuk-radios__item">
            <input
              className="govuk-radios__input"
              id="bio-link-internal"
              name="bio-link-type"
              type="radio"
              value="internal"
              checked={linkType === "internal"}
              onChange={() => setLinkType("internal")}
            />
            <label className="govuk-label govuk-radios__label" htmlFor="bio-link-internal">
              Institution page
            </label>
          </div>
          <div className="govuk-radios__item">
            <input
              className="govuk-radios__input"
              id="bio-link-external"
              name="bio-link-type"
              type="radio"
              value="external"
              checked={linkType === "external"}
              onChange={() => setLinkType("external")}
            />
            <label className="govuk-label govuk-radios__label" htmlFor="bio-link-external">
              External website
            </label>
          </div>
        </div>
      </fieldset>

      {linkType === "internal" ? (
        <div className="govuk-form-group govuk-!-margin-top-4">
          <label className="govuk-label" htmlFor="bio-link-institution-search">
            Search institutions
          </label>
          <input
            className="govuk-input"
            id="bio-link-institution-search"
            type="search"
            value={institutionQuery}
            onChange={(event) => setInstitutionQuery(event.target.value)}
            placeholder="For example, Law Society of Kenya"
            autoComplete="off"
          />
          <p className="govuk-hint">
            Choose a result to link the selected words directly to its profile.
          </p>
          {institutionQuery.trim() && matchingInstitutions.length > 0 && (
            <ul className="govuk-list">
              {matchingInstitutions.map((institution) => (
                <li key={String(institution.id)}>
                  <button
                    className="govuk-button govuk-button--secondary"
                    type="button"
                    onClick={() => addInstitutionLink(institution)}
                    aria-label={`Link selected text to ${institution.name}`}
                  >
                    {institution.name}
                    {institution.short_name ? ` (${institution.short_name})` : ""}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {institutionQuery.trim() && matchingInstitutions.length === 0 && (
            <p className="govuk-body">No institutions match that search.</p>
          )}
        </div>
      ) : (
        <div className="govuk-form-group govuk-!-margin-top-4">
          <label className="govuk-label" htmlFor="bio-link-url">
            External URL
          </label>
          <input
            className="govuk-input"
            id="bio-link-url"
            type="url"
            value={externalUrl}
            onChange={(event) => setExternalUrl(event.target.value)}
            placeholder="https://example.org"
            autoComplete="url"
          />
          <button
            className="govuk-button govuk-!-margin-top-3"
            type="button"
            onClick={addExternalLink}
          >
            Add external link
          </button>
        </div>
      )}

      <p className="govuk-hint" role="status" aria-live="polite">
        {status}
      </p>

      <div className="govuk-inset-text govuk-!-margin-top-2">
        <strong>Preview</strong>
        <div className="govuk-!-margin-top-2">
          <LinkedBiography text={value || "Your biography preview will appear here."} />
        </div>
      </div>
    </div>
  );
}
