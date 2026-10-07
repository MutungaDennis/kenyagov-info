import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 14;

export const metadata: Metadata = buildPageMetadata({
  title: "A simple way to understand the system - How government works",
  description: "A simple way to understand the system — part of how government works on CitizenGuide.KE.",
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
          { text: "A simple way to understand the system" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="A simple way to understand the system"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                People
              </dt>
              <dd className="govuk-summary-list__value">
                Hold sovereign power.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Constitution
              </dt>
              <dd className="govuk-summary-list__value">
                Sets the rules, institutions, rights and limits on public power.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Executive
              </dt>
              <dd className="govuk-summary-list__value">
                Administers government and implements law and policy.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Parliament and county assemblies
              </dt>
              <dd className="govuk-summary-list__value">
                Make legislation, represent the public and conduct oversight.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Judiciary
              </dt>
              <dd className="govuk-summary-list__value">
                Resolves disputes and interprets and applies the law
                independently.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Counties
              </dt>
              <dd className="govuk-summary-list__value">
                Exercise devolved functions and provide many services locally.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Independent bodies
              </dt>
              <dd className="govuk-summary-list__value">
                Perform specialised constitutional oversight and governance
                functions.
              </dd>
            </div>
          </dl>

          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              This page is a simplified explanation of Kenya&apos;s
              constitutional system. For the precise powers and duties of an
              institution, read the Constitution and the legislation governing
              that institution. CitizenGuide.KE is independent and is not an
              official government publication.{" "}
              <Link href="/disclaimer" className="govuk-link">
                Read our disclaimer
              </Link>
              .
            </p>
          </div>

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
