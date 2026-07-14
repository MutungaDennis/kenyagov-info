'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { adminPath } from "@/lib/admin-path";
import { createClient } from '@/lib/supabase/client';
import GovUKBackLink from '@/components/govuk/BackLink';
import GovUKBreadcrumbs from '@/components/govuk/Breadcrumbs';
import GovUKFeedback from '@/components/govuk/Feedback';
import ActionDropdown from '@/components/govuk/ActionDropdown';
import DeleteModal from '@/components/govuk/DeleteModal';

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
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [showInactive, setShowInactive] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [institutionToDelete, setInstitutionToDelete] =
    useState<{ id: string; name: string } | null>(null);

  const supabase = createClient();

  const fetchInstitutions = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("institutions")
      .select(`
        id, slug, name, short_name, institution_type,
        institution_category, government_level,
        arm_of_government, mtef_sector, is_active, description
      `)
      .order("name", { ascending: true });

    if (error) console.error(error);
    else setInstitutions(data || []);

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

  // ✅ FIXED: main categories (NO null allowed)
  const mainCategories = useMemo<string[]>(() => {
    const cats = institutions
      .map((i) => i.arm_of_government ?? i.institution_category)
      .filter((v): v is string => typeof v === "string" && v.trim() !== "");

    return ["All", ...Array.from(new Set(cats)).sort()];
  }, [institutions]);

  // ✅ FIXED: sub categories (NO null allowed)
  const subCategoryOptions = useMemo<string[]>(() => {
    if (selectedMainCategory === "All") return ["All"];

    const relevant = institutions.filter(
      (inst) =>
        inst.arm_of_government === selectedMainCategory ||
        inst.institution_category === selectedMainCategory
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

        const activeMatch = showInactive || inst.is_active;

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
    await supabase
      .from("institutions")
      .update({ is_active: !current })
      .eq("id", id);

    fetchInstitutions();
  };

  const openDeleteModal = (id: string, name: string) => {
    setInstitutionToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!institutionToDelete) return;

    await supabase
      .from("institutions")
      .delete()
      .eq("id", institutionToDelete.id);

    fetchInstitutions();
    setDeleteModalOpen(false);
    setInstitutionToDelete(null);
  };

  return (
    <div className="govuk-width-container">
      <GovUKBackLink href={adminPath()} />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Admin", href: adminPath() },
          { text: "Government Institutions", href: adminPath('institutions') },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Government Institutions</h1>
            <p className="govuk-body-l">
              Manage all public institutions — currently {institutions.length} records
            </p>
          </div>

          <div className="govuk-grid-column-one-third">
            <Link href={adminPath()} className="govuk-button">
              + Add New Institution
            </Link>
          </div>
        </div>

        {/* FILTERS */}
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <div className="govuk-grid-column-one-third">
            <label className="govuk-label">Search</label>
            <input
              className="govuk-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="govuk-grid-column-one-third">
            <label className="govuk-label">Main Category</label>
            <select
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
            <label className="govuk-label">Sub Category</label>
            <select
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

        <p className="govuk-body-s">
          Showing <strong>{filteredInstitutions.length}</strong> institutions
        </p>

        {/* TABLE */}
        <div className="govuk-table-wrapper">
          <table className="govuk-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Institution</th>
                <th>Type</th>
                <th>Category</th>
                <th>Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredInstitutions.map((inst, index) => (
                <tr key={inst.id}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{inst.name}</strong>
                    {inst.short_name && ` (${inst.short_name})`}
                  </td>
                  <td>{inst.institution_type}</td>
                  <td>
                    {inst.institution_category || inst.arm_of_government}
                  </td>
                  <td>{inst.government_level}</td>
                  <td>
                    <span
                      className={`govuk-tag ${
                        inst.is_active ? "govuk-tag--green" : "govuk-tag--grey"
                      }`}
                    >
                      {inst.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <ActionDropdown
                      actions={[
                        {
                          label: "Edit",
                          href: `/admin/institutions/${inst.id}/edit`,
                        },
                        {
                          label: "View",
                          href: `/institutions/${inst.slug}`,
                        },
                        {
                          label: inst.is_active ? "Deactivate" : "Activate",
                          onClick: () => toggleActive(inst.id, inst.is_active),
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

        {loading && <p className="govuk-body">Loading...</p>}

        <DeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Institution"
          message={`Are you sure you want to delete "${institutionToDelete?.name}"?`}
        />

        <GovUKFeedback />
      </main>
    </div>
  );
}