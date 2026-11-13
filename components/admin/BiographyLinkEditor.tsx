"use client";

import { useDebounce } from "use-debounce";
import useSWR from "swr";
import { useMemo, useRef, useState } from "react";
import LinkedBiography from "@/components/site/LinkedBiography";

type EntityType = "institution" | "party" | "county" | "school";
type SearchType = "all" | EntityType;

type LinkableResult = {
  id: string;
  type: EntityType;
  name: string;
  detail: string;
  href: string;
};

type BiographyLinkSearchResponse = {
  data: LinkableResult[];
  counts: Record<EntityType, number>;
  total: number;
  limit: number;
  offset: number;
  type: SearchType;
};

const SEARCH_GROUPS: Array<{ value: EntityType; label: string }> = [
  { value: "institution", label: "Institutions" },
  { value: "party", label: "Political parties" },
  { value: "county", label: "Counties" },
  { value: "school", label: "Public schools" },
];

function isSearchType(value: unknown): value is SearchType {
  return value === "all" || SEARCH_GROUPS.some((group) => group.value === value);
}

type Props = {
  value: string;
  onChange: (value: string) => void;
};

type TextSelection = {
  start: number;
  end: number;
  text: string;
};

const SEARCH_PAGE_SIZE = 8;
const EMPTY_COUNTS: Record<EntityType, number> = {
  institution: 0,
  party: 0,
  county: 0,
  school: 0,
};

async function fetchBiographyLinkSearch(url: string): Promise<BiographyLinkSearchResponse> {
  const response = await fetch(url, { credentials: "include", cache: "no-store" });
  const result = (await response.json()) as Partial<BiographyLinkSearchResponse> & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(result.error || `Search failed (${response.status})`);
  }

  return {
    data: Array.isArray(result.data) ? result.data : [],
    counts: { ...EMPTY_COUNTS, ...result.counts },
    total: typeof result.total === "number" ? result.total : 0,
    limit: typeof result.limit === "number" ? result.limit : SEARCH_PAGE_SIZE,
    offset: typeof result.offset === "number" ? result.offset : 0,
    type: isSearchType(result.type) ? result.type : "all",
  };
}

export default function BiographyLinkEditor({ value, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [linkType, setLinkType] = useState<"internal" | "external">("internal");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebounce(searchQuery.trim(), 250);
  const [searchType, setSearchType] = useState<SearchType>("all");
  const [searchOffset, setSearchOffset] = useState(0);
  const [externalUrl, setExternalUrl] = useState("");
  const [selection, setSelection] = useState<TextSelection>({ start: 0, end: 0, text: "" });
  const [status, setStatus] = useState("");

  const searchKey = useMemo(() => {
    if (debouncedQuery.length < 2) return null;

    const params = new URLSearchParams({
      q: debouncedQuery,
      type: searchType,
      offset: String(searchOffset),
    });
    return `/api/admin/biography-link-search?${params.toString()}`;
  }, [debouncedQuery, searchOffset, searchType]);

  const {
    data: searchResult,
    error: searchError,
    isLoading: isSearching,
    isValidating,
  } = useSWR(searchKey, fetchBiographyLinkSearch, {
    revalidateOnFocus: false,
  });

  const hasSearchTerm = Boolean(searchQuery.trim());
  const searchIsCurrent = searchQuery.trim() === debouncedQuery;
  const currentPage =
    searchIsCurrent && searchResult?.offset === searchOffset && searchResult.type === searchType
      ? searchResult
      : undefined;
  const resultGroups = SEARCH_GROUPS.map((group) => ({
    ...group,
    total: currentPage?.counts[group.value] ?? 0,
    results: (currentPage?.data ?? []).filter((result) => result.type === group.value),
  })).filter((group) =>
    searchType === "all" ? group.results.length > 0 : group.value === searchType,
  );
  const visibleGroups = SEARCH_GROUPS.filter(
    (group) => searchType === "all" || group.value === searchType,
  );
  const pageCount = Math.max(
    1,
    ...visibleGroups.map((group) =>
      Math.ceil((currentPage?.counts[group.value] ?? 0) / SEARCH_PAGE_SIZE),
    ),
  );
  const currentPageNumber = Math.floor(searchOffset / SEARCH_PAGE_SIZE) + 1;
  const hasNextPage = visibleGroups.some(
    (group) => (currentPage?.counts[group.value] ?? 0) > searchOffset + SEARCH_PAGE_SIZE,
  );

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

  const addInternalLink = (result: LinkableResult) => {
    applyLink(result.href);
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
        Highlight a phrase, then choose where it should link. Internal record pages are selected by default.
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
              Internal record
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
          <label className="govuk-label" htmlFor="bio-link-record-search">
            Search linkable records
          </label>
          <input
            className="govuk-input"
            id="bio-link-record-search"
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setSearchOffset(0);
            }}
            placeholder="Search by name, abbreviation or location"
            autoComplete="off"
            aria-describedby="bio-link-record-search-hint"
          />
          <p id="bio-link-record-search-hint" className="govuk-hint">
            Search institutions, political parties, counties and public schools. School results are limited to published public profiles.
          </p>
          <label className="govuk-label govuk-!-margin-top-3" htmlFor="bio-link-search-type">
            Search in
          </label>
          <select
            className="govuk-select"
            id="bio-link-search-type"
            value={searchType}
            onChange={(event) => {
              setSearchType(event.target.value as SearchType);
              setSearchOffset(0);
            }}
          >
            <option value="all">All linkable data</option>
            <option value="institution">Institutions</option>
            <option value="party">Political parties</option>
            <option value="county">Counties</option>
            <option value="school">Public schools</option>
          </select>

          {hasSearchTerm && searchQuery.trim().length < 2 && (
            <p className="govuk-body-s" role="status">
              Enter at least 2 characters to search.
            </p>
          )}
          {hasSearchTerm && searchIsCurrent && (isSearching || isValidating) && (
            <p className="govuk-body-s" role="status">
              Searching linkable records…
            </p>
          )}
          {hasSearchTerm && searchIsCurrent && searchError && (
            <p className="govuk-error-message" role="alert">
              Record search failed: {searchError.message}
            </p>
          )}
          {hasSearchTerm && searchIsCurrent && currentPage && currentPage.total > 0 && (
            <p className="govuk-body-s" aria-live="polite">
              Page {currentPageNumber} of {pageCount}. Results are grouped by record type.
            </p>
          )}
          {hasSearchTerm && searchIsCurrent && currentPage && resultGroups.length > 0 && (
            <>
              {resultGroups.map((group) => (
                <section key={group.value} aria-labelledby={`bio-link-results-${group.value}`}>
                  <h3
                    className="govuk-heading-s govuk-!-margin-top-3 govuk-!-margin-bottom-2"
                    id={`bio-link-results-${group.value}`}
                  >
                    {group.label} ({group.total.toLocaleString("en-KE")})
                  </h3>
                  <ul className="govuk-list">
                    {group.results.map((result) => (
                      <li key={`${result.type}-${result.id}`}>
                        <button
                          className="govuk-button govuk-button--secondary"
                          type="button"
                          onClick={() => addInternalLink(result)}
                          aria-label={`Link selected text to ${result.name}, ${group.label}${result.detail ? `, ${result.detail}` : ""}`}
                        >
                          {result.name}
                          {result.detail ? ` — ${result.detail}` : ""}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
              <div className="govuk-button-group">
                <button
                  className="govuk-button govuk-button--secondary"
                  type="button"
                  onClick={() => setSearchOffset((offset) => Math.max(0, offset - SEARCH_PAGE_SIZE))}
                  disabled={searchOffset === 0 || isValidating || isSearching}
                >
                  Previous results
                </button>
                <button
                  className="govuk-button govuk-button--secondary"
                  type="button"
                  onClick={() => setSearchOffset((offset) => offset + SEARCH_PAGE_SIZE)}
                  disabled={!hasNextPage || isValidating || isSearching}
                >
                  Next results
                </button>
              </div>
            </>
          )}
          {hasSearchTerm && searchIsCurrent && currentPage && currentPage.total === 0 && (
            <p className="govuk-body">No linkable records match that search.</p>
          )}
          {hasSearchTerm && searchIsCurrent && currentPage && currentPage.total > 0 && resultGroups.length === 0 && (
            <p className="govuk-body">There are no more results on this page.</p>
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
