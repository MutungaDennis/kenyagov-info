"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { adminPath } from "@/lib/admin-path";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import ActionDropdown from "@/components/govuk/ActionDropdown";
import DeleteModal from "@/components/govuk/DeleteModal";

type Institution = {
  id: string;
  slug: string;
  name: string;
  short_name?: string | null;
  institution_type?: string | null;
  institution_category?: string | null;
  government_level?: string | null;
  arm_of_government?: string | null;
  mtef_sector?: string | null;
  is_active: boolean;
  description?: string | null;
};

export default function AdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [showInactive, setShowInactive] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [institutionToDelete, setInstitutionToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchInstitutions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/institutions?limit=500", {
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `Failed to load (${res.status})`);
      }
      setInstitutions(json.data || []);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to load institutions");
      setInstitutions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

  const mainCategories = useMemo<string[]>(() => {
    const cats = institutions
      .map((i) => i.arm_of_government ?? i.institution_category)
      .filter((v): v is string => typeof v === "string" && v.trim() !== "");
    return ["All", ...Array.from(new Set(cats)).sort()];
  }, [institutions]);

  const subCategoryOptions = useMemo<string[]>(() => {
    if (selectedMainCategory === "All") return ["All"];
    const relevant = institutions.filter(
      (inst) =>
        inst.arm_of_government === selectedMainCategory ||
        inst.institution_category === selectedMainCategory,
    );
    const subs = relevant
      .map((i) => i.institution_type)
      .filter((v): v is string => typeof v === "string" && v.trim() !== "");
    return ["All", ...Array.from(new Set(subs)).sort()];
  }, [selectedMainCategory, institutions]);

  const filteredInstitutions = useMemo(() => {
    return institutions
      .filter((inst) => {
        const searchMatch =
          inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (inst.short_name &&
            inst.short_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (inst.description &&
            inst.description.toLowerCase().includes(searchTerm.toLowerCase()));

        const mainMatch =
          selectedMainCategory === "All" ||
          inst.arm_of_government === selectedMainCategory ||
          inst.institution_category === selectedMainCategory;

        const subMatch =
          selectedSubCategory === "All" ||
          inst.institution_type === selectedSubCategory;

        const activeMatch = showInactive || inst.is_active !== false;

        return searchMatch && mainMatch && subMatch && activeMatch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [
    institutions,
    searchTerm,
    selectedMainCategory,
    selectedSubCategory,
    showInactive,
  ]);

  const toggleActive = async (id: string, current: boolean) => {
    setActionMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/institutions/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !current }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      setActionMessage(current ? "Institution deactivated." : "Institution activated.");
      await fetchInstitutions();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status");
    }
  };

  const openDeleteModal = (id: string, name: string) => {
    setInstitutionToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!institutionToDelete) return;
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/institutions/${institutionToDelete.id}`,
        { method: "DELETE", credentials: "include" },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
      setActionMessage(`Deleted “${institutionToDelete.name}”.`);
      await fetchInstitutions();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleteModalOpen(false);
      setInstitutionToDelete(null);
    }
  };

  return (
    <div className="govuk-width-container">
      <GovUKBackLink href={adminPath()} />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Admin", href: adminPath() },
          { text: "Government Institutions", href: adminPath("institutions") },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Government Institutions</h1>
            <p className="govuk-body-l">
              Manage public institutions — currently {institutions.length}{" "}
              records loaded from Supabase.
            </p>
          </div>
          <div className="govuk-grid-column-one-third">
            <Link
              href={adminPath("institutions/new")}
              className="govuk-button"
            >
              + Add institution
            </Link>
          </div>
        </div>

        {error && (
          <div className="govuk-error-summary" role="alert">
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <p className="govuk-body">{error}</p>
          </div>
        )}

        {actionMessage && (
          <div className="govuk-notification-banner govuk-notification-banner--success">
            <div className="govuk-notification-banner__content">
              <p className="govuk-body">{actionMessage}</p>
            </div>
          </div>
        )}

        <div className="govuk-grid-row govuk-!-margin-bottom-6">
          <div className="govuk-grid-column-one-third">
            <label className="govuk-label" htmlFor="search">
              Search
            </label>
            <input
              id="search"
              className="govuk-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="govuk-grid-column-one-third">
            <label className="govuk-label" htmlFor="main">
              Main category
            </label>
            <select
              id="main"
              className="govuk-select"
              value={selectedMainCategory}
              onChange={(e) => {
                setSelectedMainCategory(e.target.value);
                setSelectedSubCategory("All");
              }}
            >
              {mainCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="govuk-grid-column-one-third">
            <label className="govuk-label" htmlFor="sub">
              Sub category
            </label>
            <select
              id="sub"
              className="govuk-select"
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              disabled={selectedMainCategory === "All"}
            >
              {subCategoryOptions.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="govuk-checkboxes govuk-!-margin-bottom-4">
          <div className="govuk-checkboxes__item">
            <input
              className="govuk-checkboxes__input"
              id="inactive"
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            <label
              className="govuk-label govuk-checkboxes__label"
              htmlFor="inactive"
            >
              Show inactive
            </label>
          </div>
        </div>

        <p className="govuk-body-s">
          Showing <strong>{filteredInstitutions.length}</strong>
          {loading ? " (loading…)" : ""} institutions
        </p>

        {!loading && filteredInstitutions.length === 0 && (
          <p className="govuk-body">No institutions match your filters.</p>
        )}

        {filteredInstitutions.length > 0 && (
          <div className="govuk-table-wrapper">
            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th className="govuk-table__header" scope="col">
                    #
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Institution
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Type
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Category
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Level
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Status
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {filteredInstitutions.map((inst, index) => (
                  <tr key={inst.id} className="govuk-table__row">
                    <td className="govuk-table__cell">{index + 1}</td>
                    <td className="govuk-table__cell">
                      <strong>{inst.name}</strong>
                      {inst.short_name && ` (${inst.short_name})`}
                    </td>
                    <td className="govuk-table__cell">
                      {inst.institution_type || "—"}
                    </td>
                    <td className="govuk-table__cell">
                      {inst.institution_category ||
                        inst.arm_of_government ||
                        "—"}
                    </td>
                    <td className="govuk-table__cell">
                      {inst.government_level || "—"}
                    </td>
                    <td className="govuk-table__cell">
                      <span
                        className={`govuk-tag ${
                          inst.is_active !== false
                            ? "govuk-tag--green"
                            : "govuk-tag--grey"
                        }`}
                      >
                        {inst.is_active !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="govuk-table__cell">
                      <ActionDropdown
                        actions={[
                          {
                            label: "Edit",
                            href: adminPath(`institutions/${inst.id}/edit`),
                          },
                          {
                            label: "View public",
                            href: `/government/institutions/${inst.slug}`,
                          },
                          {
                            label:
                              inst.is_active !== false
                                ? "Deactivate"
                                : "Activate",
                            onClick: () =>
                              toggleActive(inst.id, inst.is_active !== false),
                          },
                          {
                            label: "Delete",
                            destructive: true,
                            onClick: () =>
                              openDeleteModal(inst.id, inst.name),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <DeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete institution"
          message={`Delete "${institutionToDelete?.name}"? This cannot be undone.`}
        />
      </main>
    </div>
  );
}
