import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
import PageContents from "@/components/site/PageContents";

export const revalidate = 86400;
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Kenya Gazette and official notices",
  description:
    "What the Kenya Gazette is, what is published there, and how citizens can use official notices — not a full Gazette archive.",
};

export default function KenyaGazettePage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Law and documents", href: "/documents" },
          { text: "Kenya Gazette" },
        ]}
        caption="Official notices"
        title="Kenya Gazette and official notices"
        lead="The Kenya Gazette is the official public journal of the Government of Kenya. Important appointments, legal notices and certain public announcements are published there."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <PageContents
            items={[
              { href: "#what-it-is", text: "What the Kenya Gazette is" },
              { href: "#what-is-published", text: "What is commonly published" },
              { href: "#how-to-use", text: "How to use Gazette information" },
              { href: "#this-website", text: "How this website uses it" },
              { href: "#related", text: "Related reading" },
            ]}
          />

          <section id="what-it-is" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">What the Kenya Gazette is</h2>
            <p className="govuk-body">
              The Gazette is the authoritative way the State publishes many
              formal notices. Courts, researchers, journalists and citizens use
              it to verify what government has officially announced.
            </p>
            <p className="govuk-body">
              CitizenGuide.KE is{" "}
              <strong>not</strong> the Gazette and does not host a complete
              searchable archive of every issue. We may cite Gazette notices as
              sources when we update leadership or institutional pages.
            </p>
          </section>

          <section id="what-is-published" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">What is commonly published</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>appointments and removals of public officers</li>
              <li>legal notices and some subsidiary legislation pathways</li>
              <li>land and property-related notices where required by law</li>
              <li>company and business-related statutory notices</li>
              <li>commission and institutional instruments</li>
              <li>other public proclamations required to be gazetted</li>
            </ul>
          </section>

          <section id="how-to-use" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">How to use Gazette information</h2>
            <ol className="govuk-list govuk-list--number">
              <li>Identify the notice type and date you need.</li>
              <li>
                Obtain the official Gazette issue from authorised government
                publication channels (print or official digital sources).
              </li>
              <li>
                Prefer the Gazette wording over secondary summaries when
                accuracy matters (for example court filings or formal challenges).
              </li>
            </ol>
            <div className="govuk-warning-text">
              <span className="govuk-warning-text__icon" aria-hidden="true">
                !
              </span>
              <strong className="govuk-warning-text__text">
                <span className="govuk-visually-hidden">Warning </span>
                Unofficial PDFs shared on social media can be incomplete or
                altered. Verify against official sources.
              </strong>
            </div>
          </section>

          <section id="this-website" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">How this website uses it</h2>
            <p className="govuk-body">
              Our{" "}
              <Link href="/editorial-policy" className="govuk-link">
                editorial policy
              </Link>{" "}
              ranks the Kenya Gazette highly in the source hierarchy for
              appointments and formal instruments. If you spot a mismatch
              between our directory and a Gazette notice, use{" "}
              <Link href="/corrections" className="govuk-link">
                corrections
              </Link>
              .
            </p>
          </section>

          <section id="related" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">Related reading</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                <Link href="/acts/parliament" className="govuk-link">
                  Acts of Parliament
                </Link>
              </li>
              <li>
                <Link href="/constitution" className="govuk-link">
                  Constitution of Kenya
                </Link>
              </li>
              <li>
                <Link href="/access-to-information" className="govuk-link">
                  Access to information
                </Link>
              </li>
              <li>
                <Link href="/government/executive-orders" className="govuk-link">
                  Executive orders register
                </Link>
              </li>
              <li>
                <Link href="/documents" className="govuk-link">
                  Policy documents
                </Link>
              </li>
            </ul>
          </section>
        </div>

        <RelatedNav
          links={[
            { text: "Editorial policy", href: "/editorial-policy" },
            { text: "Content style guide", href: "/content-style-guide" },
            { text: "Open data", href: "/open-data" },
            { text: "Disclaimer", href: "/disclaimer" },
          ]}
        />
      </div>
    </>
  );
}
