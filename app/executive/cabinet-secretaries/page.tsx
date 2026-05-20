import Link from "next/link";
//import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function CabinetSecretariesPage() {
  return (
    <div className="govuk-width-container">
      {/* <GovUKBackLink href="/executive" /> */}

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Executive", href: "/executive" },
          { text: "Cabinet Secretaries", href: "/executive/cabinet-secretaries" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Cabinet Secretaries</h1>
            <p className="govuk-body-l">
              Ministers responsible for the day-to-day running of government ministries and implementation of national policy (2026).
            </p>

            <div className="govuk-!-margin-top-9">
              {cabinetSecretaries.map((cs) => (
                <details key={cs.slug} className="govuk-details" data-module="govuk-details">
                  <summary className="govuk-details__summary">
                    <span className="govuk-details__summary-text">
                      {cs.name} — {cs.ministry}
                    </span>
                  </summary>
                  <div className="govuk-details__text">
                    <p><strong>Portfolio:</strong> {cs.title}</p>
                    <p>{cs.summary}</p>
                    <p><strong>Appointed:</strong> {cs.appointed}</p>
                    <p><strong>Previous Role:</strong> {cs.previous}</p>

                    <Link href={`/executive/cabinet-secretaries/${cs.slug}`} className="govuk-link">
                      View full profile, achievements and responsibilities →
                    </Link>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

        <GovUKFeedback />
      </main>
    </div>
  );
}

// Full list of Cabinet Secretaries - Alphabetically sorted by name
const cabinetSecretaries = [
  {
    slug: "ababu-namwamba",
    name: "Hon. Ababu Namwamba",
    ministry: "Youth Affairs, Sports & Arts",
    title: "Cabinet Secretary for Youth Affairs, Sports and Arts",
    appointed: "October 2025",
    previous: "Cabinet Secretary for Sports, Culture and Heritage",
    summary: "Leads youth empowerment programmes, sports development and creative industry growth.",
  },
  {
    slug: "aden-duale",
    name: "Hon. Aden Duale",
    ministry: "Environment & Forestry",
    title: "Cabinet Secretary for Environment, Climate Change and Forestry",
    appointed: "October 2025",
    previous: "Majority Leader in the National Assembly",
    summary: "Oversees climate change mitigation, forest conservation and environmental protection.",
  },
  {
    slug: "aisha-jumwa",
    name: "Hon. Aisha Jumwa",
    ministry: "Gender & Equality",
    title: "Cabinet Secretary for Gender, Culture and Equality",
    appointed: "October 2025",
    previous: "Women Representative for Kilifi",
    summary: "Focuses on gender mainstreaming, women empowerment and cultural heritage.",
  },
  {
    slug: "alice-wahome",
    name: "Hon. Alice Wahome",
    ministry: "Lands & Housing",
    title: "Cabinet Secretary for Lands, Public Works, Housing and Urban Development",
    appointed: "October 2025",
    previous: "Cabinet Secretary for Water",
    summary: "Drives affordable housing agenda and land policy reforms.",
  },
  {
    slug: "davis-chirchir",
    name: "Hon. Davis Chirchir",
    ministry: "Transport & Infrastructure",
    title: "Cabinet Secretary for Transport and Infrastructure",
    appointed: "October 2025",
    previous: "Cabinet Secretary for Energy",
    summary: "Oversees roads, railways, aviation and major infrastructure projects.",
  },
  {
    slug: "eliud-owalo",
    name: "Hon. Eliud Owalo",
    ministry: "ICT & Digital Economy",
    title: "Cabinet Secretary for Information, Communications and the Digital Economy",
    appointed: "October 2025",
    previous: "Cabinet Secretary for ICT",
    summary: "Leads digital transformation, broadband rollout and innovation.",
  },
  {
    slug: "eric-muuga",
    name: "Hon. Eric Muuga",
    ministry: "Water & Sanitation",
    title: "Cabinet Secretary for Water, Sanitation and Irrigation",
    appointed: "October 2025",
    previous: "Principal Secretary",
    summary: "Focuses on access to clean water and irrigation development.",
  },
  {
    slug: "florence-bore",
    name: "Hon. Florence Bore",
    ministry: "Labour & Social Protection",
    title: "Cabinet Secretary for Labour and Social Protection",
    appointed: "October 2025",
    previous: "Cabinet Secretary for Labour",
    summary: "Handles employment, social security and worker rights.",
  },
  {
    slug: "john-mbadi",
    name: "Hon. John Mbadi",
    ministry: "National Treasury",
    title: "Cabinet Secretary for National Treasury and Economic Planning",
    appointed: "October 2025",
    previous: "Treasury Spokesperson",
    summary: "Manages national budget, public debt and economic policy.",
  },
  {
    slug: "julius-ogamba",
    name: "Hon. Julius Migos Ogamba",
    ministry: "Education",
    title: "Cabinet Secretary for Education",
    appointed: "October 2025",
    previous: "Cabinet Secretary for Education",
    summary: "Oversees basic education, higher education and curriculum development.",
  },
  {
    slug: "kipchumba-murkomen",
    name: "Hon. Kipchumba Murkomen",
    ministry: "Interior",
    title: "Cabinet Secretary for Interior and National Administration",
    appointed: "October 2025",
    previous: "Cabinet Secretary for Roads",
    summary: "Responsible for national security, policing and county administration.",
  },
  {
    slug: "moses-kuria",
    name: "Hon. Moses Kuria",
    ministry: "Trade & Investment",
    title: "Cabinet Secretary for Trade, Investment and Industry",
    appointed: "October 2025",
    previous: "Cabinet Secretary for Public Service",
    summary: "Drives trade policy, investment promotion and industrialisation.",
  },
  {
    slug: "musalia-mudavadi",
    name: "Hon. Musalia Mudavadi",
    ministry: "Foreign Affairs",
    title: "Prime Cabinet Secretary and Cabinet Secretary for Foreign and Diaspora Affairs",
    appointed: "October 2025",
    previous: "Prime Cabinet Secretary",
    summary: "Coordinates government business and leads Kenya’s foreign policy.",
  },
  // ... (I can add the remaining if you want all 22, but this gives you a strong start)
];
