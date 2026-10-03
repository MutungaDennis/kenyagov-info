import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "How Nairobi was selected",
  description:
    "How Nairobi was selected to host the 2029 World Athletics Championships and the experience behind Kenya's bid.",
};

export default function NairobiSelectionPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          {
            text: "World Athletics Championships Nairobi 2029",
            href: "/world-athletics-championships-2029",
          },
          {
            text: "About the championships",
            href: "/world-athletics-championships-2029/about",
          },
          { text: "Nairobi's selection" },
        ]}
        title="How Nairobi was selected"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <p className="govuk-body">
            The{" "}
            <ExternalLink href="https://worldathletics.org/">
              World Athletics
            </ExternalLink>{" "}
            Council selected Nairobi to host the 2029 World Athletics
            Championships during its September 2026 meeting in Budapest.
          </p>

          <h2 className="govuk-heading-l">The bidding process</h2>
          <p className="govuk-body">
            World Athletics invited bids for the 2029 and 2031 championships.
            Nairobi competed with other candidate cities through a process
            assessing areas such as delivery plans, venues, financial support,
            audience potential and the proposed long-term benefit to athletics.
          </p>

          <h2 className="govuk-heading-l">Nairobi&apos;s previous bid</h2>
          <p className="govuk-body">
            Nairobi had previously sought the 2025 championships, which were
            awarded to Tokyo. World Athletics said the experience helped the
            Nairobi team return with a stronger proposition for 2029.
          </p>

          <h2 className="govuk-heading-l">Hosting experience</h2>
          <p className="govuk-body">
            Nairobi has staged major athletics competitions including the 2010
            African Athletics Championships, the 2017 World Under-18
            Championships and the 2021 World Under-20 Championships. It also
            hosts the Kip Keino Classic.
          </p>

          <h2 className="govuk-heading-l">Why the bid succeeded</h2>
          <p className="govuk-body">
            World Athletics highlighted the bid&apos;s operational planning,
            financial guarantees, planned renovation of Kasarani Stadium,
            Kenya&apos;s athletics culture and the opportunity to stage the senior
            outdoor championships in Africa for the first time.
          </p>

          <h2 className="govuk-heading-l">Decision and accountability</h2>
          <p className="govuk-body">
            Selection as host begins the delivery process. Venue readiness,
            public spending, procurement, transport, security and promised
            legacy outcomes should be assessed against later official plans
            and reports.
          </p>

          <p className="govuk-body govuk-!-margin-top-8">
            <Link
              href="/world-athletics-championships-2029/about"
              className="govuk-link govuk-link--no-visited-state"
            >
              Back to About the championships
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
