"use client";

import { FormEvent, useEffect, useState } from "react";

export function LegislationDocumentRelationships({
  documentId,
  legalDocumentId,
}: {
  documentId: string;
  legalDocumentId: string;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [targetId, setTargetId] = useState("");
  const [relationshipType, setRelationshipType] = useState("amends");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const response = await fetch(
      `/api/admin/legislation/documents/${documentId}/relationships`,
      { cache: "no-store" },
    );
    const payload = await response.json();
    if (response.ok) setRows(payload.data || []);
  }

  useEffect(() => {
    void load();
  }, [documentId]);

  async function search() {
    if (query.trim().length < 2) return;
    const response = await fetch(
      `/api/admin/legislation/search-targets?type=law&q=${encodeURIComponent(query.trim())}`,
      { cache: "no-store" },
    );
    const payload = await response.json();
    setResults(response.ok ? payload.data || [] : []);
  }

  async function save(event: FormEvent) {
    event.preventDefault();

    if (!targetId) {
      setMessage("Choose a target law.");
      return;
    }

    const response = await fetch(
      `/api/admin/legislation/documents/${documentId}/relationships`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_document_id: legalDocumentId,
          target_document_id: targetId,
          relationship_type: relationshipType,
          description,
        }),
      },
    );
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setMessage(payload?.error || "Could not save relationship.");
      return;
    }

    setMessage("Relationship saved.");
    setQuery("");
    setResults([]);
    setTargetId("");
    setDescription("");
    await load();
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this relationship?")) return;
    const response = await fetch(
      `/api/admin/legislation/documents/${documentId}/relationships?id=${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    if (response.ok) await load();
  }

  return (
    <section>
      <h2 className="govuk-heading-l">Document relationships</h2>
      <p className="govuk-body">
        Use these for legal relationships such as amended by, repeals,
        constitutional basis, subsidiary to, gives effect to and references.
      </p>

      <form onSubmit={save}>
        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--s" htmlFor="relationship-type">
            Relationship
          </label>
          <select
            className="govuk-select"
            id="relationship-type"
            value={relationshipType}
            onChange={(e) => setRelationshipType(e.target.value)}
          >
            {[
              "amends",
              "amended_by",
              "repeals",
              "repealed_by",
              "constitutional_basis",
              "implemented_by",
              "enables",
              "subsidiary_to",
              "gives_effect_to",
              "references",
              "related_to",
            ].map((value) => (
              <option key={value} value={value}>
                {value.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--s" htmlFor="law-search">
            Find target law
          </label>
          <div className="admin-search-row">
            <input
              className="govuk-input"
              id="law-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              className="govuk-button govuk-button--secondary"
              type="button"
              onClick={search}
            >
              Search
            </button>
          </div>
        </div>

        {results.length > 0 ? (
          <div className="govuk-radios">
            {results.map((result) => (
              <div className="govuk-radios__item" key={result.id}>
                <input
                  className="govuk-radios__input"
                  id={`law-${result.id}`}
                  type="radio"
                  name="target-law"
                  checked={targetId === result.id}
                  onChange={() => setTargetId(result.id)}
                />
                <label
                  className="govuk-label govuk-radios__label"
                  htmlFor={`law-${result.id}`}
                >
                  {result.name}
                  {result.description ? ` — ${result.description}` : ""}
                </label>
              </div>
            ))}
          </div>
        ) : null}

        <div className="govuk-form-group govuk-!-margin-top-4">
          <label className="govuk-label" htmlFor="relationship-description">
            Description
          </label>
          <textarea
            className="govuk-textarea"
            id="relationship-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button className="govuk-button" type="submit">Add relationship</button>
      </form>

      {message ? <div className="govuk-inset-text">{message}</div> : null}

      <h3 className="govuk-heading-m govuk-!-margin-top-7">Existing relationships</h3>
      {rows.length ? (
        <ul className="govuk-list govuk-list--spaced">
          {rows.map((row) => (
            <li key={row.id}>
              <strong>{row.relationship_type.replaceAll("_", " ")}</strong>
              {row.target?.title ? <> — {row.target.title}</> : null}
              {row.description ? <p className="govuk-body-s">{row.description}</p> : null}
              <button
                className="govuk-button govuk-button--warning"
                type="button"
                onClick={() => remove(row.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="govuk-body">No document relationships yet.</p>
      )}
    </section>
  );
}
