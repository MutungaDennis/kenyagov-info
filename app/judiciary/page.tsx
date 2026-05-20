import Link from "next/link";
//import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function JudiciaryPage() {
  return (
    <div className="govuk-width-container">
      {/* <GovUKBackLink href="/legislature" /> */}

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Legislature", href: "/legislature" },
          { text: "Judiciary", href: "/judiciary" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">The Judiciary of Kenya</h1>
            <p className="govuk-body-l">
              The Judiciary is one of the three independent arms of government under Chapter 10 of the Constitution of Kenya 2010. 
              It interprets the law, protects the Constitution, and delivers justice to all Kenyans.
            </p>

            <div className="govuk-inset-text">
              Justice Be Our Shield and Defender
            </div>

            {/* Quick Overview */}
            <div className="govuk-grid-row govuk-!-margin-top-9 govuk-!-margin-bottom-9">
              <div className="govuk-grid-column-one-third">
                <strong>Superior Courts</strong><br />5 courts
              </div>
              <div className="govuk-grid-column-one-third">
                <strong>Subordinate Courts</strong><br />Magistrates, Kadhis &amp; Tribunals
              </div>
              <div className="govuk-grid-column-one-third">
                <strong>Leadership</strong><br />Chief Justice
              </div>
            </div>

            {/* Superior Courts */}
            <h2 className="govuk-heading-l">Superior Courts</h2>

            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Supreme Court</span>
              </summary>
              <div className="govuk-details__text">
                Highest court in Kenya. Final interpreter of the Constitution. Handles presidential election disputes and matters of general public importance.
              </div>
            </details>

            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Court of Appeal</span>
              </summary>
              <div className="govuk-details__text">
                Hears appeals from the High Court and other superior courts.
              </div>
            </details>

            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">High Court</span>
              </summary>
              <div className="govuk-details__text">
                Unlimited original jurisdiction in civil and criminal matters. Supervisory role over subordinate courts.
              </div>
            </details>

            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Employment &amp; Labour Relations Court (ELRC)</span>
              </summary>
              <div className="govuk-details__text">
                Specialised court handling all employment and labour disputes.
              </div>
            </details>

            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Environment &amp; Land Court (ELC)</span>
              </summary>
              <div className="govuk-details__text">
                Specialised court for land, environment, and natural resources matters.
              </div>
            </details>

            {/* Subordinate Courts */}
            <h2 className="govuk-heading-l govuk-!-margin-top-9">Subordinate Courts</h2>

            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Magistrates’ Courts</span>
              </summary>
              <div className="govuk-details__text">
                Handle the majority of criminal and civil cases across Kenya.
              </div>
            </details>

            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Kadhis’ Courts</span>
              </summary>
              <div className="govuk-details__text">
                Deal with Muslim personal law (marriage, divorce, inheritance).
              </div>
            </details>

            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Small Claims Court &amp; Tribunals</span>
              </summary>
              <div className="govuk-details__text">
                Fast-track resolution for minor disputes and specialised matters.
              </div>
            </details>

            {/* New Enhanced Administrative Section */}
            <h2 className="govuk-heading-l govuk-!-margin-top-9">Administration &amp; Leadership</h2>

            <details className="govuk-details" data-module="govuk-details" open>
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Key Administrative Offices</span>
              </summary>
              <div className="govuk-details__text">
                <ul className="govuk-list govuk-list--bullet">
                  <li><strong>Office of the Chief Justice</strong></li>
                  <li><strong>Office of the Deputy Chief Justice</strong></li>
                  <li><strong>Office of the Chief Registrar of Judiciary</strong></li>
                  <li><strong>Office of the President of the Court of Appeal</strong></li>
                  <li><strong>Office of the Principal Judge of the High Court</strong></li>
                  <li><strong>Office of the Principal Judge, ELRC</strong></li>
                  <li><strong>Office of the Presiding Judge, ELC</strong></li>
                  <li><strong>Chief of Staff, Office of the Chief Justice</strong></li>
                  <li><strong>Office of the Judiciary Ombudsman</strong></li>
                </ul>
              </div>
            </details>

            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Office of Registrars</span>
              </summary>
              <div className="govuk-details__text">
                <ul className="govuk-list govuk-list--bullet">
                  <li>Registrar, Supreme Court</li>
                  <li>Registrar, Court of Appeal</li>
                  <li>Registrar, High Court</li>
                  <li>Registrar, Employment &amp; Labour Relations Court</li>
                  <li>Registrar, Environment &amp; Land Court</li>
                  <li>Registrar, Magistrates’ Courts</li>
                  <li>Registrar, Small Claims Court</li>
                  <li>Registrar, Tribunals</li>
                  <li>Registrar, Court Annexed Mediation</li>
                  <li>Registrar, Kenya Judiciary Academy</li>
                </ul>
              </div>
            </details>

            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Directorates &amp; Support Units</span>
              </summary>
              <div className="govuk-details__text">
                <ul className="govuk-list govuk-list--bullet">
                  <li>Directorate of Human Resource Management &amp; Development</li>
                  <li>Directorate of Planning &amp; Organisational Performance</li>
                  <li>Directorate of ICT</li>
                  <li>Directorate of Finance &amp; Accounts</li>
                  <li>Directorate of Supply Chain Management</li>
                  <li>Directorate of Public Affairs &amp; Communication</li>
                  <li>Directorate of Administration &amp; Security Services</li>
                  <li>Department of Construction &amp; Maintenance Works</li>
                  <li>Information &amp; Record Management Unit</li>
                </ul>
              </div>
            </details>

            <p className="govuk-body govuk-!-margin-top-6">
              <Link href="/judiciary/administration" className="govuk-link">
                View detailed administration and leadership structure →
              </Link>
            </p>

            <p className="govuk-body govuk-!-margin-top-9">
              <Link href="/judiciary/appeals-process" className="govuk-link">
                Understand the appeals process from Magistrates’ Court to Supreme Court →
              </Link>
            </p>
          </div>
        </div>

        <GovUKFeedback />
      </main>
    </div>
  );
}