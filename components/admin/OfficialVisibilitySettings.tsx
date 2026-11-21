"use client";

import { useEffect, useState } from "react";

const scopes = [
  ["all_officials", "All officials"],
  ["national_officials", "National officials"],
  ["mps", "Members of Parliament"],
  ["senators", "Senators"],
  ["governors", "Governors"],
  ["women_representatives", "Woman representatives"],
] as const;
const fields = [
  ["biography", "Biography"],
  ["key_details", "Key details"],
  ["party", "Political party"],
  ["positions", "Positions held"],
  ["qualifications", "Academic qualifications"],
  ["committees", "Committee memberships"],
  ["contact", "Contact details"],
  ["social_media", "Social media links"],
  ["hansard_contributions", "Parliamentary contributions (Hansard)"],
] as const;
type Scope = (typeof scopes)[number][0];
type Visibility = Record<string, boolean>;

export default function OfficialVisibilitySettings() {
  const [values, setValues] = useState<Record<string, Visibility>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Scope | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/officials/visibility", { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || "Could not load settings");
        if (!cancelled) {
          const next: Record<string, Visibility> = {};
          for (const row of json.data || []) next[row.scope] = row.visibility || {};
          setValues(next);
        }
      })
      .catch((error) => {
        if (!cancelled) setMessage(error instanceof Error ? error.message : "Could not load settings");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const saveScope = async (scope: Scope) => {
    setSaving(scope);
    setMessage("");
    try {
      const response = await fetch("/api/admin/officials/visibility", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, visibility: values[scope] || {} }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Could not save settings");
      setValues((current) => ({ ...current, [scope]: json.data.visibility || {} }));
      setMessage("Visibility settings saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save settings");
    } finally {
      setSaving(null);
    }
  };

  return (
    <section className="govuk-inset-text" aria-labelledby="official-visibility-heading">
      <h2 id="official-visibility-heading" className="govuk-heading-m">Public profile visibility</h2>
      <p className="govuk-body">Choose which sections are visible on official profiles. A specific official&apos;s settings can override these defaults.</p>
      {loading ? <p className="govuk-body">Loading visibility settings…</p> : (
        <div className="govuk-grid-row">
          {scopes.map(([scope, label]) => (
            <div className="govuk-grid-column-one-half" key={scope}>
              <fieldset className="govuk-fieldset govuk-!-margin-bottom-5">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">{label}</legend>
                <p className="govuk-hint">Unchecked sections are hidden for this group.</p>
                {fields.map(([key, fieldLabel]) => (
                  <div className="govuk-checkboxes govuk-checkboxes--small" key={key}>
                    <div className="govuk-checkboxes__item">
                      <input
                        className="govuk-checkboxes__input"
                        id={`visibility-${scope}-${key}`}
                        type="checkbox"
                        checked={values[scope]?.[key] !== false}
                        onChange={(event) => setValues((current) => ({
                          ...current,
                          [scope]: { ...(current[scope] || {}), [key]: event.target.checked },
                        }))}
                      />
                      <label className="govuk-label govuk-checkboxes__label" htmlFor={`visibility-${scope}-${key}`}>
                        {fieldLabel}
                      </label>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="govuk-button govuk-button--secondary govuk-!-margin-top-3"
                  onClick={() => saveScope(scope)}
                  disabled={saving !== null}
                >
                  {saving === scope ? "Saving…" : `Save ${label.toLowerCase()}`}
                </button>
              </fieldset>
            </div>
          ))}
        </div>
      )}
      {message && <p className="govuk-body" role="status">{message}</p>}
    </section>
  );
}
