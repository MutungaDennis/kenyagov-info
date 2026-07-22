"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminPath } from "@/lib/admin-path";
import {
  isInstitutionEarmarked,
  isInstitutionHistorical,
} from "@/lib/institutions/fields";
import { groupsForDivisionValue } from "@/lib/institutions/cofog";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import InstitutionForm, {
  emptyInstitutionForm,
  institutionFormSnapshot,
  institutionFormToPayload,
  type InstitutionFormState,
} from "@/components/admin/InstitutionForm";
import type { LeaderPickResult } from "@/components/admin/LeaderLinkPicker";
import type { SocialLink } from "@/lib/leaders/titles-social";

export default function NewInstitutionPage() {
  const router = useRouter();
  const [form, setForm] = useState<InstitutionFormState>(emptyInstitutionForm());
  const [baseline] = useState(() =>
    institutionFormSnapshot(emptyInstitutionForm()),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldOptions, setFieldOptions] = useState<
    Partial<Record<string, string[]>>
  >({});

  useEffect(() => {
    (async () => {
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
        /* ignore */
      }
    })();
  }, []);

  const isDirty = useMemo(
    () => institutionFormSnapshot(form) !== baseline,
    [form, baseline],
  );

  const canSave = isDirty && form.name.trim().length > 0;

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
      if (name === "name" && !prev.slug) {
        next.slug = value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
      }
      if (name === "status" && typeof value === "string") {
        if (value === "Active") {
          next.is_active = true;
        } else if (value === "Proposed") {
          next.is_active = false;
          next.has_organisational_change = true;
        } else if (
          isInstitutionHistorical(value) ||
          isInstitutionEarmarked(value)
        ) {
          next.has_organisational_change = true;
          next.is_active = true;
        } else if (value && value !== "Active") {
          next.has_organisational_change = true;
        }
      }
      if (name === "has_organisational_change" && type === "checkbox") {
        next.has_organisational_change = checked;
        if (!checked) {
          next.status = "Active";
          next.status_effective_date = "";
          next.lifecycle_change_reason = "";
          next.successor_institution_id = "";
          next.successor_institution_label = "";
          next.predecessor_institution_id = "";
          next.predecessor_institution_label = "";
          next.is_active = true;
        }
      }
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
    setError(null);
    setSuccess(null);
  };

  const onHierarchyChange = (
    field:
      | "parent_institution"
      | "supervising_ministry"
      | "reports_to_institution"
      | "predecessor_institution"
      | "successor_institution",
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
      if (field === "predecessor_institution") {
        return {
          ...prev,
          predecessor_institution_id: pick.id,
          predecessor_institution_label: pick.label,
        };
      }
      if (field === "successor_institution") {
        return {
          ...prev,
          successor_institution_id: pick.id,
          successor_institution_label: pick.label,
        };
      }
      return {
        ...prev,
        reports_to_institution_id: pick.id,
        reports_to_institution_label: pick.label,
      };
    });
    setError(null);
    setSuccess(null);
  };

  const onHeadLeaderChange = (pick: LeaderPickResult) => {
    setForm((prev) => ({
      ...prev,
      current_head_id: pick.id,
      current_head: pick.label || prev.current_head,
      head_title: prev.head_title.trim()
        ? prev.head_title
        : pick.title || prev.head_title,
    }));
    setError(null);
    setSuccess(null);
  };

  const onSocialLinksChange = (links: SocialLink[]) => {
    setForm((prev) => ({ ...prev, social_links: links }));
    setError(null);
    setSuccess(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave || submitting) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/institutions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(institutionFormToPayload(form)),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          [json.error, json.hint].filter(Boolean).join(" — ") ||
            "Create failed",
        );
      }
      setSuccess(
        form.is_active
          ? "Institution created and published. Opening editor…"
          : "Institution created as unpublished. Opening editor…",
      );
      if (json.data?.id) {
        router.push(adminPath(`institutions/${json.data.id}/edit`));
      } else {
        router.push(adminPath("institutions"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSuccess(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="govuk-width-container">
      <GovUKBackLink href={adminPath("institutions")} />
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Admin", href: adminPath() },
          { text: "Institutions", href: adminPath("institutions") },
          { text: "New", href: "#" },
        ]}
      />
      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">Add government institution</h1>
        <p className="govuk-body">
          Enter identity details, classification (custom values become
          suggestions after save), optional leader head link, social profiles,
          and publish status. Verification defaults to Unverified.
        </p>
        {error && (
          <div className="govuk-error-summary" role="alert">
            <h2 className="govuk-error-summary__title">Create failed</h2>
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
            </div>
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
          canSave={canSave}
          submitLabel="Create institution"
          fieldOptions={fieldOptions}
          cancelHref={adminPath("institutions")}
        />
      </main>
    </div>
  );
}
