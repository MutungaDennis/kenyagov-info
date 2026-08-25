"use client";

/**
 * Advanced lifecycle: segments (resurrection), multi-entity lineage, dated names.
 * Requires migration enhance_institutions_lineage_segments.sql.
 */

import { useCallback, useEffect, useState } from "react";
import InstitutionLinkPicker from "@/components/admin/InstitutionLinkPicker";
import {
  INSTITUTION_STATUS_OPTIONS,
  LEGAL_BASIS_TYPE_OPTIONS,
} from "@/lib/institutions/fields";
import {
  INSTITUTION_NAME_KINDS,
  INSTITUTION_RELATIONSHIP_TYPES,
  emptyLifecycleSegment,
  emptyNameHistoryRow,
  emptyRelationship,
  type InstitutionLifecycleSegment,
  type InstitutionNameHistoryRow,
  type InstitutionRelationship,
} from "@/lib/institutions/lineage";

type Props = {
  institutionId: string;
  institutionName: string;
};

export default function InstitutionLifecyclePanel({
  institutionId,
  institutionName,
}: Props) {
  const [segments, setSegments] = useState<InstitutionLifecycleSegment[]>([]);
  const [relationships, setRelationships] = useState<InstitutionRelationship[]>(
    [],
  );
  const [names, setNames] = useState<InstitutionNameHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setHint(null);
    try {
      const [segRes, relRes, nameRes] = await Promise.all([
        fetch(`/api/admin/institutions/${institutionId}/lifecycle-segments`, {
          credentials: "include",
          cache: "no-store",
        }),
        fetch(`/api/admin/institutions/${institutionId}/relationships`, {
          credentials: "include",
          cache: "no-store",
        }),
        fetch(`/api/admin/institutions/${institutionId}/name-history`, {
          credentials: "include",
          cache: "no-store",
        }),
      ]);
      const segJson = await segRes.json();
      const relJson = await relRes.json();
      const nameJson = await nameRes.json();

      if (segJson.hint || relJson.hint || nameJson.hint) {
        setHint(
          segJson.hint ||
            relJson.hint ||
            nameJson.hint ||
            "Run the lineage migration in Supabase.",
        );
      }

      const segRows = (segJson.data || []) as Record<string, unknown>[];
      setSegments(
        segRows.map((r, i) => ({
          id: String(r.id || ""),
          label: String(r.label || ""),
          start_date: r.start_date ? String(r.start_date) : "",
          end_date: r.end_date ? String(r.end_date) : "",
          segment_status: String(r.segment_status || "Active"),
          legal_basis_type: String(r.legal_basis_type || ""),
          legal_basis_name: String(r.legal_basis_name || ""),
          legal_basis_reference: String(r.legal_basis_reference || ""),
          notes: String(r.notes || ""),
          sort_order: typeof r.sort_order === "number" ? r.sort_order : i,
        })),
      );

      const relRows = (relJson.data || []) as Record<string, unknown>[];
      setRelationships(
        relRows.map((r) => {
          const from = r.from_institution as
            | { name?: string; short_name?: string }
            | undefined;
          const to = r.to_institution as
            | { name?: string; short_name?: string }
            | undefined;
          return {
            id: String(r.id || ""),
            from_institution_id: String(r.from_institution_id || ""),
            to_institution_id: String(r.to_institution_id || ""),
            relationship_type: String(r.relationship_type || "SUCCESSION"),
            effective_date: r.effective_date ? String(r.effective_date) : "",
            end_date: r.end_date ? String(r.end_date) : "",
            legal_instrument: String(r.legal_instrument || ""),
            notes: String(r.notes || ""),
            is_primary: Boolean(r.is_primary),
            from_institution: from
              ? {
                  id: String(r.from_institution_id),
                  name: String(from.name || ""),
                  slug: "",
                  short_name: from.short_name,
                }
              : undefined,
            to_institution: to
              ? {
                  id: String(r.to_institution_id),
                  name: String(to.name || ""),
                  slug: "",
                  short_name: to.short_name,
                }
              : undefined,
          };
        }),
      );

      const nameRows = (nameJson.data || []) as Record<string, unknown>[];
      setNames(
        nameRows.map((r) => ({
          id: String(r.id || ""),
          name: String(r.name || ""),
          name_kind: String(r.name_kind || "official"),
          start_date: r.start_date ? String(r.start_date) : "",
          end_date: r.end_date ? String(r.end_date) : "",
          notes: String(r.notes || ""),
        })),
      );
      setDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load lifecycle data");
    } finally {
      setLoading(false);
    }
  }, [institutionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveAll = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const [segRes, relRes, nameRes] = await Promise.all([
        fetch(`/api/admin/institutions/${institutionId}/lifecycle-segments`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ segments }),
        }),
        fetch(`/api/admin/institutions/${institutionId}/relationships`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ relationships }),
        }),
        fetch(`/api/admin/institutions/${institutionId}/name-history`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ names }),
        }),
      ]);
      const segJson = await segRes.json();
      const relJson = await relRes.json();
      const nameJson = await nameRes.json();
      if (!segRes.ok) {
        throw new Error(
          [segJson.error, segJson.hint].filter(Boolean).join(" — ") ||
            "Failed to save segments",
        );
      }
      if (!relRes.ok) {
        throw new Error(
          [relJson.error, relJson.hint].filter(Boolean).join(" — ") ||
            "Failed to save relationships",
        );
      }
      if (!nameRes.ok) {
        throw new Error(
          [nameJson.error, nameJson.hint].filter(Boolean).join(" — ") ||
            "Failed to save name history",
        );
      }
      setSuccess("Lifecycle, lineage and name history saved.");
      setDirty(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="govuk-body">Loading lifecycle data…</p>;
  }

  return (
    <div className="govuk-!-margin-top-8">
      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
      <h2 className="govuk-heading-l">Lifecycle, lineage and names</h2>
      <p className="govuk-body">
        Use this for complex Kenyan institutional history — offices that were
        abolished and later recreated (e.g. Prime Minister), bodies that split
        into several successors (e.g. KP&amp;TC), or positions annulled by the
        courts. Save here separately from the main institution form.
      </p>

      {hint && (
        <div className="govuk-warning-text">
          <span className="govuk-warning-text__icon" aria-hidden="true">
            !
          </span>
          <strong className="govuk-warning-text__text">
            <span className="govuk-visually-hidden">Warning</span>
            {hint}
          </strong>
        </div>
      )}
      {error && (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">There is a problem</h2>
          <p className="govuk-body">{error}</p>
        </div>
      )}
      {success && (
        <div className="govuk-notification-banner govuk-notification-banner--success" role="status">
          <div className="govuk-notification-banner__header">
            <h2 className="govuk-notification-banner__title">Success</h2>
          </div>
          <div className="govuk-notification-banner__content">
            <p className="govuk-notification-banner__heading">{success}</p>
          </div>
        </div>
      )}

      {/* Segments */}
      <h3 className="govuk-heading-m">Operational periods</h3>
      <p className="govuk-hint">
        Multiple eras for <strong>{institutionName || "this office"}</strong>.
        Example: 1963–1964 Active, then 2008–2013 Active (Office of the Prime
        Minister).
      </p>
      {segments.map((seg, i) => (
        <div
          key={seg.id || `seg-${i}`}
          className="govuk-!-margin-bottom-4"
          style={{ border: "1px solid #b1b4b6", padding: 12 }}
        >
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor={`seg-label-${i}`}>
                  Period label
                </label>
                <input
                  id={`seg-label-${i}`}
                  className="govuk-input"
                  value={seg.label}
                  placeholder="e.g. Grand Coalition"
                  onChange={(e) => {
                    const next = [...segments];
                    next[i] = { ...next[i], label: e.target.value };
                    setSegments(next);
                    setDirty(true);
                  }}
                />
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor={`seg-start-${i}`}>
                  Start date
                </label>
                <input
                  id={`seg-start-${i}`}
                  className="govuk-input"
                  type="date"
                  value={seg.start_date}
                  onChange={(e) => {
                    const next = [...segments];
                    next[i] = { ...next[i], start_date: e.target.value };
                    setSegments(next);
                    setDirty(true);
                  }}
                />
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor={`seg-end-${i}`}>
                  End date
                </label>
                <input
                  id={`seg-end-${i}`}
                  className="govuk-input"
                  type="date"
                  value={seg.end_date}
                  onChange={(e) => {
                    const next = [...segments];
                    next[i] = { ...next[i], end_date: e.target.value };
                    setSegments(next);
                    setDirty(true);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor={`seg-status-${i}`}>
                  Status in this period
                </label>
                <select
                  id={`seg-status-${i}`}
                  className="govuk-select"
                  value={seg.segment_status}
                  onChange={(e) => {
                    const next = [...segments];
                    next[i] = { ...next[i], segment_status: e.target.value };
                    setSegments(next);
                    setDirty(true);
                  }}
                >
                  {INSTITUTION_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor={`seg-basis-${i}`}>
                  Legal basis type
                </label>
                <select
                  id={`seg-basis-${i}`}
                  className="govuk-select"
                  value={seg.legal_basis_type}
                  onChange={(e) => {
                    const next = [...segments];
                    next[i] = { ...next[i], legal_basis_type: e.target.value };
                    setSegments(next);
                    setDirty(true);
                  }}
                >
                  <option value="">—</option>
                  {LEGAL_BASIS_TYPE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor={`seg-basis-name-${i}`}>
              Legal basis name / instrument
            </label>
            <input
              id={`seg-basis-name-${i}`}
              className="govuk-input"
              value={seg.legal_basis_name}
              placeholder="e.g. National Accord and Reconciliation Act, 2008"
              onChange={(e) => {
                const next = [...segments];
                next[i] = { ...next[i], legal_basis_name: e.target.value };
                setSegments(next);
                setDirty(true);
              }}
            />
          </div>
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor={`seg-notes-${i}`}>
              Notes
            </label>
            <textarea
              id={`seg-notes-${i}`}
              className="govuk-textarea"
              rows={2}
              value={seg.notes}
              onChange={(e) => {
                const next = [...segments];
                next[i] = { ...next[i], notes: e.target.value };
                setSegments(next);
                setDirty(true);
              }}
            />
          </div>
          <button
            type="button"
            className="govuk-button govuk-button--warning govuk-button--secondary"
            onClick={() => {
              setSegments((prev) => prev.filter((_, j) => j !== i));
              setDirty(true);
            }}
          >
            Remove period
          </button>
        </div>
      ))}
      <button
        type="button"
        className="govuk-button govuk-button--secondary"
        onClick={() => {
          setSegments((prev) => [
            ...prev,
            { ...emptyLifecycleSegment(), sort_order: prev.length },
          ]);
          setDirty(true);
        }}
      >
        Add operational period
      </button>

      {/* Relationships */}
      <h3 className="govuk-heading-m govuk-!-margin-top-8">
        Lineage (related institutions)
      </h3>
      <p className="govuk-hint">
        Direction: <strong>from</strong> = ancestor / older body;{" "}
        <strong>to</strong> = descendant / result. Example: KP&amp;TC → Telkom
        with type “Split from”. Mark one link as primary to sync the main
        predecessor/successor fields.
      </p>
      {relationships.map((rel, i) => {
        const otherId =
          rel.from_institution_id === institutionId
            ? rel.to_institution_id
            : rel.from_institution_id;
        const otherLabel =
          rel.from_institution_id === institutionId
            ? rel.to_institution?.short_name ||
              rel.to_institution?.name ||
              ""
            : rel.from_institution?.short_name ||
              rel.from_institution?.name ||
              "";
        return (
          <div
            key={rel.id || `rel-${i}`}
            className="govuk-!-margin-bottom-4"
            style={{ border: "1px solid #b1b4b6", padding: 12 }}
          >
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor={`rel-type-${i}`}>
                Relationship type
              </label>
              <select
                id={`rel-type-${i}`}
                className="govuk-select"
                value={rel.relationship_type}
                onChange={(e) => {
                  const next = [...relationships];
                  next[i] = { ...next[i], relationship_type: e.target.value };
                  setRelationships(next);
                  setDirty(true);
                }}
              >
                {INSTITUTION_RELATIONSHIP_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <div className="govuk-hint">
                {
                  INSTITUTION_RELATIONSHIP_TYPES.find(
                    (t) => t.value === rel.relationship_type,
                  )?.hint
                }
              </div>
            </div>
            <InstitutionLinkPicker
              id={`rel-other-${i}`}
              label={
                rel.from_institution_id === institutionId
                  ? "Related institution (descendant / “to”)"
                  : "Related institution (ancestor / “from”)"
              }
              hint="Search by name or acronym"
              valueId={otherId}
              valueLabel={otherLabel}
              excludeId={institutionId}
              onChange={(pick) => {
                const next = [...relationships];
                if (next[i].from_institution_id === institutionId) {
                  next[i] = {
                    ...next[i],
                    to_institution_id: pick.id,
                    to_institution: {
                      id: pick.id,
                      name: pick.label,
                      slug: "",
                    },
                  };
                } else {
                  next[i] = {
                    ...next[i],
                    from_institution_id: pick.id,
                    from_institution: {
                      id: pick.id,
                      name: pick.label,
                      slug: "",
                    },
                  };
                }
                setRelationships(next);
                setDirty(true);
              }}
            />
            <div className="govuk-checkboxes govuk-checkboxes--small">
              <div className="govuk-checkboxes__item">
                <input
                  className="govuk-checkboxes__input"
                  id={`rel-primary-${i}`}
                  type="checkbox"
                  checked={rel.is_primary}
                  onChange={(e) => {
                    const next = relationships.map((r, j) =>
                      j === i
                        ? { ...r, is_primary: e.target.checked }
                        : e.target.checked
                          ? { ...r, is_primary: false }
                          : r,
                    );
                    setRelationships(next);
                    setDirty(true);
                  }}
                />
                <label
                  className="govuk-label govuk-checkboxes__label"
                  htmlFor={`rel-primary-${i}`}
                >
                  Primary link (syncs main predecessor/successor on this record)
                </label>
              </div>
            </div>
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-half">
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor={`rel-date-${i}`}>
                    Effective date
                  </label>
                  <input
                    id={`rel-date-${i}`}
                    className="govuk-input"
                    type="date"
                    value={rel.effective_date}
                    onChange={(e) => {
                      const next = [...relationships];
                      next[i] = {
                        ...next[i],
                        effective_date: e.target.value,
                      };
                      setRelationships(next);
                      setDirty(true);
                    }}
                  />
                </div>
              </div>
              <div className="govuk-grid-column-one-half">
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor={`rel-instrument-${i}`}>
                    Legal instrument
                  </label>
                  <input
                    id={`rel-instrument-${i}`}
                    className="govuk-input"
                    value={rel.legal_instrument}
                    placeholder="e.g. Executive Order No. 1 of 2023"
                    onChange={(e) => {
                      const next = [...relationships];
                      next[i] = {
                        ...next[i],
                        legal_instrument: e.target.value,
                      };
                      setRelationships(next);
                      setDirty(true);
                    }}
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              className="govuk-button govuk-button--warning govuk-button--secondary"
              onClick={() => {
                setRelationships((prev) => prev.filter((_, j) => j !== i));
                setDirty(true);
              }}
            >
              Remove link
            </button>
          </div>
        );
      })}
      <button
        type="button"
        className="govuk-button govuk-button--secondary"
        onClick={() => {
          setRelationships((prev) => [
            ...prev,
            emptyRelationship(institutionId),
          ]);
          setDirty(true);
        }}
      >
        Add lineage link
      </button>

      {/* Name history */}
      <h3 className="govuk-heading-m govuk-!-margin-top-8">
        Name history (dated)
      </h3>
      <p className="govuk-hint">
        Optional dated names (e.g. “Ministry of Education, Science and
        Technology” 2013–2018). Flat former names on the main form still work.
      </p>
      {names.map((n, i) => (
        <div
          key={n.id || `name-${i}`}
          className="govuk-!-margin-bottom-4"
          style={{ border: "1px solid #b1b4b6", padding: 12 }}
        >
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor={`name-text-${i}`}>
                  Name
                </label>
                <input
                  id={`name-text-${i}`}
                  className="govuk-input"
                  value={n.name}
                  onChange={(e) => {
                    const next = [...names];
                    next[i] = { ...next[i], name: e.target.value };
                    setNames(next);
                    setDirty(true);
                  }}
                />
              </div>
            </div>
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor={`name-kind-${i}`}>
                  Kind
                </label>
                <select
                  id={`name-kind-${i}`}
                  className="govuk-select"
                  value={n.name_kind}
                  onChange={(e) => {
                    const next = [...names];
                    next[i] = { ...next[i], name_kind: e.target.value };
                    setNames(next);
                    setDirty(true);
                  }}
                >
                  {INSTITUTION_NAME_KINDS.map((k) => (
                    <option key={k.value} value={k.value}>
                      {k.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor={`name-start-${i}`}>
                  From
                </label>
                <input
                  id={`name-start-${i}`}
                  className="govuk-input"
                  type="date"
                  value={n.start_date}
                  onChange={(e) => {
                    const next = [...names];
                    next[i] = { ...next[i], start_date: e.target.value };
                    setNames(next);
                    setDirty(true);
                  }}
                />
              </div>
            </div>
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor={`name-end-${i}`}>
                  Until
                </label>
                <input
                  id={`name-end-${i}`}
                  className="govuk-input"
                  type="date"
                  value={n.end_date}
                  onChange={(e) => {
                    const next = [...names];
                    next[i] = { ...next[i], end_date: e.target.value };
                    setNames(next);
                    setDirty(true);
                  }}
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            className="govuk-button govuk-button--warning govuk-button--secondary"
            onClick={() => {
              setNames((prev) => prev.filter((_, j) => j !== i));
              setDirty(true);
            }}
          >
            Remove name
          </button>
        </div>
      ))}
      <button
        type="button"
        className="govuk-button govuk-button--secondary"
        onClick={() => {
          setNames((prev) => [...prev, emptyNameHistoryRow()]);
          setDirty(true);
        }}
      >
        Add dated name
      </button>

      <div className="govuk-button-group govuk-!-margin-top-6">
        <button
          type="button"
          className="govuk-button"
          disabled={saving || !dirty}
          onClick={() => void saveAll()}
        >
          {saving ? "Saving…" : "Save lifecycle & lineage"}
        </button>
      </div>
      {dirty && !saving && (
        <p className="govuk-hint">You have unsaved lifecycle changes.</p>
      )}
    </div>
  );
}
