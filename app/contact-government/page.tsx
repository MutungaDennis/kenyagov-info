import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";

export const metadata: Metadata = {
  title: "Contact government",
  description:
    "How to contact Kenyan public institutions — ministries, Parliament, Judiciary, IEBC, counties and common service portals.",
};

export default function ContactGovernmentPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Help", href: "/help" },
          { text: "Contact government" },
        ]}
        title="Contact government"
        lead="Use this page to find the right type of public body. CitizenGuide.KE is not a government switchboard — we cannot transfer calls or process applications for you."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-warning-text">
            <span className="govuk-warning-text__icon" aria-hidden="true">
              !
            </span>
            <strong className="govuk-warning-text__text">
              <span className="govuk-visually-hidden">Warning </span>
              To contact the team that runs this website, use{" "}
              <Link href="/contact" className="govuk-link">
                contact CitizenGuide.KE
              </Link>
              . That form does not reach ministries or counties.
            </strong>
          </div>

          <h2 className="govuk-heading-l">Online services and payments</h2>
          <p className="govuk-body">
            Use our guides first — they explain what each channel is for and then
            point you to the official portal when you are ready to apply or pay.
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/ecitizen" className="govuk-link">
                eCitizen explained
              </Link>{" "}
              — many national services
            </li>
            <li>
              <Link href="/topics/money-tax" className="govuk-link">
                Money and tax
              </Link>{" "}
              — KRA PIN, returns and compliance (transactions on official tax
              systems)
            </li>
            <li>
              <Link href="/huduma-centres" className="govuk-link">
                Huduma Centres
              </Link>{" "}
              — in-person assisted services
            </li>
            <li>
              <Link href="/services" className="govuk-link">
                All service guides
              </Link>
            </li>
          </ul>

          <h2 className="govuk-heading-l">National Executive</h2>
          <p className="govuk-body">
            Ministries, state departments and agencies publish contacts on their
            official websites. Start from our directories:
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/government/institutions" className="govuk-link">
                All government institutions
              </Link>
            </li>
            <li>
              <Link href="/government/cabinet" className="govuk-link">
                Cabinet and ministries
              </Link>
            </li>
            <li>
              <Link href="/government/presidency" className="govuk-link">
                The Presidency
              </Link>
            </li>
          </ul>

          <h2 className="govuk-heading-l">Parliament</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/government/legislature" className="govuk-link">
                Parliament overview
              </Link>
            </li>
            <li>
              <Link
                href="/government/legislature/national-assembly/members"
                className="govuk-link"
              >
                Members of the National Assembly
              </Link>
            </li>
            <li>
              <Link
                href="/government/legislature/senate/senators"
                className="govuk-link"
              >
                Senators
              </Link>
            </li>
          </ul>
          <p className="govuk-body">
            For constituency issues, contact your elected representatives. See{" "}
            <Link href="/find-your-representatives" className="govuk-link">
              find your representatives
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">Judiciary and justice</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/government/judiciary" className="govuk-link">
                The Judiciary
              </Link>
            </li>
            <li>
              <Link href="/topics/crime-justice" className="govuk-link">
                Crime, justice and the law
              </Link>
            </li>
          </ul>

          <h2 className="govuk-heading-l">Elections (IEBC)</h2>
          <p className="govuk-body">
            Voter registration, polling stations and results are managed by the
            Independent Electoral and Boundaries Commission.
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/elections" className="govuk-link">
                Elections hub
              </Link>
            </li>
            <li>
              <Link href="/elections/iebc-offices" className="govuk-link">
                IEBC offices
              </Link>
            </li>
          </ul>

          <h2 className="govuk-heading-l">Counties</h2>
          <p className="govuk-body">
            For county licences, local health facilities, county roads and many
            local services, contact the relevant county government.
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/government/counties" className="govuk-link">
                County governments directory
              </Link>
            </li>
            <li>
              <Link href="/government/counties/governors" className="govuk-link">
                Governors
              </Link>
            </li>
            <li>
              <Link href="/county-vs-national" className="govuk-link">
                County vs national functions
              </Link>
            </li>
          </ul>

          <h2 className="govuk-heading-l">Complaints and oversight</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/complain-about-government" className="govuk-link">
                How to complain about government
              </Link>
            </li>
            <li>
              <Link href="/access-to-information" className="govuk-link">
                Access to information requests
              </Link>
            </li>
            <li>
              <Link href="/government/commissions" className="govuk-link">
                Constitutional commissions
              </Link>
            </li>
          </ul>

          <h2 className="govuk-heading-l">Emergencies</h2>
          <p className="govuk-body">
            This website is not an emergency service. See{" "}
            <Link href="/emergency-and-safety" className="govuk-link">
              emergency and safety information
            </Link>
            .
          </p>
        </div>

        <RelatedNav
          links={[
            { text: "Contact this website", href: "/contact" },
            { text: "Help", href: "/help" },
            { text: "Find your representatives", href: "/find-your-representatives" },
            { text: "eCitizen explained", href: "/ecitizen" },
            { text: "Scams and fake websites", href: "/scams" },
          ]}
        />
      </div>
    </>
  );
}
