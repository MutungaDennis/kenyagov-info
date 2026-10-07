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

const index = 11;

export const metadata: Metadata = buildPageMetadata({
  title: "Public money and accountability - How government works",
  description: "Public institutions also operate within constitutional rules on taxation, budgeting, spending, borrowing, audit and revenue sharing.",
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
          { text: "Public money and accountability" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="Public money and accountability"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            Public institutions also operate within constitutional rules on
            taxation, budgeting, spending, borrowing, audit and revenue sharing.
          </p>

          <p className="govuk-body">
            National and county governments prepare budgets, while institutions
            including Parliament, county assemblies, the Controller of Budget
            and Auditor-General perform different financial oversight
            functions.
          </p>

          <p className="govuk-body">
            See{" "}
            <Link
              href={constitutionRefs.publicFinance.href}
              className="govuk-link"
            >
              {constitutionRefs.publicFinance.label}
            </Link>
            .
          </p>

          <p className="govuk-body">
            <Link href="/how-public-money-works" className="govuk-link">
              How public money works
            </Link>
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
