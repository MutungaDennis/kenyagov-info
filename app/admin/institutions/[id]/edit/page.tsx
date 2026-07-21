"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { adminPath } from "@/lib/admin-path";
import { INSTITUTION_STATUS_IMPLIES_INACTIVE } from "@/lib/institutions/fields";
import { groupsForDivisionValue } from "@/lib/institutions/cofog";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import InstitutionForm, {
  emptyInstitutionForm,
  institutionFormFromRow,
  institutionFormSnapshot,
  institutionFormToPayload,
  type InstitutionFormState,
} from "@/components/admin/InstitutionForm";
import type { LeaderPickResult } from "@/components/admin/LeaderLinkPicker";
import type { SocialLink } from "@/lib/leaders/titles-social";

function leaderDisplayName(d: Record<string, unknown>): string {
  const parts = [d.first_name, d.other_names, d.surname]
    .filter(Boolean)
    .join(" ")
    .trim();
  return parts || String(d.full_name || "").trim() || "";
}

export default function EditInstitutionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState("");
  const [form, setForm] = useState<InstitutionFormState>(emptyInstitutionForm());
  const [baseline, setBaseline] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [fieldOptions, setFieldOptions] = useState<
    Partial<Record<string, string[]>>
  >({});

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const loadFacets = async () => {
    try {
      const res = await fetch("/api/admin/institutions?facets=1", {
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();
      if (res.ok && json.facets && typeof json.facets === "object") {
        setFieldOptions(json.facets as Partial<Record<string, string[]>>);
      }
    } catch {
      /* keep previous */
    }
  };

  useEffect(() => {
    loadFacets();
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const res = await fetch(`/api/admin/institutions/${id}`, {
          credentials: "include",
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok || !json.data) {
          throw new Error(json.error || "Not found");
        }
        const row = json.data as Record<string, unknown>;
        const base = institutionFormFromRow(row);

        // Resolve hierarchy labels for display
        const linkIds = [
          row.parent_institution_id,
          row.supervising_ministry_id,
          row.reports_to_institution_id,
        ].filter(Boolean) as string[];

        if (linkIds.length) {
          const labels: Record<string, string> = {};
          await Promise.all(
            linkIds.map(async (linkId) => {
              try {
                const r = await fetch(`/api/admin/institutions/${linkId}`, {
                  credentials: "include",
                  cache: "no-store",
                });
                const j = await r.json();
                if (r.ok && j.data) {
                  const n = j.data.short_name
                    ? `${j.data.name} (${j.data.short_name})`
                    : j.data.name;
                  labels[linkId] = n || linkId;
                }
              } catch {
                /* ignore */
              }
            }),
          );
          if (row.parent_institution_id) {
            base.parent_institution_label =
              labels[String(row.parent_institution_id)] || "";
          }
          if (row.supervising_ministry_id) {
            base.supervising_ministry_label =
              labels[String(row.supervising_ministry_id)] || "";
          }
          if (row.reports_to_institution_id) {
            base.reports_to_institution_label =
              labels[String(row.reports_to_institution_id)] || "";
          }
        }

        // Resolve linked head label from leaders if needed
        if (base.current_head_id && !base.current_head) {
          try {
            const lr = await fetch(
              `/api/admin/leaders/${base.current_head_id}`,
              { credentials: "include", cache: "no-store" },
            );
            const lj = await lr.json();
            if (lr.ok && lj.data) {
              base.current_head = leaderDisplayName(lj.data);
              if (!base.head_title && lj.data.title) {
                base.head_title = String(lj.data.title);
              }
            }
          } catch {
            /* ignore */
          }
        }

        setForm(base);
        setBaseline(institutionFormSnapshot(base));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const isDirty = useMemo(
    () => institutionFormSnapshot(form) !== baseline,
    [form, baseline],
  );

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      } as InstitutionFormState;

      // Lifecycle status can suggest publish flag (admin can still override)
      if (name === "status" && typeof value === "string") {
        if (value === "Active") next.is_active = true;
        else if (INSTITUTION_STATUS_IMPLIES_INACTIVE.has(value)) {
          next.is_active = false;
        }
      }
      // COFOG: clear group when it no longer belongs to the selected division
      if (name === "cofog_division" && typeof value === "string") {
        const allowed = new Set(
          groupsForDivisionValue(value).map((g) => g.value),
        );
        if (
          next.cofog_group &&
          allowed.size > 0 &&
          !allowed.has(next.cofog_group)
        ) {
          next.cofog_group = "";
        }
      }
      return next;
    });
    setSuccess(null);
    setError(null);
  };

  const onHierarchyChange = (
    field:
      | "parent_institution"
      | "supervising_ministry"
      | "reports_to_institution",
    pick: { id: string; label: string },
  ) => {
    setForm((prev) => {
      if (field === "parent_institution") {
        return {
          ...prev,
          parent_institution_id: pick.id,
          parent_institution_label: pick.label,
        };
      }
      if (field === "supervising_ministry") {
        return {
          ...prev,
          supervising_ministry_id: pick.id,
          supervising_ministry_label: pick.label,
        };
      }
      return {
        ...prev,
        reports_to_institution_id: pick.id,
        reports_to_institution_label: pick.label,
      };
    });
    setSuccess(null);
    setError(null);
  };

  const onHeadLeaderChange = (pick: LeaderPickResult) => {
    setForm((prev) => ({
      ...prev,
      current_head_id: pick.id,
      current_head: pick.label || prev.current_head,
      // Prefill title only when empty so role-at-institution can differ from leader snapshot
      head_title: prev.head_title.trim()
        ? prev.head_title
        : pick.title || prev.head_title,
    }));
    setSuccess(null);
    setError(null);
  };

  const onSocialLinksChange = (links: SocialLink[]) => {
    setForm((prev) => ({ ...prev, social_links: links }));
    setSuccess(null);
    setError(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || submitting) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setWarnings([]);
    try {
      const res = await fetch(`/api/admin/institutions/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(institutionFormToPayload(form)),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          [json.error, json.hint].filter(Boolean).join(" — ") ||
            "Update failed",
        );
      }

      // Re-baseline from saved form (+ server slug if returned)
      const nextForm: InstitutionFormState = {
        ...form,
        slug: json.data?.slug ? String(json.data.slug) : form.slug,
      };
      setForm(nextForm);
      setBaseline(institutionFormSnapshot(nextForm));
      setSuccess(
        nextForm.is_active
          ? "Changes saved. Institution is published on the public site."
          : "Changes saved. Institution is unpublished (hidden from the public site).",
      );

      // Refresh suggestions so any new free-text values appear in dropdowns
      void loadFacets();

      const dropped = Array.isArray(json.dropped)
        ? (json.dropped as string[])
        : [];
      if (dropped.length) {
        setWarnings([
          `Saved, but some fields were skipped (missing column or enum value): ${dropped.join(", ")}. Run enhance_institutions_head_social_status.sql if needed.`,
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSuccess(null);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="govuk-width-container">
        <p className="govuk-body">Loading institution…</p>
      </div>
    );
  }

  return (
    <div className="govuk-width-container">
      <GovUKBackLink href={adminPath("institutions")} />
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Admin", href: adminPath() },
          { text: "Institutions", href: adminPath("institutions") },
          { text: "Edit", href: "#" },
        ]}
      />
      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">Edit institution</h1>
        <p className="govuk-body">
          Link the current head to a leader, set organisation social profiles,
          lifecycle status, and verification. Save activates only when you change
          something.
        </p>
        {error && (
          <div className="govuk-error-summary" role="alert">
            <h2 className="govuk-error-summary__title">Save failed</h2>
            <p className="govuk-body">{error}</p>
          </div>
        )}
        {success && (
          <div
            className="govuk-notification-banner govuk-notification-banner--success"
            role="status"
          >
            <div className="govuk-notification-banner__header">
              <h2 className="govuk-notification-banner__title">Success</h2>
            </div>
            <div className="govuk-notification-banner__content">
              <p className="govuk-notification-banner__heading">{success}</p>
              {form.slug && (
                <p className="govuk-body">
                  <Link
                    href={`/government/institutions/${form.slug}`}
                    className="govuk-link"
                    target="_blank"
                  >
                    View public page
                  </Link>
                </p>
              )}
            </div>
          </div>
        )}
        {warnings.length > 0 && (
          <div className="govuk-warning-text">
            <span className="govuk-warning-text__icon" aria-hidden="true">
              !
            </span>
            <strong className="govuk-warning-text__text">
              <span className="govuk-visually-hidden">Warning</span>
              {warnings.join(" ")}
            </strong>
          </div>
        )}
        <InstitutionForm
          form={form}
          onChange={onChange}
          onHierarchyChange={onHierarchyChange}
          onHeadLeaderChange={onHeadLeaderChange}
          onSocialLinksChange={onSocialLinksChange}
          onSubmit={onSubmit}
          submitting={submitting}
          canSave={isDirty}
          submitLabel="Save changes"
          fieldOptions={fieldOptions}
          cancelHref={adminPath("institutions")}
          excludeInstitutionId={id}
          extraActions={
            form.slug ? (
              <Link
                href={`/government/institutions/${form.slug}`}
                className="govuk-link"
                target="_blank"
              >
                Public page
              </Link>
            ) : null
          }
        />
      </main>
    </div>
  );
}
