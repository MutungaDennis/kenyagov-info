import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import GovUKSummaryList from "@/components/govuk/SummaryList";

type Institution = {
  id: string;
  slug: string;
  name: string;
  short_name?: string | null;
  official_name?: string | null;

  institution_type?: string | null;
  institution_category?: string | null;
  institution_subtype?: string | null;

  government_level?: string | null;
  arm_of_government?: string | null;
  constitutional_status?: string | null;

  legal_basis_type?: string | null;
  legal_basis_name?: string | null;
  legal_basis_reference?: string | null;

  mtef_sector?: string | null;
  description?: string | null;
  mandate?: string | null;
  vision?: string | null;
  mission?: string | null;

  functions?: string[] | null;
  keywords?: string[] | null;

  website_url?: string | null;
  email?: string | null;
  phone?: string | null;
  physical_address?: string | null;
  headquarters?: string | null;

  current_head_name?: string | null;
  current_head_title?: string | null;
  appointing_authority?: string | null;

  funding_model?: string | null;
  established_date?: string | null;

  has_board?: boolean | null;
  board_type?: string | null;

  ecitizen_integrated?: boolean | null;
  has_online_services?: boolean | null;
  api_available?: boolean | null;
  open_data_available?: boolean | null;

  parent_institution_id?: string | null;
};

type RelatedInstitution = {
  id: string;
  name: string;
  slug: string;
  institution_type?: string | null;
};

export default async function InstitutionProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createClient();

  const { data: inst, error } = await (await supabase)
    .from("institutions")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !inst) notFound();

  // Parent Institution
  let parent: RelatedInstitution | null = null;
  if (inst.parent_institution_id) {
    const { data } = await (await supabase)
      .from("institutions")
      .select("id, name, slug, institution_type")
      .eq("id", inst.parent_institution_id)
      .single();
    parent = data;
  }

  // Child Entities
  const { data: children } = await (await supabase)
    .from("institutions")
    .select("id, name, slug, institution_type, institution_category, institution_subtype")
    .eq("parent_institution_id", inst.id)
    .eq("is_active", true)
    .order("name");

  // Related by MTEF Sector
  const { data: related } = await (await supabase)
    .from("institutions")
    .select("id, name, slug, institution_type")
    .eq("mtef_sector", inst.mtef_sector)
    .neq("id", inst.id)
    .limit(8);

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
          <div className="govuk-grid-column-two-thirds">

            <p className="govuk-caption-l">
              {inst.institution_type} • {inst.government_level} • {inst.arm_of_government}
            </p>

            <h1 className="govuk-heading-xl">{inst.name}</h1>

            {inst.short_name && (
              <p className="govuk-body-l">Also known as <strong>{inst.short_name}</strong></p>
            )}

            {/* Key Facts */}
            <GovUKSummaryList
              items={[
                { key: "Category", value: inst.institution_category || "—" },
                { key: "Legal Status", value: inst.constitutional_status || "—" },
                { key: "MTEF Sector", value: inst.mtef_sector || "—" },
                { key: "Parent Ministry", value: "Ministry of Labour & Social Protection" },
                { key: "Headquarters", value: inst.headquarters || "—" },
              ]}
            />

            {/* What it does */}
            {(inst.mandate || inst.description || inst.functions) && (
              <div className="govuk-!-margin-top-9" id="what-it-does">
                <h2 className="govuk-heading-l">What it does</h2>
                <p className="govuk-body-l">{inst.mandate || inst.description}</p>

                {inst.functions && inst.functions.length > 0 && (
                  <ul className="govuk-list govuk-list--bullet govuk-!-margin-top-6">
                    {inst.functions.map((func: string, i: number) => (
                      <li key={i}>{func}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Leadership */}
            {(inst.current_head_name || inst.has_board) && (
              <div className="govuk-!-margin-top-9" id="leadership">
                <h2 className="govuk-heading-l">Leadership & Governance</h2>
                <GovUKSummaryList
                  items={[
                    { key: "Current Head", value: inst.current_head_name ? `${inst.current_head_name} ${inst.current_head_title ? `— ${inst.current_head_title}` : ''}` : "—" },
                    { key: "Appointing Authority", value: inst.appointing_authority || "—" },
                    { key: "Governing Board", value: inst.has_board ? (inst.board_type || "Yes") : "No" },
                  ]}
                />
              </div>
            )}

            {/* Legal Foundation */}
            {(inst.legal_basis_name || inst.constitutional_status) && (
              <div className="govuk-!-margin-top-9" id="legal">
                <h2 className="govuk-heading-l">Legal Foundation</h2>
                <GovUKSummaryList
                  items={[
                    { key: "Constitutional Status", value: inst.constitutional_status || "—" },
                    { key: "Legal Basis", value: inst.legal_basis_name || "—" },
                    { key: "Legal Reference", value: inst.legal_basis_reference || "—" },
                  ]}
                />
              </div>
            )}

            {/* Contact Information */}
            {(inst.website_url || inst.email || inst.phone || inst.physical_address) && (
              <div className="govuk-!-margin-top-9" id="contact">
                <h2 className="govuk-heading-l">Contact Information</h2>
                <GovUKSummaryList
                  items={[
                    { key: "Website", value: inst.website_url ? <a href={inst.website_url} className="govuk-link" target="_blank" rel="noopener noreferrer">Visit official website →</a> : "—" },
                    { key: "Email", value: inst.email || "—" },
                    { key: "Phone", value: inst.phone || "—" },
                    { key: "Physical Address", value: inst.physical_address || "—" },
                  ]}
                />
              </div>
            )}

            {/* Child Entities - Collapsible GOV.UK Style */}
            {children && children.length > 0 && (
              <div className="govuk-!-margin-top-9" id="children">
                <h2 className="govuk-heading-l">Entities under this institution</h2>
                <details className="govuk-details" open>
                  <summary className="govuk-details__summary">
                    <span className="govuk-details__summary-text">
                      Show {children.length} subordinate entities
                    </span>
                  </summary>
                  <div className="govuk-details__text">
                    <ul className="govuk-list govuk-list--bullet">
                      {children.map((child: RelatedInstitution) => (
                        <li key={child.id}>
                          <Link href={`/institutions/${child.slug}`} className="govuk-link">
                            {child.name}
                          </Link>
                          {child.institution_type && <span className="govuk-body-s text-gray-600"> ({child.institution_type})</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              </div>
            )}

            {/* Related Institutions */}
            {related && related.length > 0 && (
              <div className="govuk-!-margin-top-9" id="related">
                <h2 className="govuk-heading-l">Related institutions</h2>
                <ul className="govuk-list govuk-list--bullet">
                  {related.map((item: RelatedInstitution) => (
                    <li key={item.id}>
                      <Link href={`/institutions/${item.slug}`} className="govuk-link">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <GovUKFeedback />
          </div>

          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <div className="govuk-related-items" aria-labelledby="contents-heading">
              <h2 id="contents-heading" className="govuk-heading-m">Contents</h2>
              <ul className="govuk-list govuk-list--spaced">
                <li><a href="#what-it-does" className="govuk-link">What it does</a></li>
                <li><a href="#leadership" className="govuk-link">Leadership & Governance</a></li>
                <li><a href="#legal" className="govuk-link">Legal Foundation</a></li>
                <li><a href="#contact" className="govuk-link">Contact Information</a></li>
                {children && children.length > 0 && <li><a href="#children" className="govuk-link">Entities under this institution</a></li>}
                {related && related.length > 0 && <li><a href="#related" className="govuk-link">Related institutions</a></li>}
              </ul>

              {/* Explore More - Spaced below Contents */}
              <div className="govuk-!-margin-top-9">
                <h3 className="govuk-heading-s">Explore more</h3>
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <Link href={`/institutions/${inst.slug}/leadership`} className="govuk-link">
                      Current leadership →
                    </Link>
                  </li>
                  <li>
                    <Link href={`/institutions/${inst.slug}/services`} className="govuk-link">
                      Services offered →
                    </Link>
                  </li>
                  <li>
                    <Link href={`/institutions/${inst.slug}/documents`} className="govuk-link">
                      Key documents →
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}