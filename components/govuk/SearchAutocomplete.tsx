"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClientAsync } from "@/lib/supabase/client";
import { searchSite } from "@/lib/search/search";
import { resultHref, type SearchHit } from "@/lib/search/results";

interface Props {
  initialQuery?: string;
  onSelect?: (suggestion: SearchHit) => void;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  autoFocus?: boolean;
  inputId?: string;
  filterType?: string;
}

export default function SearchAutocomplete({ initialQuery = "", onSelect, placeholder = "Search the whole website", className = "", compact = false, autoFocus = false, inputId, filterType = "" }: Props) {
  const router = useRouter();
  const uniqueId = useId();
  const id = inputId || `site-search-${uniqueId}`;
  const listId = `${id}-suggestions`;
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const request = useRef(0);
  const cache = useRef(new Map<string, SearchHit[]>());

  useEffect(() => {
    let cancelled = false;
    const generation = ++request.current;
    const timer = window.setTimeout(async () => {
      const term = query.trim();
      if (term.length < 2) { setSuggestions([]); setLoading(false); return; }
      const key = `${filterType}:${term.toLowerCase()}`;
      if (cache.current.has(key)) { setSuggestions(cache.current.get(key)!); setLoading(false); return; }
      setLoading(true);
      try {
        const db = await createBrowserClientAsync();
        const { results } = await searchSite(db, term, filterType, 8, results => {
          if (!cancelled && generation === request.current) { setSuggestions(results); if (results.length) setLoading(false); }
        });
        if (cancelled || generation !== request.current) return;
        if (cache.current.size >= 30) cache.current.delete(cache.current.keys().next().value!);
        cache.current.set(key, results); setSuggestions(results);
      } catch { if (!cancelled && generation === request.current) setSuggestions([]); }
      finally { if (!cancelled && generation === request.current) setLoading(false); }
    }, 250);
    return () => { window.clearTimeout(timer); cancelled = true; };
  }, [query, filterType]);

  function select(hit: SearchHit) {
    setOpen(false); setActive(-1);
    if (onSelect) onSelect(hit); else router.push(resultHref(hit));
  }
  const show = open && suggestions.length > 0;
  return <div className={`${className} autocomplete-wrapper`} style={{ position: "relative" }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <form action="/search" method="get" role="search" aria-label="Search the whole website" className="autocomplete-form" style={{ display: "flex" }} onSubmit={event => {
      if (show && active >= 0 && suggestions[active]) { event.preventDefault(); select(suggestions[active]); }
      else if (!query.trim()) event.preventDefault();
    }}>
      {filterType && <input type="hidden" name="type" value={filterType} />}
      <input id={id} className={`govuk-input autocomplete-input ${compact ? "autocomplete-input-compact" : ""}`} type="search" name="q" role="combobox" aria-label="Search the whole website" aria-autocomplete="list" aria-expanded={show} aria-controls={listId} aria-activedescendant={show && active >= 0 ? `${listId}-${active}` : undefined}
        value={query} maxLength={120} placeholder={placeholder} autoFocus={autoFocus} autoComplete="off" enterKeyHint="search"
        onChange={event => { request.current++; setQuery(event.target.value); setSuggestions([]); setActive(-1); setOpen(true); }} onFocus={() => setOpen(true)}
        onKeyDown={event => {
          if (event.key === "Escape") { setOpen(false); setActive(-1); }
          if ((event.key === "ArrowDown" || event.key === "ArrowUp") && suggestions.length) {
            event.preventDefault(); setOpen(true); setActive(index => event.key === "ArrowDown" ? (index + 1) % suggestions.length : (index - 1 + suggestions.length) % suggestions.length);
          }
        }} style={{ minWidth: 0, flex: 1, height: compact ? 36 : 44, fontSize: compact ? 16 : 19, background: "#fff", color: "#0b0c0c", border: "2px solid #0b0c0c", borderRadius: 0 }} />
      <button type="submit" className="govuk-button autocomplete-button" aria-label="Search the whole website" style={{ margin: 0, height: compact ? 36 : 44, minWidth: 44, padding: "6px 12px", background: "#00703c", color: "#fff" }}><svg width="22" height="22" viewBox="0 0 27 27" aria-hidden="true"><circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" strokeWidth="3" /><path d="m17 17 8 8" stroke="currentColor" strokeWidth="3" /></svg></button>
    </form>
    <span className="govuk-visually-hidden" role="status">{open ? loading ? "Searching" : suggestions.length ? `${suggestions.length} suggestions. Use the up and down arrow keys, then Enter to open a result.` : query.trim().length >= 2 ? "Press Enter to search all results." : "" : ""}</span>
    {show && <ul id={listId} role="listbox" aria-label="Search suggestions" className="autocomplete-suggestions" style={{ position: "absolute", zIndex: 9999, top: "100%", left: 0, right: 0, background: "white", color: "#0b0c0c", border: "1px solid #b1b4b6", boxShadow: "0 3px 8px #0003", margin: 0, padding: 0, listStyle: "none" }}>
      {suggestions.map((hit, index) => <li id={`${listId}-${index}`} key={resultHref(hit)} role="option" aria-selected={active === index} onMouseDown={event => event.preventDefault()} onClick={() => select(hit)} style={{ padding: "12px", borderBottom: "1px solid #b1b4b6", cursor: "pointer", background: active === index ? "#ffdd00" : "white" }}>
        <strong style={{ display: "block", color: "#1d70b8", textDecoration: "underline" }}>{hit.name}</strong><span style={{ fontSize: 14 }}>{hit.entity_type}</span>
      </li>)}
    </ul>}
  </div>;
}
