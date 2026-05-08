import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

type Institution = {
  id: string;
  slug: string;
  name: string;
  short_name?: string | null;
  official_name?: string | null;
  institution_type?: string | null;
  institution_category?: string | null;
  government_level?: string | null;
  arm_of_government?: string | null;
  constitutional_status?: string | null;
  mtef_sector?: string | null;
  legal_basis_type?: string | null;
  description?: string | null;
  mandate?: string | null;
  vision?: string | null;
  mission?: string | null;
  functions?: string[] | null;
  keywords?: string[] | null;
  website_url?: string | null;
  headquarters?: string | null;
  current_head_name?: string | null;
  current_head_title?: string | null;
  established_date?: string | null;
  appointing_authority?: string | null;
  funding_model?: string | null;
  is_active: boolean;
};

export default async function InstitutionProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: institution, error } = await supabase
    .from('institutions')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !institution) {
    notFound();
  }

  const inst = institution as Institution;

  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/institutions" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Institutions", href: "/institutions" },
          { text: inst.name, href: "#" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          {/* Main Content */}
          <div className="govuk-grid-column-two-thirds">
            {/* Header */}
            <p className="govuk-caption-l govuk-!-margin-bottom-1">
              {inst.institution_type} • {inst.government_level} • {inst.arm_of_government}
            </p>
            
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">{inst.name}</h1>
            
            {inst.short_name && (
              <p className="govuk-heading-m govuk-!-margin-bottom-6 text-gray-600">
                {inst.short_name}
              </p>
            )}

            {inst.official_name && inst.official_name !== inst.name && (
              <p className="govuk-body-m govuk-!-margin-bottom-6">
                Officially: <strong>{inst.official_name}</strong>
              </p>
            )}

            {/* What it does */}
            {inst.mandate && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">What it does</h2>
                <p className="govuk-body-l">{inst.mandate}</p>
              </>
            )}

            {inst.description && (
              <p className="govuk-body">{inst.description}</p>
            )}

            {/* Key Facts */}
            <h2 className="govuk-heading-l govuk-!-margin-top-9">Key facts</h2>
            <dl className="govuk-summary-list govuk-summary-list--no-border">
              {inst.constitutional_status && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Constitutional Status</dt>
                  <dd className="govuk-summary-list__value">{inst.constitutional_status}</dd>
                </div>
              )}
              {inst.legal_basis_type && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Legal Basis</dt>
                  <dd className="govuk-summary-list__value">{inst.legal_basis_type}</dd>
                </div>
              )}
              {inst.mtef_sector && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">MTEF Sector</dt>
                  <dd className="govuk-summary-list__value">{inst.mtef_sector}</dd>
                </div>
              )}
              {inst.funding_model && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Funding Model</dt>
                  <dd className="govuk-summary-list__value">{inst.funding_model}</dd>
                </div>
              )}
              {inst.headquarters && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Headquarters</dt>
                  <dd className="govuk-summary-list__value">{inst.headquarters}</dd>
                </div>
              )}
              {inst.established_date && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Established</dt>
                  <dd className="govuk-summary-list__value">{inst.established_date}</dd>
                </div>
              )}
            </dl>

            {/* Leadership */}
            {(inst.current_head_name || inst.appointing_authority) && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Leadership</h2>
                <dl className="govuk-summary-list">
                  {inst.current_head_name && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Current Head</dt>
                      <dd className="govuk-summary-list__value">
                        {inst.current_head_name} {inst.current_head_title && `— ${inst.current_head_title}`}
                      </dd>
                    </div>
                  )}
                  {inst.appointing_authority && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Appointed By</dt>
                      <dd className="govuk-summary-list__value">{inst.appointing_authority}</dd>
                    </div>
                  )}
                </dl>
              </>
            )}

            {/* Functions */}
            {inst.functions && inst.functions.length > 0 && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Main Functions</h2>
                <ul className="govuk-list govuk-list--bullet">
                  {inst.functions.map((func, index) => (
                    <li key={index} className="govuk-body">{func}</li>
                  ))}
                </ul>
              </>
            )}

            {/* Official Website */}
            {inst.website_url && (
              <div className="govuk-!-margin-top-9">
                <a 
                  href={inst.website_url} 
                  className="govuk-button govuk-button--secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Official Website →
                </a>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <div className="govuk-related-items" aria-labelledby="related-heading">
              <h2 id="related-heading" className="govuk-heading-m">Explore more</h2>
              <ul className="govuk-list govuk-list--spaced">
                <li><Link href={`/institutions/${inst.slug}/leaders`} className="govuk-link">Current Leadership</Link></li>
                <li><Link href={`/institutions/${inst.slug}/services`} className="govuk-link">Services Offered</Link></li>
                <li><Link href={`/institutions/${inst.slug}/documents`} className="govuk-link">Key Documents</Link></li>
                {inst.keywords && inst.keywords.length > 0 && (
                  <li className="govuk-!-margin-top-4">
                    <strong>Keywords:</strong><br />
                    {inst.keywords.join(", ")}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <GovUKFeedback />
      </main>
    </div>
  );
}