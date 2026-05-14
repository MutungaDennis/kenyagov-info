'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
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

  // Filters
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [showInactive, setShowInactive] = useState(false);

  // Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [institutionToDelete, setInstitutionToDelete] = useState<{ id: string; name: string } | null>(null);

  const supabase = createClient();

  const fetchInstitutions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('institutions')
      .select(`
        id, slug, name, short_name, institution_type, institution_category,
        government_level, arm_of_government, mtef_sector, is_active, description
      `)
      .order('name', { ascending: true });

    if (error) console.error(error);
    else setInstitutions(data || []);

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

  // Main Categories (dynamic)
  const mainCategories = useMemo(() => {
    const cats = [...new Set(institutions.map(i => i.arm_of_government || i.institution_category).filter(Boolean))];
    return ["All", ...cats.sort()];
  }, [institutions]);

  // Dynamic Subcategories
  const subCategoryOptions = useMemo(() => {
    if (selectedMainCategory === "All") return ["All"];

    const relevant = institutions.filter(inst => 
      inst.arm_of_government === selectedMainCategory || 
      inst.institution_category === selectedMainCategory
    );

    const subs = [...new Set(relevant.map(i => i.institution_type).filter(Boolean))];
    return ["All", ...subs.sort()];
  }, [selectedMainCategory, institutions]);

  // Filtered Results
  const filteredInstitutions = useMemo(() => {
    return institutions
      .filter((inst) => {
        const searchMatch = 
          inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (inst.short_name && inst.short_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (inst.description && inst.description.toLowerCase().includes(searchTerm.toLowerCase()));

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
  }, [institutions, searchTerm, selectedMainCategory, selectedSubCategory, showInactive]);

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('institutions').update({ is_active: !current }).eq('id', id);
    fetchInstitutions();
  };

  const openDeleteModal = (id: string, name: string) => {
    setInstitutionToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!institutionToDelete) return;
    await supabase.from('institutions').delete().eq('id', institutionToDelete.id);
    fetchInstitutions();
    setDeleteModalOpen(false);
    setInstitutionToDelete(null);
  };

  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/admin" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Admin", href: "/admin" },
          { text: "Government Institutions", href: "/admin/institutions" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Government Institutions</h1>
            <p className="govuk-body-l">Manage all public institutions — currently {institutions.length} records</p>
          </div>
          <div className="govuk-grid-column-one-third">
            <Link href="/admin/institutions/new" className="govuk-button">
              + Add New Institution
            </Link>
          </div>
        </div>

        {/* Filters - Similar to public page */}
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <div className="govuk-grid-column-one-third">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="search">Search</label>
              <input
                className="govuk-input"
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g. Ministry of Health, KRA..."
              />
            </div>
          </div>

          <div className="govuk-grid-column-one-third">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="main-category">Main Category</label>
              <select 
                className="govuk-select" 
                id="main-category"
                value={selectedMainCategory}
                onChange={(e) => {
                  setSelectedMainCategory(e.target.value);
                  setSelectedSubCategory("All");
                }}
              >
                {mainCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="govuk-grid-column-one-third">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="sub-category">Sub Category / Type</label>
              <select 
                className="govuk-select" 
                id="sub-category"
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                disabled={selectedMainCategory === "All"}
              >
                {subCategoryOptions.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <p className="govuk-body-s govuk-!-margin-bottom-6">
          Showing <strong>{filteredInstitutions.length}</strong> institutions
        </p>

        {/* Table */}
        <div className="govuk-table-wrapper">
          <table className="govuk-table">
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th className="govuk-table__header" style={{ width: "50px" }}>#</th>
                <th className="govuk-table__header">Institution</th>
                <th className="govuk-table__header">Type</th>
                <th className="govuk-table__header">Category</th>
                <th className="govuk-table__header">Level</th>
                <th className="govuk-table__header">Status</th>
                <th className="govuk-table__header">Actions</th>
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
                  <td className="govuk-table__cell">{inst.institution_type}</td>
                  <td className="govuk-table__cell">{inst.institution_category || inst.arm_of_government}</td>
                  <td className="govuk-table__cell">{inst.government_level}</td>
                  <td className="govuk-table__cell">
                    <span className={`govuk-tag ${inst.is_active ? 'govuk-tag--green' : 'govuk-tag--grey'}`}>
                      {inst.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="govuk-table__cell">
                    <ActionDropdown
                      actions={[
                        { label: "Edit", href: `/admin/institutions/${inst.id}/edit` },
                        { label: "View Full Details", href: `/institutions/${inst.slug}` },
                        { label: inst.is_active ? "Deactivate" : "Activate", onClick: () => toggleActive(inst.id, inst.is_active) },
                        { label: "Delete", onClick: () => openDeleteModal(inst.id, inst.name), destructive: true },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInstitutions.length === 0 && !loading && (
          <div className="govuk-warning-text">
            <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
            <strong className="govuk-warning-text__text">No institutions found</strong>
          </div>
        )}

        {loading && <p className="govuk-body">Loading institutions...</p>}

        <DeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Institution"
          message={`Are you sure you want to permanently delete "${institutionToDelete?.name}"? This action cannot be undone.`}
        />

        <GovUKFeedback />
      </main>
    </div>
  );
}