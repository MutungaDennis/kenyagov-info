"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminPath } from "@/lib/admin-path";
import { createBrowserClientAsync } from "@/lib/supabase/client";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import InstitutionForm, {
  emptyInstitutionForm,
  institutionFormFromRow,
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

export default function EditInstitutionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState("");
  const [form, setForm] = useState<InstitutionFormState>(emptyInstitutionForm());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [institutionTypes, setInstitutionTypes] = useState<string[]>([]);
  const [mtefSectors, setMtefSectors] = useState<string[]>([]);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

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

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError(null);
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
        setForm(base);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(
      (prev) =>
        ({
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        }) as InstitutionFormState,
    );
    setSaved(false);
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
    setSaved(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/institutions/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          [json.error, json.hint].filter(Boolean).join(" — ") ||
            "Update failed",
        );
      }
      setSaved(true);
      if (json.data?.slug) {
        setForm((f) => ({ ...f, slug: json.data.slug }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
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
          All classification enums and array fields match the database schema
          you provided.
        </p>
        {error && (
          <div className="govuk-error-summary" role="alert">
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <p className="govuk-body">{error}</p>
          </div>
        )}
        {saved && (
          <div className="govuk-notification-banner govuk-notification-banner--success">
            <div className="govuk-notification-banner__content">
              <p className="govuk-notification-banner__heading">Saved</p>
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
        <InstitutionForm
          form={form}
          onChange={onChange}
          onHierarchyChange={onHierarchyChange}
          onSubmit={onSubmit}
          submitting={submitting}
          submitLabel="Save changes"
          institutionTypes={institutionTypes}
          mtefSectors={mtefSectors}
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
