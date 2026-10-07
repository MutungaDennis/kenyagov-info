import type { Metadata } from "next";
import Link from "next/link";
import HomeMasthead from "@/components/site/HomeMasthead";
import ChevronLinkList from "@/components/site/ChevronLinkList";
import { taskGuides } from "@/lib/guides/task-guides";
import {
  buildPageMetadata,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
} from "@/lib/seo";

export const revalidate = 86400;

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: "/",
  }),
  title: {
    absolute: DEFAULT_TITLE,
  },
};

/**
 * Homepage, simplified for phones first:
 * 1) Masthead with search
 * 2) One main action: find your representatives
 * 3) Common tasks
 * 4) Browse in 6 topics (one list, two columns on larger screens)
 * 5) Timely notice, emergency numbers, independence note
 */
const topics = [
  {
    href: "/government",
    title: "How government works",
    description: "National and county government, Parliament and the courts.",
  },
  {
    href: "/government/counties",
    title: "Your county",
    description: "47 county governments, governors, assemblies and wards.",
  },
  {
    href: "/government/people",
    title: "Leaders and officials",
    description: "Elected leaders and the people who head public offices.",
  },
  {
    href: "/government/institutions",
    title: "Institutions",
    description: "Ministries, commissions, agencies, regulators and other public bodies.",
  },
  {
    href: "/open-data",
    title: "Open data",
    description: "Download government data and statistics.",
  },
  {
    href: "/elections",
    title: "Elections and voting",
    description: "Register to vote, polling stations, parties and timelines.",
  },
  {
    href: "/constitution-and-laws",
    title: "The Constitution and laws",
    description: "The Constitution, Acts of Parliament and official documents.",
  },
  {
    href: "/services",
    title: "Government services",
    description: "Passports, IDs, tax, land, business and more, A to Z.",
  },
];

export default function Home() {
  return (
    <>
      <HomeMasthead />

      <div className="govuk-width-container app-home-body">
        <div className="govuk-grid-row govuk-!-margin-top-6">
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-heading-m">Find who represents you</h2>
            <p className="govuk-body">
              Your MP, senator, governor, woman representative and MCA, by
              county, constituency and ward.
            </p>
            <Link
              href="/find-your-representatives"
              role="button"
              draggable="false"
              className="govuk-button govuk-button--start"
              data-module="govuk-button"
            >
              Find your representatives
              <svg
                className="govuk-button__start-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="17.5"
                height="19"
                viewBox="0 0 33 40"
                aria-hidden="true"
                focusable="false"
              >
                <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-heading-m">Common tasks</h2>
            <p className="govuk-body">
              We explain how public services work. Applications and payments
              are made on{" "}
              <Link href="/ecitizen" className="govuk-link">
                eCitizen
              </Link>{" "}
              or with the relevant office.
            </p>
            <ChevronLinkList
              ariaLabel="Common tasks"
              items={[
                ...taskGuides.map((guide) => ({
                  href: `/guides/${guide.slug}`,
                  title: guide.title,
                })),
                { href: "/guides", title: "All guides and life events" },
              ]}
            />
          </div>

          <div className="govuk-grid-column-one-third-from-desktop govuk-grid-column-full govuk-!-margin-top-4">
            <div className="govuk-inset-text govuk-!-margin-top-0">
              <h2 className="govuk-heading-s govuk-!-margin-top-0">
                Coming up
              </h2>
              <p className="govuk-body govuk-!-margin-bottom-2">
                <Link
                  href="/elections/general-elections/timeline"
                  className="govuk-link"
                >
                  2027 General Election timeline
                </Link>
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                IEBC milestones toward the 10 August 2027 poll.
              </p>
            </div>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

        <h2 className="govuk-heading-m">Browse by topic</h2>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half-from-desktop govuk-grid-column-full">
            <ChevronLinkList
              ariaLabel="Browse by topic"
              items={topics.slice(0, 4)}
            />
          </div>
          <div className="govuk-grid-column-one-half-from-desktop govuk-grid-column-full">
            <ChevronLinkList
              ariaLabel="More topics"
              items={topics.slice(4)}
            />
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

        <div className="govuk-grid-row govuk-!-margin-bottom-6">
          <div className="govuk-grid-column-one-half-from-desktop govuk-grid-column-full">
            <h2 className="govuk-heading-s">In an emergency</h2>
            <p className="govuk-body">
              Call <strong>999</strong> or <strong>112</strong>.{" "}
              <Link href="/emergency-safety" className="govuk-link">
                Emergency contacts and safety information
              </Link>
              .
            </p>
          </div>
          <div className="govuk-grid-column-one-half-from-desktop govuk-grid-column-full">
            <h2 className="govuk-heading-s">About this site</h2>
            <p className="govuk-body">
              CitizenGuide.KE is an independent guide to Kenyan government. It
              is not an official government website.{" "}
              <Link href="/about" className="govuk-link">
                About us
              </Link>{" "}
              and{" "}
              <Link href="/disclaimer" className="govuk-link">
                disclaimer
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
