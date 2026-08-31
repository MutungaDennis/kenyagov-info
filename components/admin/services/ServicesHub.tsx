"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ServiceEditor from "./ServiceEditor";
import ServicesUploadPanel from "./UploadPanel";
import ServicesLinkPhrasesPanel from "./LinkPhrasesPanel";
import {
  detailToForm,
  emptyServiceForm,
  type CategoryOption,
  type MinistryOption,
  type ServiceFormState,
  type ServiceListRow,
} from "./types";

export type ServicesTab = "list" | "new" | "upload" | "links" | "edit";

type Props = {
  initialTab?: ServicesTab;
};

export default function ServicesHub({ initialTab = "list" }: Props) {
  const [tab, setTab] = useState<ServicesTab>(initialTab);
  const [services, setServices] = useState<ServiceListRow[]>([]);
  const [ministries, setMinistries] = useState<MinistryOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editorForm, setEditorForm] = useState<ServiceFormState | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/services/save", {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load services");
      }
      setServices(json.data || []);
      setMinistries(json.ministries || []);
      setCategories(json.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const switchTab = (next: ServicesTab) => {
    setTab(next);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", next === "edit" ? "list" : next);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const openNew = () => {
    setEditorForm(emptyServiceForm());
    setTab("edit");
  };

  const openEdit = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/services/save?id=${encodeURIComponent(id)}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Load failed");
      setEditorForm(detailToForm(json.data));
      setTab("edit");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open");
    }
  };

  const remove = async (id: string, title?: string) => {
    if (!confirm(`Delete “${title || id}”? This cannot be undone.`)) return;
    try {
      const res = await fetch("/api/admin/services/save", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Delete failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const filtered = services.filter((s) => {
    if (categoryFilter === "uncategorised") {
      if (s.categoryIds && s.categoryIds.length > 0) return false;
    } else if (categoryFilter !== "all") {
      if (!s.categoryIds?.includes(categoryFilter)) return false;
    }
    if (!q.trim()) return true;
    const hay = `${s.title || ""} ${s.slug || ""} ${(s.categoryTitles || []).join(" ")}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  const selectedCategoryTitle =
    categoryFilter === "all"
      ? null
      : categoryFilter === "uncategorised"
        ? "Uncategorised"
        : categories.find((c) => c._id === categoryFilter)?.title || null;

  return (
    <div>
      <h1 className="govuk-heading-xl">Service guides</h1>
      <p className="govuk-body-l">
        Author GOV.UK-style service guides. Start now buttons always point at
        official portals (eCitizen or agency sites).
      </p>

      <nav className="govuk-!-margin-bottom-6" aria-label="Services admin tabs">
        <ul className="govuk-list" style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          {(
            [
              ["list", "All services"],
              ["new", "New (form)"],
              ["upload", "Paste → Grok"],
              ["links", "Link phrases"],
            ] as const
          ).map(([id, label]) => (
            <li key={id}>
              <button
                type="button"
                className={
                  tab === id || (tab === "edit" && id === "list")
                    ? "govuk-link govuk-!-font-weight-bold"
                    : "govuk-link"
                }
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  font: "inherit",
                }}
                onClick={() => {
                  if (id === "new") openNew();
                  else {
                    setEditorForm(null);
                    switchTab(id);
                  }
                }}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {error && <p className="govuk-error-message">{error}</p>}

      {tab === "list" && (
        <>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="svc-category-filter">
                  Category hub
                </label>
                <div className="govuk-hint">
                  Same hubs used on /services (e.g. Driving and transport). Filter
                  to check related guides sit together.
                </div>
                <select
                  className="govuk-select"
                  id="svc-category-filter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All categories</option>
                  <option value="uncategorised">Uncategorised</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="svc-search">
                  Search
                </label>
                <div className="govuk-hint">Filter by title or slug within the category.</div>
                <input
                  className="govuk-input"
                  id="svc-search"
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="e.g. passport, licence…"
                />
              </div>
            </div>
          </div>
          {loading ? (
            <p className="govuk-body">Loading…</p>
          ) : (
            <table className="govuk-table">
              <caption className="govuk-table__caption govuk-table__caption--m">
                {filtered.length} service{filtered.length === 1 ? "" : "s"}
                {selectedCategoryTitle
                  ? ` in “${selectedCategoryTitle}”`
                  : ""}
                {services.length !== filtered.length
                  ? ` (of ${services.length} total)`
                  : ""}
              </caption>
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th className="govuk-table__header">Title</th>
                  <th className="govuk-table__header">Category hub</th>
                  <th className="govuk-table__header">Mode</th>
                  <th className="govuk-table__header">Weight</th>
                  <th className="govuk-table__header">Updated</th>
                  <th className="govuk-table__header">Actions</th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {filtered.map((s) => (
                  <tr key={s._id} className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">
                      {s.title}
                      <div className="govuk-hint govuk-!-margin-0">
                        /{s.slug}
                        {s.status === "draft" ? " · draft" : ""}
                      </div>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">
                      {s.categoryTitles && s.categoryTitles.length > 0
                        ? s.categoryTitles.join(", ")
                        : "—"}
                    </td>
                    <td className="govuk-table__cell">{s.executionMode || "—"}</td>
                    <td className="govuk-table__cell">{s.popularityWeight ?? 0}</td>
                    <td className="govuk-table__cell govuk-body-s">
                      {s._updatedAt
                        ? new Date(s._updatedAt).toLocaleDateString("en-KE")
                        : "—"}
                    </td>
                    <td className="govuk-table__cell">
                      <button
                        type="button"
                        className="govuk-link"
                        onClick={() => void openEdit(s._id)}
                      >
                        Edit
                      </button>
                      {" · "}
                      {s.slug ? (
                        <Link href={`/${s.slug}`} className="govuk-link" target="_blank">
                          View
                        </Link>
                      ) : null}
                      {" · "}
                      <button
                        type="button"
                        className="govuk-link"
                        onClick={() => void remove(s._id, s.title)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {tab === "upload" && (
        <ServicesUploadPanel
          onStructured={(form) => {
            setEditorForm(form);
            setTab("edit");
          }}
        />
      )}

      {tab === "links" && <ServicesLinkPhrasesPanel />}

      {tab === "edit" && editorForm && (
        <ServiceEditor
          key={editorForm._id || "new"}
          initial={editorForm}
          ministries={ministries}
          categories={categories}
          allServices={services}
          onMinistriesChange={setMinistries}
          onCategoriesChange={setCategories}
          onSaved={() => void load()}
          onCancel={() => {
            setEditorForm(null);
            switchTab("list");
          }}
        />
      )}
    </div>
  );
}
