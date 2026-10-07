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

const index = 7;

export const metadata: Metadata = buildPageMetadata({
  title: "Independent commissions and offices - How government works",
  description: "The Constitution establishes a number of commissions and independent offices to perform specialised constitutional functions.",
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
          { text: "Independent commissions and offices" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="Independent commissions and offices"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            The Constitution establishes a number of commissions and independent
            offices to perform specialised constitutional functions.
          </p>

          <p className="govuk-body">
            See{" "}
            <Link
              href={constitutionRefs.commissions.href}
              className="govuk-link"
            >
              {constitutionRefs.commissions.label}
            </Link>
            .
          </p>

          <p className="govuk-body">
            Their purposes include protecting constitutionalism, democratic
            governance, accountability and particular areas of public
            administration.
          </p>

          <p className="govuk-body">
            Examples include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              Independent Electoral and Boundaries Commission — elections and
              electoral boundaries within its mandate
            </li>
            <li>
              Commission on Revenue Allocation — recommendations on sharing
              nationally raised revenue
            </li>
            <li>
              Public Service Commission — constitutional public-service
              functions
            </li>
            <li>
              Salaries and Remuneration Commission — remuneration functions for
              state and public officers within its mandate
            </li>
            <li>
              Kenya National Commission on Human Rights — protection and
              promotion of human rights
            </li>
          </ul>

          <p className="govuk-body">
            The Constitution also establishes the independent offices of the
            Auditor-General and Controller of Budget.
          </p>

          <p className="govuk-body">
            <Link href="/government/commissions" className="govuk-link">
              Browse commissions and independent offices
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
