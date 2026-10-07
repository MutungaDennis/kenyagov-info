import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 2;

export const metadata: Metadata = buildPageMetadata({
  title: "Where public money comes from - How public money works",
  description: "Government revenue comes from several sources. Taxes are important, but they are not the only source of public money.",
  path: `${guideBase}/${sections[index].slug}`,
});

export default function Page() {
  const previous = index > 0 ? sections[index - 1] : null;
  const next = index < sections.length - 1 ? sections[index + 1] : null;

  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: guideName, href: guideBase },
          { text: "Where public money comes from" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="Where public money comes from"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            Government revenue comes from several sources. Taxes are important,
            but they are not the only source of public money.
          </p>

          <p className="govuk-body">
            Sources can include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>income tax</li>
            <li>value added tax (VAT)</li>
            <li>excise duties</li>
            <li>customs duties</li>
            <li>fees and charges for public services</li>
            <li>county own-source revenue</li>
            <li>grants</li>
            <li>investment and other non-tax income</li>
            <li>borrowing used to finance a budget deficit</li>
          </ul>

          <h2 className="govuk-heading-m">
            National taxes
          </h2>

          <p className="govuk-body">
            Under Article 209 of the Constitution, only the national government
            may impose:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>income tax</li>
            <li>value added tax</li>
            <li>customs duties and other duties on imports and exports</li>
            <li>excise tax</li>
          </ul>

          <p className="govuk-body">
            Many national taxes are administered by the Kenya Revenue Authority
            (KRA).
          </p>

          <p className="govuk-body">
            If you need information about your own taxes, see{" "}
            <Link href="/topics/money-tax" className="govuk-link">
              money and tax
            </Link>
            .
          </p>

          <h2 className="govuk-heading-m">
            County revenue
          </h2>

          <p className="govuk-body">
            Counties do not have the same taxing powers as the national
            government.
          </p>

          <p className="govuk-body">
            The Constitution allows county governments to impose:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>property rates</li>
            <li>entertainment taxes</li>
            <li>taxes authorised for counties by an Act of Parliament</li>
            <li>charges for services they provide</li>
          </ul>

          <p className="govuk-body">
            County revenue can therefore include items such as property rates,
            permit fees, parking charges, market charges and other lawful
            county fees, depending on the county and service.
          </p>

          <div className="govuk-inset-text">
            A government body cannot simply invent a tax or licensing fee.
            Article 210 of the Constitution requires taxes and licensing fees
            to be imposed, waived or varied in accordance with legislation.
          </div>

          <SectionPager
            previous={previous ? { href: `${guideBase}/${previous.slug}`, title: previous.title } : null}
            next={next ? { href: `${guideBase}/${next.slug}`, title: next.title } : null}
            parent={{ href: guideBase, title: guideName }}
          />

          <p className="govuk-body govuk-!-margin-top-8">
            <strong>Last updated:</strong> {lastUpdated}
          </p>
        </div>

        <RelatedNav links={[...relatedLinks]} />
      </div>
    </>
  );
}
