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

const index = 5;

export const metadata: Metadata = buildPageMetadata({
  title: "County governments and devolution - How government works",
  description: "The Constitution established 47 county governments as part of the system of devolved government.",
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
          { text: "County governments and devolution" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="County governments and devolution"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            The Constitution established 47 county governments as part of the
            system of devolved government.
          </p>

          <p className="govuk-body">
            Devolution is intended to bring government and services closer to
            people, promote participation, recognise diversity and support more
            equitable development.
          </p>

          <p className="govuk-body">
            See{" "}
            <Link
              href={constitutionRefs.devolvedGovernment.href}
              className="govuk-link"
            >
              {constitutionRefs.devolvedGovernment.label}
            </Link>
            .
          </p>

          <h2 className="govuk-heading-m">
            County executive
          </h2>

          <p className="govuk-body">
            Each county has an executive headed by the county governor.
          </p>

          <p className="govuk-body">
            The county executive implements county legislation and manages the
            county functions assigned under the Constitution and legislation.
          </p>

          <h2 className="govuk-heading-m">
            County assembly
          </h2>

          <p className="govuk-body">
            Each county also has a county assembly made up of elected and
            nominated members as provided by the Constitution.
          </p>

          <p className="govuk-body">
            A county assembly:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>makes county legislation</li>
            <li>approves county budgets</li>
            <li>oversees the county executive</li>
            <li>represents residents of the county</li>
          </ul>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/county-vs-national" className="govuk-link">
                County vs national government
              </Link>
            </li>

            <li>
              <Link
                href="/government/counties"
                className="govuk-link"
              >
                Browse county governments
              </Link>
            </li>

            <li>
              <Link
                href="/government/counties/devolution"
                className="govuk-link"
              >
                How devolution works
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
