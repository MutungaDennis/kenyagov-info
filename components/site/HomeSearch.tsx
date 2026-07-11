"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Homepage search island — client only for form state.
 * Surrounding homepage content is server-rendered.
 */
export default function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search/all?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearchSubmit} className="govuk-form-group" role="search">
      <label className="govuk-label govuk-label--m" htmlFor="main-search">
        Search government entities, services or laws
      </label>
      <div className="govuk-hint" id="search-hint-text">
        For example: KRA, Constitution Article 47, passport or Nairobi County
      </div>

      <div className="govuk-input__wrapper">
        <input
          className="govuk-input"
          id="main-search"
          name="q"
          type="search"
          autoComplete="off"
          aria-describedby="search-hint-text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="govuk-button"
          data-module="govuk-button"
        >
          Search
        </button>
      </div>
    </form>
  );
}
