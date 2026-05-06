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
              The core policy-making and administrative arms of the Government of Kenya. 
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

                    {ministry.regulatory && (
                      <>
                        <h4 className="govuk-heading-s">Regulatory Bodies</h4>
                        <ul className="govuk-list">
                          {ministry.regulatory.map((entity, i) => (
                            <li key={i}>{entity}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    {ministry.councils && (
                      <>
                        <h4 className="govuk-heading-s">Councils</h4>
                        <ul className="govuk-list">
                          {ministry.councils.map((entity, i) => (
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

// Full list of Ministries with rich data for Health, Agriculture & Treasury
const ministries = [
  {
    slug: "health",
    name: "Health",
    cs: "Hon. Susan Nakhumicha",
    description: "Responsible for national health policy, Universal Health Coverage, disease control and medical services.",
    keyEntities: [
      "Kenyatta National Teaching and Referral Hospital (KNH)",
      "Kenya Biovax Institute",
      "Kenya Medical Research Institute (KEMRI)",
      "Kenya Medical Supplies Authority (KEMSA)",
      "Kenya Medical Training College (KMTC)",
      "Kenyatta University Teaching, Research & Referral Hospital (KUTRRH)",
      "Mathari National Teaching and Referral Hospital",
      "Moi Teaching and Referral Hospital (MTRH)",
      "National Health Insurance Fund (NHIF)",
      "National Cancer Institute (NCI)"
    ],
    regulatory: [
      "Pharmacy and Poisons Board",
      "Kenya Medical Laboratories Technicians & Technologists Board",
      "Kenya Nuclear Regulatory Authority (KENRA)",
      "National Quality Control Laboratories (NQCL)"
    ],
    councils: [
      "Kenya Medical Practitioners and Dentists Council (KMPDC)",
      "Nursing Council of Kenya",
      "Clinical Officers Council",
      "National Syndemic Diseases Control Council"
    ]
  },
  {
    slug: "agriculture",
    name: "Agriculture and Livestock Development",
    cs: "Hon. Mutahi Kagwe",
    description: "Ensures food security, agricultural productivity, crop and livestock development.",
    keyEntities: [
      "Agriculture and Food Authority (AFA)",
      "Kenya Agricultural and Livestock Research Organization (KALRO)",
      "Kenya Plant Health Inspectorate Service (KEPHIS)",
      "National Cereals and Produce Board",
      "Agricultural Finance Corporation",
      "Kenya Seed Company",
      "Tea Board of Kenya"
    ]
  },
  {
    slug: "treasury",
    name: "National Treasury and Economic Planning",
    cs: "Hon. John Mbadi",
    description: "Manages public finance, national budget, economic policy and fiscal strategy.",
    keyEntities: [
      "Kenya Revenue Authority (KRA)",
      "Central Bank of Kenya (CBK)",
      "Capital Markets Authority (CMA)",
      "Competition Authority of Kenya",
      "Public Procurement Regulatory Authority (PPRA)",
      "Retirement Benefits Authority",
      "Insurance Regulatory Authority",
      "Kenya Investments Authority",
      "Financial Reporting Centre",
      "Privatisation Commission"
    ]
  },

  // Other Ministries (shorter version)
  {
    slug: "defence",
    name: "Defence",
    cs: "Hon. Soipan Tuya",
    description: "Oversees national defence, military operations and security policy.",
    keyEntities: ["Kenya Defence Forces", "National Defence College"]
  },
  {
    slug: "education",
    name: "Education",
    cs: "Hon. Julius Migos Ogamba",
    description: "Responsible for basic education, higher education, TVET and curriculum development.",
    keyEntities: ["Kenya National Examinations Council", "Universities", "KMTC"]
  },
  {
    slug: "energy",
    name: "Energy and Petroleum",
    cs: "Hon. Opiyo Wandayi",
    description: "Manages electricity, petroleum, renewable energy and power generation.",
    keyEntities: ["Kenya Power", "KenGen", "EPRA"]
  },
  // ... you can continue adding the rest
  {
    slug: "foreign",
    name: "Foreign and Diaspora Affairs",
    cs: "Hon. Musalia Mudavadi",
    description: "Handles Kenya’s foreign policy, international relations and diaspora engagement.",
    keyEntities: []
  },
  // Add remaining ministries here as needed
];