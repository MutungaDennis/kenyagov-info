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

export default function BiographyLinkEditor({ value, onChange, institutions }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [linkType, setLinkType] = useState<"internal" | "external">("internal");
  const [institutionId, setInstitutionId] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [status, setStatus] = useState("");

  const institutionOptions = useMemo(
    () =>
      institutions
        .filter((institution) => institution.name && institution.slug)
        .slice()
        .sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    [institutions],
  );

  const applyLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const selectedText = value.slice(selectionStart, selectionEnd);
    if (!selectedText.trim()) {
      setStatus("Select the text you want to link in the biography first.");
      return;
    }

    let href = "";
    if (linkType === "internal") {
      const institution = institutionOptions.find(
        (item) => String(item.id) === institutionId,
      );
      if (!institution?.slug) {
        setStatus("Choose an institution to create an internal link.");
        return;
      }
      href = `/government/institutions/${encodeURIComponent(institution.slug)}`;
    } else {
      try {
        const parsed = new URL(externalUrl.trim());
        if (parsed.protocol !== "https:") throw new Error("HTTPS required");
        href = parsed.toString().replace(/\(/g, "%28").replace(/\)/g, "%29");
      } catch {
        setStatus("Enter a valid external URL beginning with https://.");
        return;
      }
    }

    const label = selectedText
      .replace(/\\/g, "\\\\")
      .replace(/\[/g, "\\[")
      .replace(/\]/g, "\\]");
    const markdownLink = `[${label}](${href})`;
    const nextValue =
      value.slice(0, selectionStart) + markdownLink + value.slice(selectionEnd);

    onChange(nextValue);
    setStatus(`Linked “${selectedText}”.`);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(
        selectionStart + markdownLink.length,
        selectionStart + markdownLink.length,
      );
    });
  };

  return (
    <div className="govuk-form-group">
      <label className="govuk-label" htmlFor="bio">
        Biography
      </label>
      <p id="bio-link-help" className="govuk-hint">
        Select a phrase, choose an internal institution page or an external website, then add the link.
      </p>
      <textarea
        ref={textareaRef}
        id="bio"
        className="govuk-textarea"
        rows={8}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setStatus("");
        }}
        aria-describedby="bio-link-help"
      />

      <fieldset className="govuk-fieldset govuk-!-margin-top-4">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
          Link type
        </legend>
        <div className="govuk-radios govuk-radios--inline" data-module="govuk-radios">
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
              Internal institution page
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
          <label className="govuk-label" htmlFor="bio-link-institution">
            Institution
          </label>
          <select
            className="govuk-select"
            id="bio-link-institution"
            value={institutionId}
            onChange={(event) => setInstitutionId(event.target.value)}
          >
            <option value="">Choose an institution</option>
            {institutionOptions.map((institution) => (
              <option key={String(institution.id)} value={String(institution.id)}>
                {institution.name}
                {institution.short_name ? ` (${institution.short_name})` : ""}
              </option>
            ))}
          </select>
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
        </div>
      )}

      <button className="govuk-button govuk-button--secondary" type="button" onClick={applyLink}>
        Link selected text
      </button>
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
