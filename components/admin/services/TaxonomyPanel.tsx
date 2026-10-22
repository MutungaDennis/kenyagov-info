"use client";

import { useMemo, useState } from "react";
import type { CategoryOption } from "./types";

type Props = {
  categories: CategoryOption[];
  onChange: (categories: CategoryOption[]) => void;
};

type Draft = { id?: string; title: string; description: string; parentId: string };

const emptyDraft: Draft = { title: "", description: "", parentId: "" };

export default function TaxonomyPanel({ categories, onChange }: Props) {
  const [selectedId, setSelectedId] = useState(categories[0]?._id || "");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selected = categories.find((category) => category._id === selectedId);
  const headings = useMemo(() => selected?.subTopics || [], [selected]);

  const refresh = async () => {
    const response = await fetch("/api/admin/services/save", { credentials: "include" });
    const json = await response.json();
    if (!response.ok || !json.success) throw new Error(json.error || "Could not refresh categories");
    onChange(json.categories || []);
  };

  const save = async () => {
    if (!draft.title.trim()) return setError("Add a name before saving.");
    setBusy(true); setError(null); setMessage(null);
    try {
      const response = await fetch("/api/admin/services/taxonomy", {
        method: editingCategory || editingId ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: editingCategory ? "category" : editingId ? "subcategory" : "category",
          id: editingCategory ? selectedId : editingId || undefined,
          categoryId: selectedId || undefined,
          name: draft.title,
          description: draft.description,
          parentHeading: draft.parentId || undefined,
        }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Could not save taxonomy");
      await refresh();
      setMessage(editingCategory ? "Category updated." : editingId ? "Subcategory updated." : "Category added.");
      setDraft(emptyDraft); setEditingId(null); setEditingCategory(false);
      if (!selectedId && json.data?._id) setSelectedId(json.data._id);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save taxonomy"); }
    finally { setBusy(false); }
  };

  const editCategory = (category: CategoryOption) => {
    setSelectedId(category._id); setEditingId(null); setEditingCategory(true);
    setDraft({ title: category.title, description: category.description || "", parentId: "" });
  };

  const editSubcategory = (heading: NonNullable<CategoryOption["subTopics"]>[number]) => {
    setEditingId(heading.heading || null); setEditingCategory(false);
    setDraft({ title: heading.heading || "", description: heading.description || "", parentId: heading.parentHeading || "" });
  };

  const remove = async (payload: { kind: "category" | "subcategory"; categoryId: string; heading?: string }) => {
    if (!confirm(`Remove this ${payload.kind}? Services under it will be moved to General.`)) return;
    setBusy(true); setError(null); setMessage(null);
    try {
      const response = await fetch("/api/admin/services/taxonomy", { method: "DELETE", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Could not remove taxonomy");
      await refresh();
      if (payload.kind === "category") setSelectedId("");
      setMessage("Removed. Affected services were moved to General.");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not remove taxonomy"); }
    finally { setBusy(false); }
  };

  return <section className="govuk-!-margin-top-8" aria-labelledby="taxonomy-heading">
    <h2 id="taxonomy-heading" className="govuk-heading-l">Manage service categories</h2>
    <p className="govuk-body">Build the browse path from broad categories to subcategories. Removing a level keeps its services safe by moving them to General.</p>
    {error && <p className="govuk-error-message" role="alert">{error}</p>}
    {message && <p className="govuk-notification-banner govuk-notification-banner--success" role="status">{message}</p>}
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-one-third">
        <h3 className="govuk-heading-m">Main categories</h3>
        <ul className="govuk-list govuk-list--spaced">
          {categories.map((category) => <li key={category._id}>
            <button type="button" className="govuk-link" onClick={() => setSelectedId(category._id)}>{category.title}</button>{" "}
            <button type="button" className="govuk-link govuk-body-s" onClick={() => editCategory(category)}>Edit</button>{" "}
            <button type="button" className="govuk-link govuk-body-s" onClick={() => void remove({ kind: "category", categoryId: category._id })}>Remove</button>
          </li>)}
        </ul>
        <button type="button" className="govuk-button govuk-button--secondary" onClick={() => { setDraft(emptyDraft); setEditingId(null); setEditingCategory(false); setSelectedId(""); }}>Add main category</button>
      </div>
      <div className="govuk-grid-column-two-thirds">
        <h3 className="govuk-heading-m">{selected ? `${selected.title} subcategories` : "New main category"}</h3>
        {selected && <ul className="govuk-list govuk-list--spaced">
          {headings.map((heading, index) => <li key={`${heading.heading}-${index}`}>
            <strong>{heading.heading}</strong>{heading.parentHeading ? ` under ${heading.parentHeading}` : ""}{" "}
            <span className="govuk-hint govuk-!-display-inline">({heading.serviceIds?.length || 0} services)</span>{" "}
            <button type="button" className="govuk-link govuk-body-s" onClick={() => editSubcategory(heading)}>Edit</button>{" "}
            <button type="button" className="govuk-link govuk-body-s" onClick={() => void remove({ kind: "subcategory", categoryId: selected._id, heading: heading.heading })}>Remove</button>
          </li>)}
        </ul>}
        <div className="govuk-form-group"><label className="govuk-label" htmlFor="taxonomy-name">{editingCategory ? "Edit category" : editingId ? "Edit subcategory" : selected ? "Add subcategory" : "Category name"}</label><input id="taxonomy-name" className="govuk-input" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></div>
        <div className="govuk-form-group"><label className="govuk-label" htmlFor="taxonomy-description">Description</label><textarea id="taxonomy-description" className="govuk-textarea" rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></div>
        {selected && <div className="govuk-form-group"><label className="govuk-label" htmlFor="taxonomy-parent">Parent subcategory (optional)</label><select id="taxonomy-parent" className="govuk-select" value={draft.parentId} onChange={(event) => setDraft({ ...draft, parentId: event.target.value })}><option value="">No parent</option>{headings.filter((heading) => heading.heading !== editingId).map((heading) => <option key={heading.heading} value={heading.heading}>{heading.heading}</option>)}</select></div>}
        <button type="button" className="govuk-button" disabled={busy} onClick={() => void save()}>{busy ? "Saving…" : editingCategory || editingId ? "Save changes" : "Save category"}</button>
        {(editingId || draft.title) && <button type="button" className="govuk-button govuk-button--secondary govuk-!-margin-left-2" onClick={() => { setDraft(emptyDraft); setEditingId(null); setEditingCategory(false); }}>Cancel</button>}
      </div>
    </div>
  </section>;
}
