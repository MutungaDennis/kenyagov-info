"use client";

import { useCallback, useEffect, useState } from "react";

export type LeaderPick = {
  id: string;
  slug?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  other_names?: string | null;
  surname?: string | null;
  title?: string | null;
  current_organization?: string | null;
};

export type LeaderPickResult = {
  id: string;
  label: string;
  title: string;
  slug: string;
};

function leaderDisplayName(row: LeaderPick): string {
  const parts = [row.first_name, row.other_names, row.surname]
    .filter(Boolean)
    .join(" ")
    .trim();
  return parts || row.full_name || "Unknown";
}

type Props = {
  id: string;
  label: string;
  hint?: string;
  valueId: string;
  valueLabel: string;
  onChange: (pick: LeaderPickResult) => void;
};

/**
 * Searchable leader picker — links institutions.current_head_id to leaders.
 */
export default function LeaderLinkPicker({
  id,
  label,
  hint,
  valueId,
  valueLabel,
  onChange,
}: Props) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<LeaderPick[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback(async (q: string) => {
    const term = q.trim();
    if (term.length < 1) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("q", term);
      params.set("limit", "40");
      const res = await fetch(`/api/admin/leaders?${params}`, {
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) {
        setResults([]);
        return;
      }
      setResults((json.data || []) as LeaderPick[]);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (open) runSearch(search);
    }, 280);
    return () => clearTimeout(t);
  }, [search, open, runSearch]);

  return (
    <div className="govuk-form-group">
      <label className="govuk-label" htmlFor={id}>
        {label}
      </label>
      {hint && <div className="govuk-hint">{hint}</div>}
      <input
        id={id}
        className="govuk-input"
        type="search"
        autoComplete="off"
        placeholder="Type to search leaders…"
        value={open ? search : valueLabel || search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
          if (valueId) {
            onChange({ id: "", label: "", title: "", slug: "" });
          }
        }}
        onFocus={() => {
          setOpen(true);
          if (valueLabel && !search) setSearch(valueLabel);
        }}
      />
      {loading && (
        <p className="govuk-hint govuk-!-margin-top-1">Searching…</p>
      )}
      {open && results.length > 0 && (
        <ul
          className="govuk-list"
          role="listbox"
          style={{
            maxHeight: 220,
            overflowY: "auto",
            border: "1px solid #b1b4b6",
            background: "#fff",
            marginTop: 4,
            padding: 0,
          }}
        >
          {results.map((r) => {
            const name = leaderDisplayName(r);
            return (
              <li key={r.id} style={{ margin: 0 }}>
                <button
                  type="button"
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    border: "none",
                    borderBottom: "1px solid #f3f2f1",
                    background: "transparent",
                    cursor: "pointer",
                    font: "inherit",
                  }}
                  onClick={() => {
                    onChange({
                      id: String(r.id),
                      label: name,
                      title: r.title ? String(r.title) : "",
                      slug: r.slug ? String(r.slug) : "",
                    });
                    setSearch("");
                    setOpen(false);
                    setResults([]);
                  }}
                >
                  <strong>{name}</strong>
                  {r.title ? (
                    <div className="govuk-hint govuk-!-margin-bottom-0">
                      {r.title}
                      {r.current_organization
                        ? ` · ${r.current_organization}`
                        : ""}
                    </div>
                  ) : r.current_organization ? (
                    <div className="govuk-hint govuk-!-margin-bottom-0">
                      {r.current_organization}
                    </div>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {open && search.trim().length >= 1 && !loading && results.length === 0 && (
        <p className="govuk-hint govuk-!-margin-top-1">
          No leaders match. Add the person under Officials first, or leave blank
          and type the name below.
        </p>
      )}
      {valueId && valueLabel && (
        <p className="govuk-body-s govuk-!-margin-top-2">
          <strong>Linked leader:</strong> {valueLabel}{" "}
          <button
            type="button"
            className="govuk-link"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              font: "inherit",
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() => {
              onChange({ id: "", label: "", title: "", slug: "" });
              setSearch("");
              setResults([]);
            }}
          >
            Clear link
          </button>
        </p>
      )}
    </div>
  );
}
