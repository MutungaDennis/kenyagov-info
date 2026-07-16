import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
import { constitutionRefs } from "@/lib/constitution-links";

export const revalidate = 86400;
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "How public money works",
  description:
    "A citizen overview of Kenya’s public finance — taxes, national and county budgets, revenue sharing and oversight.",
};

export default function HowPublicMoneyWorksPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "How public money works" },
        ]}
        caption="Public finance"
        title="How public money works"
        lead="Public services are funded mainly by taxes and other revenues. This page explains the big picture for citizens — not how to file your personal tax return."
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-l">Where money comes from</h2>
          <p className="govuk-body">
            The national government raises revenue through taxes administered by
            the Kenya Revenue Authority (KRA) and other sources. Counties receive
            a constitutional share of nationally raised revenue and may collect
            local revenue such as property rates and certain fees. The framework
            is in{" "}
            <Link href={constitutionRefs.publicFinance.href} className="govuk-link">
              {constitutionRefs.publicFinance.label}
            </Link>
            .
          </p>
          <p className="govuk-body">
            For your own tax account, see{" "}
            <Link href="/topics/money-tax" className="govuk-link">
              money and tax
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">Budgets</h2>
          <p className="govuk-body">
            Each year, the national government prepares a budget that Parliament
            considers. Counties prepare county budgets through their assemblies.
            Budgets allocate money to ministries, agencies and county departments
            for wages, projects and services.
          </p>
          <p className="govuk-body">
            Published budget documents and budget policy statements are the
            authoritative sources for figures. Summaries on news sites can be
            incomplete.
          </p>

          <h2 className="govuk-heading-l">Sharing revenue with counties</h2>
          <p className="govuk-body">
            The Commission on Revenue Allocation (CRA) recommends how revenue
            should be shared vertically (national vs counties) and horizontally
            (among the 47 counties). Parliament makes the division of revenue
            decisions required by the Constitution. Additional conditional grants
            may support specific programmes.
          </p>

          <h2 className="govuk-heading-l">Oversight</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <strong>Controller of Budget</strong> — authorises withdrawals from
              public funds according to law and reports on budget implementation
            </li>
            <li>
              <strong>Auditor-General</strong> — audits public accounts and
              reports to Parliament and the public
            </li>
            <li>
              <strong>Parliament and county assemblies</strong> — oversight
              through committees and budget approval
            </li>
            <li>
              <strong>National Treasury and county treasuries</strong> —
              day-to-day public financial management within the law
            </li>
          </ul>

          <h2 className="govuk-heading-l">Public participation</h2>
          <p className="govuk-body">
            The Constitution expects public participation in budgeting and other
            governance processes. Counties and national institutions publish
            invitations for input at different stages — check official notices.
          </p>

          <h2 className="govuk-heading-l">Related reading on this site</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/government/counties/devolution" className="govuk-link">
                Devolution
              </Link>
            </li>
            <li>
              <Link href="/county-vs-national" className="govuk-link">
                County vs national
              </Link>
            </li>
            <li>
              <Link href="/open-data" className="govuk-link">
                Open data
              </Link>
            </li>
            <li>
              <Link href="/documents" className="govuk-link">
                Policy documents
              </Link>
            </li>
            <li>
              <Link href="/access-to-information" className="govuk-link">
                Access to information
              </Link>
            </li>
          </ul>

          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              This explainer is simplified. For legal detail, read{" "}
              <Link href={constitutionRefs.publicFinance.href} className="govuk-link">
                {constitutionRefs.publicFinance.label}
              </Link>
              , the Public Finance Management Act via{" "}
              <Link href="/acts/parliament" className="govuk-link">
                Acts of Parliament
              </Link>
              , and official budget documents.
            </p>
          </div>
        </div>

        <RelatedNav
          links={[
            { text: "How government works", href: "/how-government-works" },
            { text: "County vs national", href: "/county-vs-national" },
            { text: "Money and tax topic", href: "/topics/money-tax" },
            { text: "Access to information", href: "/access-to-information" },
            { text: "Commissions", href: "/government/commissions" },
            { text: "Open data", href: "/open-data" },
            {
              text: constitutionRefs.publicFinance.label,
              href: constitutionRefs.publicFinance.href,
            },
          ]}
        />
      </div>
    </>
  );
}
