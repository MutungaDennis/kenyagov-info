import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";

import PrintPageButton from "@/components/govuk/PrintPageButton";
import LastUpdated from "@/components/govuk/LastUpdated";

interface WardPageProps {
  params: Promise<{ slug: string }>;
}

export default async function WardPage({ params }: WardPageProps) {
  const supabase = await createClient();
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { data: ward, error } = await supabase
    .from("wards")
    .select("*")
    .eq("slug", decodedSlug)
    .single();

  if (error || !ward) {
    notFound();
  }

  const [ { data: leadership }, { data: relatedWards } ] = await Promise.all([
    supabase
      .from("ward_leadership")
      .select("*")
      .eq("ward_id", ward.id)
      .maybeSingle(),
    supabase
      .from("wards")
      .select("id, slug, name")
      .eq("constituency_name", ward.constituency_name)
      .neq("id", ward.id)
      .order("name"),
  ]);

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Wards", href: "/counties/wards" },
          { text: ward.name, href: "" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">{ward.name} Ward Profile</h1>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Administrative unit in <strong>{ward.constituency_name}</strong>, <strong>{ward.county_name} County</strong>.
            </p>

            <div className="govuk-!-margin-bottom-6 print-hide">
              <PrintPageButton />
            </div>
          </div>
        </div>

        <div className="govuk-grid-row">
          {/* Enhanced GOV.UK Sidebar Navigation */}
          <div className="govuk-grid-column-one-third print-hide govuk-!-margin-bottom-6">
            <nav 
              style={{ borderTop: '2px solid #1d70b8', padding: '15px 0' }} 
              aria-label="Secondary Profile Navigation"
            >
              <ul className="govuk-list govuk-list--spaced" style={{ margin: 0, padding: 0 }}>
                <li style={{ 
                  paddingLeft: '12px', 
                  borderLeft: '4px solid #1d70b8', 
                  fontWeight: 'bold',
                  color: '#1d70b8'
                }}>
                  Overview & Geography
                </li>
                <li style={{ paddingLeft: '16px' }}>
                  <Link 
                    href={`/counties/wards/${slug}/about`} 
                    className="govuk-link govuk-!-font-size-19" 
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    Facilities & Projects
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Overview & Geography</h2>
            <GovUKSummaryList
              items={[
                { key: "Ward Code", value: ward.ward_code },
                { key: "County", value: ward.county_name },
                { key: "Constituency", value: ward.constituency_name },
                { key: "Registered Voters (2022)", value: ward.registered_voters_2022?.toLocaleString() ?? "—" },
                { key: "Population Estimate", value: ward.population_estimate?.toLocaleString() ?? "—" },
                { key: "Land Area", value: ward.land_area_km2 ? `${ward.land_area_km2} km²` : "—" },
              ]}
            />

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Local Governance</h2>
            {leadership ? (
              <GovUKSummaryList
                items={[
                  { key: "Member of County Assembly (MCA)", value: leadership.mca_name ?? "—" },
                  { key: "Political Party", value: leadership.mca_party ?? "—" },
                  { key: "Contact Details", value: leadership.mca_contact ?? "—" },
                ]}
              />
            ) : (
              <p className="govuk-body govuk-text-secondary">No leadership records available for this ward.</p>
            )}

            {relatedWards && relatedWards.length > 0 && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">
                  Other Wards in {ward.constituency_name}
                </h2>
                <ul className="govuk-list govuk-list--bullet">
                  {relatedWards.map((w) => (
                    <li key={w.id}>
                      <Link href={`/counties/wards/${w.slug}`} className="govuk-link">
                        {w.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Replaced broken inline style with standard GOV.UK spacer utilities */}
            <div className="govuk-!-margin-top-8">
              <LastUpdated lastUpdated={ward.updated_at} published={ward.created_at} />
            </div>

            <div 
              className="govuk-!-margin-top-6" 
              style={{ paddingTop: '15px', borderTop: '1px solid #bfc1c3', display: 'flex', justifyContent: 'flex-end' }}
            >
              <Link href={`/counties/wards/${slug}/about`} className="govuk-link govuk-!-font-size-19" style={{ fontWeight: 'bold' }}>
                Next: Facilities & Projects &rarr;
              </Link>
            </div>

            
          </div>
        </div>
      </main>
    </div>
  );
}
