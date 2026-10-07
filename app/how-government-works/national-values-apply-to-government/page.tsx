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

const index = 10;

export const metadata: Metadata = buildPageMetadata({
  title: "National values apply to government - How government works",
  description: "Article 10 of the Constitution sets out national values and principles of governance that bind state organs, state officers, public officers and other persons when applying or…",
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
          { text: "National values apply to government" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="National values apply to government"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            Article 10 of the Constitution sets out national values and
            principles of governance that bind state organs, state officers,
            public officers and other persons when applying or interpreting the
            Constitution, enacting or applying law, or making and implementing
            public policy.
          </p>

          <p className="govuk-body">
            These include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>the rule of law</li>
            <li>democracy</li>
            <li>participation of the people</li>
            <li>human dignity</li>
            <li>equity</li>
            <li>social justice</li>
            <li>inclusiveness</li>
            <li>equality</li>
            <li>human rights</li>
            <li>non-discrimination</li>
            <li>good governance</li>
            <li>integrity</li>
            <li>transparency</li>
            <li>accountability</li>
          </ul>

          <p className="govuk-body">
            <Link
              href={constitutionRefs.nationalValues.href}
              className="govuk-link"
            >
              {constitutionRefs.nationalValues.label}
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
