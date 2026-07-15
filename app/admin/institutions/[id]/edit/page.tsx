'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminPath } from "@/lib/admin-path";
import Link from 'next/link';
import { createBrowserClientAsync } from "@/lib/supabase/client";
import GovUKBackLink from '@/components/govuk/BackLink';
import GovUKBreadcrumbs from '@/components/govuk/Breadcrumbs';
import GovUKFeedback from '@/components/govuk/Feedback';

async function getSb() {
  return createBrowserClientAsync();
}

export default function EditInstitutionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();

  const [id, setId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic dropdown options
  const [institutionTypes, setInstitutionTypes] = useState<string[]>([]);
  const [governmentLevels, setGovernmentLevels] = useState<string[]>([]);
  const [mtefSectors, setMtefSectors] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    short_name: '',
    official_name: '',
    slug: '',
    institution_type: '',
    institution_category: '',
    institution_subtype: '',
    government_level: 'National',
    arm_of_government: 'Executive',
    constitutional_status: 'Statutory',
    mtef_sector: '',
    description: '',
    mandate: '',
    headquarters: '',
    physical_address: '',
    website_url: '',
    email: '',
    phone: '',
    current_head_name: '',
    current_head_title: '',
    has_board: false,
    board_type: '',
    is_active: true,
  });

  // Get ID from URL params
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  // Fetch dropdown options
  useEffect(() => {
    const fetchOptions = async () => {
      const [typesRes, levelsRes, sectorsRes] = await Promise.all([
        (await getSb()).from('institutions').select('institution_type').not('institution_type', 'is', null),
        (await getSb()).from('institutions').select('government_level').not('government_level', 'is', null),
        (await getSb()).from('institutions').select('mtef_sector').not('mtef_sector', 'is', null),
      ]);

      const unique = (values: (string | null | undefined)[] | undefined) =>
        [...new Set((values ?? []).filter((v): v is string => typeof v === "string" && v.length > 0))];

      setInstitutionTypes(
        unique(typesRes.data?.map((t: { institution_type: string | null }) => t.institution_type)),
      );
      setGovernmentLevels(
        unique(levelsRes.data?.map((l: { government_level: string | null }) => l.government_level)),
      );
      setMtefSectors(
        unique(sectorsRes.data?.map((s: { mtef_sector: string | null }) => s.mtef_sector)),
      );
    };

    fetchOptions();
  }, []);

  // Fetch existing institution data
  useEffect(() => {
    if (!id) return;

    const fetchInstitution = async () => {
      const { data, error } = await (await getSb())
        .from('institutions')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        alert('Institution not found');
        router.push(adminPath('institutions'));
        return;
      }

      setFormData({
        name: data.name || '',
        short_name: data.short_name || '',
        official_name: data.official_name || '',
        slug: data.slug || '',
        institution_type: data.institution_type || '',
        institution_category: data.institution_category || '',
        institution_subtype: data.institution_subtype || '',
        government_level: data.government_level || 'National',
        arm_of_government: data.arm_of_government || 'Executive',
        constitutional_status: data.constitutional_status || 'Statutory',
        mtef_sector: data.mtef_sector || '',
        description: data.description || '',
        mandate: data.mandate || '',
        headquarters: data.headquarters || '',
        physical_address: data.physical_address || '',
        website_url: data.website_url || '',
        email: data.email || '',
        phone: data.phone || '',
        current_head_name: data.current_head_name || '',
        current_head_title: data.current_head_title || '',
        has_board: data.has_board || false,
        board_type: data.board_type || '',
        is_active: data.is_active !== false,
      });

      setLoading(false);
    };

    fetchInstitution();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await (await getSb())
      .from('institutions')
      .update(formData)
      .eq('id', id);

    if (error) {
      alert('Error updating institution: ' + error.message);
    } else {
      alert('Institution updated successfully!');
      router.push(adminPath('institutions'));
    }

    setSubmitting(false);
  };

  if (loading) {
    return <p className="govuk-body">Loading institution data...</p>;
  }

  return (
    <div className="govuk-width-container">
      <GovUKBackLink href={adminPath()} />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Admin", href: adminPath() },
          { text: "Institutions", href: adminPath('institutions') },
          { text: "Edit", href: "#" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">Edit Institution</h1>
        <p className="govuk-body">Update the details below.</p>

        <form onSubmit={handleSubmit} className="govuk-!-margin-top-9">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">

              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--s" htmlFor="name">
                  Institution Name <span className="govuk-required">*</span>
                </label>
                <input
                  className="govuk-input"
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="short_name">Short Name / Acronym</label>
                <input className="govuk-input" id="short_name" name="short_name" type="text" value={formData.short_name} onChange={handleChange} />
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="slug">Slug (URL-friendly)</label>
                <input className="govuk-input" id="slug" name="slug" type="text" value={formData.slug} onChange={handleChange} required />
              </div>

              {/* Dynamic Dropdowns */}
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-half">
                  <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="institution_type">Institution Type</label>
                    <select
                      className="govuk-select"
                      id="institution_type"
                      name="institution_type"
                      value={formData.institution_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Type</option>
                      {institutionTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="govuk-grid-column-one-half">
                  <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="government_level">Government Level</label>
                    <select
                      className="govuk-select"
                      id="government_level"
                      name="government_level"
                      value={formData.government_level}
                      onChange={handleChange}
                    >
                      <option value="">Select Level</option>
                      {governmentLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="mtef_sector">MTEF Sector</label>
                <select
                  className="govuk-select"
                  id="mtef_sector"
                  name="mtef_sector"
                  value={formData.mtef_sector}
                  onChange={handleChange}
                >
                  <option value="">Select Sector</option>
                  {mtefSectors.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="description">Description / Mandate</label>
                <textarea
                  className="govuk-textarea"
                  id="description"
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {/* Contact Information */}
              <h3 className="govuk-heading-m govuk-!-margin-top-9">Contact Information</h3>

              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="headquarters">Headquarters</label>
                <input className="govuk-input" id="headquarters" name="headquarters" type="text" value={formData.headquarters} onChange={handleChange} />
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="website_url">Official Website</label>
                <input className="govuk-input" id="website_url" name="website_url" type="url" value={formData.website_url} onChange={handleChange} />
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="physical_address">Physical Address</label>
                <textarea className="govuk-textarea" id="physical_address" name="physical_address" rows={3} value={formData.physical_address} onChange={handleChange} />
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label govuk-checkboxes__label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  Published (Visible on the public website)
                </label>
              </div>

              <div className="govuk-button-group govuk-!-margin-top-9">
                <button type="submit" className="govuk-button" disabled={submitting}>
                  {submitting ? 'Saving Changes...' : 'Save Changes'}
                </button>
                <Link href={adminPath()} className="govuk-button govuk-button--secondary">
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </form>
      </main>

      <GovUKFeedback />
    </div>
  );
}