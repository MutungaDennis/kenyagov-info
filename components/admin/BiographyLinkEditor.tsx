"use client";

import { useDebounce } from "use-debounce";
import useSWR from "swr";
import { useMemo, useRef, useState } from "react";
import LinkedBiography from "@/components/site/LinkedBiography";

type InstitutionOption = {
  id: string | number;
  name?: string | null;
  short_name?: string | null;
  slug?: string | null;
  is_active?: boolean | null;
};

type InstitutionSearchResponse = {
  data: InstitutionOption[];
  total: number;
  limit: number;
  offset: number;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
};

type TextSelection = {
  start: number;
  end: number;
  text: string;
};

const INSTITUTION_PAGE_SIZE = 10;

async function fetchInstitutionSearch(url: string): Promise<InstitutionSearchResponse> {
  const response = await fetch(url, { credentials: "include", cache: "no-store" });
  const result = (await response.json()) as Partial<InstitutionSearchResponse> & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(result.error || `Institution search failed (${response.status})`);
  }

  return {
    data: Array.isArray(result.data) ? result.data : [],
    total: typeof result.total === "number" ? result.total : 0,
    limit: typeof result.limit === "number" ? result.limit : INSTITUTION_PAGE_SIZE,
    offset: typeof result.offset === "number" ? result.offset : 0,
  };
}

export default function BiographyLinkEditor({ value, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [linkType, setLinkType] = useState<"internal" | "external">("internal");
  const [institutionQuery, setInstitutionQuery] = useState("");
  const [debouncedQuery] = useDebounce(institutionQuery.trim(), 250);
  const [institutionOffset, setInstitutionOffset] = useState(0);
  const [externalUrl, setExternalUrl] = useState("");
  const [selection, setSelection] = useState<TextSelection>({ start: 0, end: 0, text: "" });
  const [status, setStatus] = useState("");

  const searchKey = useMemo(() => {
    if (!debouncedQuery) return null;

    const params = new URLSearchParams({
      q: debouncedQuery,
      limit: String(INSTITUTION_PAGE_SIZE),
      offset: String(institutionOffset),
    });
    return `/api/admin/institutions?${params.toString()}`;
  }, [debouncedQuery, institutionOffset]);

  const {
    data: searchResult,
    error: searchError,
    isLoading: isSearching,
    isValidating,
  } = useSWR(searchKey, fetchInstitutionSearch, {
    revalidateOnFocus: false,
  });

  const hasSearchTerm = Boolean(institutionQuery.trim());
  const searchIsCurrent = institutionQuery.trim() === debouncedQuery;
  const currentPage =
    searchIsCurrent && searchResult?.offset === institutionOffset
      ? searchResult
      : undefined;
  const institutionResults = currentPage?.data ?? [];
  const totalInstitutions = currentPage?.total ?? 0;
  const currentPageNumber = Math.floor(institutionOffset / INSTITUTION_PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(totalInstitutions / INSTITUTION_PAGE_SIZE));

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
            Search all institutions
          </label>
          <input
            className="govuk-input"
            id="bio-link-institution-search"
            type="search"
            value={institutionQuery}
            onChange={(event) => {
              setInstitutionQuery(event.target.value);
              setInstitutionOffset(0);
            }}
            placeholder="Name, short name or slug"
            autoComplete="off"
            aria-describedby="bio-link-institution-search-hint"
          />
          <p id="bio-link-institution-search-hint" className="govuk-hint">
            Search the full institution catalogue, including unpublished records. Choose a result to link the selected words to its profile.
          </p>

          {hasSearchTerm && !searchIsCurrent && (
            <p className="govuk-body-s" role="status">
              Searching all institutions…
            </p>
          )}
          {hasSearchTerm && searchIsCurrent && isSearching && (
            <p className="govuk-body-s" role="status">
              Searching all institutions…
            </p>
          )}
          {hasSearchTerm && searchIsCurrent && searchError && (
            <p className="govuk-error-message" role="alert">
              Institution search failed: {searchError.message}
            </p>
          )}
          {hasSearchTerm && searchIsCurrent && currentPage && institutionResults.length > 0 && (
            <>
              <p className="govuk-body-s" aria-live="polite">
                Showing {institutionOffset + 1}–
                {institutionOffset + institutionResults.length} of {totalInstitutions} institutions
                (page {currentPageNumber} of {totalPages}).
              </p>
              <ul className="govuk-list">
                {institutionResults.map((institution) => (
                  <li key={String(institution.id)}>
                    <button
                      className="govuk-button govuk-button--secondary"
                      type="button"
                      onClick={() => addInstitutionLink(institution)}
                      disabled={!institution.slug}
                      aria-label={`Link selected text to ${institution.name}${institution.is_active === false ? ", unpublished" : ""}${!institution.slug ? ", no profile URL" : ""}`}
                    >
                      {institution.name}
                      {institution.short_name ? ` (${institution.short_name})` : ""}
                      {institution.is_active === false ? " — Unpublished" : ""}
                      {!institution.slug ? " — No profile URL" : ""}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="govuk-button-group">
                <button
                  className="govuk-button govuk-button--secondary"
                  type="button"
                  onClick={() =>
                    setInstitutionOffset((offset) =>
                      Math.max(0, offset - INSTITUTION_PAGE_SIZE),
                    )
                  }
                  disabled={institutionOffset === 0 || isValidating || isSearching}
                >
                  Previous results
                </button>
                <button
                  className="govuk-button govuk-button--secondary"
                  type="button"
                  onClick={() =>
                    setInstitutionOffset((offset) => offset + INSTITUTION_PAGE_SIZE)
                  }
                  disabled={
                    institutionOffset + institutionResults.length >= totalInstitutions ||
                    isValidating || isSearching
                  }
                >
                  Next results
                </button>
              </div>
            </>
          )}
          {hasSearchTerm && searchIsCurrent && currentPage && institutionResults.length === 0 && (
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
