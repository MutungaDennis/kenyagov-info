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
  title: "Kenya has 2 levels of government - How government works",
  description: "Kenya has a national government and 47 county governments.",
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
          { text: "Kenya has 2 levels of government" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="Kenya has 2 levels of government"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            Kenya has a <strong>national government</strong> and{" "}
            <strong>47 county governments</strong>.
          </p>

          <p className="govuk-body">
            The Constitution describes the two levels as distinct and
            interdependent. They are expected to conduct their relations on the
            basis of consultation and cooperation.
          </p>

          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                National government
              </dt>

              <dd className="govuk-summary-list__value">
                Handles functions assigned nationally by the Constitution,
                including areas such as defence, foreign affairs, national
                economic policy and other national functions.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                County governments
              </dt>

              <dd className="govuk-summary-list__value">
                Handle functions assigned to counties, including many services
                delivered locally.
              </dd>
            </div>
          </dl>

          <p className="govuk-body">
            The main division of functions is set out in the Fourth Schedule to
            the Constitution.
          </p>

          <p className="govuk-body">
            <Link href="/county-vs-national" className="govuk-link">
              See which services belong to county and national government
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
