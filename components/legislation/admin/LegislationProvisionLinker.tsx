"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

function normalizeSelectionText(selection: Selection) {
  return selection.toString().replace(/\s+/g, " ").trim();
}

function makeId() {
  return crypto.randomUUID();
}

export function LegislationProvisionLinker({
  provisionId,
}: {
  provisionId: string;
}) {
  const previewRef = useRef<HTMLDivElement>(null);

  const [bodyHtml, setBodyHtml] = useState("");
  const [links, setLinks] = useState<any[]>([]);
  const [pendingId, setPendingId] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [linkType, setLinkType] = useState<
    "person" | "institution" | "law" | "internal" | "external"
  >("institution");
  const [semanticRole, setSemanticRole] = useState("references");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [target, setTarget] = useState<any | null>(null);
  const [targetUrl, setTargetUrl] = useState("");
  const [targetLabel, setTargetLabel] = useState("");
  const [externalSourceName, setExternalSourceName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const response = await fetch(
      `/api/admin/legislation/provisions/${provisionId}/links`,
      { cache: "no-store" },
    );
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload?.error || "Could not load provision.");
      return;
    }

    setBodyHtml(payload.data.provision.body_html || "");
    setLinks(payload.data.links || []);
  }, [provisionId]);

  useEffect(() => {
    void load();
  }, [load]);

  function clearPending() {
    const preview = previewRef.current;
    if (preview && pendingId) {
      const marker = preview.querySelector(
        `[data-legislation-inline-link="${CSS.escape(pendingId)}"]`,
      );

      if (marker) {
        marker.replaceWith(...Array.from(marker.childNodes));
        preview.normalize();
      }
    }

    setPendingId("");
    setSelectedText("");
    setTarget(null);
    setResults([]);
  }

  function captureSelection() {
    clearPending();

    const preview = previewRef.current;
    const selection = window.getSelection();

    if (!preview || !selection || selection.rangeCount !== 1) {
      setMessage("Select wording inside the legal text.");
      return;
    }

    const text = normalizeSelectionText(selection);

    if (!text) {
      setMessage("Select wording inside the legal text.");
      return;
    }

    const range = selection.getRangeAt(0);

    if (!preview.contains(range.commonAncestorContainer)) {
      setMessage("Select wording inside the legal text.");
      return;
    }

    try {
      const id = makeId();
      const span = document.createElement("span");

      span.dataset.legislationInlinePending = id;
      span.dataset.legislationInlineLink = id;
      span.className =
        "admin-inline-selection admin-inline-selection--pending";

      range.surroundContents(span);
      selection.removeAllRanges();

      setPendingId(id);
      setSelectedText(text);
      setQuery(text);
      setMessage(null);
    } catch {
      setMessage(
        "That selection crosses complex markup. Select wording within one paragraph or list item.",
      );
    }
  }

  async function searchTargets() {
    if (linkType === "internal" || linkType === "external") return;
    if (query.trim().length < 2) return;

    const response = await fetch(
      `/api/admin/legislation/search-targets?type=${encodeURIComponent(
        linkType,
      )}&q=${encodeURIComponent(query.trim())}`,
      { cache: "no-store" },
    );

    const payload = await response.json();
    setResults(response.ok ? payload.data || [] : []);
  }

  async function save(event: FormEvent) {
    event.preventDefault();

    const preview = previewRef.current;

    if (!preview || !pendingId || !selectedText) {
      setMessage("Select wording in the legal text first.");
      return;
    }

    const marker = preview.querySelector(
      `[data-legislation-inline-link="${CSS.escape(pendingId)}"]`,
    );

    if (!marker) {
      setMessage("The selected wording is no longer available.");
      return;
    }

    marker.removeAttribute("data-legislation-inline-pending");
    marker.classList.remove("admin-inline-selection--pending");
    marker.classList.add("admin-inline-selection--linked");

    const payload: any = {
      id: pendingId,
      selected_text: selectedText,
      link_type: linkType,
      semantic_role: semanticRole,
      content_html: preview.innerHTML,
    };

    if (linkType === "person") {
      payload.leader_id = target?.kind === "leader" ? target.id : null;
      payload.mca_id = target?.kind === "mca" ? target.id : null;
    }

    if (linkType === "institution") {
      payload.institution_id = target?.id || null;
    }

    if (linkType === "law") {
      payload.target_document_id = target?.id || null;
    }

    if (linkType === "internal" || linkType === "external") {
      payload.target_url = targetUrl.trim();
      payload.target_label = targetLabel.trim() || selectedText;
      payload.external_source_name =
        linkType === "external"
          ? externalSourceName.trim() || null
          : null;
    }

    const response = await fetch(
      `/api/admin/legislation/provisions/${provisionId}/links`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      marker.dataset.legislationInlinePending = pendingId;
      marker.classList.remove("admin-inline-selection--linked");
      marker.classList.add("admin-inline-selection--pending");
      setMessage(result?.error || "Could not save link.");
      return;
    }

    setPendingId("");
    setSelectedText("");
    setTarget(null);
    setResults([]);
    setTargetUrl("");
    setTargetLabel("");
    setExternalSourceName("");
    setMessage("Link saved.");
    await load();
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this link?")) return;

    const response = await fetch(
      `/api/admin/legislation/provisions/${provisionId}/links?id=${encodeURIComponent(
        id,
      )}`,
      { method: "DELETE" },
    );

    if (response.ok) {
      setMessage("Link removed.");
      await load();
    }
  }

  return (
    <div>
      <div className="govuk-inset-text">
        Highlight wording in the legal text, then click{" "}
        <strong>Use selected wording</strong>. Pending wording is yellow;
        saved links remain blue.
      </div>

      <div className="govuk-button-group">
        <button
          className="govuk-button govuk-button--secondary"
          type="button"
          onClick={captureSelection}
        >
          Use selected wording
        </button>

        {pendingId ? (
          <button
            className="govuk-button govuk-button--secondary"
            type="button"
            onClick={clearPending}
          >
            Clear selection
          </button>
        ) : null}
      </div>

      <div
        ref={previewRef}
        className="admin-legislation-link-preview"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />

      <form onSubmit={save}>
        <h2 className="govuk-heading-l">Create inline link</h2>

        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--s">
            Selected wording
          </label>
          <div className="govuk-inset-text">
            {selectedText || "Nothing selected yet."}
          </div>
        </div>

        <div className="admin-form-grid">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="link-type">
              Link to
            </label>
            <select
              className="govuk-select"
              id="link-type"
              value={linkType}
              onChange={(e) => {
                setLinkType(e.target.value as any);
                setTarget(null);
                setResults([]);
              }}
            >
              <option value="person">Person</option>
              <option value="institution">Institution</option>
              <option value="law">Law</option>
              <option value="internal">CitizenGuide page</option>
              <option value="external">External official source</option>
            </select>
          </div>

          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="semantic-role">
              Relationship
            </label>
            <select
              className="govuk-select"
              id="semantic-role"
              value={semanticRole}
              onChange={(e) => setSemanticRole(e.target.value)}
            >
              {[
                "references",
                "establishes",
                "appoints",
                "assigns_function_to",
                "grants_power_to",
                "imposes_duty_on",
                "amends",
                "repeals",
                "implements",
                "constitutional_basis",
                "defined_by",
                "related_to",
              ].map((value) => (
                <option value={value} key={value}>
                  {value.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {linkType === "internal" || linkType === "external" ? (
          <>
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="target-url">
                {linkType === "internal"
                  ? "CitizenGuide path"
                  : "Official HTTPS URL"}
              </label>
              <input
                className="govuk-input"
                id="target-url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
              />
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="target-label">
                Link label
              </label>
              <input
                className="govuk-input"
                id="target-label"
                value={targetLabel}
                onChange={(e) => setTargetLabel(e.target.value)}
              />
            </div>

            {linkType === "external" ? (
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="source-name">
                  Source name
                </label>
                <input
                  className="govuk-input"
                  id="source-name"
                  value={externalSourceName}
                  onChange={(e) => setExternalSourceName(e.target.value)}
                />
              </div>
            ) : null}
          </>
        ) : (
          <>
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="target-search">
                Search target
              </label>
              <div className="admin-search-row">
                <input
                  className="govuk-input"
                  id="target-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  className="govuk-button govuk-button--secondary"
                  type="button"
                  onClick={searchTargets}
                >
                  Search
                </button>
              </div>
            </div>

            {results.length ? (
              <div className="govuk-radios">
                {results.map((result) => (
                  <div
                    className="govuk-radios__item"
                    key={`${result.kind}-${result.id}`}
                  >
                    <input
                      className="govuk-radios__input"
                      id={`target-${result.kind}-${result.id}`}
                      type="radio"
                      name="target"
                      checked={
                        target?.id === result.id &&
                        target?.kind === result.kind
                      }
                      onChange={() => setTarget(result)}
                    />
                    <label
                      className="govuk-label govuk-radios__label"
                      htmlFor={`target-${result.kind}-${result.id}`}
                    >
                      {result.name}
                      {result.description
                        ? ` — ${result.description}`
                        : ""}
                    </label>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        )}

        <button className="govuk-button govuk-!-margin-top-4" type="submit">
          Save link
        </button>
      </form>

      {message ? <div className="govuk-inset-text">{message}</div> : null}

      <h2 className="govuk-heading-l govuk-!-margin-top-8">
        Existing inline links
      </h2>

      {links.length ? (
        <ul className="govuk-list govuk-list--spaced">
          {links.map((link) => (
            <li key={link.id}>
              <strong>{link.selected_text}</strong>
              {" → "}
              {link.target_href ? (
                <a className="govuk-link" href={link.target_href}>
                  {link.target_name || link.target_href}
                  {link.link_type === "external" ? (
                    <span aria-hidden="true"> ↗</span>
                  ) : null}
                </a>
              ) : (
                link.target_name || "Target unavailable"
              )}
              <div className="govuk-body-s">
                {link.link_type} · {link.semantic_role}
              </div>
              <button
                className="govuk-button govuk-button--warning govuk-!-margin-top-2"
                type="button"
                onClick={() => remove(link.id)}
              >
                Remove link
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="govuk-body">No linked wording yet.</p>
      )}
    </div>
  );
}
