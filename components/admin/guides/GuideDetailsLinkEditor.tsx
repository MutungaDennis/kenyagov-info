"use client";

import { useRef, useState } from "react";

type Props = { value: string; onChange: (value: string) => void };
type LinkType = "internal" | "external";

export default function GuideDetailsLinkEditor({ value, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [linkType, setLinkType] = useState<LinkType>("internal");
  const [selection, setSelection] = useState({ start: 0, end: 0, text: "" });
  const [internalPath, setInternalPath] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [status, setStatus] = useState("");

  const captureSelection = (textarea: HTMLTextAreaElement) => {
    setSelection({ start: textarea.selectionStart, end: textarea.selectionEnd, text: value.slice(textarea.selectionStart, textarea.selectionEnd) });
  };

  const applyLink = (href: string) => {
    if (!selection.text.trim() || selection.start === selection.end) {
      setStatus("Highlight the words you want to link in the details first.");
      return;
    }
    const label = selection.text.replace(/\\/g, "\\\\").replace(/\[/g, "\\[").replace(/\]/g, "\\]");
    const markdownLink = `[${label}](${href})`;
    const nextValue = value.slice(0, selection.start) + markdownLink + value.slice(selection.end);
    const nextCursor = selection.start + markdownLink.length;
    onChange(nextValue);
    setSelection({ start: nextCursor, end: nextCursor, text: "" });
    setStatus(`Added a link for “${selection.text}”.`);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const addInternalLink = () => {
    const path = internalPath.trim();
    if (!path.startsWith("/") || path.startsWith("//") || /[\\\s<>]/.test(path) || /^(?:javascript|data):/i.test(path)) {
      setStatus("Enter an internal path beginning with /, such as /guides/acronyms.");
      return;
    }
    applyLink(path);
  };

  const addExternalLink = () => {
    try {
      const url = new URL(externalUrl.trim());
      if (url.protocol !== "https:") throw new Error("HTTPS required");
      applyLink(url.toString().replace(/\(/g, "%28").replace(/\)/g, "%29"));
    } catch {
      setStatus("Enter a valid external URL beginning with https://.");
    }
  };

  return (
    <div className="govuk-form-group">
      <label className="govuk-label" htmlFor="entry-details">Full details</label>
      <div className="govuk-hint" id="entry-details-hint">Shown after a reader opens the entry (up to 5,000 characters). Highlight text, then add an internal or external link.</div>
      <textarea
        ref={textareaRef}
        required
        id="entry-details"
        className="govuk-textarea"
        rows={7}
        maxLength={5000}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onSelect={(event) => captureSelection(event.currentTarget)}
        onKeyUp={(event) => captureSelection(event.currentTarget)}
        onMouseUp={(event) => captureSelection(event.currentTarget)}
        aria-describedby="entry-details-hint"
      />
      <fieldset className="govuk-fieldset govuk-!-margin-top-3">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Link destination</legend>
        <div className="govuk-radios govuk-radios--inline">
          {([ ["internal", "Internal page"], ["external", "External website"] ] as const).map(([type, label]) => (
            <div className="govuk-radios__item" key={type}>
              <input className="govuk-radios__input" id={`entry-link-${type}`} name="entry-link-type" type="radio" value={type} checked={linkType === type} onChange={() => setLinkType(type)} />
              <label className="govuk-label govuk-radios__label" htmlFor={`entry-link-${type}`}>{label}</label>
            </div>
          ))}
        </div>
      </fieldset>
      {linkType === "internal" ? (
        <div className="govuk-form-group govuk-!-margin-top-3">
          <label className="govuk-label" htmlFor="entry-link-path">Internal page path</label>
          <input className="govuk-input" id="entry-link-path" value={internalPath} onChange={(event) => setInternalPath(event.target.value)} placeholder="/guides/acronyms/example" />
          <button className="govuk-button govuk-!-margin-top-2" type="button" onClick={addInternalLink}>Add internal link</button>
        </div>
      ) : (
        <div className="govuk-form-group govuk-!-margin-top-3">
          <label className="govuk-label" htmlFor="entry-link-url">External URL</label>
          <input className="govuk-input" id="entry-link-url" type="url" value={externalUrl} onChange={(event) => setExternalUrl(event.target.value)} placeholder="https://example.org" />
          <button className="govuk-button govuk-!-margin-top-2" type="button" onClick={addExternalLink}>Add external link</button>
        </div>
      )}
      <p className="govuk-hint" role="status" aria-live="polite">{status}</p>
    </div>
  );
}
