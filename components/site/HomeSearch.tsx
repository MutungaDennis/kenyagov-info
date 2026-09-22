"use client";
import SearchAutocomplete from "@/components/govuk/SearchAutocomplete";

export default function HomeSearch({ variant = "default" }: { variant?: "default" | "inverse" }) {
  const inverse = variant === "inverse";
  return <div className={`govuk-form-group app-home-search govuk-!-margin-bottom-0 ${inverse ? "app-home-search--inverse" : ""}`}>
    <label className={`govuk-label govuk-label--m ${inverse ? "app-home-search__label" : ""}`} htmlFor="main-search">Search the whole website</label>
    <p className={`govuk-hint ${inverse ? "app-home-search__hint" : ""}`}>Find institutions, people, public schools, services and laws. Try KRA, passport or Article 47.</p>
    <SearchAutocomplete inputId="main-search" placeholder="What are you looking for?" />
  </div>;
}
