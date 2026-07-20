"use client";

import { useCallback, useEffect, useState } from "react";

export type InstitutionPick = {
  id: string;
  name: string;
  short_name?: string | null;
  slug?: string | null;
  institution_type?: string | null;
};

type Props = {
  id: string;
  label: string;
  hint?: string;
  valueId: string;
  valueLabel: string;
  excludeId?: string;
  onChange: (pick: { id: string; label: string }) => void;
};

/**
 * Searchable institution picker for parent / supervising / reports-to links.
 */
export default function InstitutionLinkPicker({
  id,
  label,
  hint,
  valueId,
  valueLabel,
  excludeId,
  onChange,
}: Props) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<InstitutionPick[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback(
    async (q: string) => {
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
        const res = await fetch(`/api/admin/institutions?${params}`, {
          credentials: "include",
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok) {
          setResults([]);
          return;
        }
        const rows = (json.data || []) as InstitutionPick[];
        setResults(
          rows.filter((r) => !excludeId || String(r.id) !== String(excludeId)),
        );
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [excludeId],
  );

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
        placeholder="Type to search institutions…"
        value={open ? search : valueLabel || search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
          // Clear selection when typing a new query
          if (valueId) onChange({ id: "", label: "" });
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
          {results.map((r) => (
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
                    label: r.short_name
                      ? `${r.name} (${r.short_name})`
                      : r.name,
                  });
                  setSearch("");
                  setOpen(false);
                  setResults([]);
                }}
              >
                <strong>{r.name}</strong>
                {r.short_name ? (
                  <span className="govuk-hint"> ({r.short_name})</span>
                ) : null}
                {r.institution_type ? (
                  <div className="govuk-hint govuk-!-margin-bottom-0">
                    {r.institution_type}
                  </div>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && search.trim().length >= 1 && !loading && results.length === 0 && (
        <p className="govuk-hint govuk-!-margin-top-1">
          No institutions match. Create the parent first if it does not exist.
        </p>
      )}
      {valueId && valueLabel && (
        <p className="govuk-body-s govuk-!-margin-top-2">
          <strong>Selected:</strong> {valueLabel}{" "}
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
              onChange({ id: "", label: "" });
              setSearch("");
              setResults([]);
            }}
          >
            Clear
          </button>
        </p>
      )}
    </div>
  );
}
