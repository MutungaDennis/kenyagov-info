import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 13;

export const metadata: Metadata = buildPageMetadata({
  title: "Controller of Budget and Auditor-General are different - How public money works",
  description: "These offices are sometimes confused, but their roles are not the same.",
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
          { text: "Controller of Budget and Auditor-General are different" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="Controller of Budget and Auditor-General are different"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            These offices are sometimes confused, but their roles are not the
            same.
          </p>

          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Controller of Budget
              </dt>
              <dd className="govuk-summary-list__value">
                Primarily oversees budget implementation and authorises lawful
                withdrawals from specified public funds.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Auditor-General
              </dt>
              <dd className="govuk-summary-list__value">
                Audits public accounts and reports on how public resources were
                accounted for and used.
              </dd>
            </div>
          </dl>

          <p className="govuk-body">
            Put simply: the Controller of Budget is closely involved during
            budget implementation, while the Auditor-General provides
            independent audit scrutiny of public accounts and spending.
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
