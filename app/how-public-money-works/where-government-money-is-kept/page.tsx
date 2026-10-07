import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 3;

export const metadata: Metadata = buildPageMetadata({
  title: "Where government money is kept - How public money works",
  description: "The Constitution establishes public funds through which government revenue is managed.",
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
          { text: "Where government money is kept" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="Where government money is kept"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            The Constitution establishes public funds through which government
            revenue is managed.
          </p>

          <h2 className="govuk-heading-m">
            Consolidated Fund
          </h2>

          <p className="govuk-body">
            Money raised or received by or on behalf of the national government
            is generally paid into the Consolidated Fund, subject to exceptions
            provided by law.
          </p>

          <p className="govuk-body">
            Money cannot simply be withdrawn from the fund because a ministry
            wants to spend it. The withdrawal must have legal authority.
          </p>

          <h2 className="govuk-heading-m">
            County Revenue Fund
          </h2>

          <p className="govuk-body">
            Each county has a County Revenue Fund. Money raised or received by
            or on behalf of the county government is generally paid into that
            fund, subject to the Constitution and legislation.
          </p>

          <h2 className="govuk-heading-m">
            Equalisation Fund
          </h2>

          <p className="govuk-body">
            The Constitution also establishes the Equalisation Fund to support
            basic services in marginalised areas so that the quality of those
            services can be brought closer to the level generally enjoyed
            elsewhere in Kenya.
          </p>

          <p className="govuk-body">
            The Constitution identifies services including water, roads, health
            facilities and electricity.
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
