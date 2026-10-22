"use client";

import { useMemo, useState } from "react";
import type { CategoryOption } from "./types";

type Props = {
  categories: CategoryOption[];
  onChange: (categories: CategoryOption[]) => void;
};

type Draft = { id?: string; title: string; description: string; parentId: string };
const emptyDraft: Draft = { title: "", description: "", parentId: "" };

type TaxonomyItem = NonNullable<CategoryOption["subTopics"]>[number];

export default function TaxonomyPanel({ categories, onChange }: Props) {
  const [selectedId, setSelectedId] = useState(categories[0]?._id || "");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState(false);
  const [formLevel, setFormLevel] = useState<"category" | "subcategory" | "subsubcategory">("category");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selected = categories.find((category) => category._id === selectedId);
  const items = useMemo(() => selected?.subTopics || [], [selected]);
  const roots = items.filter((item) => !item.parentHeading);
  const childrenOf = (parent: string) => items.filter((item) => item.parentHeading === parent);
  const editingItem = editingId ? items.find((item) => item.heading === editingId) : null;

  const refresh = async () => {
    const response = await fetch("/api/admin/services/save", { credentials: "include" });
    const json = await response.json();
    if (!response.ok || !json.success) throw new Error(json.error || "Could not refresh categories");
    onChange(json.categories || []);
  };

  const resetForm = () => {
    setDraft(emptyDraft);
    setEditingId(null);
    setEditingCategory(false);
    setFormLevel(selected ? "subcategory" : "category");
  };

  const save = async () => {
    if (!draft.title.trim()) return setError("Enter a name before saving.");
    if (formLevel === "subsubcategory" && !draft.parentId) return setError("Choose a parent subcategory.");
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const isEditing = editingCategory || Boolean(editingId);
      const response = await fetch("/api/admin/services/taxonomy", {
        method: isEditing ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: editingCategory ? "category" : "subcategory",
          id: editingCategory ? selectedId : editingId || undefined,
          categoryId: selectedId || undefined,
          name: draft.title.trim(),
          description: draft.description.trim(),
          parentHeading: formLevel === "subsubcategory" ? draft.parentId : undefined,
        }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Could not save taxonomy");
      await refresh();
      setMessage(editingCategory ? "Category updated." : editingId ? "Subcategory updated." : `${formLevel === "category" ? "Category" : "Subcategory"} added.`);
      resetForm();
      if (!selectedId && json.data?._id) setSelectedId(json.data._id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save taxonomy");
    } finally {
      setBusy(false);
    }
  };

  const editCategory = (category: CategoryOption) => {
    setSelectedId(category._id);
    setEditingId(null);
    setEditingCategory(true);
    setFormLevel("category");
    setDraft({ title: category.title, description: category.description || "", parentId: "" });
  };

  const editItem = (item: TaxonomyItem) => {
    setEditingId(item.heading || null);
    setEditingCategory(false);
    setFormLevel(item.parentHeading ? "subsubcategory" : "subcategory");
    setDraft({ title: item.heading || "", description: item.description || "", parentId: item.parentHeading || "" });
  };

  const remove = async (payload: { kind: "category" | "subcategory"; categoryId: string; heading?: string }) => {
    if (!confirm(`Remove this ${payload.kind}? Services under it will be moved to General.`)) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/services/taxonomy", { method: "DELETE", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Could not remove taxonomy");
      await refresh();
      if (payload.kind === "category") setSelectedId("");
      resetForm();
      setMessage("Removed safely. Affected services were moved to General.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove taxonomy");
    } finally {
      setBusy(false);
    }
  };

  const renderItem = (item: TaxonomyItem, depth = 0) => {
    const children = childrenOf(item.heading || "");
    return (
      <li key={`${item.heading}-${depth}`} className="govuk-!-margin-bottom-4" style={{ paddingLeft: depth ? "1.5rem" : 0, borderLeft: depth ? "4px solid #d8dde0" : undefined }}>
        <div className="govuk-!-margin-bottom-1">
          <strong className="govuk-body">{item.heading}</strong>
          <span className="govuk-hint govuk-!-display-inline govuk-!-margin-left-2">{item.serviceIds?.length || 0} services</span>
        </div>
        {item.description && <p className="govuk-body-s govuk-!-margin-bottom-2">{item.description}</p>}
        <button type="button" className="govuk-link govuk-body-s" onClick={() => editItem(item)}>Edit</button>
        <span aria-hidden="true" className="govuk-!-margin-left-2 govuk-!-margin-right-2">·</span>
        <button type="button" className="govuk-link govuk-body-s" onClick={() => void remove({ kind: "subcategory", categoryId: selectedId, heading: item.heading })}>Remove</button>
        {children.length > 0 && <ul className="govuk-list govuk-!-margin-top-3">{children.map((child) => renderItem(child, depth + 1))}</ul>}
      </li>
    );
  };

  return (
    <section className="govuk-!-margin-top-8" aria-labelledby="taxonomy-heading">
      <h2 id="taxonomy-heading" className="govuk-heading-l">Categories and browse paths</h2>
      <p className="govuk-body-l">Organise services from broad topics to specific pathways. Changes here control how people browse services on the public website.</p>
      <div className="govuk-inset-text govuk-!-margin-bottom-6">Removing a category or subcategory does not delete services. Affected services are moved to <strong>General</strong>.</div>
      {error && <p className="govuk-error-message" role="alert"><span className="govuk-visually-hidden">Error:</span> {error}</p>}
      {message && <p className="govuk-notification-banner govuk-notification-banner--success" role="status">{message}</p>}

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <div style={{ border: "1px solid #b1b4b6", padding: "1rem", background: "#f3f2f1" }}>
            <h3 className="govuk-heading-m govuk-!-margin-bottom-2">Main categories</h3>
            <p className="govuk-hint">The first level people see at /services.</p>
            {categories.length === 0 ? <p className="govuk-body-s">No categories yet.</p> : <ul className="govuk-list govuk-list--spaced">
              {categories.map((category) => <li key={category._id}>
                <button type="button" className="govuk-link" aria-current={selectedId === category._id ? "page" : undefined} onClick={() => { setSelectedId(category._id); resetForm(); }}>{category.title}</button>
                <span className="govuk-hint govuk-!-display-block govuk-body-s govuk-!-margin-bottom-1">{category.subTopics?.length || 0} browse levels</span>
                <button type="button" className="govuk-link govuk-body-s" onClick={() => editCategory(category)}>Edit</button>
                <span aria-hidden="true" className="govuk-!-margin-left-2 govuk-!-margin-right-2">·</span>
                <button type="button" className="govuk-link govuk-body-s" onClick={() => void remove({ kind: "category", categoryId: category._id })}>Remove</button>
              </li>)}
            </ul>}
            <button type="button" className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0" onClick={() => { setSelectedId(""); setFormLevel("category"); setDraft(emptyDraft); setEditingId(null); setEditingCategory(false); }}>Add main category</button>
          </div>
        </div>

        <div className="govuk-grid-column-two-thirds">
          <div style={{ borderBottom: "1px solid #b1b4b6", paddingBottom: "1rem" }}>
            <h3 className="govuk-heading-m govuk-!-margin-bottom-2">{selected ? selected.title : "Create a main category"}</h3>
            {selected ? <>
              {selected.description && <p className="govuk-body">{selected.description}</p>}
              <p className="govuk-hint">Subcategories and sub-subcategories appear beneath this category.</p>
              {roots.length > 0 ? <ul className="govuk-list">{roots.map((item) => renderItem(item))}</ul> : <p className="govuk-body-s">No subcategories yet. Add the first one below.</p>}
            </> : <p className="govuk-body">Select a category to manage its browse path, or create a new main category.</p>}
          </div>

          <div className="govuk-!-margin-top-6">
            <h3 className="govuk-heading-m">{editingCategory ? "Edit main category" : editingId ? `Edit ${formLevel === "subsubcategory" ? "sub-subcategory" : "subcategory"}` : "Add to the browse path"}</h3>
            {!editingCategory && <div className="govuk-form-group"><label className="govuk-label" htmlFor="taxonomy-level">What are you adding?</label><select id="taxonomy-level" className="govuk-select" value={formLevel} disabled={!selected || Boolean(editingId)} onChange={(event) => { setFormLevel(event.target.value as typeof formLevel); setDraft({ ...draft, parentId: "" }); }}><option value="category">Main category</option><option value="subcategory" disabled={!selected}>Subcategory</option><option value="subsubcategory" disabled={!selected || roots.length === 0}>Sub-subcategory</option></select></div>}
            {formLevel === "subsubcategory" && !editingCategory && <div className="govuk-form-group"><label className="govuk-label" htmlFor="taxonomy-parent">Parent subcategory</label><select id="taxonomy-parent" className="govuk-select" value={draft.parentId} onChange={(event) => setDraft({ ...draft, parentId: event.target.value })}><option value="">Choose a parent</option>{roots.map((item) => <option key={item.heading} value={item.heading}>{item.heading}</option>)}</select></div>}
            <div className="govuk-form-group"><label className="govuk-label" htmlFor="taxonomy-name">Name</label><input id="taxonomy-name" className="govuk-input govuk-!-width-two-thirds" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></div>
            <div className="govuk-form-group"><label className="govuk-label" htmlFor="taxonomy-description">Short description <span className="govuk-hint govuk-!-display-inline">(optional)</span></label><textarea id="taxonomy-description" className="govuk-textarea" rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></div>
            <button type="button" className="govuk-button" disabled={busy} onClick={() => void save()}>{busy ? "Saving…" : editingCategory || editingId ? "Save changes" : `Add ${formLevel === "category" ? "category" : formLevel === "subcategory" ? "subcategory" : "sub-subcategory"}`}</button>
            {(editingId || editingCategory || draft.title) && <button type="button" className="govuk-button govuk-button--secondary govuk-!-margin-left-2" onClick={resetForm}>Cancel</button>}
          </div>
        </div>
      </div>
    </section>
  );
}
