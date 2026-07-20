"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminPath } from "@/lib/admin-path";
import { createBrowserClientAsync } from "@/lib/supabase/client";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import InstitutionForm, {
  emptyInstitutionForm,
  type InstitutionFormState,
} from "@/components/admin/InstitutionForm";

function uniqueStrings(values: (string | null | undefined)[] | undefined) {
  return [
    ...new Set(
      (values ?? []).filter(
        (v): v is string => typeof v === "string" && v.trim().length > 0,
      ),
    ),
  ].sort();
}

export default function NewInstitutionPage() {
  const router = useRouter();
  const [form, setForm] = useState<InstitutionFormState>(emptyInstitutionForm());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [institutionTypes, setInstitutionTypes] = useState<string[]>([]);
  const [mtefSectors, setMtefSectors] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const sb = await createBrowserClientAsync();
        const [types, sectors] = await Promise.all([
          sb
            .from("institutions")
            .select("institution_type")
            .not("institution_type", "is", null),
          sb
            .from("institutions")
            .select("mtef_sector")
            .not("mtef_sector", "is", null),
        ]);
        setInstitutionTypes(
          uniqueStrings(
            types.data?.map(
              (r: { institution_type: string | null }) => r.institution_type,
            ),
          ),
        );
        setMtefSectors(
          uniqueStrings(
            sectors.data?.map(
              (r: { mtef_sector: string | null }) => r.mtef_sector,
            ),
          ),
        );
      } catch {
        /* ignore */
      }
    })();
  }, []);

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
      return next;
    });
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
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/institutions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          [json.error, json.hint].filter(Boolean).join(" — ") ||
            "Create failed",
        );
      }
      if (json.data?.id) {
        router.push(adminPath(`institutions/${json.data.id}/edit`));
      } else {
        router.push(adminPath("institutions"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
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
          Fields match the live <code>institutions</code> schema (enums,
          arrays, contact, leadership, classification).
        </p>
        {error && (
          <div className="govuk-error-summary" role="alert">
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <p className="govuk-body">{error}</p>
          </div>
        )}
        <InstitutionForm
          form={form}
          onChange={onChange}
          onHierarchyChange={onHierarchyChange}
          onSubmit={onSubmit}
          submitting={submitting}
          submitLabel="Create institution"
          institutionTypes={institutionTypes}
          mtefSectors={mtefSectors}
          cancelHref={adminPath("institutions")}
        />
      </main>
    </div>
  );
}
