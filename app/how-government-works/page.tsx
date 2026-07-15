import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
import { constitutionRefs } from "@/lib/constitution-links";

export const metadata: Metadata = {
  title: "How government works",
  description:
    "A plain-language overview of how the Government of Kenya is organised under the Constitution of Kenya 2010 — national and county levels.",
};

export default function HowGovernmentWorksPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "How government works" },
        ]}
        caption="Government"
        title="How government works in Kenya"
        lead="Kenya has a national government and 47 county governments. Power is also separated between the Executive, Parliament and the Judiciary, with independent commissions watching key parts of public life."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-l">The Constitution</h2>
          <p className="govuk-body">
            The{" "}
            <Link href="/constitution" className="govuk-link">
              Constitution of Kenya 2010
            </Link>{" "}
            is the supreme law. It sets out rights and freedoms, the structure
            of government, devolution, leadership and integrity, and how public
            finance should work.
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href={constitutionRefs.billOfRights.href} className="govuk-link">
                {constitutionRefs.billOfRights.label}
              </Link>
            </li>
            <li>
              <Link
                href={constitutionRefs.leadershipIntegrity.href}
                className="govuk-link"
              >
                {constitutionRefs.leadershipIntegrity.label}
              </Link>
            </li>
            <li>
              <Link
                href={constitutionRefs.nationalValues.href}
                className="govuk-link"
              >
                {constitutionRefs.nationalValues.label}
              </Link>
            </li>
          </ul>

          <h2 className="govuk-heading-l">Three arms of the national government</h2>

          <h3 className="govuk-heading-m">The Executive</h3>
          <p className="govuk-body">
            The President is Head of State and Government. The Deputy President
            and Cabinet Secretaries help run ministries and state departments.
            The Executive proposes policy, implements laws and manages much of
            day-to-day national administration. See{" "}
            <Link href={constitutionRefs.executive.href} className="govuk-link">
              {constitutionRefs.executive.label}
            </Link>
            .
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/government/presidency" className="govuk-link">
                The Presidency
              </Link>
            </li>
            <li>
              <Link href="/government/cabinet" className="govuk-link">
                The Cabinet
              </Link>
            </li>
            <li>
              <Link href="/government/institutions" className="govuk-link">
                Ministries and institutions
              </Link>
            </li>
          </ul>

          <h3 className="govuk-heading-m">Parliament (the Legislature)</h3>
          <p className="govuk-body">
            Parliament makes national laws, oversees the Executive and
            represents the people. It has two houses: the National Assembly and
            the Senate. The Senate has a special role in protecting counties and
            devolution. See{" "}
            <Link href={constitutionRefs.legislature.href} className="govuk-link">
              {constitutionRefs.legislature.label}
            </Link>
            .
          </p>
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

          <h3 className="govuk-heading-m">The Judiciary</h3>
          <p className="govuk-body">
            Courts interpret the law and resolve disputes independently of the
            Executive and Parliament. The system includes magistrates’ courts,
            the High Court, specialised courts, the Court of Appeal and the
            Supreme Court. See{" "}
            <Link href={constitutionRefs.judiciary.href} className="govuk-link">
              {constitutionRefs.judiciary.label}
            </Link>
            .
          </p>
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

          <h2 className="govuk-heading-l">Devolution and counties</h2>
          <p className="govuk-body">
            The Constitution created 47 counties so that some services and
            decisions sit closer to citizens. Each county has a governor and a
            county assembly. National and county functions are divided mainly by
            the Fourth Schedule (distribution of functions). Start with{" "}
            <Link
              href={constitutionRefs.devolvedGovernment.href}
              className="govuk-link"
            >
              {constitutionRefs.devolvedGovernment.label}
            </Link>
            .
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/county-vs-national" className="govuk-link">
                County vs national government
              </Link>
            </li>
            <li>
              <Link href="/government/counties" className="govuk-link">
                County governments
              </Link>
            </li>
            <li>
              <Link href="/government/counties/devolution" className="govuk-link">
                Devolution
              </Link>
            </li>
          </ul>

          <h2 className="govuk-heading-l">Independent commissions and offices</h2>
          <p className="govuk-body">
            <Link href={constitutionRefs.commissions.href} className="govuk-link">
              {constitutionRefs.commissions.label}
            </Link>{" "}
            establishes commissions and independent offices — for example
            electoral management, revenue allocation, human rights,
            administrative justice and salaries. They are designed to operate
            without improper direction from the Executive.
          </p>
          <p className="govuk-body">
            <Link href="/government/commissions" className="govuk-link">
              Browse commissions and independent offices
            </Link>
          </p>

          <h2 className="govuk-heading-l">Elections</h2>
          <p className="govuk-body">
            Citizens choose the President, MPs, senators, woman representatives,
            governors and MCAs through elections run by the Independent
            Electoral and Boundaries Commission (IEBC). Political rights are
            protected under{" "}
            <Link
              href={constitutionRefs.politicalRights.href}
              className="govuk-link"
            >
              {constitutionRefs.politicalRights.label}
            </Link>
            . See also{" "}
            <Link
              href={constitutionRefs.representationOfThePeople.href}
              className="govuk-link"
            >
              {constitutionRefs.representationOfThePeople.label}
            </Link>
            .
          </p>
          <p className="govuk-body">
            <Link href="/elections" className="govuk-link">
              Elections and voting
            </Link>
          </p>

          <h2 className="govuk-heading-l">Public money</h2>
          <p className="govuk-body">
            Taxes and other revenues fund national and county services. Sharing
            of revenue, budgeting and audit involve several institutions. See{" "}
            <Link href={constitutionRefs.publicFinance.href} className="govuk-link">
              {constitutionRefs.publicFinance.label}
            </Link>
            .
          </p>
          <p className="govuk-body">
            <Link href="/how-public-money-works" className="govuk-link">
              How public money works
            </Link>
          </p>

          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              This is a simplified overview for citizens. For legal wording, read
              the Constitution and relevant Acts. This website is independent and
              not an official government publication.{" "}
              <Link href="/disclaimer" className="govuk-link">
                Disclaimer
              </Link>
              .
            </p>
          </div>
        </div>

        <RelatedNav
          links={[
            { text: "Government hub", href: "/government" },
            { text: "Find your representatives", href: "/find-your-representatives" },
            { text: "County vs national", href: "/county-vs-national" },
            { text: "Contact government", href: "/contact-government" },
            { text: "Browse topics", href: "/topics" },
            { text: "Constitution of Kenya", href: "/constitution" },
          ]}
        />
      </div>
    </>
  );
}
