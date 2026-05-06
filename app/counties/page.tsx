import Link from "next/link";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function CountiesPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Counties", href: "/counties" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Counties of Kenya</h1>
            <p className="govuk-body-l">
              Kenya has <strong>47 counties</strong> established under the Constitution of Kenya 2010 as the units of devolved government. 
              Devolution brought decision-making closer to the people and improved service delivery in health, agriculture, roads, and water.
            </p>

            <div className="govuk-inset-text">
              Devolution is one of the most transformative provisions of the 2010 Constitution.
            </div>

            {/* Quick Facts */}
            <div className="govuk-grid-row govuk-!-margin-top-9">
              <div className="govuk-grid-column-one-third">
                <h3 className="govuk-heading-s">47 Counties</h3>
                <p className="govuk-body-s">One in each former district area</p>
              </div>
              <div className="govuk-grid-column-one-third">
                <h3 className="govuk-heading-s">47 Governors</h3>
                <p className="govuk-body-s">Elected every 5 years</p>
              </div>
              <div className="govuk-grid-column-one-third">
                <h3 className="govuk-heading-s">2010 Constitution</h3>
                <p className="govuk-body-s">Chapter 11 – Devolved Government</p>
              </div>
            </div>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">What Devolution Means</h2>
            <p className="govuk-body">
              Devolution transferred significant powers, functions, and resources from the national government to the 47 counties. 
              Counties are now responsible for key services including:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>Health services (county hospitals, dispensaries)</li>
              <li>Agriculture, livestock, and fisheries</li>
              <li>County roads and transport</li>
              <li>Pre-primary education and village polytechnics</li>
              <li>Water and sanitation</li>
              <li>Trade development and regulation</li>
              <li>County planning and development</li>
            </ul>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">Explore the 47 Counties</h2>
            <p className="govuk-body">
              Each county has its own governor, county assembly, and unique opportunities and challenges.
            </p>

            <div className="govuk-grid-row govuk-!-margin-top-6">
              <div className="govuk-grid-column-one-half">
                <Link href="/counties/all-counties" className="govuk-button">
                  View All 47 Counties
                </Link>
              </div>
              <div className="govuk-grid-column-one-half">
                <Link href="/counties/governors" className="govuk-button govuk-button--secondary">
                  List of Current Governors
                </Link>
              </div>
            </div>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">Key Achievements of Devolution</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>Significant improvement in access to healthcare and clean water</li>
              <li>Increased investment in rural roads and markets</li>
              <li>More responsive local governance</li>
              <li>Equitable sharing of national resources</li>
            </ul>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">Learn More</h2>
            <ul className="govuk-list">
              <li><Link href="/counties/devolution" className="govuk-link">Understanding Devolution in Kenya</Link></li>
              <li><Link href="/counties/performance" className="govuk-link">County Performance &amp; Rankings</Link></li>
            </ul>

            <GovUKFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}