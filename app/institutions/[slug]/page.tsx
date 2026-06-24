import { createClient } from "@/lib/supabase/server";
import { getInstitutionContent } from "@/lib/sanity/client";
import { notFound } from "next/navigation";
import Link from "next/link";

import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";
import PortableTextContent from "@/components/sanity/PortableTextContent";
import { JsonLd } from "@/components/JsonLd";

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
  parent_institution_id?: string | null;
};

type RelatedInstitution = {
  id: string;
  name: string;
  slug: string;
  institution_type?: string | null;
};

type InstitutionContent = {
  headquarters?: string;
  whatItDoes?: any[];
  legalBasis?: string;
  legalReference?: string;
  website?: string;
  email?: string;
  phone?: string;
  physicalAddress?: string;
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

  const sanityContent: InstitutionContent | null =
    await getInstitutionContent(slug);

  const display = {
    ...inst,
    headquarters: sanityContent?.headquarters || inst.headquarters,
    legalBasis: sanityContent?.legalBasis || inst.legal_basis_name,
    legalReference:
      sanityContent?.legalReference || inst.legal_basis_reference,
  };

  // ----------------------------
  // SAFE DATA NORMALIZATION
  // ----------------------------
  let parent: RelatedInstitution | null = null;

  if (inst.parent_institution_id) {
    const { data } = await (await supabase)
      .from("institutions")
      .select("id, name, slug, institution_type")
      .eq("id", inst.parent_institution_id)
      .single();

    parent = data;
  }

  const { data: childrenRaw } = await (await supabase)
    .from("institutions")
    .select("id, name, slug, institution_type, institution_category")
    .eq("parent_institution_id", inst.id)
    .eq("is_active", true)
    .order("name");

  const { data: relatedRaw } = await (await supabase)
    .from("institutions")
    .select("id, name, slug, institution_type")
    .eq("mtef_sector", inst.mtef_sector)
    .neq("id", inst.id)
    .limit(8);

  const children: RelatedInstitution[] = childrenRaw ?? [];
  const related: RelatedInstitution[] = relatedRaw ?? [];

  // ==========================================
  // SCHEMA.ORG - GovernmentOrganization + BreadcrumbList
  // ==========================================
  const institutionSchema = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    "name": inst.name,
    "alternateName": inst.short_name || undefined,
    "description": inst.description || inst.mandate || undefined,
    "url": `https://www.citizenguide.ke/institutions/${slug}`,
    "email": inst.email || undefined,
    "telephone": inst.phone || undefined,
    "address": inst.physical_address || inst.headquarters || undefined,
    "areaServed": {
      "@type": "Country",
      "name": "Kenya"
    },
    "parentOrganization": parent
      ? {
          "@type": "GovernmentOrganization",
          "name": parent.name,
          "url": `https://www.citizenguide.ke/institutions/${parent.slug}`
        }
      : undefined,
    "foundingDate": inst.established_date || undefined,
    "keywords": inst.keywords?.length ? inst.keywords.join(", ") : undefined,
    "inLanguage": "en-KE"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.citizenguide.ke"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Institutions",
        "item": "https://www.citizenguide.ke/institutions"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": inst.name,
        "item": `https://www.citizenguide.ke/institutions/${slug}`
      }
    ]
  };

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Institutions", href: "/institutions" },
          { text: inst.name, href: "#" },
        ]}
      />

      {/* Schema.org Structured Data */}
      <JsonLd data={institutionSchema} />
      <JsonLd data={breadcrumbSchema} />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <p className="govuk-caption-l">
              {inst.institution_type} • {inst.government_level} •{" "}
              {inst.arm_of_government}
            </p>

            <h1 className="govuk-heading-xl">{inst.name}</h1>

            {inst.short_name && (
              <p className="govuk-body-l">
                Also known as <strong>{inst.short_name}</strong>
              </p>
            )}

            <GovUKSummaryList
              items={[
                {
                  key: "Category",
                  value: inst.institution_category || "—",
                },
                {
                  key: "Legal Status",
                  value: inst.constitutional_status || "—",
                },
                {
                  key: "MTEF Sector",
                  value: inst.mtef_sector || "—",
                },
                {
                  key: "Headquarters",
                  value: display.headquarters || "—",
                },
              ]}
            />

            {/* What it does */}
            {(sanityContent?.whatItDoes || inst.mandate || inst.description) && (
              <div className="govuk-!-margin-top-9" id="what-it-does">
                <h2 className="govuk-heading-l">What it does</h2>
                {sanityContent?.whatItDoes ? (
                  <PortableTextContent content={sanityContent.whatItDoes} />
                ) : (
                  <p className="govuk-body-l">
                    {inst.mandate || inst.description}
                  </p>
                )}
              </div>
            )}

            {/* Services, Data & Tools */}
            <div className="govuk-!-margin-top-9" id="tasks-and-tools">
              <h2 className="govuk-heading-l">Services, Data &amp; Tools</h2>
              <p className="govuk-body">
                Select a section below to run computations, view public datasets, or find regional offices managed by this entity.
              </p>

              <ul className="govuk-list govuk-list--spaced govuk-!-margin-top-6">
                <li>
                  <Link href={`/institutions/${slug}/services`} className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-22">
                    Services &amp; Checklists
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1">
                    Step-by-step documentation, processing timelines, and statutory fees for public services.
                  </p>
                </li>
                <li>
                  <Link href={`/institutions/${slug}/tools`} className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-22">
                    Interactive Tools &amp; Calculators
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1">
                    Run complex mathematical calculators or data finders configured for this institution.
                  </p>
                </li>
                <li>
                  <Link href={`/institutions/${slug}/data`} className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-22">
                    Data, Charts &amp; Metrics
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1">
                    Historical monthly tracking logs, statistical trends, and regional dashboard analytics.
                  </p>
                </li>
                <li>
                  <Link href={`/institutions/${slug}/publications`} className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-22">
                    Publications &amp; Official Gazettes
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1">
                    Download strategic governance declarations, internal research audits, and public reporting forms.
                  </p>
                </li>
                <li>
                  <Link href={`/institutions/${slug}/tenders`} className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-22">
                    Procurement &amp; AGPO Disclosures
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1">
                    Browse open invitations for tenders, contract award logs, and minority quota allocations.
                  </p>
                </li>
                <li>
                  <Link href={`/institutions/${slug}/locations`} className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-22">
                    Branch Locations &amp; Huduma Center Desks
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1">
                    Locate regional offices outside Nairobi and track down physical counter numbers inside Huduma centers.
                  </p>
                </li>
              </ul>
            </div>

            {/* Leadership */}
            {(inst.current_head_name || inst.has_board) && (
              <div className="govuk-!-margin-top-9" id="leadership">
                <h2 className="govuk-heading-l">Leadership &amp; Governance</h2>
                <p className="govuk-body">
                  Review the current oversight body, board structures, and managing directors for this organ under the{" "}
                  <Link href={`/institutions/${slug}/leadership`} className="govuk-link">
                    Leadership Hub
                  </Link>.
                </p>
              </div>
            )}

            {/* Legal */}
            <div className="govuk-!-margin-top-9" id="legal">
              <h2 className="govuk-heading-l">Legal Foundation</h2>
              <p className="govuk-body">
                This entity functions under statutory provisions outlined in the <strong>{display.legalBasis || "Constitution of Kenya"}</strong>
                {display.legalReference && ` (${display.legalReference})`}.
              </p>
            </div>

            {/* Contact */}
            <div className="govuk-!-margin-top-9" id="contact">
              <h2 className="govuk-heading-l">Contact Information</h2>
              <p className="govuk-body">
                For formal processing, contact the head office directly through the public channels registered below:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                {inst.email && (
                  <li>
                    Email: <a href={`mailto:${inst.email}`} className="govuk-link">{inst.email}</a>
                  </li>
                )}
                {inst.phone && <li>Phone: {inst.phone}</li>}
                {inst.website_url && (
                  <li>
                    Official Web Portal:{" "}
                    <a href={inst.website_url} className="govuk-link" target="_blank" rel="noreferrer">
                      {inst.website_url}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Children */}
            {children.length > 0 && (
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
                      {children.map((child) => (
                        <li key={child.id}>
                          <Link href={`/institutions/${child.slug}`} className="govuk-link">
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              </div>
            )}

            {/* Related */}
            {related.length > 0 && (
              <div className="govuk-!-margin-top-9" id="related">
                <h2 className="govuk-heading-l">Related institutions</h2>
                <ul className="govuk-list govuk-list--bullet">
                  {related.map((item) => (
                    <li key={item.id}>
                      <Link href={`/institutions/${item.slug}`} className="govuk-link">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <div className="govuk-related-items">
              <h2 className="govuk-heading-m">Contents</h2>
              <ul className="govuk-list govuk-list--spaced">
                <li><a href="#what-it-does" className="govuk-link">What it does</a></li>
                <li><a href="#tasks-and-tools" className="govuk-link">Services, Data &amp; Tools</a></li>
                <li><a href="#leadership" className="govuk-link">Leadership &amp; Governance</a></li>
                <li><a href="#legal" className="govuk-link">Legal Foundation</a></li>
                <li><a href="#contact" className="govuk-link">Contact Information</a></li>
                {children.length > 0 && (
                  <li><a href="#children" className="govuk-link">Entities under this institution</a></li>
                )}
                {related.length > 0 && (
                  <li><a href="#related" className="govuk-link">Related institutions</a></li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}