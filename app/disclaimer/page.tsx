import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Important information about CitizenGuide.KE, its independence, the information it publishes and how that information should be used.",
};

export default function DisclaimerPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Disclaimer" },
        ]}
        title="Disclaimer"
        lead="Important information about CitizenGuide.KE, the information we publish and how you should use it."
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-warning-text">
            <span
              className="govuk-warning-text__icon"
              aria-hidden="true"
            >
              !
            </span>

            <strong className="govuk-warning-text__text">
              <span className="govuk-visually-hidden">
                Important
              </span>
              CitizenGuide.KE is an independent website. It is not a
              Government of Kenya website and does not represent any national
              or county government institution.
            </strong>
          </div>

          <h2 className="govuk-heading-l">
            About CitizenGuide.KE
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE is an independent civic information platform.
          </p>

          <p className="govuk-body">
            We help people find and understand information about Kenya&apos;s
            government, public institutions, leaders, laws, public services and
            other civic matters.
          </p>

          <p className="govuk-body">
            We organise information from publicly available sources, including
            legislation, the Kenya Gazette, parliamentary records, official
            government websites and publications from public bodies.
          </p>

          <h2 className="govuk-heading-l">
            We are not a government service
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE does not provide or administer government services.
          </p>

          <p className="govuk-body">
            We do not:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>process government applications</li>
            <li>issue licences, permits, certificates or official documents</li>
            <li>collect taxes, fees, fines or other government payments</li>
            <li>make decisions on behalf of a public body</li>
            <li>speak on behalf of the Government of Kenya</li>
            <li>speak on behalf of a county government or public institution</li>
            <li>provide legal, tax, immigration or financial advice</li>
          </ul>

          <div className="govuk-inset-text">
            If you need to apply for a government service, make a payment or
            obtain an official record, use the system or office authorised by
            the responsible public body.
          </div>

          <p className="govuk-body">
            CitizenGuide.KE may explain how a service works and direct you to
            the appropriate official service. You can use our{" "}
            <Link href="/services" className="govuk-link">
              service guides
            </Link>
            ,{" "}
            <Link href="/ecitizen" className="govuk-link">
              eCitizen guide
            </Link>{" "}
            or{" "}
            <Link href="/huduma-centres" className="govuk-link">
              Huduma Centre directory
            </Link>{" "}
            as a starting point.
          </p>

          <h2 className="govuk-heading-l">
            Accuracy of information
          </h2>

          <p className="govuk-body">
            We aim to publish information that is accurate, clear and based on
            reliable public sources.
          </p>

          <p className="govuk-body">
            Government information can change. This includes laws, regulations,
            office holders, procedures, forms, fees, deadlines, contact details
            and service requirements.
          </p>

          <p className="govuk-body">
            There may be a delay between an official change and an update to
            CitizenGuide.KE.
          </p>

          <div className="govuk-inset-text">
            For information that affects an application, payment, deadline,
            legal obligation or other important decision, check the latest
            information with the responsible public body.
          </div>

          <h2 className="govuk-heading-l">
            Errors and corrections
          </h2>

          <p className="govuk-body">
            We take reasonable steps to check the information we publish, but
            errors or omissions can occur.
          </p>

          <p className="govuk-body">
            If you believe information on CitizenGuide.KE is incorrect,
            incomplete or out of date, you can{" "}
            <Link href="/corrections" className="govuk-link">
              report a correction
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">
            General information only
          </h2>

          <p className="govuk-body">
            Information on CitizenGuide.KE is provided for general civic and
            informational purposes.
          </p>

          <p className="govuk-body">
            It should not be treated as legal, financial, tax, immigration or
            other professional advice. Where professional advice is required,
            you should seek advice from an appropriately qualified person or
            contact the responsible public body.
          </p>

          <h2 className="govuk-heading-l">
            External websites
          </h2>

          <p className="govuk-body">
            We link to government websites and other external sources to help
            you find official services and supporting information.
          </p>

          <p className="govuk-body">
            We do not control external websites and
            are not responsible for their content, availability, security,
            accessibility or privacy practices.
          </p>

          <p className="govuk-body">
            Linking to an external website does not necessarily mean that
            CitizenGuide.KE endorses that website, organisation, product or
            service.
          </p>

          <h2 className="govuk-heading-l">
            Your responsibility
          </h2>

          <p className="govuk-body">
            You are responsible for checking information before relying on it
            for an important decision or official transaction.
          </p>

          <p className="govuk-body">
            Our{" "}
            <Link href="/terms" className="govuk-link">
              terms and conditions
            </Link>{" "}
            explain the terms that apply when you use CitizenGuide.KE.
          </p>
        </div>

        <RelatedNav
          links={[
            { text: "About this website", href: "/about" },
            { text: "Editorial policy", href: "/editorial-policy" },
            { text: "Corrections", href: "/corrections" },
            { text: "Terms and conditions", href: "/terms" },
            { text: "Copyright and content notices", href: "/copyright" },
            { text: "Contact this website", href: "/contact" },
          ]}
        />
      </div>
    </>
  );
}
