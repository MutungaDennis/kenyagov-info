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

const index = 19;

export const metadata: Metadata = buildPageMetadata({
  title: "Legal framework - How public money works",
  description: "This page is a simplified explanation. Kenya's public finance framework is mainly governed by Chapter Twelve of the Constitution, the Public Finance Management Act and other…",
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
          { text: "Legal framework" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="Legal framework"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            This page is a simplified explanation. Kenya&apos;s public finance
            framework is mainly governed by Chapter Twelve of the Constitution,
            the Public Finance Management Act and other legislation dealing with
            taxation, revenue sharing, appropriation, audit and public bodies.
          </p>

          <p className="govuk-body">
            For legal detail, start with{" "}
            <Link
              href={constitutionRefs.publicFinance.href}
              className="govuk-link"
            >
              {constitutionRefs.publicFinance.label}
            </Link>{" "}
            and the{" "}
            <Link href="/legislation/acts" className="govuk-link">
              Acts of Parliament
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
