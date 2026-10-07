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
  title: "The Constitution is the supreme law - How government works",
  description: "The Constitution of Kenya 2010 is the supreme law of Kenya. All public institutions and state officers must exercise their powers consistently with it.",
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
          { text: "The Constitution is the supreme law" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="The Constitution is the supreme law"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            The{" "}
            <Link href="/constitution" className="govuk-link">
              Constitution of Kenya 2010
            </Link>{" "}
            is the supreme law of Kenya. All public institutions and state
            officers must exercise their powers consistently with it.
          </p>

          <p className="govuk-body">
            The Constitution sets out:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>how sovereign power is exercised</li>
            <li>rights and fundamental freedoms</li>
            <li>national values and principles of governance</li>
            <li>the structure and powers of public institutions</li>
            <li>leadership and integrity requirements</li>
            <li>the system of devolution</li>
            <li>elections and political representation</li>
            <li>public finance</li>
            <li>independent commissions and offices</li>
          </ul>

          <p className="govuk-body">
            Useful parts of the Constitution include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link
                href={constitutionRefs.nationalValues.href}
                className="govuk-link"
              >
                {constitutionRefs.nationalValues.label}
              </Link>
            </li>

            <li>
              <Link
                href={constitutionRefs.billOfRights.href}
                className="govuk-link"
              >
                {constitutionRefs.billOfRights.label}
              </Link>
            </li>

            <li>
              <Link
                href={constitutionRefs.leadershipIntegrity.href}
                className="govuk-link"
              >
                {constitutionRefs.leadershipIntegrity.label}
              </Link>
            </li>
          </ul>

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
