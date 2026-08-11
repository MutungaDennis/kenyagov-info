"use client";

/**
 * Full-page create official — personal details, titles, honours, bio,
 * verification. Positions are added on the edit page after create (supports
 * multiple concurrent current roles).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminPath } from "@/lib/admin-path";
import { triggerIndexNow } from "@/lib/indexnow";
import {
  NAME_TITLE_OPTIONS,
  NATIONAL_HONOUR_OPTIONS,
  SOCIAL_PLATFORM_OPTIONS,
  formatNationalHonoursSuffix,
  mergeNameTitleOptions,
  mergeNationalHonourOptions,
  type CatalogOption,
  type SocialLink,
} from "@/lib/leaders/titles-social";
import {
  DEFAULT_VERIFICATION_STATUS,
  VERIFICATION_FIELD_HINT,
  VERIFICATION_STATUS_OPTIONS,
  normalizeVerificationStatus,
} from "@/lib/verification";
import LeaderImageField from "@/components/admin/LeaderImageField";

type FormState = {
  first_name: string;
  other_names: string;
  surname: string;
  slug: string;
  bio: string;
  image_url: string;
  contact_email: string;
  phone: string;
  official_website: string;
  is_active: boolean;
  verification_status: string;
};

const emptyForm: FormState = {
  first_name: "",
  other_names: "",
  surname: "",
  slug: "",
  bio: "",
  image_url: "",
  contact_email: "",
  phone: "",
  official_website: "",
  is_active: true,
  verification_status: DEFAULT_VERIFICATION_STATUS,
};

function slugifyName(parts: string[]): string {
  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NewOfficialPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [nameTitles, setNameTitles] = useState<string[]>([]);
  const [nationalHonours, setNationalHonours] = useState<string[]>([]);
  const [titleOptions, setTitleOptions] = useState<CatalogOption[]>([
    ...NAME_TITLE_OPTIONS,
  ]);
  const [honourOptions, setHonourOptions] = useState<CatalogOption[]>([
    ...NATIONAL_HONOUR_OPTIONS,
  ]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [newTitleValue, setNewTitleValue] = useState("");
  const [newTitleLabel, setNewTitleLabel] = useState("");
  const [newHonourValue, setNewHonourValue] = useState("");
  const [newHonourLabel, setNewHonourLabel] = useState("");
  const [catalogSaving, setCatalogSaving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const computedName = useMemo(
    () =>
      [form.first_name, form.other_names, form.surname]
        .filter(Boolean)
        .join(" ")
        .trim(),
    [form.first_name, form.other_names, form.surname],
  );

  useEffect(() => {
    if (slugTouched) return;
    const s = slugifyName([
      form.first_name,
      form.other_names,
      form.surname,
    ]);
    if (s.length >= 3) {
      setForm((prev) => ({ ...prev, slug: s }));
    }
  }, [form.first_name, form.other_names, form.surname, slugTouched]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          "/api/admin/leaders/lookups?only=name_titles,national_honours",
          { credentials: "include", cache: "no-store" },
        );
        const json = await res.json();
        if (cancelled || !res.ok) return;
        if (Array.isArray(json.name_title_options)) {
          setTitleOptions(mergeNameTitleOptions(json.name_title_options));
        }
        if (Array.isArray(json.national_honour_options)) {
          setHonourOptions(
            mergeNationalHonourOptions(json.national_honour_options),
          );
        }
      } catch {
        /* built-ins only */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = (key: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const createCatalogOption = useCallback(
    async (
      kind: "name_title" | "national_honour",
      value: string,
      label: string,
    ) => {
      const v = value.trim();
      if (!v) {
        setError("Enter a short form for the new option.");
        return;
      }
      setCatalogSaving(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/leaders/catalog-options", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind,
            value: v,
            label: label.trim() || v,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(
            [json.error, json.hint].filter(Boolean).join(" — ") ||
              "Could not save option",
          );
        }
        const opt: CatalogOption = {
          value: json.data?.value || v,
          label: json.data?.label || label.trim() || v,
        };
        if (kind === "name_title") {
          setTitleOptions((prev) => mergeNameTitleOptions([...prev, opt]));
          setNameTitles((prev) =>
            prev.includes(opt.value) ? prev : [...prev, opt.value],
          );
          setNewTitleValue("");
          setNewTitleLabel("");
        } else {
          setHonourOptions((prev) =>
            mergeNationalHonourOptions([...prev, opt]),
          );
          setNationalHonours((prev) =>
            prev.includes(opt.value) ? prev : [...prev, opt.value],
          );
          setNewHonourValue("");
          setNewHonourLabel("");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save option");
      } finally {
        setCatalogSaving(false);
      }
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.surname.trim()) {
      setError("First name and surname are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        first_name: form.first_name.trim(),
        other_names: form.other_names.trim() || null,
        surname: form.surname.trim(),
        slug: form.slug.trim() || null,
        bio: form.bio.trim() || null,
        image_url: form.image_url.trim() || null,
        contact_email: form.contact_email.trim() || null,
        phone: form.phone.trim() || null,
        official_website: form.official_website.trim() || null,
        is_active: form.is_active,
        verification_status: normalizeVerificationStatus(
          form.verification_status,
        ),
        name_titles: nameTitles,
        national_honours: nationalHonours,
        social_media: socialLinks.filter((l) => l.platform && l.url.trim()),
      };
      const res = await fetch("/api/admin/leaders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          [json.error, json.hint].filter(Boolean).join(" — ") ||
            "Failed to create official",
        );
      }
      if (json.data?.slug) {
        void triggerIndexNow(json.data.slug, "leaders");
      }
      const id = json.data?.id;
      if (id) {
        router.push(adminPath(`officials/${id}/edit`));
        return;
      }
      router.push(adminPath("officials"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="govuk-width-container">
      <Link href={adminPath("officials")} className="govuk-back-link">
        Back to officials
      </Link>

      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">Add official</h1>
        <p className="govuk-body-l">
          Create a full person record. After saving you will open the edit page
          to add <strong>one or more positions</strong> (including concurrent
          current offices).
        </p>

        {error && (
          <div className="govuk-error-summary" role="alert">
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <p className="govuk-body">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h2 className="govuk-heading-m">Name</h2>
          <fieldset className="govuk-fieldset govuk-!-margin-bottom-4">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
              Titles / honorifics (optional)
            </legend>
            <div className="govuk-hint">
              Shown before the name on public pages (e.g. Hon., Justice, SC).
              Not used in the URL slug.
            </div>
            <div
              className="govuk-checkboxes govuk-checkboxes--small"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(11rem, 1fr))",
                gap: "0.25rem 1rem",
              }}
            >
              {titleOptions.map((opt) => {
                const checked = nameTitles.includes(opt.value);
                const idSafe = opt.value.replace(/[^a-zA-Z0-9_-]/g, "_");
                return (
                  <div className="govuk-checkboxes__item" key={opt.value}>
                    <input
                      className="govuk-checkboxes__input"
                      id={`new-title-${idSafe}`}
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setNameTitles((prev) =>
                          checked
                            ? prev.filter((t) => t !== opt.value)
                            : [...prev, opt.value],
                        )
                      }
                    />
                    <label
                      className="govuk-label govuk-checkboxes__label"
                      htmlFor={`new-title-${idSafe}`}
                    >
                      {opt.label}
                    </label>
                  </div>
                );
              })}
            </div>
            <div className="govuk-!-margin-top-3">
              <p className="govuk-body-s govuk-!-font-weight-bold">
                Add a new title for reuse
              </p>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-third">
                  <input
                    className="govuk-input"
                    placeholder="Short form e.g. Justice"
                    value={newTitleValue}
                    onChange={(e) => setNewTitleValue(e.target.value)}
                    aria-label="New title short form"
                  />
                </div>
                <div className="govuk-grid-column-one-third">
                  <input
                    className="govuk-input"
                    placeholder="Full label (optional)"
                    value={newTitleLabel}
                    onChange={(e) => setNewTitleLabel(e.target.value)}
                    aria-label="New title full label"
                  />
                </div>
                <div className="govuk-grid-column-one-third">
                  <button
                    type="button"
                    className="govuk-button govuk-button--secondary"
                    disabled={catalogSaving}
                    onClick={() =>
                      void createCatalogOption(
                        "name_title",
                        newTitleValue,
                        newTitleLabel,
                      )
                    }
                  >
                    Add title
                  </button>
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset className="govuk-fieldset govuk-!-margin-bottom-4">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
              National honours &amp; awards (optional)
            </legend>
            <div className="govuk-hint">
              Appear after the name (e.g. E.G.H., O.G.W.).
            </div>
            <div
              className="govuk-checkboxes govuk-checkboxes--small"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(18rem, 1fr))",
                gap: "0.25rem 1rem",
              }}
            >
              {honourOptions.map((opt) => {
                const checked = nationalHonours.includes(opt.value);
                const idSafe = opt.value.replace(/[^a-zA-Z0-9_-]/g, "_");
                return (
                  <div className="govuk-checkboxes__item" key={opt.value}>
                    <input
                      className="govuk-checkboxes__input"
                      id={`new-honour-${idSafe}`}
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setNationalHonours((prev) =>
                          checked
                            ? prev.filter((h) => h !== opt.value)
                            : [...prev, opt.value],
                        )
                      }
                    />
                    <label
                      className="govuk-label govuk-checkboxes__label"
                      htmlFor={`new-honour-${idSafe}`}
                    >
                      {opt.label}
                    </label>
                  </div>
                );
              })}
            </div>
            <div className="govuk-!-margin-top-3">
              <p className="govuk-body-s govuk-!-font-weight-bold">
                Add a new honour for reuse
              </p>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-third">
                  <input
                    className="govuk-input"
                    placeholder="Post-nominal e.g. E.G.H."
                    value={newHonourValue}
                    onChange={(e) => setNewHonourValue(e.target.value)}
                    aria-label="New honour short form"
                  />
                </div>
                <div className="govuk-grid-column-one-third">
                  <input
                    className="govuk-input"
                    placeholder="Full name (optional)"
                    value={newHonourLabel}
                    onChange={(e) => setNewHonourLabel(e.target.value)}
                    aria-label="New honour full label"
                  />
                </div>
                <div className="govuk-grid-column-one-third">
                  <button
                    type="button"
                    className="govuk-button govuk-button--secondary"
                    disabled={catalogSaving}
                    onClick={() =>
                      void createCatalogOption(
                        "national_honour",
                        newHonourValue,
                        newHonourLabel,
                      )
                    }
                  >
                    Add honour
                  </button>
                </div>
              </div>
            </div>
            {(nameTitles.length > 0 || nationalHonours.length > 0) && (
              <p className="govuk-body-s govuk-!-margin-top-2">
                Preview:{" "}
                <strong>
                  {[nameTitles.join(" "), computedName || "…"]
                    .filter(Boolean)
                    .join(" ")}
                  {nationalHonours.length
                    ? `, ${formatNationalHonoursSuffix(nationalHonours)}`
                    : ""}
                </strong>
              </p>
            )}
          </fieldset>

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="first_name">
                  First name *
                </label>
                <input
                  id="first_name"
                  className="govuk-input"
                  value={form.first_name}
                  onChange={(e) => setField("first_name", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="other_names">
                  Other names
                </label>
                <input
                  id="other_names"
                  className="govuk-input"
                  value={form.other_names}
                  onChange={(e) => setField("other_names", e.target.value)}
                />
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="surname">
                  Surname *
                </label>
                <input
                  id="surname"
                  className="govuk-input"
                  value={form.surname}
                  onChange={(e) => setField("surname", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="slug">
              URL slug *
            </label>
            <div className="govuk-hint">
              Auto-generated from the name (no titles). Edit if needed.
            </div>
            <input
              id="slug"
              className="govuk-input"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setField("slug", e.target.value);
              }}
              required
            />
            {form.slug && (
              <p className="govuk-body-s">
                Public URL: /government/people/{form.slug}
              </p>
            )}
          </div>

          <h2 className="govuk-heading-m">Biography &amp; contact</h2>
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="bio">
              Biography
            </label>
            <textarea
              id="bio"
              className="govuk-textarea"
              rows={5}
              value={form.bio}
              onChange={(e) => setField("bio", e.target.value)}
            />
          </div>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="contact_email">
                  Contact email
                </label>
                <input
                  id="contact_email"
                  className="govuk-input"
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setField("contact_email", e.target.value)}
                />
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="phone">
                  Phone
                </label>
                <input
                  id="phone"
                  className="govuk-input"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                />
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="official_website">
                  Website
                </label>
                <input
                  id="official_website"
                  className="govuk-input"
                  value={form.official_website}
                  onChange={(e) => setField("official_website", e.target.value)}
                />
              </div>
            </div>
          </div>
          <LeaderImageField
            value={form.image_url}
            idPrefix="new-official-image"
            onChange={(url) => setField("image_url", url)}
          />

          <h2 className="govuk-heading-m">Social links</h2>
          {socialLinks.map((link, i) => (
            <div key={i} className="govuk-grid-row govuk-!-margin-bottom-2">
              <div className="govuk-grid-column-one-third">
                <select
                  className="govuk-select"
                  value={link.platform}
                  onChange={(e) => {
                    const next = [...socialLinks];
                    next[i] = { ...next[i], platform: e.target.value };
                    setSocialLinks(next);
                  }}
                  aria-label={`Social platform ${i + 1}`}
                >
                  {SOCIAL_PLATFORM_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="govuk-grid-column-one-half">
                <input
                  className="govuk-input"
                  type="url"
                  placeholder="https://…"
                  value={link.url}
                  onChange={(e) => {
                    const next = [...socialLinks];
                    next[i] = { ...next[i], url: e.target.value };
                    setSocialLinks(next);
                  }}
                  aria-label={`Social URL ${i + 1}`}
                />
              </div>
              <div className="govuk-grid-column-one-sixth">
                <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  onClick={() =>
                    setSocialLinks((prev) => prev.filter((_, j) => j !== i))
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="govuk-button govuk-button--secondary govuk-!-margin-bottom-6"
            onClick={() =>
              setSocialLinks((prev) => [...prev, { platform: "x", url: "" }])
            }
          >
            Add social link
          </button>

          <h2 className="govuk-heading-m">Status</h2>
          <div className="govuk-checkboxes govuk-!-margin-bottom-4">
            <div className="govuk-checkboxes__item">
              <input
                className="govuk-checkboxes__input"
                id="is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setField("is_active", e.target.checked)}
              />
              <label
                className="govuk-label govuk-checkboxes__label"
                htmlFor="is_active"
              >
                Active in directory
              </label>
            </div>
          </div>
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="verification_status">
              Verification
            </label>
            <div id="verification-hint" className="govuk-hint">
              {VERIFICATION_FIELD_HINT}
            </div>
            <select
              className="govuk-select"
              id="verification_status"
              aria-describedby="verification-hint"
              value={form.verification_status}
              onChange={(e) => setField("verification_status", e.target.value)}
            >
              {VERIFICATION_STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              After create you will add <strong>positions held</strong> (job
              titles, organisations, dates). A person can hold several{" "}
              <strong>Active</strong> positions at once.
            </p>
          </div>

          <div className="govuk-button-group">
            <button type="submit" className="govuk-button" disabled={saving}>
              {saving ? "Creating…" : "Create official"}
            </button>
            <Link
              href={adminPath("officials")}
              className="govuk-button govuk-button--secondary"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
