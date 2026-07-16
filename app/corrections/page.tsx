import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";

export const revalidate = 86400;
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Corrections",
  description:
    "How to report an error on CitizenGuide.KE — wrong names, titles, fees, contacts or outdated information.",
};

export default function CorrectionsPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "About", href: "/about" },
          { text: "Corrections" },
        ]}
        caption="About this website"
        title="Corrections"
        lead="Tell us if something on CitizenGuide.KE is wrong, outdated or missing important context."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-l">What you can report</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>incorrect names, titles or institutions</li>
            <li>outdated office holders after a gazetted change</li>
            <li>wrong fees, documents or steps on a service guide</li>
            <li>broken official links</li>
            <li>missing accessibility information on a page we control</li>
            <li>factual errors in explainers or open data descriptions</li>
          </ul>

          <h2 className="govuk-heading-l">What we need from you</h2>
          <p className="govuk-body">Please include:</p>
          <ul className="govuk-list govuk-list--bullet">
            <li>the page address (URL) or page title</li>
            <li>what is wrong</li>
            <li>what the correct information should be, if you know it</li>
            <li>
              a public source where possible (Gazette notice, official website,
              Hansard, court document)
            </li>
          </ul>

          <h2 className="govuk-heading-l">How to send a correction</h2>
          <ol className="govuk-list govuk-list--number">
            <li>
              Use the{" "}
              <Link href="/contact" className="govuk-link">
                contact form
              </Link>{" "}
              and choose a subject that mentions “correction”, or
            </li>
            <li>
              Use{" "}
              <Link href="/feedback" className="govuk-link">
                feedback
              </Link>{" "}
              and describe the error clearly.
            </li>
          </ol>

          <p className="govuk-body">
            For copyright, logo or formal rights notices from rights holders or
            public bodies, use our{" "}
            <Link href="/copyright" className="govuk-link">
              copyright and content notices
            </Link>{" "}
            process instead of the general contact form when possible.
          </p>

          <div className="govuk-inset-text">
            <p className="govuk-body">
              We cannot change official government records. If your complaint is
              about a ministry decision, a county service, or an official
              application, contact the public body directly — see{" "}
              <Link href="/contact-government" className="govuk-link">
                contact government
              </Link>
              .
            </p>
          </div>

          <h2 className="govuk-heading-l">What happens next</h2>
          <p className="govuk-body">
            We review corrections against public sources. If we verify an error,
            we update the page. We may not reply to every message, but we read
            them.
          </p>
          <p className="govuk-body">
            Urgent safety issues (for example a phishing link that pretends to
            be us) should also be reported via the contact form with “urgent” in
            the subject.
          </p>

          <h2 className="govuk-heading-l">Related policies</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/editorial-policy" className="govuk-link">
                Editorial policy
              </Link>
            </li>
            <li>
              <Link href="/copyright" className="govuk-link">
                Copyright and content notices
              </Link>
            </li>
            <li>
              <Link href="/disclaimer" className="govuk-link">
                Disclaimer
              </Link>
            </li>
            <li>
              <Link href="/scams" className="govuk-link">
                Scams and fake websites
              </Link>
            </li>
          </ul>
        </div>

        <RelatedNav
          links={[
            { text: "Contact this website", href: "/contact" },
            { text: "Give feedback", href: "/feedback" },
            { text: "Report a problem", href: "/support" },
            { text: "Editorial policy", href: "/editorial-policy" },
            { text: "Contact government", href: "/contact-government" },
          ]}
        />
      </div>
    </>
  );
}
