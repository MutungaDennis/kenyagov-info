import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
import PageContents from "@/components/site/PageContents";

export const metadata: Metadata = {
  title: "Content style guide",
  description:
    "How CitizenGuide.KE writes public information — plain language, structure and GOV.UK-inspired content design for Kenya.",
};

export default function ContentStyleGuidePage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "About", href: "/about" },
          { text: "Content style guide" },
        ]}
        caption="About this website"
        title="Content style guide"
        lead="Rules for writing and structuring pages on CitizenGuide.KE. Adapted from GOV.UK content design principles for Kenyan civic information."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <PageContents
            items={[
              { href: "#principles", text: "Principles" },
              { href: "#structure", text: "Page structure" },
              { href: "#language", text: "Language and style" },
              { href: "#services", text: "Service pages" },
              { href: "#links", text: "Links" },
              { href: "#dates", text: "Dates, money and names" },
              { href: "#do-not", text: "Do not" },
            ]}
          />

          <section id="principles" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">Principles</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>Start with the user need, not the organisation chart.</li>
              <li>One main purpose per page.</li>
              <li>Be accurate, neutral and independent of party politics.</li>
              <li>Prefer short sentences and everyday words.</li>
              <li>Say when something can change or varies by county.</li>
              <li>
                Never pretend to be government or process applications on this
                site.
              </li>
            </ul>
            <p className="govuk-body">
              See also the{" "}
              <Link href="/editorial-policy" className="govuk-link">
                editorial policy
              </Link>
              .
            </p>
          </section>

          <section id="structure" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">Page structure</h2>
            <ol className="govuk-list govuk-list--number">
              <li>Breadcrumbs</li>
              <li>One H1 that matches the user task</li>
              <li>Short lead paragraph</li>
              <li>Non-official or scam warning where relevant</li>
              <li>Contents list on long pages</li>
              <li>H2 sections in a logical order</li>
              <li>Related links (internal first)</li>
            </ol>
          </section>

          <section id="language" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">Language and style</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>Use active voice (“Apply on eCitizen”, not “Applications may be made”).</li>
              <li>Expand acronyms on first use (KRA, IEBC, NTSA, SHA).</li>
              <li>Address the reader as “you”.</li>
              <li>Avoid marketing language and hype.</li>
              <li>English (Kenya) for primary content; Kiswahili may be added later via i18n.</li>
            </ul>
          </section>

          <section id="services" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">Service pages</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>Title starts with a verb where possible.</li>
              <li>Show “From:” responsible body and last updated date.</li>
              <li>One primary Start button to the official portal.</li>
              <li>Fees as a table with KSh; note that fees can change.</li>
              <li>Link related services and parent topic.</li>
            </ul>
          </section>

          <section id="links" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">Links</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>Prefer internal pages; use external links sparingly.</li>
              <li>
                Constitution links use{" "}
                <code className="govuk-!-font-size-16">
                  /constitution/chapter/n/article/m
                </code>{" "}
                and labels like “Article 35 — Access to information”.
              </li>
              <li>Describe the destination; avoid “click here”.</li>
              <li>Mark new tabs accessibly when used.</li>
            </ul>
          </section>

          <section id="dates" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">Dates, money and names</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>Dates: 15 July 2026 (day month year).</li>
              <li>Money: KSh with spaces for thousands where helpful (KSh 1,050).</li>
              <li>Use official institution names first; acronyms second.</li>
            </ul>
          </section>

          <section id="do-not" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">Do not</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>Invent fees, deadlines or eligibility.</li>
              <li>Collect application data or passwords.</li>
              <li>Endorse parties, candidates or commercial agents.</li>
              <li>Use stock photo hero banners or marketing card grids as primary content.</li>
            </ul>
          </section>
        </div>

        <RelatedNav
          links={[
            { text: "Editorial policy", href: "/editorial-policy" },
            { text: "Disclaimer", href: "/disclaimer" },
            { text: "Corrections", href: "/corrections" },
            { text: "About", href: "/about" },
            { text: "Accessibility", href: "/accessibility" },
          ]}
        />
      </div>
    </>
  );
}
