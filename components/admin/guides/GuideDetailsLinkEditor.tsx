"use client";

import { useDebounce } from "use-debounce";
import useSWR from "swr";
import { useMemo, useRef, useState } from "react";

type EntityType = "institution" | "person" | "party" | "coalition" | "committee" | "county" | "constituency" | "ward" | "article" | "school";
type LinkableResult = { id: string; type: EntityType; name: string; detail: string; href: string };
type SearchResponse = { data: LinkableResult[]; total: number; offset: number; type: EntityType; counts: Record<EntityType, number> };
type BiographySearchResponse = { data: LinkableResult[]; total: number; offset: number; hasNextPage: boolean };
type Props = { value: string; onChange: (value: string) => void };
type LinkType = "internal" | "external";
type TextSelection = { start: number; end: number; text: string };
type BiographyLink = TextSelection & { label: string; href: string };

const SEARCH_GROUPS: Array<{ value: EntityType; label: string }> = [
  { value: "institution", label: "Institutions" },
  { value: "person", label: "People (officials and MCAs)" },
  { value: "party", label: "Political parties" },
  { value: "coalition", label: "Political coalitions" },
  { value: "committee", label: "Parliamentary committees" },
  { value: "county", label: "Counties" },
  { value: "constituency", label: "Constituencies" },
  { value: "ward", label: "Wards" },
  { value: "article", label: "Constitution articles" },
  { value: "school", label: "Public schools" },
];
const SEARCH_PAGE_SIZE = 8;

function getLinks(value: string): BiographyLink[] {
  const links: BiographyLink[] = [];
  const pattern = /\[((?:\\.|[^\]])+)\]\(([^)\s]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(value)) !== null) {
    links.push({
      label: match[1].replace(/\\([\\[\]])/g, "$1"),
      href: match[2],
      start: match.index,
      end: match.index + match[0].length,
      text: match[1].replace(/\\([\\[\]])/g, "$1"),
    });
  }
  return links;
}

async function fetchInternalLinks(url: string): Promise<BiographySearchResponse> {
  const requestUrl = new URL(url, window.location.origin);
  const query = requestUrl.searchParams.get("q") ?? "";
  const offset = Number(requestUrl.searchParams.get("offset") ?? 0);
  const settled = await Promise.allSettled(SEARCH_GROUPS.map(async (group) => {
    const params = new URLSearchParams({ q: query, type: group.value, offset: String(offset) });
    const response = await fetch(`/api/admin/biography-link-search?${params.toString()}`, {
      credentials: "include",
      cache: "no-store",
    });
    const result = (await response.json()) as SearchResponse & { error?: string };
    if (!response.ok) throw new Error(result.error || `Search failed (${response.status})`);
    return result;
  }));
  const results = settled.flatMap((item) => item.status === "fulfilled" ? [item.value] : []);
  if (results.length === 0) {
    const failed = settled.find((item): item is PromiseRejectedResult => item.status === "rejected");
    throw new Error(failed?.reason instanceof Error ? failed.reason.message : "Internal search is temporarily unavailable.");
  }
  return {
    data: results.flatMap((result) => result.data),
    total: results.reduce((sum, result) => sum + result.total, 0),
    offset,
    hasNextPage: results.some((result) => result.counts[result.type] > offset + SEARCH_PAGE_SIZE),
  };
}

export default function GuideDetailsLinkEditor({ value, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [linkType, setLinkType] = useState<LinkType>("internal");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebounce(searchQuery.trim(), 250);
  const [searchOffset, setSearchOffset] = useState(0);
  const [externalUrl, setExternalUrl] = useState("");
  const [selection, setSelection] = useState<TextSelection>({ start: 0, end: 0, text: "" });
  const [status, setStatus] = useState("");

  const searchKey = useMemo(() => {
    if (linkType !== "internal" || debouncedQuery.length < 2) return null;
    return `/api/admin/biography-link-search?q=${encodeURIComponent(debouncedQuery)}&offset=${searchOffset}`;
  }, [debouncedQuery, linkType, searchOffset]);
  const { data: searchResult, error: searchError, isLoading: isSearching, isValidating } = useSWR(
    searchKey,
    fetchInternalLinks,
    { revalidateOnFocus: false },
  );
  const searchIsCurrent = searchQuery.trim() === debouncedQuery;
  const currentResults = searchIsCurrent && searchResult?.offset === searchOffset ? searchResult : undefined;
  const links = getLinks(value);
  const hasNextPage = Boolean(currentResults && currentResults.total > searchOffset + SEARCH_PAGE_SIZE);

  const captureSelection = (textarea: HTMLTextAreaElement) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value.slice(start, end);
    setSelection({ start, end, text });
    if (text.trim().length >= 2) {
      setSearchQuery(text.trim());
      setSearchOffset(0);
    }
    setStatus("");
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
    setStatus(`Added a link for “${selection.text}”. You can highlight another phrase to add another link.`);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(nextCursor, nextCursor);
    });
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

  const removeLink = (link: BiographyLink) => {
    onChange(value.slice(0, link.start) + link.label + value.slice(link.end));
    setSelection({ start: link.start, end: link.start + link.label.length, text: link.label });
    setSearchQuery(link.label);
    setSearchOffset(0);
    setLinkType("internal");
    setStatus(`Removed the link from “${link.label}”. The wording remains.`);
  };

  return (
    <div className="govuk-form-group">
      <label className="govuk-label" htmlFor="entry-details">Full details</label>
      <div className="govuk-hint" id="entry-details-hint">Shown after a reader opens the entry (up to 5,000 characters). Highlight text, then choose a destination. You can add multiple links.</div>
      <textarea
        ref={textareaRef}
        required
        id="entry-details"
        className="govuk-textarea"
        rows={7}
        maxLength={5000}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setSelection({ start: event.target.selectionStart, end: event.target.selectionEnd, text: "" });
          setStatus("");
        }}
        onSelect={(event) => captureSelection(event.currentTarget)}
        onKeyUp={(event) => captureSelection(event.currentTarget)}
        onMouseUp={(event) => captureSelection(event.currentTarget)}
        aria-describedby="entry-details-hint"
      />

      {links.length > 0 && (
        <section className="govuk-inset-text govuk-!-margin-top-3" aria-labelledby="entry-existing-links-heading">
          <h3 className="govuk-heading-s" id="entry-existing-links-heading">Links in these details ({links.length})</h3>
          <ul className="govuk-list govuk-list--spaced">
            {links.map((link) => (
              <li key={`${link.start}-${link.href}`}>
                <strong>{link.label}</strong><span className="govuk-hint"> {link.href}</span>
                <button className="govuk-button govuk-button--warning govuk-!-margin-top-2 govuk-!-margin-bottom-0" type="button" onClick={() => removeLink(link)}>Remove link</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="govuk-inset-text govuk-!-margin-top-3">
        <strong>Selected text</strong>
        <p className="govuk-body govuk-!-margin-bottom-0">{selection.text.trim() ? `“${selection.text}”` : "Highlight a phrase in the details above to choose link text."}</p>
      </div>

      <fieldset className="govuk-fieldset govuk-!-margin-top-3">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Link destination</legend>
        <p className="govuk-hint">Search internal records first. If there is no suitable record, choose an external website.</p>
        <div className="govuk-radios govuk-radios--inline">
          {([["internal", "Internal record"], ["external", "External website"]] as const).map(([type, label]) => (
            <div className="govuk-radios__item" key={type}>
              <input className="govuk-radios__input" id={`entry-link-${type}`} name="entry-link-type" type="radio" value={type} checked={linkType === type} onChange={() => setLinkType(type)} />
              <label className="govuk-label govuk-radios__label" htmlFor={`entry-link-${type}`}>{label}</label>
            </div>
          ))}
        </div>
      </fieldset>

      {linkType === "internal" ? (
        <div className="govuk-form-group govuk-!-margin-top-3">
          <label className="govuk-label" htmlFor="entry-link-search">Search internal records</label>
          <input
            className="govuk-input"
            id="entry-link-search"
            type="search"
            value={searchQuery}
            onChange={(event) => { setSearchQuery(event.target.value); setSearchOffset(0); }}
            placeholder="Search institutions, parties, officials and more"
            autoComplete="off"
            aria-describedby="entry-link-search-hint"
          />
          <p id="entry-link-search-hint" className="govuk-hint">Highlighting text above starts a search automatically. Enter at least 2 characters.</p>
          {searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && <p className="govuk-body-s" role="status">Enter at least 2 characters to search.</p>}
          {searchQuery.trim().length >= 2 && searchIsCurrent && (isSearching || isValidating) && <p className="govuk-body-s" role="status">Searching institutions, political parties, officials and other records…</p>}
          {searchQuery.trim().length >= 2 && searchIsCurrent && searchError && <p className="govuk-error-message" role="alert">Internal record search failed: {searchError.message}</p>}
          {searchQuery.trim().length >= 2 && searchIsCurrent && currentResults?.data.length === 0 && <p className="govuk-body">No matching internal records. If there is no suitable record, select “External website”.</p>}
          {searchQuery.trim().length >= 2 && searchIsCurrent && currentResults?.data.length ? (
            <>
              <ul className="govuk-list govuk-list--spaced" aria-label="Internal record search results">
                {currentResults.data.map((result) => (
                  <li key={`${result.type}-${result.id}`}>
                    <button className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0" type="button" onClick={() => applyLink(result.href)} aria-label={`Link selected text to ${result.name}${result.detail ? `, ${result.detail}` : ""}`}>
                      {result.name}{result.detail ? ` — ${result.detail}` : ""}
                    </button>
                    <span className="govuk-hint govuk-!-margin-left-2">{SEARCH_GROUPS.find((group) => group.value === result.type)?.label}</span>
                  </li>
                ))}
              </ul>
              <div className="govuk-button-group">
                <button className="govuk-button govuk-button--secondary" type="button" onClick={() => setSearchOffset((offset) => Math.max(0, offset - SEARCH_PAGE_SIZE))} disabled={searchOffset === 0 || isValidating}>Previous results</button>
                <button className="govuk-button govuk-button--secondary" type="button" onClick={() => setSearchOffset((offset) => offset + SEARCH_PAGE_SIZE)} disabled={!hasNextPage || isValidating}>More results</button>
              </div>
            </>
          ) : null}
        </div>
      ) : (
        <div className="govuk-form-group govuk-!-margin-top-3">
          <label className="govuk-label" htmlFor="entry-link-url">External URL</label>
          <input className="govuk-input" id="entry-link-url" type="url" value={externalUrl} onChange={(event) => setExternalUrl(event.target.value)} placeholder="https://example.org" autoComplete="url" />
          <button className="govuk-button govuk-!-margin-top-2" type="button" onClick={addExternalLink}>Add external link</button>
        </div>
      )}
      <p className="govuk-hint" role="status" aria-live="polite">{status}</p>
    </div>
  );
}
