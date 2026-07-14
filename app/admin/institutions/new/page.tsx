'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminPath } from "@/lib/admin-path";
import { createClient } from '@/lib/supabase/client';
import GovUKBackLink from '@/components/govuk/BackLink';
import GovUKBreadcrumbs from '@/components/govuk/Breadcrumbs';
import GovUKFeedback from '@/components/govuk/Feedback';
import Link from 'next/link';

export default function NewInstitutionPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
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

  // Fetch unique values for dropdowns
  useEffect(() => {
    const fetchOptions = async () => {
      // Institution Types
      const { data: typesData } = await supabase
        .from('institutions')
        .select('institution_type')
        .not('institution_type', 'is', null)
        .order('institution_type');

      const unique = (values: (string | null | undefined)[] | undefined) =>
        [...new Set((values ?? []).filter((v): v is string => typeof v === 'string' && v.length > 0))];

      setInstitutionTypes(
        unique(typesData?.map((item: { institution_type: string | null }) => item.institution_type)),
      );

      // Government Levels
      const { data: levelsData } = await supabase
        .from('institutions')
        .select('government_level')
        .not('government_level', 'is', null);

      setGovernmentLevels(
        unique(levelsData?.map((item: { government_level: string | null }) => item.government_level)),
      );

      // MTEF Sectors
      const { data: sectorsData } = await supabase
        .from('institutions')
        .select('mtef_sector')
        .not('mtef_sector', 'is', null);

      setMtefSectors(
        unique(sectorsData?.map((item: { mtef_sector: string | null }) => item.mtef_sector)),
      );
    };

    fetchOptions();
  }, [supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Auto-generate slug from name
    if (name === 'name') {
      const generatedSlug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase
      .from('institutions')
      .insert([formData]);

    if (error) {
      alert('Error creating institution: ' + error.message);
    } else {
      alert('Institution created successfully!');
      router.push(adminPath('institutions'));
    }

    setSubmitting(false);
  };

  return (
    <div className="govuk-width-container">
      <GovUKBackLink href={adminPath()} />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Admin", href: adminPath() },
          { text: "Institutions", href: adminPath('institutions') },
          { text: "New Institution", href: "#" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">Add New Government Institution</h1>
        <p className="govuk-body">Fill in the details below. All fields marked with * are required.</p>

        <form onSubmit={handleSubmit} className="govuk-!-margin-top-9">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">

              {/* Basic Information */}
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
                <label className="govuk-label" htmlFor="slug">Slug (URL-friendly) <span className="govuk-required">*</span></label>
                <input className="govuk-input" id="slug" name="slug" type="text" value={formData.slug} onChange={handleChange} required />
              </div>

              {/* Dynamic Dropdowns */}
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-half">
                  <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="institution_type">Institution Type <span className="govuk-required">*</span></label>
                    <select 
                      className="govuk-select" 
                      id="institution_type" 
                      name="institution_type" 
                      value={formData.institution_type} 
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Type</option>
                      {institutionTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
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
                      {governmentLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
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
                  <option value="">Select MTEF Sector</option>
                  {mtefSectors.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
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

              {/* Status */}
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
                  {submitting ? 'Creating Institution...' : 'Create Institution'}
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