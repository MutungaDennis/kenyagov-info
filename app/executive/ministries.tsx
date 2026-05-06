import Link from "next/link";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function MinistriesPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/executive" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Executive", href: "/executive" },
          { text: "Ministries", href: "/executive/ministries" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Ministries of Kenya</h1>
            <p className="govuk-body-l">
              The core policy and administrative arms of the Government of Kenya. 
              Each ministry is headed by a Cabinet Secretary.
            </p>

            <div className="govuk-!-margin-top-9">
              {ministries.map((ministry) => (
                <details key={ministry.slug} className="govuk-details" data-module="govuk-details">
                  <summary className="govuk-details__summary">
                    <span className="govuk-details__summary-text">
                      Ministry of {ministry.name}
                    </span>
                  </summary>
                  <div className="govuk-details__text">
                    <p><strong>Cabinet Secretary:</strong> {ministry.cs}</p>
                    <p>{ministry.description}</p>

                    {ministry.keyEntities && (
                      <>
                        <h4 className="govuk-heading-s">Key Institutions &amp; SAGAs</h4>
                        <ul className="govuk-list">
                          {ministry.keyEntities.map((entity, i) => (
                            <li key={i}>{entity}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    <Link href={`/executive/ministries/${ministry.slug}`} className="govuk-link">
                      View full structure, State Departments and all institutions →
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

// Full list of Ministries
const ministries = [
  {
    slug: "agriculture",
    name: "Agriculture and Livestock Development",
    cs: "Hon. Mutahi Kagwe",
    description: "Ensures food security, agricultural productivity and livestock development.",
    keyEntities: ["Agriculture and Food Authority (AFA)", "KALRO", "KEPHIS", "National Cereals and Produce Board"],
  },
  {
    slug: "defence",
    name: "Defence",
    cs: "Hon. Soipan Tuya",
    description: "Oversees national defence, military operations and security policy.",
    keyEntities: ["Kenya Defence Forces", "National Defence College"],
  },
  {
    slug: "education",
    name: "Education",
    cs: "Hon. Julius Migos Ogamba",
    description: "Responsible for basic education, higher education, TVET and curriculum development.",
    keyEntities: ["Kenya National Examinations Council", "Universities", "KMTC"],
  },
  {
    slug: "energy",
    name: "Energy and Petroleum",
    cs: "Hon. Opiyo Wandayi",
    description: "Manages electricity, petroleum, renewable energy and power generation.",
    keyEntities: ["Kenya Power", "KenGen", "EPRA"],
  },
  {
    slug: "environment",
    name: "Environment, Climate Change and Forestry",
    cs: "Hon. Aden Duale",
    description: "Leads climate action, forest conservation and environmental protection.",
    keyEntities: ["Kenya Forestry Service", "National Environment Management Authority (NEMA)"],
  },
  {
    slug: "foreign",
    name: "Foreign and Diaspora Affairs",
    cs: "Hon. Musalia Mudavadi",
    description: "Handles Kenya’s foreign policy, international relations and diaspora engagement.",
    keyEntities: ["Kenya High Commissions and Embassies"],
  },
  {
    slug: "gender",
    name: "Gender, Culture and Equality",
    cs: "Hon. Aisha Jumwa",
    description: "Promotes gender equality, culture and social inclusion.",
    keyEntities: [],
  },
  {
    slug: "health",
    name: "Health",
    cs: "Hon. Susan Nakhumicha",
    description: "Leads national health policy, Universal Health Coverage and medical services.",
    keyEntities: ["KNH", "KEMSA", "KEMRI", "NHIF", "KMTC"],
  },
  {
    slug: "ict",
    name: "Information, Communications and the Digital Economy",
    cs: "Hon. Eliud Owalo",
    description: "Drives digital transformation, broadband and innovation.",
    keyEntities: ["Communications Authority of Kenya (CA)"],
  },
  {
    slug: "interior",
    name: "Interior and National Administration",
    cs: "Hon. Kipchumba Murkomen",
    description: "Responsible for national security, policing and county administration.",
    keyEntities: ["National Police Service"],
  },
  {
    slug: "lands",
    name: "Lands, Public Works, Housing and Urban Development",
    cs: "Hon. Alice Wahome",
    description: "Manages land policy, housing and urban planning.",
    keyEntities: ["National Land Commission"],
  },
  {
    slug: "labour",
    name: "Labour and Social Protection",
    cs: "Hon. Florence Bore",
    description: "Handles employment, worker rights and social security.",
    keyEntities: [],
  },
  {
    slug: "trade",
    name: "Trade, Investment and Industry",
    cs: "Hon. Moses Kuria",
    description: "Promotes trade, investment and industrial growth.",
    keyEntities: [],
  },
  {
    slug: "transport",
    name: "Transport and Infrastructure",
    cs: "Hon. Davis Chirchir",
    description: "Oversees roads, railways, aviation and ports.",
    keyEntities: ["Kenya Ports Authority", "Kenya Railways"],
  },
  {
    slug: "treasury",
    name: "National Treasury and Economic Planning",
    cs: "Hon. John Mbadi",
    description: "Manages public finance, budget and economic policy.",
    keyEntities: ["Kenya Revenue Authority (KRA)", "Central Bank of Kenya"],
  },
  {
    slug: "water",
    name: "Water, Sanitation and Irrigation",
    cs: "Hon. Eric Muuga",
    description: "Ensures access to clean water and irrigation development.",
    keyEntities: [],
  },
  // Add remaining ministries as needed
  {
    slug: "youth",
    name: "Youth Affairs, Sports and Arts",
    cs: "Hon. Ababu Namwamba",
    description: "Youth empowerment, sports development and creative economy.",
    keyEntities: [],
  },
];