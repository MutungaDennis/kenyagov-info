import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import { constitutionRefs } from "@/lib/constitution-links";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 0;

export const metadata: Metadata = buildPageMetadata({
  title: "The public money cycle - How public money works",
  description: "A simplified way to understand public finance is:",
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
          { text: "The public money cycle" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="The public money cycle"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            A simplified way to understand public finance is:
          </p>

          <ol className="govuk-list govuk-list--number">
            <li>
              <strong>Government raises revenue</strong> through taxes, charges,
              grants and other lawful sources.
            </li>
            <li>
              <strong>Government prepares a budget</strong> setting out expected
              revenue and proposed spending.
            </li>
            <li>
              <strong>Parliament or a county assembly approves spending</strong>{" "}
              through the budget and appropriation process.
            </li>
            <li>
              <strong>Money is withdrawn from public funds</strong> in accordance
              with the law.
            </li>
            <li>
              <strong>Ministries, agencies and counties spend the money</strong>{" "}
              on approved programmes and services.
            </li>
            <li>
              <strong>Spending is reported, examined and audited</strong> so that
              institutions can be held accountable.
            </li>
          </ol>

          <p className="govuk-body">
            The constitutional principles governing this system are set out in{" "}
            <Link
              href={constitutionRefs.publicFinance.href}
              className="govuk-link"
            >
              {constitutionRefs.publicFinance.label}
            </Link>
            .
          </p>

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
