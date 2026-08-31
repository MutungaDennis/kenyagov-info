"use client";

import { useCallback, useEffect, useState } from "react";

export type ProvidingInstitution = {
  institutionId: string;
  name: string;
  slug?: string;
  shortName?: string;
  parentName?: string;
};

type SearchHit = {
  id: string;
  name: string;
  short_name?: string | null;
  slug?: string | null;
  institution_type?: string | null;
  parent_institution_id?: string | null;
};

type Props = {
  selected: ProvidingInstitution[];
  onChange: (next: ProvidingInstitution[]) => void;
};

/**
 * Multi-select institution search — same API as institutions admin picker.
 */
export default function InstitutionMultiPicker({ selected, onChange }: Props) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
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
      params.set("active", "1");
      const res = await fetch(`/api/admin/institutions?${params}`, {
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) {
        setResults([]);
        return;
      }
      setResults((json.data || []) as SearchHit[]);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (open) void runSearch(search);
    }, 280);
    return () => clearTimeout(t);
  }, [search, open, runSearch]);

  const already = new Set(selected.map((s) => s.institutionId));

  const resolveParentName = async (
    parentId: string | null | undefined,
  ): Promise<string | undefined> => {
    if (!parentId) return undefined;
    try {
      const res = await fetch(`/api/admin/institutions/${parentId}`, {
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();
      const name = json?.data?.name || json?.name;
      return name ? String(name) : undefined;
    } catch {
      return undefined;
    }
  };

  const add = async (hit: SearchHit) => {
    if (already.has(hit.id)) return;
    const parentName = await resolveParentName(hit.parent_institution_id);
    onChange([
      ...selected,
      {
        institutionId: hit.id,
        name: hit.name,
        slug: hit.slug || undefined,
        shortName: hit.short_name || undefined,
        parentName,
      },
    ]);
    setSearch("");
    setResults([]);
    setOpen(false);
  };

  const remove = (id: string) => {
    onChange(selected.filter((s) => s.institutionId !== id));
  };

  return (
    <div className="govuk-form-group">
      <label className="govuk-label" htmlFor="svc-inst-search">
        Providing institutions
      </label>
      <div className="govuk-hint">
        Search the institutions directory (same source as Institutions admin).
        Add every body that owns this service.
      </div>

      {selected.length > 0 ? (
        <ul className="govuk-list govuk-!-margin-bottom-3">
          {selected.map((s) => (
            <li key={s.institutionId}>
              <strong>{s.name}</strong>
              {s.parentName ? (
                <span className="govuk-hint"> (under {s.parentName})</span>
              ) : null}
              {s.slug ? (
                <span className="govuk-hint"> · /government/institutions/{s.slug}</span>
              ) : null}
              {" "}
              <button
                type="button"
                className="govuk-link"
                onClick={() => remove(s.institutionId)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="govuk-hint">No institutions selected yet.</p>
      )}

      <input
        id="svc-inst-search"
        className="govuk-input"
        type="search"
        autoComplete="off"
        placeholder="Type to search institutions…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {loading && (
        <p className="govuk-hint govuk-!-margin-top-1">Searching…</p>
      )}
      {open && results.length > 0 && (
        <ul
          className="govuk-list"
          role="listbox"
          style={{
            maxHeight: 260,
            overflowY: "auto",
            border: "1px solid #b1b4b6",
            background: "#fff",
            marginTop: 4,
            padding: 0,
          }}
        >
          {results.map((r) => {
            const disabled = already.has(r.id);
            return (
              <li key={r.id} style={{ margin: 0, borderBottom: "1px solid #f3f2f1" }}>
                <button
                  type="button"
                  disabled={disabled}
                  className="govuk-link"
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "0.6rem 0.75rem",
                    background: disabled ? "#f3f2f1" : "transparent",
                    border: "none",
                    cursor: disabled ? "default" : "pointer",
                    textDecoration: "none",
                    color: "inherit",
                    font: "inherit",
                  }}
                  onClick={() => void add(r)}
                >
                  <span className="govuk-!-font-weight-bold">{r.name}</span>
                  {r.short_name ? (
                    <span className="govuk-hint"> ({r.short_name})</span>
                  ) : null}
                  <div className="govuk-hint govuk-!-margin-0">
                    {[r.institution_type, r.slug].filter(Boolean).join(" · ")}
                    {disabled ? " · already added" : ""}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {open && search.trim().length >= 1 && !loading && results.length === 0 && (
        <p className="govuk-hint govuk-!-margin-top-1">
          No institutions match. Create or update the institution under
          Institutions admin if it is missing.
        </p>
      )}
    </div>
  );
}
