"use client";

import { useMemo, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import useSWR from "swr";

type LinkType = "institution" | "person" | "party" | "coalition" | "committee" | "county" | "constituency" | "ward" | "article" | "school";
type LinkResult = { id: string; type: LinkType; name: string; detail: string; href: string };
type LinkResponse = { data: LinkResult[]; total?: number; offset?: number; limit?: number; error?: string };
type Props = { initialHtml: string; onChange: (html: string) => void };
type LinkEntry = { index: number; label: string; href: string };

const LINK_TYPES: Array<{ value: LinkType; label: string }> = [
  { value: "person", label: "People (officials and MCAs)" },
  { value: "institution", label: "Institutions" },
  { value: "party", label: "Political parties" },
  { value: "coalition", label: "Political coalitions" },
  { value: "committee", label: "Parliamentary committees" },
  { value: "county", label: "Counties" },
  { value: "constituency", label: "Constituencies" },
  { value: "ward", label: "Wards" },
  { value: "article", label: "Constitution articles" },
  { value: "school", label: "Public schools" },
];

async function fetchLinks(url: string): Promise<LinkResponse> {
  const response = await fetch(url, { credentials: "include", cache: "no-store" });
  const data = (await response.json()) as LinkResponse;
  if (!response.ok) throw new Error(data.error || "Could not search internal records.");
  return data;
}

function parseHtmlLinks(html: string): LinkEntry[] {
  const entries: LinkEntry[] = [];
  const anchorPattern = /<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi;
  for (const match of html.matchAll(anchorPattern)) {
    const hrefMatch = match[1].match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    if (!hrefMatch) continue;
    const decode = (value: string) => value
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">");
    entries.push({
      index: entries.length,
      label: decode(match[2].replace(/<[^>]*>/g, "").trim()) || "Linked text",
      href: decode(hrefMatch[1] ?? hrefMatch[2] ?? hrefMatch[3] ?? ""),
    });
  }
  return entries;
}

export default function PresidentialSpeechHtmlEditor({ initialHtml, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query.trim(), 250);
  const [linkType, setLinkType] = useState<LinkType>("person");
  const [searchOffset, setSearchOffset] = useState(0);
  const [destinationType, setDestinationType] = useState<"internal" | "external">("internal");
  const [externalUrl, setExternalUrl] = useState("");
  const [selection, setSelection] = useState<Range | null>(null);
  const [activeLink, setActiveLink] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [links, setLinks] = useState<LinkEntry[]>(() => parseHtmlLinks(initialHtml));
  const searchKey = useMemo(() => debouncedQuery.length >= 2
    ? `/api/admin/biography-link-search?q=${encodeURIComponent(debouncedQuery)}&type=${linkType}&offset=${searchOffset}`
    : null, [debouncedQuery, linkType, searchOffset]);
  const { data, error, isLoading } = useSWR(searchKey, fetchLinks, { revalidateOnFocus: false });

  const emitChange = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const html = editor.innerHTML;
    onChange(html);
    setLinks(Array.from(editor.querySelectorAll("a[href]")).map((anchor, index) => ({
      index,
      label: anchor.textContent?.trim() || "Linked text",
      href: anchor.getAttribute("href") || "",
    })));
    setStatus("Unsaved text and link changes.");
  };

  const captureSelection = () => {
    const current = window.getSelection();
    if (!current?.rangeCount || !editorRef.current?.contains(current.anchorNode)) return;
    setSelection(current.getRangeAt(0).cloneRange());
    setActiveLink(null);
  };

  const setLink = (href: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    if (activeLink !== null) {
      const anchor = editor.querySelectorAll("a[href]")[activeLink];
      if (anchor) {
        anchor.setAttribute("href", href);
        emitChange();
        setStatus("Updated the selected link destination.");
        setActiveLink(null);
        return;
      }
    }
    if (!selection || selection.collapsed || !editor.contains(selection.commonAncestorContainer)) {
      setStatus("Select the words to link in the publication text first.");
      return;
    }
    const anchor = document.createElement("a");
    anchor.setAttribute("href", href);
    anchor.setAttribute("class", "govuk-link");
    anchor.append(selection.extractContents());
    selection.insertNode(anchor);
    const current = window.getSelection();
    current?.removeAllRanges();
    emitChange();
    setSelection(null);
    setStatus("Link added to the selected words.");
  };

  const applyExternalLink = () => {
    try {
      const url = new URL(externalUrl.trim());
      if (url.protocol !== "https:") throw new Error("HTTPS required");
      setLink(url.toString());
    } catch {
      setStatus("Enter a valid external URL beginning with https://.");
    }
  };

  const focusLink = (index: number) => {
    const anchor = editorRef.current?.querySelectorAll("a[href]")[index];
    if (!anchor) return;
    setActiveLink(index);
    setSelection(null);
    setExternalUrl(anchor.getAttribute("href")?.startsWith("https://") ? anchor.getAttribute("href") || "" : "");
    setDestinationType(anchor.getAttribute("href")?.startsWith("https://") ? "external" : "internal");
    anchor.scrollIntoView({ block: "center", behavior: "smooth" });
    setStatus(`Selected “${anchor.textContent?.trim() || "linked text"}”. Choose a new destination or remove the link.`);
  };

  const removeLink = (index: number) => {
    const anchor = editorRef.current?.querySelectorAll("a[href]")[index];
    if (!anchor) return;
    const label = anchor.textContent?.trim() || "linked text";
    anchor.replaceWith(...Array.from(anchor.childNodes));
    emitChange();
    setActiveLink(null);
    setStatus(`Removed the link from “${label}”; the wording remains.`);
  };

  return (
    <section aria-labelledby="speech-document-heading" className="govuk-!-margin-top-6">
      <h2 id="speech-document-heading" className="govuk-heading-l">Formatted publication text</h2>
      <p className="govuk-hint">The stored document is already formatted. Select wording below to add an internal or external link; existing links can be updated or removed without replacing the document.</p>
      <div
        ref={editorRef}
        className="govuk-body speech-html-editor"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Formatted publication text"
        aria-multiline="true"
        onMouseUp={captureSelection}
        onKeyUp={captureSelection}
        onInput={emitChange}
        dangerouslySetInnerHTML={{ __html: initialHtml }}
      />

      {links.length > 0 && (
        <section className="govuk-inset-text" aria-labelledby="speech-links-heading">
          <h3 id="speech-links-heading" className="govuk-heading-s">Links in this publication ({links.length})</h3>
          <ul className="govuk-list govuk-list--spaced">
            {links.map((link) => (
              <li key={`${link.index}-${link.href}`}>
                <strong>{link.label}</strong><span className="govuk-hint"> {link.href}</span>
                <div className="govuk-button-group govuk-!-margin-top-2">
                  <button type="button" className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0" onClick={() => focusLink(link.index)}>Edit destination</button>
                  <button type="button" className="govuk-button govuk-button--warning govuk-!-margin-bottom-0" onClick={() => removeLink(link.index)}>Remove link</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="govuk-inset-text" role="status" aria-live="polite">
        {activeLink !== null ? "Selected an existing link. Choose a replacement destination below." : selection && !selection.collapsed ? `Selected text: “${selection.toString()}”` : "Select text in the formatted document to add a link."}
      </p>
      <fieldset className="govuk-fieldset govuk-!-margin-bottom-4">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Link destination</legend>
        <div className="govuk-radios govuk-radios--inline">
          {([["internal", "Internal record"], ["external", "External website"]] as const).map(([value, label]) => (
            <div className="govuk-radios__item" key={value}>
              <input className="govuk-radios__input" id={`speech-link-${value}`} name="speech-link-destination" type="radio" checked={destinationType === value} onChange={() => setDestinationType(value)} />
              <label className="govuk-label govuk-radios__label" htmlFor={`speech-link-${value}`}>{label}</label>
            </div>
          ))}
        </div>
      </fieldset>
      {destinationType === "internal" ? (
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="speech-link-search">Search internal records</label>
          <select className="govuk-select" id="speech-link-type" value={linkType} onChange={(event) => { setLinkType(event.target.value as LinkType); setSearchOffset(0); }}>
            {LINK_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <input className="govuk-input govuk-!-margin-top-2" id="speech-link-search" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setSearchOffset(0); }} placeholder="Search people, institutions, parties and more" autoComplete="off" />
          {query.trim().length > 0 && query.trim().length < 2 && <p className="govuk-hint">Enter at least 2 characters to search.</p>}
          {isLoading && <p className="govuk-body-s" role="status">Searching internal records…</p>}
          {error && <p className="govuk-error-message" role="alert">{error.message}</p>}
          {data?.data && (
            <ul className="govuk-list govuk-list--spaced" aria-label="Internal record search results">
              {data.data.map((result) => (
                <li key={`${result.type}-${result.id}`}>
                  <button type="button" className="govuk-button govuk-button--secondary" onClick={() => setLink(result.href)}>{result.name}{result.detail ? ` — ${result.detail}` : ""}</button>
                </li>
              ))}
              {data.data.length === 0 && <li>No matching internal records.</li>}
            </ul>
          )}
          {data && (data.total ?? 0) > (data.limit ?? 8) && (
            <div className="govuk-button-group">
              <button type="button" className="govuk-button govuk-button--secondary" disabled={searchOffset === 0 || isLoading} onClick={() => setSearchOffset((offset) => Math.max(0, offset - (data.limit ?? 8)))}>Previous results</button>
              <span className="govuk-body govuk-!-margin-top-2">Page {Math.floor(searchOffset / (data.limit ?? 8)) + 1} of {Math.ceil((data.total ?? 0) / (data.limit ?? 8))}</span>
              <button type="button" className="govuk-button govuk-button--secondary" disabled={searchOffset + (data.limit ?? 8) >= (data.total ?? 0) || isLoading} onClick={() => setSearchOffset((offset) => offset + (data.limit ?? 8))}>Next results</button>
            </div>
          )}
        </div>
      ) : (
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="speech-link-url">External URL</label>
          <input className="govuk-input" id="speech-link-url" type="url" value={externalUrl} onChange={(event) => setExternalUrl(event.target.value)} placeholder="https://example.org" />
          <button type="button" className="govuk-button govuk-!-margin-top-2" onClick={applyExternalLink}>{activeLink !== null ? "Update external destination" : "Add external link"}</button>
        </div>
      )}
      <p className="govuk-hint" role="status" aria-live="polite">{status}</p>
      <style jsx>{`
        .speech-html-editor { min-height: 20rem; max-height: 48rem; overflow: auto; padding: 1rem; border: 2px solid #505a5f; background: #fff; }
        .speech-html-editor:focus { outline: 3px solid #ffdd00; outline-offset: 0; }
      `}</style>
    </section>
  );
}
