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

const index = 8;

export const metadata: Metadata = buildPageMetadata({
  title: "Elections and representation - How government works",
  description: "Elections are one of the main ways citizens exercise sovereign power through representatives.",
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
          { text: "Elections and representation" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="Elections and representation"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            Elections are one of the main ways citizens exercise sovereign
            power through representatives.
          </p>

          <p className="govuk-body">
            Kenyan voters elect public representatives including:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>the President</li>
            <li>Members of the National Assembly</li>
            <li>county woman representatives to the National Assembly</li>
            <li>senators</li>
            <li>county governors</li>
            <li>Members of County Assembly (MCAs)</li>
          </ul>

          <p className="govuk-body">
            The Independent Electoral and Boundaries Commission (IEBC)
            administers elections and performs other electoral functions given
            to it by the Constitution and legislation.
          </p>

          <p className="govuk-body">
            Political rights are protected under{" "}
            <Link
              href={constitutionRefs.politicalRights.href}
              className="govuk-link"
            >
              {constitutionRefs.politicalRights.label}
            </Link>
            .
          </p>

          <p className="govuk-body">
            See also{" "}
            <Link
              href={constitutionRefs.representationOfThePeople.href}
              className="govuk-link"
            >
              {constitutionRefs.representationOfThePeople.label}
            </Link>
            .
          </p>

          <p className="govuk-body">
            <Link href="/elections" className="govuk-link">
              Elections and voting
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
