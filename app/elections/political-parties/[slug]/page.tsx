// app/elections/political-parties/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";

export const revalidate = 3600;

// SEO metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const supabase = await createClient();
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { data: party } = await supabase
    .from("political_parties")
    .select("name, abbreviation, slogan")
    .eq("slug", decodedSlug)
    .maybeSingle();

  if (!party) {
    return {
      title: "Party not found | Political Parties | CitizenGuide.KE",
    };
  }

  const title = party.abbreviation
    ? `${party.name} (${party.abbreviation}) | Political Parties | CitizenGuide.KE`
    : `${party.name} | Political Parties | CitizenGuide.KE`;

  return {
    title,
    description: party.slogan || `Official details for ${party.name}, registered with the Office of the Registrar of Political Parties (ORPP).`,
  };
}

export default async function PoliticalPartyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const supabase = await createClient();
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  // Fetch party with coalition details in one query
  const { data: party, error } = await supabase
    .from("political_parties")
    .select(`
      id,
      name,
      slug,
      abbreviation,
      symbol,
      colors,
      slogan,
      status,
      certificate_serial_no,
      certificate_issue_date,
      certificate_date,
      postal_address,
      head_office_location,
      previous_names,
      changes,
      coalition_id,
      coalitions (id, name, abbreviation)
    `)
    .eq("slug", decodedSlug)
    .maybeSingle();

  if (error || !party) {
    notFound();
  }

  // Extract coalition from the array returned by Supabase
  const coalition = Array.isArray(party.coalitions) 
    ? party.coalitions[0] 
    : party.coalitions || null;

  // Fetch related parties (same coalition if available, otherwise random)
  let relatedParties: any[] = [];

  if (party.coalition_id) {
    const { data } = await supabase
      .from("political_parties")
      .select("id, name, slug, abbreviation")
      .eq("coalition_id", party.coalition_id)
      .neq("id", party.id)
      .limit(5)
      .order("name");
    relatedParties = data || [];
  }

  // If not enough related parties, fetch others
  if (relatedParties.length < 3) {
    const { data } = await supabase
      .from("political_parties")
      .select("id, name, slug, abbreviation")
      .neq("id", party.id)
      .limit(5 - relatedParties.length)
      .order("name");
    relatedParties = [...relatedParties, ...(data || [])];
  }

  // Date formatting helper
  const formatDate = (date?: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Status styling
  const getStatusTagClass = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "govuk-tag--green";
      case "deregistered":
      case "cancelled":
        return "govuk-tag--red";
      case "suspended":
        return "govuk-tag--orange";
      default:
        return "govuk-tag--grey";
    }
  };

  // Build the full display name: "Party Name (ABBR)" or just "Party Name"
  const displayName = party.abbreviation
    ? `${party.name} (${party.abbreviation})`
    : party.name;

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Elections", href: "/elections" },
          { text: "Political parties", href: "/elections/political-parties" },
          { text: party.name, href: `/elections/political-parties/${party.slug}` },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <span className="govuk-caption-xl">Political party</span>
            <h1 className="govuk-heading-xl">{displayName}</h1>

            {/* Coalition tag */}
            {coalition && (
              <div className="govuk-!-margin-bottom-6">
                <strong className="govuk-tag govuk-tag--blue">
                  {coalition.abbreviation}
                </strong>
              </div>
            )}

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Party Details */}
            <section className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Party details</h2>
              
              <dl className="govuk-summary-list">
                {party.slogan && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Slogan</dt>
                    <dd className="govuk-summary-list__value">
                      {party.slogan}
                    </dd>
                  </div>
                )}

                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Symbol</dt>
                  <dd className="govuk-summary-list__value">
                    {party.symbol || "—"}
                  </dd>
                </div>

                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Party colours</dt>
                  <dd className="govuk-summary-list__value">
                    {party.colors || "—"}
                  </dd>
                </div>

                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Head office</dt>
                  <dd className="govuk-summary-list__value">
                    {party.head_office_location || "—"}
                  </dd>
                </div>

                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Postal address</dt>
                  <dd className="govuk-summary-list__value">
                    {party.postal_address || "—"}
                  </dd>
                </div>
              </dl>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Registration Details */}
            <section className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Registration details</h2>
              
              <dl className="govuk-summary-list">
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Status</dt>
                  <dd className="govuk-summary-list__value">
                    {party.status ? (
                      <strong className={`govuk-tag ${getStatusTagClass(party.status)}`}>
                        {party.status.charAt(0).toUpperCase() + party.status.slice(1)}
                      </strong>
                    ) : (
                      "Unknown"
                    )}
                  </dd>
                </div>

                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Certificate serial number</dt>
                  <dd className="govuk-summary-list__value">
                    {party.certificate_serial_no || "—"}
                  </dd>
                </div>

                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Certificate issue date</dt>
                  <dd className="govuk-summary-list__value">
                    {formatDate(party.certificate_issue_date || party.certificate_date)}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Changes and History */}
            {(party.previous_names || party.changes) && (
              <>
                <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

                <section className="govuk-!-margin-bottom-8">
                  <h2 className="govuk-heading-l">Changes and history</h2>
                  
                  <dl className="govuk-summary-list">
                    {party.previous_names && (
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">Previous names</dt>
                        <dd className="govuk-summary-list__value">
                          {party.previous_names}
                        </dd>
                      </div>
                    )}

                    {party.changes && (
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">Recent changes or notes</dt>
                        <dd className="govuk-summary-list__value">
                          {party.changes}
                        </dd>
                      </div>
                    )}
                  </dl>
                </section>
              </>
            )}

            {/* Coalition */}
            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            <section className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Coalition membership</h2>
              
              {coalition ? (
                <>
                  <p className="govuk-body">
                    This party is a member of{" "}
                    <Link
                      href={`/elections/coalitions/${coalition.id}`}
                      className="govuk-link"
                    >
                      <strong>{coalition.name}</strong>
                    </Link>
                    {" "}({coalition.abbreviation}).
                  </p>
                  <p className="govuk-body">
                    Coalitions are formal alliances of political parties that work together, typically during election periods.
                  </p>
                </>
              ) : (
                <p className="govuk-body">
                  This party is not currently a member of any registered coalition.
                </p>
              )}
            </section>

            {/* Related Parties */}
            {relatedParties.length > 0 && (
              <>
                <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

                <section className="govuk-!-margin-bottom-8">
                  <h2 className="govuk-heading-l">
                    {party.coalition_id ? "Other parties in this coalition" : "Other political parties"}
                  </h2>
                  
                  <ul className="govuk-list govuk-list--spaced">
                    {relatedParties.map((p: any) => (
                      <li key={p.id}>
                        <Link
                          href={`/elections/political-parties/${p.slug}`}
                          className="govuk-link"
                        >
                          {p.name}
                        </Link>
                        {p.abbreviation && (
                          <span className="govuk-body-s govuk-!-margin-left-1">
                            ({p.abbreviation})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            <LastUpdated published="2026-05-22" lastUpdated="2026-07-02" />

          </div>

          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <aside className="govuk-!-display-none-print" role="complementary">
              <h2 className="govuk-heading-m">Related pages</h2>
              <nav role="navigation">
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <Link href="/elections/political-parties" className="govuk-link">
                      All political parties
                    </Link>
                  </li>
                  <li>
                    <Link href="/elections" className="govuk-link">
                      Elections
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/institutions/orpp" className="govuk-link">
                      Office of the Registrar of Political Parties
                    </Link>
                  </li>
                </ul>
              </nav>

              <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

              <div className="govuk-inset-text">
                <p className="govuk-body govuk-!-margin-bottom-0">
                  Political parties are regulated by the Office of the Registrar of Political Parties (ORPP) under the Political Parties Act.
                </p>
              </div>

              <div className="govuk-inset-text">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-2">Status guide</h3>
                <ul className="govuk-list govuk-list--bullet govuk-body-s">
                  <li><strong>Active</strong> — fully registered and compliant</li>
                  <li><strong>Suspended</strong> — temporarily barred from activities</li>
                  <li><strong>Deregistered</strong> — registration cancelled</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <style>{`
        .app-party-tags {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
      `}</style>
    </div>
  );
}