"use client";

import { useMemo, useState } from "react";
import {
  type CategoryOption,
  type MinistryOption,
  type ServiceFormState,
  type ServiceListRow,
  formSnapshot,
  formToPayload,
} from "./types";
import { CheckboxMultiSelect, ExpandableTextarea } from "./form-controls";
import InstitutionMultiPicker from "./InstitutionMultiPicker";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type Props = {
  initial: ServiceFormState;
  ministries: MinistryOption[];
  categories: CategoryOption[];
  allServices: ServiceListRow[];
  onSaved: () => void;
  onCancel: () => void;
  onMinistriesChange?: (items: MinistryOption[]) => void;
  onCategoriesChange?: (items: CategoryOption[]) => void;
};

export default function ServiceEditor({
  initial,
  categories,
  allServices,
  onSaved,
  onCancel,
  onCategoriesChange,
}: Props) {
  const [form, setForm] = useState<ServiceFormState>(initial);
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    formSnapshot(initial),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const relatedOptions = useMemo(
    () => allServices.filter((s) => s._id !== form._id),
    [allServices, form._id],
  );

  const isDirty = formSnapshot(form) !== savedSnapshot;

  const set = <K extends keyof ServiceFormState>(
    key: K,
    value: ServiceFormState[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const onTitleBlur = () => {
    if (!form.slug.trim() && form.title.trim()) {
      set("slug", slugify(form.title));
    }
  };

  const showPhysicalVisits =
    form.executionMode === "hybrid" || form.executionMode === "manual";

  const createCategory = async () => {
    const title = newCategory.trim();
    if (!title) return;
    setCreatingCategory(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/services/taxonomy", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "category", name: title }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Create failed");
      const created = json.data as { _id: string; title: string; slug?: string };
      const next = [
        ...categories.filter((c) => c._id !== created._id),
        {
          _id: created._id,
          title: created.title,
          slug: created.slug,
          subTopics: [],
        },
      ].sort((a, b) => a.title.localeCompare(b.title));
      onCategoriesChange?.(next);
      set("categoryId", created._id);
      setNewCategory("");
      setMessage(json.message || "Category added");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add category");
    } finally {
      setCreatingCategory(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/services/save", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToPayload(form)),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Save failed");
      }
      setMessage(`Saved. Public URL: /${json.slug}`);
      const nextForm = json.id ? { ...form, _id: String(json.id) } : form;
      if (json.id) setForm(nextForm);
      setSavedSnapshot(formSnapshot(nextForm));
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="govuk-!-margin-bottom-8">
      <h2 className="govuk-heading-l">
        {form._id ? "Edit service guide" : "New service guide"}
      </h2>
      <p className="govuk-body">
        Write for citizens. The Start now button must open an official portal
        (eCitizen or agency site) — this site does not take applications.
      </p>

      {error && (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">There is a problem</h2>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">{error}</p>
          </div>
        </div>
      )}
      {message && (
        <div
          className="govuk-notification-banner govuk-notification-banner--success"
          role="status"
        >
          <div className="govuk-notification-banner__content">
            <p className="govuk-notification-banner__heading">{message}</p>
          </div>
        </div>
      )}

      <fieldset className="govuk-fieldset govuk-!-margin-bottom-6">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
          Identity
        </legend>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="svc-title">
            Title (start with a verb)
          </label>
          <input
            className="govuk-input"
            id="svc-title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            onBlur={onTitleBlur}
          />
        </div>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="svc-slug">
            Slug (public URL /{form.slug || "…"})
          </label>
          <input
            className="govuk-input govuk-input--width-20"
            id="svc-slug"
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
          />
        </div>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="svc-summary">
            Summary
          </label>
          <div className="govuk-hint">2–3 sentences. Text box grows as you type.</div>
          <ExpandableTextarea
            id="svc-summary"
            minRows={3}
            maxRows={12}
            value={form.summary}
            onChange={(e) => set("summary", e.target.value)}
          />
        </div>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="svc-body">
            Additional guidance
          </label>
          <div className="govuk-hint">
            Optional paragraphs. Leave a blank line between paragraphs.
          </div>
          <ExpandableTextarea
            id="svc-body"
            minRows={5}
            maxRows={30}
            value={form.bodyText}
            onChange={(e) => set("bodyText", e.target.value)}
          />
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="svc-status">
                Status
              </label>
              <select
                className="govuk-select"
                id="svc-status"
                value={form.status}
                onChange={(e) =>
                  set("status", e.target.value as "published" | "draft")
                }
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          <div className="govuk-grid-column-one-third">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="svc-reviewed">
                Last reviewed
              </label>
              <input
                className="govuk-input"
                id="svc-reviewed"
                type="date"
                value={form.reviewedAt}
                onChange={(e) => set("reviewedAt", e.target.value)}
              />
            </div>
          </div>
          <div className="govuk-grid-column-one-third">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="svc-weight">
                Popularity weight
              </label>
              <input
                className="govuk-input"
                id="svc-weight"
                type="number"
                min={0}
                value={form.popularityWeight}
                onChange={(e) =>
                  set("popularityWeight", Number(e.target.value) || 0)
                }
              />
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className="govuk-fieldset govuk-!-margin-bottom-6">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
          How people use this service
        </legend>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="svc-mode">
            Application channel
          </label>
          <div className="govuk-hint">
            Choose online only, physical only, or both (hybrid).
          </div>
          <div className="govuk-radios" data-module="govuk-radios">
            {(
              [
                {
                  value: "online",
                  label: "Online only",
                  hint: "Fully digital — no office visit required",
                },
                {
                  value: "manual",
                  label: "Physical / in person only",
                  hint: "Forms or attendance at an office or Huduma Centre",
                },
                {
                  value: "hybrid",
                  label: "Online and physical",
                  hint: "Apply online, then attend for biometrics or verification",
                },
              ] as const
            ).map((opt) => (
              <div className="govuk-radios__item" key={opt.value}>
                <input
                  className="govuk-radios__input"
                  id={`svc-mode-${opt.value}`}
                  name="svc-mode"
                  type="radio"
                  value={opt.value}
                  checked={form.executionMode === opt.value}
                  onChange={() => set("executionMode", opt.value)}
                />
                <label
                  className="govuk-label govuk-radios__label"
                  htmlFor={`svc-mode-${opt.value}`}
                >
                  {opt.label}
                </label>
                <div className="govuk-hint govuk-radios__hint">{opt.hint}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="svc-time">
                Processing time
              </label>
              <input
                className="govuk-input"
                id="svc-time"
                value={form.processingTime}
                onChange={(e) => set("processingTime", e.target.value)}
                placeholder="e.g. 2 working days"
              />
            </div>
          </div>
          <div className="govuk-grid-column-one-half">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="svc-cost">
                Cost label
              </label>
              <input
                className="govuk-input"
                id="svc-cost"
                value={form.baseCostLabel}
                onChange={(e) => set("baseCostLabel", e.target.value)}
                placeholder="e.g. From Ksh 1,050"
              />
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className="govuk-fieldset govuk-!-margin-bottom-6">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
          Providing institutions & category
        </legend>

        <InstitutionMultiPicker
          selected={form.providingInstitutions}
          onChange={(next) => set("providingInstitutions", next)}
        />
        {form.providingInstitutions.length === 0 &&
        form.providingBodyIds.length > 0 ? (
          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-0">
              This guide still has legacy Sanity ministry links. Search and add
              the matching institutions above so “From:” uses the live
              institutions directory.
            </p>
          </div>
        ) : null}

        <div className="govuk-form-group govuk-!-margin-top-6">
          <label className="govuk-label" htmlFor="svc-cat">
            Category hub (optional)
          </label>
          <div className="govuk-hint">
            Groups this guide on /services (e.g. Driving and transport).
          </div>
          <select
            className="govuk-select"
            id="svc-cat"
            value={form.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
          >
            <option value="">— Not assigned —</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div className="govuk-inset-text">
          <div className="govuk-form-group govuk-!-margin-bottom-2">
            <label className="govuk-label" htmlFor="new-category">
              Add a category that is not listed
            </label>
            <input
              className="govuk-input"
              id="new-category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Education and learning"
            />
          </div>
          <button
            type="button"
            className="govuk-button govuk-button--secondary"
            disabled={creatingCategory || !newCategory.trim()}
            onClick={() => void createCategory()}
          >
            {creatingCategory ? "Adding…" : "Add category"}
          </button>
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="svc-sub">
            Sub-topic heading within the category
          </label>
          <input
            className="govuk-input"
            id="svc-sub"
            value={form.subTopicHeading}
            onChange={(e) => set("subTopicHeading", e.target.value)}
            placeholder="e.g. Learning to drive"
          />
        </div>
      </fieldset>

      <fieldset className="govuk-fieldset govuk-!-margin-bottom-6">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
          Before you start & documents
        </legend>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="svc-bys">
            Before you start (one item per line)
          </label>
          <ExpandableTextarea
            id="svc-bys"
            minRows={4}
            maxRows={20}
            value={form.beforeYouStart}
            onChange={(e) => set("beforeYouStart", e.target.value)}
          />
        </div>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="svc-docs">
            Required documents (one per line)
          </label>
          <ExpandableTextarea
            id="svc-docs"
            minRows={4}
            maxRows={20}
            value={form.requiredDocuments}
            onChange={(e) => set("requiredDocuments", e.target.value)}
          />
        </div>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="svc-timeline">
            Timeline guidance (one per line)
          </label>
          <ExpandableTextarea
            id="svc-timeline"
            minRows={3}
            maxRows={16}
            value={form.timelineGuidancePoints}
            onChange={(e) => set("timelineGuidancePoints", e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset className="govuk-fieldset govuk-!-margin-bottom-6">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
          Steps
        </legend>
        {form.steps.map((step, idx) => (
          <div
            key={idx}
            className="govuk-!-margin-bottom-4 p-3 border border-gray-300"
          >
            <div className="govuk-form-group">
              <label className="govuk-label">Step {idx + 1} title</label>
              <input
                className="govuk-input"
                value={step.stepTitle}
                onChange={(e) => {
                  const steps = [...form.steps];
                  steps[idx] = {
                    ...step,
                    stepNumber: idx + 1,
                    stepTitle: e.target.value,
                  };
                  set("steps", steps);
                }}
              />
            </div>
            <div className="govuk-form-group">
              <label className="govuk-label">Description</label>
              <ExpandableTextarea
                minRows={2}
                maxRows={12}
                value={step.stepDescription}
                onChange={(e) => {
                  const steps = [...form.steps];
                  steps[idx] = { ...step, stepDescription: e.target.value };
                  set("steps", steps);
                }}
              />
            </div>
            <button
              type="button"
              className="govuk-link"
              onClick={() =>
                set(
                  "steps",
                  form.steps.filter((_, i) => i !== idx),
                )
              }
            >
              Remove step
            </button>
          </div>
        ))}
        <button
          type="button"
          className="govuk-button govuk-button--secondary"
          onClick={() =>
            set("steps", [
              ...form.steps,
              {
                stepNumber: form.steps.length + 1,
                stepTitle: "",
                stepDescription: "",
              },
            ])
          }
        >
          Add step
        </button>
      </fieldset>

      <ArrayObjectEditor
        title="Fees table"
        items={form.feesTable}
        empty={{ itemName: "", amount: "" }}
        fields={[
          { key: "itemName", label: "Fee item" },
          { key: "amount", label: "Amount" },
        ]}
        onChange={(items) => set("feesTable", items)}
      />

      {showPhysicalVisits ? (
        <ArrayObjectEditor
          title="Physical visits"
          hint={
            form.executionMode === "hybrid"
              ? "Describe what people must do in person after or alongside the online steps."
              : "Describe where people go and why."
          }
          items={form.physicalVisits}
          empty={{ purpose: "", locations: "" }}
          fields={[
            { key: "purpose", label: "Purpose" },
            { key: "locations", label: "Locations", textarea: true },
          ]}
          onChange={(items) => set("physicalVisits", items)}
        />
      ) : (
        <div className="govuk-inset-text govuk-!-margin-bottom-6">
          <p className="govuk-body govuk-!-margin-0">
            Physical visits are hidden because this service is{" "}
            <strong>online only</strong>. Switch to “Physical / in person” or
            “Online and physical” if an office visit is required.
          </p>
        </div>
      )}

      <ArrayObjectEditor
        title="Common mistakes"
        items={form.commonMistakes}
        empty={{ errorTitle: "", errorFix: "" }}
        fields={[
          { key: "errorTitle", label: "Mistake" },
          { key: "errorFix", label: "How to avoid", textarea: true },
        ]}
        onChange={(items) => set("commonMistakes", items)}
      />
      <ArrayObjectEditor
        title="FAQs"
        items={form.faqs}
        empty={{ question: "", answer: "" }}
        fields={[
          { key: "question", label: "Question" },
          { key: "answer", label: "Answer", textarea: true },
        ]}
        onChange={(items) => set("faqs", items)}
      />
      <ArrayObjectEditor
        title="Downloadable resources"
        hint="The label becomes the clickable link on the public page. Put the file or page URL in Source URL."
        items={form.downloadableResources}
        empty={{ label: "", sourceUrl: "" }}
        fields={[
          { key: "label", label: "Link title (shown to users)" },
          { key: "sourceUrl", label: "Source URL" },
        ]}
        onChange={(items) => set("downloadableResources", items)}
      />

      <fieldset className="govuk-fieldset govuk-!-margin-bottom-6">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
          Start now portals (official transaction sites)
        </legend>
        <ArrayObjectEditor
          title=""
          items={form.transactionPortals}
          empty={{ portalLabel: "", portalUrl: "" }}
          fields={[
            { key: "portalLabel", label: "Button label" },
            { key: "portalUrl", label: "Portal URL" },
          ]}
          onChange={(items) => set("transactionPortals", items)}
        />
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="svc-more">
            More information URL (optional, non-transactional)
          </label>
          <input
            className="govuk-input"
            id="svc-more"
            value={form.moreInformationUrl}
            onChange={(e) => set("moreInformationUrl", e.target.value)}
          />
        </div>
      </fieldset>

      <ArrayObjectEditor
        title="Related links"
        items={form.relatedLinks}
        empty={{ label: "", href: "" }}
        fields={[
          { key: "label", label: "Label" },
          { key: "href", label: "URL or /path" },
        ]}
        onChange={(items) => set("relatedLinks", items)}
      />

      <div className="govuk-!-margin-bottom-6">
        <CheckboxMultiSelect
          legend="Related service guides"
          hint="Tick other guides that sit next to this one (e.g. renewing after applying)."
          filterPlaceholder="Search service guides…"
          options={relatedOptions.map((s) => ({
            id: s._id,
            label: s.title || s.slug || s._id,
            hint: s.slug ? `/${s.slug}` : undefined,
          }))}
          selectedIds={form.relatedServiceIds}
          onChange={(ids) => set("relatedServiceIds", ids)}
        />
      </div>

      <div className="govuk-button-group">
        <button
          type="button"
          className="govuk-button"
          disabled={saving || !isDirty}
          onClick={() => void save()}
        >
          {saving ? "Saving…" : isDirty ? "Save service" : "Saved"}
        </button>
        <button
          type="button"
          className="govuk-button govuk-button--secondary"
          onClick={onCancel}
        >
          Back to list
        </button>
      </div>
      {!isDirty ? (
        <p className="govuk-hint">No unsaved changes.</p>
      ) : (
        <p className="govuk-hint">You have unsaved changes.</p>
      )}
    </div>
  );
}

function ArrayObjectEditor<T extends Record<string, string>>({
  title,
  hint,
  items,
  empty,
  fields,
  onChange,
}: {
  title: string;
  hint?: string;
  items: T[];
  empty: T;
  fields: Array<{ key: keyof T & string; label: string; textarea?: boolean }>;
  onChange: (items: T[]) => void;
}) {
  return (
    <fieldset className="govuk-fieldset govuk-!-margin-bottom-6">
      {title ? (
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
          {title}
        </legend>
      ) : null}
      {hint ? <div className="govuk-hint">{hint}</div> : null}
      {items.map((item, idx) => (
        <div
          key={idx}
          className="govuk-!-margin-bottom-3 p-3 border border-gray-200"
        >
          {fields.map((f) => (
            <div className="govuk-form-group" key={f.key}>
              <label className="govuk-label">{f.label}</label>
              {f.textarea ? (
                <ExpandableTextarea
                  minRows={2}
                  maxRows={12}
                  value={item[f.key] || ""}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...item, [f.key]: e.target.value };
                    onChange(next);
                  }}
                />
              ) : (
                <input
                  className="govuk-input"
                  value={item[f.key] || ""}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...item, [f.key]: e.target.value };
                    onChange(next);
                  }}
                />
              )}
            </div>
          ))}
          <button
            type="button"
            className="govuk-link"
            onClick={() => onChange(items.filter((_, i) => i !== idx))}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="govuk-button govuk-button--secondary"
        onClick={() => onChange([...items, { ...empty }])}
      >
        Add row
      </button>
    </fieldset>
  );
}
