import Link from "next/link";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function AccessibilityPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Accessibility", href: "/accessibility" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Accessibility Statement</h1>
            
            <p className="govuk-body-l">
              KenyaGovInfo.KE is committed to making this website accessible to as many people as possible.
            </p>

            <div className="govuk-panel govuk-panel--info">
              <h2 className="govuk-panel__title">Accessibility commitment</h2>
              <p className="govuk-body">
                This website aims to meet <strong>WCAG 2.2 Level AA</strong> accessibility standards.
              </p>
            </div>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">How accessible this website is</h2>
            <p className="govuk-body">
              We have designed this website using the official <strong>GOV.UK Frontend</strong> design system, 
              which is built with accessibility in mind. Most of the site should be accessible to users of assistive technologies.
            </p>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">What we do to make this site accessible</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>Using semantic HTML and proper heading structure</li>
              <li>Ensuring sufficient colour contrast for text and background</li>
              <li>Making the site keyboard navigable</li>
              <li>Providing clear and descriptive link text</li>
              <li>Using the GOV.UK design system which has been extensively tested for accessibility</li>
              <li>Ensuring forms and interactive elements are properly labelled</li>
            </ul>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Limitations</h2>
            <p className="govuk-body">
              While we strive for full accessibility, some limitations may still exist:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>Some older PDF documents may not be fully accessible</li>
              <li>Dynamic content (such as filters on data tables) may have minor issues for screen reader users</li>
              <li>Third-party links (e.g. eCitizen) are outside our control</li>
            </ul>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Requesting alternative formats</h2>
            <p className="govuk-body">
              If you need information in a different format (e.g. large print, braille, easy read, or audio), 
              please <Link href="/contact" className="govuk-link">contact us</Link> and we will do our best to help.
            </p>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Feedback and contact</h2>
            <p className="govuk-body">
              If you find any accessibility problems on this website, or if you need any help using it, 
              please let us know. Your feedback helps us improve.
            </p>
            <p className="govuk-body">
              <Link href="/contact" className="govuk-link">Contact us about accessibility</Link>
            </p>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Technical information</h2>
            <p className="govuk-body">
              This website runs on Next.js and uses the official GOV.UK Frontend library. 
              It has been tested with modern screen readers (NVDA, VoiceOver) and major browsers.
            </p>

            <GovUKFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}