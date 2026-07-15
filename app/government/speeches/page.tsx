import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";

export const metadata: Metadata = {
  title: "Speeches and addresses",
  description:
    "How official speeches and public addresses are published in Kenya, and where to find authoritative texts.",
};

export default function SpeechesPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Speeches" },
        ]}
        caption="Transparency"
        title="Speeches and addresses"
        lead="Official speeches are published by the offices that deliver them. This page explains where to look — CitizenGuide.KE is not a complete speech archive."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              We do not re-publish every presidential or ministerial speech. For
              the authoritative text, use the issuing office’s official website
              or{" "}
              <Link href="/kenya-gazette" className="govuk-link">
                Gazette-related notices
              </Link>{" "}
              where applicable.
            </p>
          </div>

          <h2 className="govuk-heading-l">Where speeches are published</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/government/presidency" className="govuk-link">
                The Presidency
              </Link>{" "}
              — State House and Executive Office channels
            </li>
            <li>
              <Link href="/government/cabinet" className="govuk-link">
                Cabinet and ministries
              </Link>{" "}
              — ministry websites and press units
            </li>
            <li>
              <Link href="/government/legislature" className="govuk-link">
                Parliament
              </Link>{" "}
              — Hansard records debates more fully than polished speeches
            </li>
          </ul>

          <h2 className="govuk-heading-l">Related registers on this site</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/government/presidential-visits" className="govuk-link">
                Presidential international visits
              </Link>
            </li>
            <li>
              <Link href="/government/cabinet-decisions" className="govuk-link">
                Cabinet decisions
              </Link>
            </li>
            <li>
              <Link href="/government/executive-orders" className="govuk-link">
                Executive orders
              </Link>
            </li>
            <li>
              <Link href="/government/publications" className="govuk-link">
                Publications search
              </Link>
            </li>
          </ul>

          <p className="govuk-body">
            For broad document search, use{" "}
            <Link href="/search/all" className="govuk-link">
              search all government content
            </Link>
            .
          </p>
        </div>

        <RelatedNav
          links={[
            { text: "Government hub", href: "/government" },
            { text: "How government works", href: "/how-government-works" },
            { text: "Kenya Gazette", href: "/kenya-gazette" },
            { text: "Editorial policy", href: "/editorial-policy" },
          ]}
        />
      </div>
    </>
  );
}
