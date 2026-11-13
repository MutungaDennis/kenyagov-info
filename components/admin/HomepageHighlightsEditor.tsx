"use client";

import { useState } from "react";
import {
  parseHomepageHighlightsConfig,
  type HomepageHighlight,
  type HomepageHighlightsConfig,
} from "@/lib/homepage-highlights-schema";
import styles from "./homepage-highlights.module.css";

type Props = {
  initialConfig: HomepageHighlightsConfig;
};

type EditableField = "category" | "title" | "description" | "href";

type SaveResult = {
  config?: HomepageHighlightsConfig;
  error?: string;
};

export default function HomepageHighlightsEditor({ initialConfig }: Props) {
  const [config, setConfig] = useState<HomepageHighlightsConfig>(() => ({
    sectionTitle: initialConfig.sectionTitle,
    items: initialConfig.items.map((item) => ({ ...item })),
  }));
  const [savedConfig, setSavedConfig] = useState<HomepageHighlightsConfig>(() => ({
    sectionTitle: initialConfig.sectionTitle,
    items: initialConfig.items.map((item) => ({ ...item })),
  }));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const hasChanges = JSON.stringify(config) !== JSON.stringify(savedConfig);

  function updateItem(id: string, field: EditableField, value: string) {
    setConfig((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
    setMessage("");
  }

  function moveItem(index: number, direction: -1 | 1) {
    setConfig((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.items.length) return current;
      const items = [...current.items];
      [items[index], items[target]] = [items[target], items[index]];
      return { ...current, items };
    });
    setMessage("");
  }

  function addItem() {
    if (config.items.length >= 3) return;
    const item: HomepageHighlight = {
      id: crypto.randomUUID(),
      category: "",
      title: "",
      description: "",
      href: "",
    };
    setConfig((current) => ({ ...current, items: [...current.items, item] }));
    setMessage("");
  }

  function removeItem(id: string) {
    setConfig((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== id),
    }));
    setMessage("");
  }

  async function saveChanges() {
    const parsed = parseHomepageHighlightsConfig(config);
    if (!parsed.success) {
      setMessage(
        "Check that the section name and each item are complete, and that every link is a valid web address or site path.",
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/homepage-highlights", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = (await response.json().catch(() => ({}))) as SaveResult;

      if (!response.ok || !result.config) {
        setMessage(result.error ?? "Your changes could not be saved. Try again.");
        return;
      }

      const nextConfig = {
        sectionTitle: result.config.sectionTitle,
        items: result.config.items.map((item) => ({ ...item })),
      };
      setConfig(nextConfig);
      setSavedConfig(nextConfig);
      setMessage("Changes saved. The homepage will show these highlights.");
    } catch {
      setMessage("Your changes could not be saved. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section aria-labelledby="homepage-highlights-heading">
      <div className="govuk-form-group">
        <label className="govuk-label govuk-label--s" htmlFor="section-title">
          Section name
        </label>
        <div className="govuk-hint">
          This replaces “Coming up” on the homepage. The section stays hidden when there are no items.
        </div>
        <input
          className="govuk-input govuk-!-width-two-thirds"
          id="section-title"
          maxLength={80}
          value={config.sectionTitle}
          onChange={(event) => {
            setConfig((current) => ({ ...current, sectionTitle: event.target.value }));
            setMessage("");
          }}
          required
        />
      </div>

      <div className="govuk-!-margin-top-6">
        <h2 className="govuk-heading-m" id="homepage-highlights-heading">
          Homepage items
        </h2>
        <p className="govuk-body">
          Add up to three items. Each one needs a category, a title and a link; the description is optional.
        </p>
      </div>

      <div className={styles.items}>
        {config.items.map((item, index) => (
          <fieldset className={styles.item} key={item.id}>
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
              Item {index + 1}
            </legend>

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor={`${item.id}-category`}>
                Category
              </label>
              <input
                className="govuk-input"
                id={`${item.id}-category`}
                maxLength={40}
                value={item.category}
                onChange={(event) => updateItem(item.id, "category", event.target.value)}
                placeholder="For example, Public safety"
                required
              />
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor={`${item.id}-title`}>
                Title
              </label>
              <input
                className="govuk-input"
                id={`${item.id}-title`}
                maxLength={120}
                value={item.title}
                onChange={(event) => updateItem(item.id, "title", event.target.value)}
                required
              />
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor={`${item.id}-description`}>
                Description <span className="govuk-hint govuk-!-display-inline">(optional)</span>
              </label>
              <textarea
                className="govuk-textarea"
                id={`${item.id}-description`}
                maxLength={240}
                rows={3}
                value={item.description}
                onChange={(event) => updateItem(item.id, "description", event.target.value)}
              />
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor={`${item.id}-href`}>
                Link
              </label>
              <div className="govuk-hint">
                Use a site path such as /services/tax or a full http or https address.
              </div>
              <input
                className="govuk-input"
                id={`${item.id}-href`}
                maxLength={500}
                type="text"
                value={item.href}
                onChange={(event) => updateItem(item.id, "href", event.target.value)}
                placeholder="/services/tax"
                required
              />
            </div>

            <div className={styles.actions}>
              <button
                className="govuk-button govuk-button--secondary"
                type="button"
                onClick={() => moveItem(index, -1)}
                disabled={index === 0}
                aria-label={`Move item ${index + 1} up`}
              >
                Move up
              </button>
              <button
                className="govuk-button govuk-button--secondary"
                type="button"
                onClick={() => moveItem(index, 1)}
                disabled={index === config.items.length - 1}
                aria-label={`Move item ${index + 1} down`}
              >
                Move down
              </button>
              <button
                className="govuk-button govuk-button--warning"
                type="button"
                onClick={() => removeItem(item.id)}
                aria-label={`Remove item ${index + 1}`}
              >
                Remove
              </button>
            </div>
          </fieldset>
        ))}
      </div>

      <button
        className="govuk-button govuk-button--secondary govuk-!-margin-top-4"
        type="button"
        onClick={addItem}
        disabled={config.items.length >= 3}
      >
        Add an item
      </button>
      <p className="govuk-hint">{config.items.length} of 3 items added</p>

      {message && (
        <p className="govuk-body" role={message.startsWith("Changes saved") ? "status" : "alert"}>
          {message}
        </p>
      )}

      <button
        className="govuk-button"
        type="button"
        onClick={saveChanges}
        disabled={saving || !hasChanges}
      >
        {saving ? "Saving…" : "Save homepage highlights"}
      </button>
    </section>
  );
}
