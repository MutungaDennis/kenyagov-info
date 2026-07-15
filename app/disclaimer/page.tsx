import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "CitizenGuide.KE is an independent civic information website. It is not the Government of Kenya and does not process official applications.",
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
        lead="Important information about what CitizenGuide.KE is — and is not."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-warning-text">
            <span className="govuk-warning-text__icon" aria-hidden="true">
              !
            </span>
            <strong className="govuk-warning-text__text">
              <span className="govuk-visually-hidden">Warning </span>
              CitizenGuide.KE is not a government website. It is not run,
              funded or endorsed by the Government of Kenya.
            </strong>
          </div>

          <h2 className="govuk-heading-l">Independent information only</h2>
          <p className="govuk-body">
            We publish factual information about Kenyan public institutions,
            leaders, laws and services to help citizens find their way. We
            compile material from public sources such as the Kenya Gazette,
            parliamentary records and official publications.
          </p>
          <p className="govuk-body">We do not:</p>
          <ul className="govuk-list govuk-list--bullet">
            <li>process applications or issue documents</li>
            <li>accept government fees or taxes</li>
            <li>provide legal, tax or immigration advice</li>
            <li>speak on behalf of any ministry, county or commission</li>
          </ul>

          <h2 className="govuk-heading-l">Official transactions</h2>
          <p className="govuk-body">
            For applications, payments and official records, use authorised
            government systems. Start with our{" "}
            <Link href="/ecitizen" className="govuk-link">
              eCitizen guide
            </Link>
            ,{" "}
            <Link href="/huduma-centres" className="govuk-link">
              Huduma Centres
            </Link>
            ,{" "}
            <Link href="/contact-government" className="govuk-link">
              contact government
            </Link>
            , or the official links on individual{" "}
            <Link href="/services" className="govuk-link">
              service guides
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">Accuracy and updates</h2>
          <p className="govuk-body">
            Government structures, fees, forms and office holders change. We
            aim to keep information current, but there can be a delay after
            official announcements. Always confirm critical details with the
            responsible public body.
          </p>
          <p className="govuk-body">
            If you spot an error, use our{" "}
            <Link href="/corrections" className="govuk-link">
              corrections page
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">Liability</h2>
          <p className="govuk-body">
            Content is provided for general information. We are not liable for
            decisions you make based solely on this website, including missed
            deadlines, incorrect fees paid to third parties, or reliance on
            outdated summaries.
          </p>

          <h2 className="govuk-heading-l">External links</h2>
          <p className="govuk-body">
            Links to government and other websites are provided for
            convenience. We do not control those sites and are not responsible
            for their content, availability or privacy practices.
          </p>

          <p className="govuk-body">
            See also our{" "}
            <Link href="/terms" className="govuk-link">
              terms and conditions
            </Link>
            ,{" "}
            <Link href="/privacy" className="govuk-link">
              privacy policy
            </Link>{" "}
            and{" "}
            <Link href="/editorial-policy" className="govuk-link">
              editorial policy
            </Link>
            .
          </p>
        </div>

        <RelatedNav
          links={[
            { text: "About this website", href: "/about" },
            { text: "Editorial policy", href: "/editorial-policy" },
            { text: "Corrections", href: "/corrections" },
            { text: "Terms and conditions", href: "/terms" },
            { text: "Contact this website", href: "/contact" },
          ]}
        />
      </div>
    </>
  );
}
