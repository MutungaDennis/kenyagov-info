import Link from "next/link";
//import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function HelpPage() {
  return (
    <div className="govuk-width-container">
      {/* <GovUKBackLink href="/" /> */}

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Help", href: "/help" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Help</h1>
            <p className="govuk-body-l">
              How to get the most out of KenyaGovInfo.KE
            </p>
          </div>
        </div>

        <div className="govuk-grid-row govuk-!-margin-top-9">
          <div className="govuk-grid-column-two-thirds">

            <h2 className="govuk-heading-l">What is KenyaGovInfo.KE?</h2>
            <p className="govuk-body">
              We are an independent platform that brings together information about Kenyan government 
              institutions, services, and public leaders in one simple, easy-to-use place.
            </p>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">How to use this website</h2>
            
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-half">
                <h3 className="govuk-heading-m">1. Find Services</h3>
                <p className="govuk-body">Go to <Link href="/services" className="govuk-link">Services</Link> to see the most common government services and where to apply for them (mostly on eCitizen).</p>
              </div>
              <div className="govuk-grid-column-one-half">
                <h3 className="govuk-heading-m">2. Understand Government Structure</h3>
                <p className="govuk-body">Browse <Link href="/executive" className="govuk-link">Executive</Link>, <Link href="/legislature" className="govuk-link">Legislature</Link>, <Link href="/judiciary" className="govuk-link">Judiciary</Link>, and <Link href="/counties" className="govuk-link">Counties</Link>.</p>
              </div>
            </div>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Frequently Asked Questions</h2>

            <div className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Is this an official government website?</span>
              </summary>
              <div className="govuk-details__text">
                No. KenyaGovInfo.KE is completely independent. We are not part of the Government of Kenya.
              </div>
            </div>

            <div className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Why can’t I apply for services here?</span>
              </summary>
              <div className="govuk-details__text">
                This website only provides information. Actual applications and payments are done on the official <a href="https://www.ecitizen.go.ke" target="_blank" className="govuk-link">eCitizen Portal</a>.
              </div>
            </div>

            <div className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">How accurate is the information?</span>
              </summary>
              <div className="govuk-details__text">
                We compile information from official public sources. However, always verify with the relevant government institution or eCitizen for the latest details.
              </div>
            </div>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Still need help?</h2>
            <p className="govuk-body">
              If you can’t find what you’re looking for, you can:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>Use the search bar at the top of the website</li>
              <li><Link href="/contact" className="govuk-link">Contact us</Link> with your question</li>
              <li>Visit the official <a href="https://www.ecitizen.go.ke" target="_blank" className="govuk-link">eCitizen Portal</a></li>
            </ul>

          </div>
        </div>

        <GovUKFeedback />
      </main>
    </div>
  );
}