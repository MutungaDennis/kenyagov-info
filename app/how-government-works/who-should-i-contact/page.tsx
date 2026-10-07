import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 13;

export const metadata: Metadata = buildPageMetadata({
  title: "Who should I contact? - How government works",
  description: "Start with the institution responsible for the particular function or service.",
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
          { text: "Who should I contact?" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="Who should I contact?"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            Start with the institution responsible for the particular function
            or service.
          </p>

          <p className="govuk-body">
            For example:
          </p>

          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                National service
              </dt>

              <dd className="govuk-summary-list__value">
                Contact the responsible ministry, state department, agency or
                other national institution.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                County service
              </dt>

              <dd className="govuk-summary-list__value">
                Contact the relevant county department or county government.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Elected representative
              </dt>

              <dd className="govuk-summary-list__value">
                Find the MP, senator, woman representative, governor or MCA
                associated with your area or issue.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Complaint or oversight issue
              </dt>

              <dd className="govuk-summary-list__value">
                The correct oversight body depends on whether the issue involves
                administration, corruption, policing, human rights, elections or
                another specialised area.
              </dd>
            </div>
          </dl>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/contact-government" className="govuk-link">
                Contact government
              </Link>
            </li>

            <li>
              <Link
                href="/find-your-representatives"
                className="govuk-link"
              >
                Find your representatives
              </Link>
            </li>

            <li>
              <Link
                href="/complain-about-government"
                className="govuk-link"
              >
                Complain about government
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
