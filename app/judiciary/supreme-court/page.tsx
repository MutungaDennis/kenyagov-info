import Link from "next/link";
//import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function SupremeCourtPage() {
  return (
    <div className="govuk-width-container">
      {/* <GovUKBackLink href="/judiciary" /> */}

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Judiciary", href: "/judiciary" },
          { text: "Supreme Court", href: "/judiciary/supreme-court" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Supreme Court of Kenya</h1>
            <p className="govuk-body-l">
              The apex court of the Republic of Kenya and the final interpreter of the Constitution. 
              Established under Article 163 of the Constitution of Kenya 2010.
            </p>

            <div className="govuk-inset-text">
              &ldquo;The Supreme Court shall be the final arbiter of the Constitution&rdquo; — Article 163(3)
            </div>

            {/* Current Leadership */}
            <h2 className="govuk-heading-l">Current Leadership (2026)</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li><strong>Chief Justice &amp; President of the Supreme Court</strong><br />
                Hon. Lady Justice Martha Koome, EGH</li>
              <li><strong>Deputy Chief Justice &amp; Vice President</strong><br />
                Hon. Lady Justice Philomena Mbete Mwilu, EGH</li>
            </ul>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">Jurisdiction</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li><strong>Exclusive Original Jurisdiction</strong> – Presidential election petitions</li>
              <li><strong>Appellate Jurisdiction</strong> – Constitutional matters and issues of general public importance</li>
              <li><strong>Advisory Jurisdiction</strong> – Gives legal opinions to the national and county governments</li>
            </ul>

            {/* Landmark Cases - New Rich Section */}
            <h2 className="govuk-heading-l govuk-!-margin-top-9">Landmark Cases</h2>
            <p className="govuk-body">The Supreme Court has delivered several historic judgments that have shaped Kenya’s democracy.</p>

            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Raila Odinga &amp; Another v IEBC &amp; 2 Others (2017)</span>
              </summary>
              <div className="govuk-details__text">
                <p><strong>Most famous ruling.</strong> The Court annulled the 2017 presidential election — the first time in Africa an election was nullified by a court. The Court cited massive irregularities and illegalities.</p>
              </div>
            </details>

            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Kenya National Commission on Human Rights v Attorney General (2014)</span>
              </summary>
              <div className="govuk-details__text">
                <p>Landmark decision on socio-economic rights. The Court affirmed that the Bill of Rights is justiciable and enforceable.</p>
              </div>
            </details>

            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Communications Commission of Kenya &amp; 5 Others v Royal Media Services Ltd (2014)</span>
              </summary>
              <div className="govuk-details__text">
                <p>Defined the scope of freedom of expression and media rights in the digital age.</p>
              </div>
            </details>

            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Trusted Society of Human Rights Alliance v Attorney General (2012)</span>
              </summary>
              <div className="govuk-details__text">
                <p>One of the earliest Supreme Court cases. Strengthened the independence of the Judiciary and clarified transitional constitutional matters.</p>
              </div>
            </details>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">Key Facts</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>Consists of <strong>7 Judges</strong> (Chief Justice + Deputy Chief Justice + 5 others)</li>
              <li>Decisions are binding on all other courts in Kenya</li>
              <li>Sits at the Supreme Court Building along Kenyatta Avenue, Nairobi</li>
              <li>Established in 2011 following the promulgation of the 2010 Constitution</li>
            </ul>

            <p className="govuk-body govuk-!-margin-top-9">
              <Link href="/judiciary" className="govuk-link">← Back to Judiciary Overview</Link>
            </p>

            <GovUKFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}