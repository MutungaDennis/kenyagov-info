'use client';

import React, { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { createClient } from '@/lib/supabase/client';
import { searchSanityContent } from '@/lib/sanity/client';
import { wordLikeSimilarity } from '@/lib/fuzzy';

interface Suggestion {
  name: string;
  entity_type: string;
  slug: string;
  base_route: string;
}

interface Props {
  initialQuery?: string;
  onSelect?: (suggestion: Suggestion) => void;
  placeholder?: string;
  className?: string;
  compact?: boolean; // for header use - smaller size
  autoFocus?: boolean;
}

export default function SearchAutocomplete({
  initialQuery = '',
  onSelect,
  placeholder = 'Search government...',
  className,
  compact = false,
  autoFocus = false,
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const fetchSuggestions = useDebouncedCallback(async (term: string) => {
    if (!term || term.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      // Use the hybrid rpc if available, else fallback
      const { data } = await supabase.rpc('search_public', {
        q: term,
        filter_type: null,
        lim: 6,
      });

      if (data && data.length) {
        let mapped = data.map((r: any) => ({
          name: r.name,
          entity_type: r.entity_type,
          slug: r.slug,
          base_route: r.base_route,
        }));

        // Fetch Sanity suggestions (rich content) with fuzzy tolerance
        try {
          const sanitySugs = await searchSanityContent(term, 6);
          const fuzzyNorm = (sanitySugs || [])
            .map((r: any) => {
              const text = `${r.title || r.name || ''} ${r.snippet || ''}`;
              const sim = wordLikeSimilarity(term, text);
              if (sim < 0.12) return null;
              return {
                name: r.title || r.name || 'Untitled',
                entity_type: r._type === 'constitutionArticle' ? 'Constitutional Article' : 
                             r._type === 'presidentialTrip' ? 'Presidential Trip' :
                             r._type === 'actOfParliament' ? 'Act of Parliament' : 'Content',
                slug: r.slug || '',
                base_route: r.base_route || '/',
              };
            })
            .filter(Boolean) as any[];

          // For content-oriented queries (constitution, article, part, preamble, etc.), put Sanity first so it displays well
          const contentKeywords = ['constitution', 'article', 'part ', 'preamble', 'chapter', 'bill of rights', 'supremacy'];
          const isContentQuery = contentKeywords.some(k => term.toLowerCase().includes(k));
          if (isContentQuery && fuzzyNorm.length) {
            mapped = [...fuzzyNorm, ...mapped].slice(0, 8);
          } else {
            mapped = [...mapped, ...fuzzyNorm].slice(0, 8);
          }
        } catch {}

        setSuggestions(mapped);
        setShowSuggestions(true);
      } else {
        // Fallback ilike + fuzzy Sanity for typos
        const { data: fb } = await supabase
          .from('global_search_view')
          .select('name, entity_type, slug, base_route')
          .or(`name.ilike.%${term}%,match_text.ilike.%${term}%`)
          .limit(6);
        let combined = fb || [];

        try {
          const sanitySugs = await searchSanityContent(term, 5);
          const fuzzyNorm = (sanitySugs || [])
            .map((r: any) => {
              const text = `${r.title || r.name || ''} ${r.snippet || ''}`;
              const sim = wordLikeSimilarity(term, text);
              if (sim < 0.12) return null;
              return {
                name: r.title || r.name || 'Untitled',
                entity_type: r._type === 'constitutionArticle' ? 'Constitutional Article' : 
                             r._type === 'presidentialTrip' ? 'Presidential Trip' :
                             r._type === 'actOfParliament' ? 'Act of Parliament' : 'Content',
                slug: r.slug || '',
                base_route: r.base_route || '/',
              };
            })
            .filter(Boolean) as any[];

          // Prioritize Sanity for content queries
          const contentKeywords = ['constitution', 'article', 'part ', 'preamble', 'chapter', 'bill of rights', 'supremacy'];
          const isContentQuery = contentKeywords.some(k => term.toLowerCase().includes(k));
          if (isContentQuery && fuzzyNorm.length) {
            combined = [...fuzzyNorm, ...combined].slice(0, 8);
          } else {
            combined = [...combined, ...fuzzyNorm].slice(0, 8);
          }
        } catch {}

        setSuggestions(combined);
        setShowSuggestions(combined.length > 0);
      }
    } catch (e) {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, 180);

  useEffect(() => {
    fetchSuggestions(query);
  }, [query, fetchSuggestions]);

  const handleSelect = (s: Suggestion) => {
    setQuery(s.name);
    setShowSuggestions(false);
    setSuggestions([]);
    if (onSelect) {
      onSelect(s);
    } else {
      // Default: navigate
      window.location.href = `${s.base_route}/${s.slug}`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <div className={`${className} autocomplete-wrapper`}>
      <form onSubmit={handleSubmit} role="search" className="autocomplete-form">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length && setShowSuggestions(true)}
          placeholder={placeholder}
          className={`govuk-input autocomplete-input ${compact ? 'autocomplete-input-compact' : ''}`}
          aria-label="Search"
          autoFocus={autoFocus}
          style={{ 
            flex: 1, 
            borderRight: 'none', 
            borderRadius: 0,
            height: compact ? '32px' : '40px',
            fontSize: compact ? '13px' : '14px',
            background: '#fff',
            color: '#0b0c0c',
            border: '2px solid #0b0c0c'
          }}
        />
        <button
          type="submit"
          className={`govuk-button autocomplete-button ${compact ? 'autocomplete-button-compact' : ''}`}
          aria-label="Search"
          style={{ 
            margin: 0, 
            height: compact ? '32px' : '40px', 
            width: compact ? '36px' : '44px', 
            borderRadius: 0, 
            background: '#00703c',
            color: '#fff',
            fontSize: compact ? '12px' : '14px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width={compact ? 15 : 18} height={compact ? 15 : 18} viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="3" />
            <line x1="18" y1="18" x2="24.5" y2="24.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="autocomplete-suggestions"
          style={{ 
            position: 'absolute',
            zIndex: 9999,
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            border: '1px solid #b1b4b6',
            width: '100%',
            maxWidth: '100%',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            margin: 0,
            padding: 0,
            listStyle: 'none',
            overflow: 'hidden'
          }}
        >
          {suggestions.map((s, i) => (
            <li
              key={i}
              role="option"
              onClick={() => handleSelect(s)}
              onKeyDown={(e) => e.key === 'Enter' && handleSelect(s)}
              tabIndex={0}
              style={{
                padding: '8px 12px',
                borderBottom: '1px solid #f3f2f1',
                cursor: 'pointer',
                fontSize: 14,
                backgroundColor: '#ffffff'
              }}
              className="govuk-link"
            >
              <strong>{s.name}</strong>
              <span style={{ color: '#505a5f', marginLeft: 8, fontSize: 12 }}>{s.entity_type}</span>
            </li>
          ))}
          {loading && <li style={{ padding: 8, fontSize: 12, color: '#505a5f', backgroundColor: '#ffffff' }}>Searching…</li>}
        </ul>
      )}
    </div>
  );
}
