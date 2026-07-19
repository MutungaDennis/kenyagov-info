"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type HomeSearchProps = {
  /** inverse = white text on brand-green masthead (homepage) */
  variant?: "default" | "inverse";
};

/**
 * Homepage search island — client only for form state.
 * On small screens: full-width field + icon-only submit (GOV.UK style).
 * On larger screens: field + labelled "Search" button.
 */
export default function HomeSearch({ variant = "default" }: HomeSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inverse = variant === "inverse";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search/all?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSearchSubmit}
      className={[
        "govuk-form-group",
        "app-home-search",
        "govuk-!-margin-bottom-0",
        inverse ? "app-home-search--inverse" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="search"
    >
      <label
        className={[
          "govuk-label",
          "govuk-label--m",
          inverse ? "app-home-search__label" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        htmlFor="main-search"
      >
        Search government entities, services or laws
      </label>
      <div
        className={["govuk-hint", inverse ? "app-home-search__hint" : ""]
          .filter(Boolean)
          .join(" ")}
        id="search-hint-text"
      >
        For example: KRA, Constitution Article 47, passport or Nairobi County
      </div>

      <div className="app-home-search__controls">
        <input
          className="govuk-input app-home-search__input"
          id="main-search"
          name="q"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          aria-describedby="search-hint-text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="govuk-button app-home-search__button"
          data-module="govuk-button"
          aria-label="Search"
        >
          <span className="app-home-search__button-text" aria-hidden="true">
            Search
          </span>
          <svg
            className="app-home-search__button-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 27 27"
            width="27"
            height="27"
            aria-hidden="true"
            focusable="false"
          >
            <circle
              cx="12.016"
              cy="11.016"
              r="8.516"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              d="m19.5 18.5 5.5 5.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
