import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 4;

export const metadata: Metadata = buildPageMetadata({
  title: "Separation of powers - How government works",
  description: "The Executive, Legislature and Judiciary have different roles and constitutional powers.",
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
          { text: "Separation of powers" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="Separation of powers"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            The Executive, Legislature and Judiciary have different roles and
            constitutional powers.
          </p>

          <p className="govuk-body">
            In simple terms:
          </p>

          <dl className="govuk-summary-list">
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
                Parliament
              </dt>

              <dd className="govuk-summary-list__value">
                Makes legislation, represents citizens and oversees public
                administration and finances within its mandate.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Judiciary
              </dt>

              <dd className="govuk-summary-list__value">
                Interprets and applies the law and resolves disputes
                independently.
              </dd>
            </div>
          </dl>

          <p className="govuk-body">
            Separation of powers does not mean that these institutions never
            interact. The Constitution creates checks, approvals and oversight
            relationships between them.
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
