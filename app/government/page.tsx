// app/government/page.tsx
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";

export const metadata = {
  title: "Government",
  description:
    "How the government of Kenya works, who holds office, and the institutions that deliver public services.",
};

export default function GovernmentHomePage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Government" },
        ]}
        title="Government"
        lead="Find information about how the government of Kenya works, who holds office, and the institutions that deliver public services."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <section className="govuk-!-margin-bottom-8">
            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">
              For citizens
            </h2>
            <p className="govuk-body govuk-!-margin-bottom-3">
              Start here if you want a plain-language overview or need to
              contact the right level of government.
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                <Link href="/how-government-works" className="govuk-link">
                  How government works
                </Link>
              </li>
              <li>
                <Link href="/county-vs-national" className="govuk-link">
                  County vs national government
                </Link>
              </li>
              <li>
                <Link href="/find-your-representatives" className="govuk-link">
                  Find your representatives
                </Link>
              </li>
              <li>
                <Link href="/contact-government" className="govuk-link">
                  Contact government
                </Link>
              </li>
              <li>
                <Link href="/how-public-money-works" className="govuk-link">
                  How public money works
                </Link>
              </li>
              <li>
                <Link href="/complain-about-government" className="govuk-link">
                  How to complain about government
                </Link>
              </li>
            </ul>
          </section>

          <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

          <section className="govuk-!-margin-bottom-8">
            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">
              Departments and agencies
            </h2>
            <p className="govuk-body govuk-!-margin-bottom-3">
              Explore the executive ministries, state departments, commissions,
              and parastatals that make up the national government.
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                <Link href="/government/institutions" className="govuk-link">
                  View all government institutions
                </Link>
              </li>
              <li>
                <Link
                  href="/government/presidential-visits"
                  className="govuk-link"
                >
                  Register of international visits
                </Link>
              </li>
            </ul>
          </section>

          <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

          <section className="govuk-!-margin-bottom-8">
            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">
              Ministers and senior officials
            </h2>
            <p className="govuk-body govuk-!-margin-bottom-3">
              Read biographies and find contact details for the political
              leadership and senior civil servants.
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                <Link href="/government/cabinet" className="govuk-link">
                  The Cabinet
                </Link>
              </li>
              <li>
                <Link href="/government/people" className="govuk-link">
                  All government officials (A-Z)
                </Link>
              </li>
              <li>
                <Link href="/government/presidency" className="govuk-link">
                  The Presidency
                </Link>
              </li>
              <li>
                <Link
                  href="/government/deputy-presidency"
                  className="govuk-link"
                >
                  The Deputy Presidency
                </Link>
              </li>
            </ul>
          </section>

          <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

          <section className="govuk-!-margin-bottom-8">
            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">
              Arms of government
            </h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                <Link href="/government/legislature" className="govuk-link">
                  The Legislature (Parliament)
                </Link>
              </li>
              <li>
                <Link href="/government/judiciary" className="govuk-link">
                  The Judiciary
                </Link>
              </li>
              <li>
                <Link href="/government/commissions" className="govuk-link">
                  Independent Commissions
                </Link>
              </li>
              <li>
                <Link href="/government/counties" className="govuk-link">
                  County governments
                </Link>
              </li>
            </ul>
          </section>

          <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

          <section className="govuk-!-margin-bottom-8">
            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">
              Transparency and registers
            </h2>
            <p className="govuk-body govuk-!-margin-bottom-3">
              Access official dispatches, statutory resolutions, and records of
              executive engagements.
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                <Link
                  href="/government/cabinet-decisions"
                  className="govuk-link"
                >
                  Cabinet decisions
                </Link>
              </li>
              <li>
                <Link
                  href="/government/executive-orders"
                  className="govuk-link"
                >
                  Presidential executive orders
                </Link>
              </li>
              <li>
                <Link
                  href="/government/presidential-visits"
                  className="govuk-link"
                >
                  Register of international visits
                </Link>
              </li>
              <li>
                <Link href="/government/publications" className="govuk-link">
                  Publications
                </Link>
              </li>
              <li>
                <Link href="/government/speeches" className="govuk-link">
                  Speeches
                </Link>
              </li>
            </ul>
          </section>

          <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

          <aside className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-m">Related information</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/topics" className="govuk-link">
                  Browse topics
                </Link>
              </li>
              <li>
                <Link href="/search/all" className="govuk-link">
                  Search all government content
                </Link>
              </li>
              <li>
                <Link href="/constitution" className="govuk-link">
                  Constitution of Kenya
                </Link>
              </li>
              <li>
                <Link href="/acts/parliament" className="govuk-link">
                  Acts of Parliament
                </Link>
              </li>
              <li>
                <Link href="/elections" className="govuk-link">
                  Elections and voting
                </Link>
              </li>
              <li>
                <Link href="/access-to-information" className="govuk-link">
                  Access to information
                </Link>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </>
  );
}
