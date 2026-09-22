// app/how-public-money-works/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
import ExternalLink from "@/components/site/ExternalLink";
import { constitutionRefs } from "@/lib/constitution-links";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "How public money works",
  description:
    "How public money works in Kenya — taxes, budgets, borrowing, national and county revenue sharing, spending, auditing and public participation.",
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
        lead="Government raises money, decides how it will be spent, pays for public services and accounts for what was actually used. This guide explains that process at national and county level."
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            Public money is not simply money held by a ministry or county
            department. Its collection, allocation, withdrawal, spending and
            auditing are governed by the Constitution and public finance laws.
          </div>

          <h2 className="govuk-heading-l">
            The public money cycle
          </h2>

          <p className="govuk-body">
            A simplified way to understand public finance is:
          </p>

          <ol className="govuk-list govuk-list--number">
            <li>
              <strong>Government raises revenue</strong> through taxes, charges,
              grants and other lawful sources.
            </li>
            <li>
              <strong>Government prepares a budget</strong> setting out expected
              revenue and proposed spending.
            </li>
            <li>
              <strong>Parliament or a county assembly approves spending</strong>{" "}
              through the budget and appropriation process.
            </li>
            <li>
              <strong>Money is withdrawn from public funds</strong> in accordance
              with the law.
            </li>
            <li>
              <strong>Ministries, agencies and counties spend the money</strong>{" "}
              on approved programmes and services.
            </li>
            <li>
              <strong>Spending is reported, examined and audited</strong> so that
              institutions can be held accountable.
            </li>
          </ol>

          <p className="govuk-body">
            The constitutional principles governing this system are set out in{" "}
            <Link
              href={constitutionRefs.publicFinance.href}
              className="govuk-link"
            >
              {constitutionRefs.publicFinance.label}
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">
            Principles of public finance
          </h2>

          <p className="govuk-body">
            Article 201 of the Constitution sets principles that apply to public
            finance in Kenya.
          </p>

          <p className="govuk-body">
            They include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>openness and accountability</li>
            <li>public participation in financial matters</li>
            <li>fair sharing of the burden of taxation</li>
            <li>
              equitable sharing of nationally raised revenue between national
              and county governments
            </li>
            <li>equitable development of the country</li>
            <li>
              fairness between present and future generations when public
              resources and borrowing are used
            </li>
            <li>prudent and responsible use of public money</li>
            <li>responsible financial management</li>
            <li>clear fiscal reporting</li>
          </ul>

          <h2 className="govuk-heading-l">
            Where public money comes from
          </h2>

          <p className="govuk-body">
            Government revenue comes from several sources. Taxes are important,
            but they are not the only source of public money.
          </p>

          <p className="govuk-body">
            Sources can include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>income tax</li>
            <li>value added tax (VAT)</li>
            <li>excise duties</li>
            <li>customs duties</li>
            <li>fees and charges for public services</li>
            <li>county own-source revenue</li>
            <li>grants</li>
            <li>investment and other non-tax income</li>
            <li>borrowing used to finance a budget deficit</li>
          </ul>

          <h3 className="govuk-heading-m">
            National taxes
          </h3>

          <p className="govuk-body">
            Under Article 209 of the Constitution, only the national government
            may impose:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>income tax</li>
            <li>value added tax</li>
            <li>customs duties and other duties on imports and exports</li>
            <li>excise tax</li>
          </ul>

          <p className="govuk-body">
            Many national taxes are administered by the Kenya Revenue Authority
            (KRA).
          </p>

          <p className="govuk-body">
            If you need information about your own taxes, see{" "}
            <Link href="/topics/money-tax" className="govuk-link">
              money and tax
            </Link>
            .
          </p>

          <h3 className="govuk-heading-m">
            County revenue
          </h3>

          <p className="govuk-body">
            Counties do not have the same taxing powers as the national
            government.
          </p>

          <p className="govuk-body">
            The Constitution allows county governments to impose:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>property rates</li>
            <li>entertainment taxes</li>
            <li>taxes authorised for counties by an Act of Parliament</li>
            <li>charges for services they provide</li>
          </ul>

          <p className="govuk-body">
            County revenue can therefore include items such as property rates,
            permit fees, parking charges, market charges and other lawful
            county fees, depending on the county and service.
          </p>

          <div className="govuk-inset-text">
            A government body cannot simply invent a tax or licensing fee.
            Article 210 of the Constitution requires taxes and licensing fees
            to be imposed, waived or varied in accordance with legislation.
          </div>

          <h2 className="govuk-heading-l">
            Where government money is kept
          </h2>

          <p className="govuk-body">
            The Constitution establishes public funds through which government
            revenue is managed.
          </p>

          <h3 className="govuk-heading-m">
            Consolidated Fund
          </h3>

          <p className="govuk-body">
            Money raised or received by or on behalf of the national government
            is generally paid into the Consolidated Fund, subject to exceptions
            provided by law.
          </p>

          <p className="govuk-body">
            Money cannot simply be withdrawn from the fund because a ministry
            wants to spend it. The withdrawal must have legal authority.
          </p>

          <h3 className="govuk-heading-m">
            County Revenue Fund
          </h3>

          <p className="govuk-body">
            Each county has a County Revenue Fund. Money raised or received by
            or on behalf of the county government is generally paid into that
            fund, subject to the Constitution and legislation.
          </p>

          <h3 className="govuk-heading-m">
            Equalisation Fund
          </h3>

          <p className="govuk-body">
            The Constitution also establishes the Equalisation Fund to support
            basic services in marginalised areas so that the quality of those
            services can be brought closer to the level generally enjoyed
            elsewhere in Kenya.
          </p>

          <p className="govuk-body">
            The Constitution identifies services including water, roads, health
            facilities and electricity.
          </p>

          <h2 className="govuk-heading-l">
            How the national budget is made
          </h2>

          <p className="govuk-body">
            Kenya&apos;s budget is a process, not a single event on Budget Day.
            Work on the next financial year begins months before Parliament
            approves the final spending plans.
          </p>

          <p className="govuk-body">
            The National Treasury manages the national government budget
            process.
          </p>

          <h3 className="govuk-heading-m">
            Budget Policy Statement
          </h3>

          <p className="govuk-body">
            An important stage is the Budget Policy Statement (BPS). It sets out
            broad strategic priorities and the fiscal framework for the coming
            financial year and the medium term.
          </p>

          <p className="govuk-body">
            It includes information such as:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>the economic outlook</li>
            <li>expected revenue</li>
            <li>planned expenditure</li>
            <li>borrowing and deficit financing</li>
            <li>proposed expenditure limits</li>
            <li>indicative transfers to county governments</li>
            <li>fiscal risks and financial objectives</li>
          </ul>

          <p className="govuk-body">
            <ExternalLink href="https://www.treasury.go.ke/budget-policy-statement">
              Budget Policy Statements — National Treasury
            </ExternalLink>
          </p>

          <h3 className="govuk-heading-m">
            Budget estimates
          </h3>

          <p className="govuk-body">
            Ministries and other national government entities prepare detailed
            estimates showing how much they expect to spend and on which
            programmes.
          </p>

          <p className="govuk-body">
            The Public Finance Management Act requires the national budget
            estimates to identify expenditure by vote and programme and to
            distinguish recurrent and development expenditure.
          </p>

          <h3 className="govuk-heading-m">
            National Assembly approval
          </h3>

          <p className="govuk-body">
            The national government&apos;s estimates are considered by the
            National Assembly. Parliamentary committees examine proposed
            expenditure and are required to take public views into account.
          </p>

          <p className="govuk-body">
            Approval of budget estimates does not by itself mean every public
            body can immediately take money from the Treasury. Spending must
            also have the required legal authority.
          </p>

          <h2 className="govuk-heading-l">
            Appropriation and taxation are different
          </h2>

          <p className="govuk-body">
            Several Bills and Acts appear during a budget cycle. They do
            different jobs.
          </p>

          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Finance legislation
              </dt>
              <dd className="govuk-summary-list__value">
                Deals with revenue measures such as taxes and other fiscal
                proposals. It is about how government raises revenue.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Appropriation Act
              </dt>
              <dd className="govuk-summary-list__value">
                Gives legal authority for specified public expenditure. It is
                about what government is authorised to spend.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Division of Revenue Act
              </dt>
              <dd className="govuk-summary-list__value">
                Provides for the division of nationally raised revenue between
                the national and county levels of government for the financial
                year.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                County Allocation of Revenue Act
              </dt>
              <dd className="govuk-summary-list__value">
                Provides for the allocation among the 47 counties of the county
                governments&apos; share of nationally raised revenue and related
                allocations for the financial year.
              </dd>
            </div>
          </dl>

          <h2 className="govuk-heading-l">
            How counties get a share of national revenue
          </h2>

          <p className="govuk-body">
            Revenue raised nationally is shared between the national and county
            levels of government.
          </p>

          <p className="govuk-body">
            This is commonly described using two terms:
          </p>

          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Vertical sharing
              </dt>
              <dd className="govuk-summary-list__value">
                Deciding how nationally raised revenue is divided between the
                national government and the county level of government.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Horizontal sharing
              </dt>
              <dd className="govuk-summary-list__value">
                Deciding how the county share is distributed among Kenya&apos;s
                47 county governments.
              </dd>
            </div>
          </dl>

          <h3 className="govuk-heading-m">
            The Commission on Revenue Allocation
          </h3>

          <p className="govuk-body">
            The Commission on Revenue Allocation (CRA) makes recommendations on
            the basis for equitable sharing of nationally raised revenue both
            between the two levels of government and among county governments.
          </p>

          <p className="govuk-body">
            CRA considers the constitutional criteria for equitable sharing,
            including the functions of the two levels of government, county
            needs, economic disparities and fiscal responsibility.
          </p>

          <p className="govuk-body">
            <ExternalLink href="https://cra.go.ke/">
              Commission on Revenue Allocation
            </ExternalLink>
          </p>

          <h3 className="govuk-heading-m">
            The 15% constitutional minimum
          </h3>

          <p className="govuk-body">
            Article 203 of the Constitution provides that the equitable share
            allocated to county governments must be at least{" "}
            <strong>15%</strong> of all revenue collected by the national
            government.
          </p>

          <p className="govuk-body">
            For this constitutional calculation, the percentage is based on the
            most recent audited accounts of revenue received that have been
            approved by the National Assembly.
          </p>

          <div className="govuk-inset-text">
            <strong>The 15% figure is a minimum, not a fixed county share.</strong>
            <br />
            The amount allocated to counties in a particular year can be higher
            than the constitutional minimum.
          </div>

          <h3 className="govuk-heading-m">
            How the money is divided among the 47 counties
          </h3>

          <p className="govuk-body">
            The Constitution gives the Senate the role of determining
            periodically the basis for sharing the county equitable share among
            the 47 counties, after considering CRA&apos;s recommendations and
            the constitutional criteria.
          </p>

          <p className="govuk-body">
            The formula can therefore change over time. Factors used in a
            particular revenue-sharing basis should be checked against the
            current parliamentary determination rather than assumed from an
            older formula.
          </p>

          <h2 className="govuk-heading-l">
            Counties can receive more than the equitable share
          </h2>

          <p className="govuk-body">
            The equitable share is not necessarily the only transfer a county
            receives from the national level.
          </p>

          <p className="govuk-body">
            Counties may also receive additional allocations from the national
            government&apos;s share of revenue, including allocations connected
            to particular programmes or purposes where provided for by law.
          </p>

          <p className="govuk-body">
            They may also receive grants and other lawful financing.
          </p>

          <h2 className="govuk-heading-l">
            How county budgets work
          </h2>

          <p className="govuk-body">
            Each of Kenya&apos;s 47 county governments has its own budget
            process.
          </p>

          <p className="govuk-body">
            The county treasury prepares the county&apos;s fiscal plans and
            budget estimates, while the county assembly considers and approves
            the budget.
          </p>

          <h3 className="govuk-heading-m">
            County Fiscal Strategy Paper
          </h3>

          <p className="govuk-body">
            Each county prepares a County Fiscal Strategy Paper setting out its
            broad priorities and financial outlook for the coming financial
            year and the medium term.
          </p>

          <p className="govuk-body">
            The Public Finance Management Act requires the county treasury to
            seek and take into account views from the public when preparing this
            document.
          </p>

          <h3 className="govuk-heading-m">
            County budget estimates
          </h3>

          <p className="govuk-body">
            The county executive submits budget estimates to the county
            assembly. The estimates show expected revenue and planned
            expenditure by county entities and programmes.
          </p>

          <p className="govuk-body">
            The county assembly considers the estimates and takes public views
            into account before approving the county budget.
          </p>

          <h3 className="govuk-heading-m">
            County Finance and Appropriation laws
          </h3>

          <p className="govuk-body">
            Counties also enact laws necessary to implement their budgets.
            A county Finance Act may provide for county revenue measures, while
            a County Appropriation Act authorises expenditure from the county
            budget.
          </p>

          <h2 className="govuk-heading-l">
            What recurrent and development spending mean
          </h2>

          <p className="govuk-body">
            Government budgets distinguish between recurrent and development
            expenditure.
          </p>

          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Recurrent expenditure
              </dt>
              <dd className="govuk-summary-list__value">
                Ongoing costs of running government and delivering services,
                such as salaries, operations and other recurring expenses.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Development expenditure
              </dt>
              <dd className="govuk-summary-list__value">
                Spending associated with development programmes, projects and
                investment intended to create or improve public assets and
                services.
              </dd>
            </div>
          </dl>

          <p className="govuk-body">
            The label &quot;development&quot; does not by itself tell you whether
            money was well spent. Actual performance still needs to be examined
            against what was budgeted and what was delivered.
          </p>

          <h2 className="govuk-heading-l">
            What happens when revenue is not enough
          </h2>

          <p className="govuk-body">
            A government budget can plan to spend more than the revenue expected
            from taxes and other ordinary sources. The difference is a{" "}
            <strong>budget deficit</strong>.
          </p>

          <p className="govuk-body">
            A deficit may be financed through borrowing and other lawful
            financing arrangements.
          </p>

          <p className="govuk-body">
            Public borrowing is therefore part of public finance. It can provide
            resources now, but the debt, interest and other obligations affect
            future budgets.
          </p>

          <div className="govuk-inset-text">
            Article 201 requires the burdens and benefits of the use of public
            resources and public borrowing to be shared equitably between
            present and future generations.
          </div>

          <h2 className="govuk-heading-l">
            A budget is not the same as actual spending
          </h2>

          <p className="govuk-body">
            This distinction is important when reading government figures.
          </p>

          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Budgeted
              </dt>
              <dd className="govuk-summary-list__value">
                What government planned or was authorised to spend.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Released
              </dt>
              <dd className="govuk-summary-list__value">
                Money made available during budget implementation.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Spent
              </dt>
              <dd className="govuk-summary-list__value">
                Expenditure actually incurred or recorded.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Audited
              </dt>
              <dd className="govuk-summary-list__value">
                Spending and financial statements examined later through the
                audit process.
              </dd>
            </div>
          </dl>

          <p className="govuk-body">
            A headline saying that KSh 10 billion was &quot;allocated&quot; does
            not necessarily mean KSh 10 billion was eventually spent or that the
            intended result was delivered.
          </p>

          <h2 className="govuk-heading-l">
            Who checks public spending
          </h2>

          <h3 className="govuk-heading-m">
            Controller of Budget
          </h3>

          <p className="govuk-body">
            The Controller of Budget is an independent office established under
            Article 228 of the Constitution.
          </p>

          <p className="govuk-body">
            The Controller oversees implementation of national and county
            budgets by authorising withdrawals from specified public funds.
            A withdrawal cannot be approved unless the Controller is satisfied
            that it is authorised by law.
          </p>

          <p className="govuk-body">
            The office also publishes reports on national and county budget
            implementation.
          </p>

          <p className="govuk-body">
            <ExternalLink href="https://cob.go.ke/">
              Office of the Controller of Budget
            </ExternalLink>
          </p>

          <h3 className="govuk-heading-m">
            Auditor-General
          </h3>

          <p className="govuk-body">
            The Auditor-General independently audits the accounts of national
            and county government institutions and other public entities that
            fall within the constitutional mandate.
          </p>

          <p className="govuk-body">
            An audit looks back at how public money was accounted for and used.
            Audit reports can identify matters requiring explanation,
            correction, recovery or further scrutiny.
          </p>

          <p className="govuk-body">
            <ExternalLink href="https://www.oagkenya.go.ke/">
              Office of the Auditor-General
            </ExternalLink>
          </p>

          <h3 className="govuk-heading-m">
            Parliament and county assemblies
          </h3>

          <p className="govuk-body">
            Parliament exercises national-level budget and financial oversight
            through the constitutional and legislative process, including
            committees that examine expenditure and audit findings.
          </p>

          <p className="govuk-body">
            County assemblies perform corresponding legislative and oversight
            functions over county budgets and county public finances.
          </p>

          <h3 className="govuk-heading-m">
            National Treasury and county treasuries
          </h3>

          <p className="govuk-body">
            The National Treasury manages the national public finance framework
            and national budget process within its legal mandate.
          </p>

          <p className="govuk-body">
            County treasuries perform public financial management functions for
            their respective county governments.
          </p>

          <h2 className="govuk-heading-l">
            Controller of Budget and Auditor-General are different
          </h2>

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

          <h2 className="govuk-heading-l">
            Supplementary budgets
          </h2>

          <p className="govuk-body">
            An approved annual budget can change during the financial year.
          </p>

          <p className="govuk-body">
            Government may seek supplementary appropriations where additional
            spending or changes to previously approved allocations are legally
            justified.
          </p>

          <p className="govuk-body">
            A supplementary budget does not mean the ordinary approval process
            disappears. Changes to public expenditure still require the
            constitutional and legislative authority applicable to them.
          </p>

          <h2 className="govuk-heading-l">
            Public participation in budgets
          </h2>

          <p className="govuk-body">
            Public participation is not simply a courtesy. Article 201 of the
            Constitution expressly includes public participation as a principle
            of public finance.
          </p>

          <p className="govuk-body">
            The Public Finance Management Act also builds public participation
            into national and county budget processes.
          </p>

          <p className="govuk-body">
            Opportunities may include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>public budget hearings</li>
            <li>submissions to parliamentary committees</li>
            <li>county budget consultations</li>
            <li>comments on fiscal strategy documents</li>
            <li>participation through County Budget and Economic Forums</li>
          </ul>

          <p className="govuk-body">
            Notices, deadlines and submission methods change from one budget
            cycle to another, so check current notices from Parliament, the
            National Treasury, your county government and county assembly.
          </p>

          <h2 className="govuk-heading-l">
            How to read a public budget
          </h2>

          <p className="govuk-body">
            When you see a budget figure, ask:
          </p>

          <ol className="govuk-list govuk-list--number">
            <li>
              <strong>Which financial year is this?</strong>
            </li>
            <li>
              <strong>Is the figure proposed, approved or actual?</strong>
            </li>
            <li>
              <strong>Is it recurrent or development expenditure?</strong>
            </li>
            <li>
              <strong>Which ministry, department, agency or county owns it?</strong>
            </li>
            <li>
              <strong>What programme or project is the money for?</strong>
            </li>
            <li>
              <strong>Has the money actually been released?</strong>
            </li>
            <li>
              <strong>How much has actually been spent?</strong>
            </li>
            <li>
              <strong>What was actually delivered?</strong>
            </li>
            <li>
              <strong>What did the Controller of Budget report?</strong>
            </li>
            <li>
              <strong>What did the Auditor-General find?</strong>
            </li>
          </ol>

          <div className="govuk-inset-text">
            <strong>Allocation does not mean expenditure.</strong>
            <br />
            A budget tells you what government plans or is authorised to spend.
            Budget implementation and audit reports help show what happened
            afterwards.
          </div>

          <h2 className="govuk-heading-l">
            Where to find official public finance information
          </h2>

          <ul className="govuk-list">
            <li>
              <ExternalLink href="https://www.treasury.go.ke/">
                National Treasury
              </ExternalLink>
              <br />
              <span className="govuk-body-s">
                National budgets, fiscal policy, Budget Policy Statements and
                related documents.
              </span>
            </li>

            <li className="govuk-!-margin-top-3">
              <ExternalLink href="https://cra.go.ke/">
                Commission on Revenue Allocation
              </ExternalLink>
              <br />
              <span className="govuk-body-s">
                Revenue-sharing recommendations and information about financing
                county governments.
              </span>
            </li>

            <li className="govuk-!-margin-top-3">
              <ExternalLink href="https://cob.go.ke/">
                Office of the Controller of Budget
              </ExternalLink>
              <br />
              <span className="govuk-body-s">
                National and county budget implementation reports.
              </span>
            </li>

            <li className="govuk-!-margin-top-3">
              <ExternalLink href="https://www.oagkenya.go.ke/">
                Office of the Auditor-General
              </ExternalLink>
              <br />
              <span className="govuk-body-s">
                Audit reports for ministries, counties, state corporations and
                other public entities.
              </span>
            </li>

            <li className="govuk-!-margin-top-3">
              <ExternalLink href="https://new.kenyalaw.org/">
                Kenya Law
              </ExternalLink>
              <br />
              <span className="govuk-body-s">
                The Constitution, Public Finance Management Act, annual finance
                and appropriation legislation and other laws.
              </span>
            </li>
          </ul>

          <h2 className="govuk-heading-l">
            Find public finance information on CitizenGuide.KE
          </h2>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link
                href="/government/counties/devolution"
                className="govuk-link"
              >
                How devolution works
              </Link>
            </li>

            <li>
              <Link href="/county-vs-national" className="govuk-link">
                County government vs national government
              </Link>
            </li>

            <li>
              <Link href="/topics/money-tax" className="govuk-link">
                Money and tax
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

            <li>
              <Link href="/acts/parliament" className="govuk-link">
                Acts of Parliament
              </Link>
            </li>
          </ul>

          <h2 className="govuk-heading-l">
            Legal framework
          </h2>

          <p className="govuk-body">
            This page is a simplified explanation. Kenya&apos;s public finance
            framework is mainly governed by Chapter Twelve of the Constitution,
            the Public Finance Management Act and other legislation dealing with
            taxation, revenue sharing, appropriation, audit and public bodies.
          </p>

          <p className="govuk-body">
            For legal detail, start with{" "}
            <Link
              href={constitutionRefs.publicFinance.href}
              className="govuk-link"
            >
              {constitutionRefs.publicFinance.label}
            </Link>{" "}
            and the{" "}
            <Link href="/acts/parliament" className="govuk-link">
              Acts of Parliament
            </Link>
            .
          </p>

          <p className="govuk-body govuk-!-margin-top-8">
            <strong>Last updated:</strong> 10 September 2026
          </p>
        </div>

        <RelatedNav
          links={[
            {
              text: "How government works",
              href: "/how-government-works",
            },
            {
              text: "County vs national",
              href: "/county-vs-national",
            },
            {
              text: "Devolution",
              href: "/government/counties/devolution",
            },
            {
              text: "Money and tax",
              href: "/topics/money-tax",
            },
            {
              text: "Access to information",
              href: "/access-to-information",
            },
            {
              text: "Open data",
              href: "/open-data",
            },
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