// app/politics/page.tsx
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import LastUpdated from "@/components/govuk/LastUpdated";

const politicsSections = [
  {
    title: "Political Parties",
    description: "Browse all registered political parties, their symbols, slogans, leadership, headquarters, and coalition affiliations.",
    href: "/politics/political-parties",
  },
  {
    title: "Elections & Referendums",
    description: "General elections, by-elections, voter registration, IEBC, and referendum processes.",
    href: "/politics/elections",
  },
  {
    title: "Political Funding & Compliance",
    description: "Campaign financing, party funding disclosure, and compliance with the Political Parties Act.",
    href: "/politics/political-funding",
  },
  {
    title: "Public Participation",
    description: "How citizens can participate in governance through petitions, public forums, and memoranda.",
    href: "/politics/public-participation",
  },
  {
    title: "Majority & Government Side",
    description: "The ruling coalition, Cabinet, and government leadership.",
    href: "/politics/majority",
  },
  {
    title: "Opposition & Minority Side",
    description: "Official opposition parties and minority leadership in Parliament.",
    href: "/politics/minority",
  },
];

export default function PoliticsPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Politics", href: "/politics" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-xl">Governance & Democracy</span>
            <h1 className="govuk-heading-xl">Politics in Kenya</h1>

            <p className="govuk-body-l">
              Access clear, reliable information about Kenya’s political system, 
              political parties, elections, public participation, and democratic institutions.
            </p>
          </div>
        </div>

        {/* Main Navigation Cards */}
        <section className="govuk-!-margin-top-9">
          <h2 className="govuk-heading-l">Explore political topics</h2>

          <div className="govuk-grid-row">
            {politicsSections.map((section) => (
              <div 
                key={section.href} 
                className="govuk-grid-column-one-half govuk-!-margin-bottom-6"
              >
                <div className="govuk-card govuk-card--clickable">
                  <div className="govuk-card__content">
                    <h3 className="govuk-heading-m govuk-!-margin-bottom-2">
                      <Link href={section.href} className="govuk-link">
                        {section.title}
                      </Link>
                    </h3>
                    <p className="govuk-body">
                      {section.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Understanding Kenya’s Political System */}
        <section className="govuk-!-margin-top-10">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h2 className="govuk-heading-l">Understanding Kenya’s political system</h2>
              
              <p className="govuk-body">
                Kenya is a sovereign, multi-party democratic republic governed by the Constitution of Kenya 2010. 
                Power is exercised through transparent, accountable, and participatory institutions.
              </p>

              <ul className="govuk-list govuk-list--bullet govuk-!-margin-top-6">
                <li>Multi-party system with regular general elections every five years</li>
                <li>Devolved system of government with 47 county governments</li>
                <li>Strong provisions for public participation in governance</li>
                <li>Independent institutions including IEBC, ORPP, and anti-corruption bodies</li>
              </ul>
            </div>

            {/* Sidebar */}
            <div className="govuk-grid-column-one-third">
              <div className="govuk-inset-text">
                <h3 className="govuk-heading-s">Related information</h3>
                <ul className="govuk-list govuk-list--spaced">
                  <li><Link href="/constitution" className="govuk-link">Constitution of Kenya</Link></li>
                  <li><Link href="/institutions" className="govuk-link">Government Institutions</Link></li>
                  <li><Link href="/counties" className="govuk-link">County Governments</Link></li>
                  <li><Link href="/laws" className="govuk-link">Laws of Kenya</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <LastUpdated published="2026-05-19" lastUpdated="2026-05-19" />

        <GovUKFeedback />
      </main>
    </div>
  );
}