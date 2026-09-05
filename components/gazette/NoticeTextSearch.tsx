"use client";

import { FormEvent, useState } from "react";

type NoticeTextSearchProps = {
  targetId?: string;
};

export default function NoticeTextSearch({
  targetId = "gazette-notice-content",
}: NoticeTextSearchProps) {
  const [query, setQuery] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);

  function getContainer() {
    return document.getElementById(targetId);
  }

  function restoreOriginal() {
    const container = getContainer();
    if (!container) return;

    const original = container.dataset.searchOriginalHtml;
    if (typeof original === "string") {
      container.innerHTML = original;
    }
  }

  function setActiveMatch(index: number) {
    const container = getContainer();
    if (!container) return;

    const matches = Array.from(
      container.querySelectorAll<HTMLElement>("[data-gazette-search-match]")
    );

    matches.forEach((match) => match.removeAttribute("aria-current"));

    const active = matches[index];
    if (!active) return;

    active.setAttribute("aria-current", "true");
    active.scrollIntoView({ behavior: "smooth", block: "center" });
    setCurrentMatch(index + 1);
  }

  function runSearch(event?: FormEvent) {
    event?.preventDefault();

    const container = getContainer();
    if (!container) return;

    if (!container.dataset.searchOriginalHtml) {
      container.dataset.searchOriginalHtml = container.innerHTML;
    } else {
      restoreOriginal();
    }

    const term = query.trim();
    if (!term) {
      setMatchCount(0);
      setCurrentMatch(0);
      return;
    }

    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);

    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      const parent = node.parentElement;
      if (!parent) continue;
      if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) continue;
      if (node.nodeValue?.trim()) textNodes.push(node);
    }

    const lowerTerm = term.toLocaleLowerCase();

    for (const textNode of textNodes) {
      const source = textNode.nodeValue ?? "";
      const lowerSource = source.toLocaleLowerCase();
      let cursor = 0;
      let found = lowerSource.indexOf(lowerTerm, cursor);

      if (found === -1) continue;

      const fragment = document.createDocumentFragment();

      while (found !== -1) {
        if (found > cursor) {
          fragment.append(document.createTextNode(source.slice(cursor, found)));
        }

        const mark = document.createElement("mark");
        mark.className = "gazette-search-match";
        mark.dataset.gazetteSearchMatch = "true";
        mark.textContent = source.slice(found, found + term.length);
        fragment.append(mark);

        cursor = found + term.length;
        found = lowerSource.indexOf(lowerTerm, cursor);
      }

      if (cursor < source.length) {
        fragment.append(document.createTextNode(source.slice(cursor)));
      }

      textNode.replaceWith(fragment);
    }

    const matches = container.querySelectorAll("[data-gazette-search-match]");
    setMatchCount(matches.length);

    if (matches.length > 0) {
      setActiveMatch(0);
    } else {
      setCurrentMatch(0);
    }
  }

  function move(direction: -1 | 1) {
    if (matchCount === 0) return;

    const zeroBasedCurrent = Math.max(currentMatch - 1, 0);
    const next = (zeroBasedCurrent + direction + matchCount) % matchCount;
    setActiveMatch(next);
  }

  function clearSearch() {
    restoreOriginal();
    setQuery("");
    setMatchCount(0);
    setCurrentMatch(0);
  }

  return (
    <section className="govuk-!-margin-bottom-6" aria-labelledby="search-within-notice-heading">
      <h2 id="search-within-notice-heading" className="govuk-heading-m">
        Search within this notice
      </h2>

      <form onSubmit={runSearch} role="search">
        <div className="govuk-form-group govuk-!-margin-bottom-3">
          <label className="govuk-label govuk-label--s" htmlFor="notice-text-search">
            Find words in this notice
          </label>
          <div id="notice-text-search-hint" className="govuk-hint">
            This searches the HTML transcription currently displayed on this page.
          </div>
          <input
            className="govuk-input"
            id="notice-text-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-describedby="notice-text-search-hint"
            autoComplete="off"
          />
        </div>

        <div className="govuk-button-group govuk-!-margin-bottom-2">
          <button className="govuk-button govuk-!-margin-bottom-0" type="submit">
            Find
          </button>
          {(query || matchCount > 0) && (
            <button
              className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
              type="button"
              onClick={clearSearch}
            >
              Clear
            </button>
          )}
        </div>
      </form>

      <div aria-live="polite" aria-atomic="true">
        {matchCount > 0 ? (
          <>
            <p className="govuk-body govuk-!-margin-bottom-2">
              Match {currentMatch} of {matchCount}
            </p>
            <div className="govuk-button-group govuk-!-margin-bottom-0">
              <button
                className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
                type="button"
                onClick={() => move(-1)}
              >
                Previous match
              </button>
              <button
                className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
                type="button"
                onClick={() => move(1)}
              >
                Next match
              </button>
            </div>
          </>
        ) : query.trim() ? (
          <p className="govuk-body govuk-!-margin-bottom-0">No matches found.</p>
        ) : null}
      </div>
    </section>
  );
}
