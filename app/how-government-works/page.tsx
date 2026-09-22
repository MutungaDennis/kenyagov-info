// app/how-government-works/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
import { constitutionRefs } from "@/lib/constitution-links";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "How government works",
  description:
    "How government works in Kenya under the Constitution — sovereign power, the Executive, Parliament, Judiciary, counties, commissions, elections and public accountability.",
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
        lead="Kenya is governed under the Constitution through national and county governments. Public power is exercised through institutions including the Executive, Parliament, the Judiciary, county governments and independent constitutional bodies."
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            The Constitution starts from an important principle: sovereign power
            belongs to the people of Kenya. Government institutions exercise
            public authority on behalf of the people and within the limits of
            the Constitution.
          </div>

          <h2 className="govuk-heading-l">
            The Constitution is the supreme law
          </h2>

          <p className="govuk-body">
            The{" "}
            <Link href="/constitution" className="govuk-link">
              Constitution of Kenya 2010
            </Link>{" "}
            is the supreme law of Kenya. All public institutions and state
            officers must exercise their powers consistently with it.
          </p>

          <p className="govuk-body">
            The Constitution sets out:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>how sovereign power is exercised</li>
            <li>rights and fundamental freedoms</li>
            <li>national values and principles of governance</li>
            <li>the structure and powers of public institutions</li>
            <li>leadership and integrity requirements</li>
            <li>the system of devolution</li>
            <li>elections and political representation</li>
            <li>public finance</li>
            <li>independent commissions and offices</li>
          </ul>

          <p className="govuk-body">
            Useful parts of the Constitution include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link
                href={constitutionRefs.nationalValues.href}
                className="govuk-link"
              >
                {constitutionRefs.nationalValues.label}
              </Link>
            </li>

            <li>
              <Link
                href={constitutionRefs.billOfRights.href}
                className="govuk-link"
              >
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
          </ul>

          <h2 className="govuk-heading-l">
            Sovereign power belongs to the people
          </h2>

          <p className="govuk-body">
            Kenya&apos;s constitutional system begins with the people rather
            than with the President, Parliament or any other institution.
          </p>

          <p className="govuk-body">
            Sovereign power may be exercised directly by the people or through
            democratically elected representatives.
          </p>

          <p className="govuk-body">
            Under the Constitution, that power is delegated to:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>Parliament and county legislative assemblies</li>
            <li>the national Executive and county executive structures</li>
            <li>the Judiciary and independent tribunals</li>
          </ul>

          <div className="govuk-inset-text">
            Holding a public office does not give a person unlimited authority.
            Every public institution can exercise only the powers given to it
            by the Constitution and the law.
          </div>

          <h2 className="govuk-heading-l">
            Kenya has 2 levels of government
          </h2>

          <p className="govuk-body">
            Kenya has a <strong>national government</strong> and{" "}
            <strong>47 county governments</strong>.
          </p>

          <p className="govuk-body">
            The Constitution describes the two levels as distinct and
            interdependent. They are expected to conduct their relations on the
            basis of consultation and cooperation.
          </p>

          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                National government
              </dt>

              <dd className="govuk-summary-list__value">
                Handles functions assigned nationally by the Constitution,
                including areas such as defence, foreign affairs, national
                economic policy and other national functions.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                County governments
              </dt>

              <dd className="govuk-summary-list__value">
                Handle functions assigned to counties, including many services
                delivered locally.
              </dd>
            </div>
          </dl>

          <p className="govuk-body">
            The main division of functions is set out in the Fourth Schedule to
            the Constitution.
          </p>

          <p className="govuk-body">
            <Link href="/county-vs-national" className="govuk-link">
              See which services belong to county and national government
            </Link>
          </p>

          <h2 className="govuk-heading-l">
            The main institutions of national government
          </h2>

          <p className="govuk-body">
            At national level, public power is distributed among the Executive,
            Parliament and the Judiciary.
          </p>

          <p className="govuk-body">
            They perform different constitutional roles. This helps prevent
            public power from being concentrated in one institution.
          </p>

          <h3 className="govuk-heading-m">
            The Executive
          </h3>

          <p className="govuk-body">
            The national Executive includes the President, Deputy President and
            the rest of the Cabinet.
          </p>

          <p className="govuk-body">
            The President is both Head of State and Head of Government.
          </p>

          <p className="govuk-body">
            The Executive is responsible for functions such as:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>implementing national laws and policies</li>
            <li>directing national administration</li>
            <li>developing government policy</li>
            <li>coordinating ministries and state departments</li>
            <li>preparing national budget and policy proposals</li>
            <li>performing other executive functions assigned by law</li>
          </ul>

          <p className="govuk-body">
            Cabinet Secretaries are responsible for ministries or areas of
            government assigned to them.
          </p>

          <p className="govuk-body">
            See{" "}
            <Link
              href={constitutionRefs.executive.href}
              className="govuk-link"
            >
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
              <Link
                href="/government/institutions"
                className="govuk-link"
              >
                Ministries and public institutions
              </Link>
            </li>
          </ul>

          <h3 className="govuk-heading-m">
            Parliament
          </h3>

          <p className="govuk-body">
            Parliament is Kenya&apos;s national legislature. It consists of the{" "}
            <strong>National Assembly</strong> and the <strong>Senate</strong>.
          </p>

          <p className="govuk-body">
            Parliament makes legislation, represents the people and performs
            oversight and financial functions given to it by the Constitution.
          </p>

          <p className="govuk-body">
            See{" "}
            <Link
              href={constitutionRefs.legislature.href}
              className="govuk-link"
            >
              {constitutionRefs.legislature.label}
            </Link>
            .
          </p>

          <h4 className="govuk-heading-s">
            National Assembly
          </h4>

          <p className="govuk-body">
            The National Assembly represents the people of constituencies and
            special interests provided for by the Constitution.
          </p>

          <p className="govuk-body">
            Its functions include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>participating in national law-making</li>
            <li>determining allocation of national revenue</li>
            <li>appropriating money for national government expenditure</li>
            <li>overseeing national revenue and expenditure</li>
            <li>overseeing state organs within its constitutional mandate</li>
          </ul>

          <h4 className="govuk-heading-s">
            Senate
          </h4>

          <p className="govuk-body">
            The Senate represents the counties and serves to protect the
            interests of counties and their governments.
          </p>

          <p className="govuk-body">
            Its functions include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              participating in law-making where Bills concern county governments
            </li>
            <li>
              determining the allocation of nationally raised revenue among
              counties as provided by the Constitution
            </li>
            <li>
              overseeing national revenue allocated to county governments
            </li>
            <li>
              participating in certain constitutional proceedings involving the
              President or Deputy President
            </li>
          </ul>

          <div className="govuk-inset-text">
            The National Assembly and Senate are both parts of Parliament, but
            they do not perform identical functions.
          </div>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link
                href="/government/legislature"
                className="govuk-link"
              >
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

          <h3 className="govuk-heading-m">
            The Judiciary
          </h3>

          <p className="govuk-body">
            Judicial authority is exercised by courts and tribunals established
            by or under the Constitution.
          </p>

          <p className="govuk-body">
            The Judiciary interprets and applies the law, resolves disputes and
            protects the constitutional and legal rights of people appearing
            before the courts.
          </p>

          <p className="govuk-body">
            Judges and judicial officers are required to exercise judicial
            authority independently and subject only to the Constitution and
            the law.
          </p>

          <p className="govuk-body">
            See{" "}
            <Link
              href={constitutionRefs.judiciary.href}
              className="govuk-link"
            >
              {constitutionRefs.judiciary.label}
            </Link>
            .
          </p>

          <h4 className="govuk-heading-s">
            Superior courts
          </h4>

          <ul className="govuk-list govuk-list--bullet">
            <li>Supreme Court</li>
            <li>Court of Appeal</li>
            <li>High Court</li>
            <li>Employment and Labour Relations Court</li>
            <li>Environment and Land Court</li>
          </ul>

          <h4 className="govuk-heading-s">
            Subordinate courts
          </h4>

          <p className="govuk-body">
            The judicial system also includes subordinate courts established
            under the Constitution and legislation, including magistrates&apos;
            courts and other courts or tribunals provided for by law.
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/government/judiciary" className="govuk-link">
                How the Judiciary works
              </Link>
            </li>

            <li>
              <Link href="/topics/crime-justice" className="govuk-link">
                Crime, justice and the law
              </Link>
            </li>
          </ul>

          <h2 className="govuk-heading-l">
            Separation of powers
          </h2>

          <p className="govuk-body">
            The Executive, Legislature and Judiciary have different roles and
            constitutional powers.
          </p>

          <p className="govuk-body">
            In simple terms:
          </p>

          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Executive
              </dt>

              <dd className="govuk-summary-list__value">
                Administers government and implements law and policy.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Parliament
              </dt>

              <dd className="govuk-summary-list__value">
                Makes legislation, represents citizens and oversees public
                administration and finances within its mandate.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Judiciary
              </dt>

              <dd className="govuk-summary-list__value">
                Interprets and applies the law and resolves disputes
                independently.
              </dd>
            </div>
          </dl>

          <p className="govuk-body">
            Separation of powers does not mean that these institutions never
            interact. The Constitution creates checks, approvals and oversight
            relationships between them.
          </p>

          <h2 className="govuk-heading-l">
            County governments and devolution
          </h2>

          <p className="govuk-body">
            The Constitution established 47 county governments as part of the
            system of devolved government.
          </p>

          <p className="govuk-body">
            Devolution is intended to bring government and services closer to
            people, promote participation, recognise diversity and support more
            equitable development.
          </p>

          <p className="govuk-body">
            See{" "}
            <Link
              href={constitutionRefs.devolvedGovernment.href}
              className="govuk-link"
            >
              {constitutionRefs.devolvedGovernment.label}
            </Link>
            .
          </p>

          <h3 className="govuk-heading-m">
            County executive
          </h3>

          <p className="govuk-body">
            Each county has an executive headed by the county governor.
          </p>

          <p className="govuk-body">
            The county executive implements county legislation and manages the
            county functions assigned under the Constitution and legislation.
          </p>

          <h3 className="govuk-heading-m">
            County assembly
          </h3>

          <p className="govuk-body">
            Each county also has a county assembly made up of elected and
            nominated members as provided by the Constitution.
          </p>

          <p className="govuk-body">
            A county assembly:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>makes county legislation</li>
            <li>approves county budgets</li>
            <li>oversees the county executive</li>
            <li>represents residents of the county</li>
          </ul>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/county-vs-national" className="govuk-link">
                County vs national government
              </Link>
            </li>

            <li>
              <Link
                href="/government/counties"
                className="govuk-link"
              >
                Browse county governments
              </Link>
            </li>

            <li>
              <Link
                href="/government/counties/devolution"
                className="govuk-link"
              >
                How devolution works
              </Link>
            </li>
          </ul>

          <h2 className="govuk-heading-l">
            Who does what?
          </h2>

          <p className="govuk-body">
            One of the most common sources of confusion is which level of
            government is responsible for a service.
          </p>

          <p className="govuk-body">
            Examples of functions assigned nationally include areas such as:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>foreign affairs</li>
            <li>defence and national security</li>
            <li>immigration and citizenship</li>
            <li>national economic policy</li>
            <li>national transport functions</li>
          </ul>

          <p className="govuk-body">
            County functions include many locally delivered services, such as:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>county health services</li>
            <li>county transport functions</li>
            <li>trade development and regulation within county functions</li>
            <li>county planning and development</li>
            <li>pre-primary education</li>
            <li>certain agriculture functions</li>
          </ul>

          <p className="govuk-body">
            Some sectors involve responsibilities at both levels, so the precise
            constitutional or statutory function matters.
          </p>

          <p className="govuk-body">
            <Link href="/county-vs-national" className="govuk-link">
              Check county and national government responsibilities
            </Link>
          </p>

          <h2 className="govuk-heading-l">
            Independent commissions and offices
          </h2>

          <p className="govuk-body">
            The Constitution establishes a number of commissions and independent
            offices to perform specialised constitutional functions.
          </p>

          <p className="govuk-body">
            See{" "}
            <Link
              href={constitutionRefs.commissions.href}
              className="govuk-link"
            >
              {constitutionRefs.commissions.label}
            </Link>
            .
          </p>

          <p className="govuk-body">
            Their purposes include protecting constitutionalism, democratic
            governance, accountability and particular areas of public
            administration.
          </p>

          <p className="govuk-body">
            Examples include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              Independent Electoral and Boundaries Commission — elections and
              electoral boundaries within its mandate
            </li>
            <li>
              Commission on Revenue Allocation — recommendations on sharing
              nationally raised revenue
            </li>
            <li>
              Public Service Commission — constitutional public-service
              functions
            </li>
            <li>
              Salaries and Remuneration Commission — remuneration functions for
              state and public officers within its mandate
            </li>
            <li>
              Kenya National Commission on Human Rights — protection and
              promotion of human rights
            </li>
          </ul>

          <p className="govuk-body">
            The Constitution also establishes the independent offices of the
            Auditor-General and Controller of Budget.
          </p>

          <p className="govuk-body">
            <Link href="/government/commissions" className="govuk-link">
              Browse commissions and independent offices
            </Link>
          </p>

          <h2 className="govuk-heading-l">
            Elections and representation
          </h2>

          <p className="govuk-body">
            Elections are one of the main ways citizens exercise sovereign
            power through representatives.
          </p>

          <p className="govuk-body">
            Kenyan voters elect public representatives including:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>the President</li>
            <li>Members of the National Assembly</li>
            <li>county woman representatives to the National Assembly</li>
            <li>senators</li>
            <li>county governors</li>
            <li>Members of County Assembly (MCAs)</li>
          </ul>

          <p className="govuk-body">
            The Independent Electoral and Boundaries Commission (IEBC)
            administers elections and performs other electoral functions given
            to it by the Constitution and legislation.
          </p>

          <p className="govuk-body">
            Political rights are protected under{" "}
            <Link
              href={constitutionRefs.politicalRights.href}
              className="govuk-link"
            >
              {constitutionRefs.politicalRights.label}
            </Link>
            .
          </p>

          <p className="govuk-body">
            See also{" "}
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

          <h2 className="govuk-heading-l">
            Government between elections
          </h2>

          <p className="govuk-body">
            Democracy does not end after an election. Citizens can take part in
            government and hold institutions accountable between elections.
          </p>

          <p className="govuk-body">
            Depending on the issue, this can include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>taking part in public participation processes</li>
            <li>submitting views on Bills and budgets</li>
            <li>petitioning Parliament or a county assembly</li>
            <li>requesting information from public bodies</li>
            <li>contacting elected representatives</li>
            <li>making complaints about public services</li>
            <li>challenging unlawful government action through legal processes</li>
          </ul>

          <p className="govuk-body">
            <Link
              href="/find-your-representatives"
              className="govuk-link"
            >
              Find your representatives
            </Link>
          </p>

          <h2 className="govuk-heading-l">
            National values apply to government
          </h2>

          <p className="govuk-body">
            Article 10 of the Constitution sets out national values and
            principles of governance that bind state organs, state officers,
            public officers and other persons when applying or interpreting the
            Constitution, enacting or applying law, or making and implementing
            public policy.
          </p>

          <p className="govuk-body">
            These include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>the rule of law</li>
            <li>democracy</li>
            <li>participation of the people</li>
            <li>human dignity</li>
            <li>equity</li>
            <li>social justice</li>
            <li>inclusiveness</li>
            <li>equality</li>
            <li>human rights</li>
            <li>non-discrimination</li>
            <li>good governance</li>
            <li>integrity</li>
            <li>transparency</li>
            <li>accountability</li>
          </ul>

          <p className="govuk-body">
            <Link
              href={constitutionRefs.nationalValues.href}
              className="govuk-link"
            >
              {constitutionRefs.nationalValues.label}
            </Link>
          </p>

          <h2 className="govuk-heading-l">
            Public money and accountability
          </h2>

          <p className="govuk-body">
            Public institutions also operate within constitutional rules on
            taxation, budgeting, spending, borrowing, audit and revenue sharing.
          </p>

          <p className="govuk-body">
            National and county governments prepare budgets, while institutions
            including Parliament, county assemblies, the Controller of Budget
            and Auditor-General perform different financial oversight
            functions.
          </p>

          <p className="govuk-body">
            See{" "}
            <Link
              href={constitutionRefs.publicFinance.href}
              className="govuk-link"
            >
              {constitutionRefs.publicFinance.label}
            </Link>
            .
          </p>

          <p className="govuk-body">
            <Link href="/how-public-money-works" className="govuk-link">
              How public money works
            </Link>
          </p>

          <h2 className="govuk-heading-l">
            Checks and accountability
          </h2>

          <p className="govuk-body">
            No single institution is responsible for all government
            accountability.
          </p>

          <p className="govuk-body">
            Different mechanisms include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>parliamentary and county assembly oversight</li>
            <li>independent courts</li>
            <li>constitutional commissions and independent offices</li>
            <li>financial audit</li>
            <li>budget oversight</li>
            <li>public participation</li>
            <li>access to information</li>
            <li>administrative complaint procedures</li>
            <li>elections</li>
          </ul>

          <p className="govuk-body">
            If you have a problem with a government service or public body, the
            correct route depends on the type of complaint.
          </p>

          <p className="govuk-body">
            <Link
              href="/complain-about-government"
              className="govuk-link"
            >
              How to complain about government
            </Link>
          </p>

          <h2 className="govuk-heading-l">
            Who should I contact?
          </h2>

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

          <h2 className="govuk-heading-l">
            A simple way to understand the system
          </h2>

          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                People
              </dt>
              <dd className="govuk-summary-list__value">
                Hold sovereign power.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Constitution
              </dt>
              <dd className="govuk-summary-list__value">
                Sets the rules, institutions, rights and limits on public power.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Executive
              </dt>
              <dd className="govuk-summary-list__value">
                Administers government and implements law and policy.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Parliament and county assemblies
              </dt>
              <dd className="govuk-summary-list__value">
                Make legislation, represent the public and conduct oversight.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Judiciary
              </dt>
              <dd className="govuk-summary-list__value">
                Resolves disputes and interprets and applies the law
                independently.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Counties
              </dt>
              <dd className="govuk-summary-list__value">
                Exercise devolved functions and provide many services locally.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Independent bodies
              </dt>
              <dd className="govuk-summary-list__value">
                Perform specialised constitutional oversight and governance
                functions.
              </dd>
            </div>
          </dl>

          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              This page is a simplified explanation of Kenya&apos;s
              constitutional system. For the precise powers and duties of an
              institution, read the Constitution and the legislation governing
              that institution. CitizenGuide.KE is independent and is not an
              official government publication.{" "}
              <Link href="/disclaimer" className="govuk-link">
                Read our disclaimer
              </Link>
              .
            </p>
          </div>

          <p className="govuk-body govuk-!-margin-top-8">
            <strong>Last updated:</strong> 10 September 2026
          </p>
        </div>

        <RelatedNav
          links={[
            {
              text: "Government hub",
              href: "/government",
            },
            {
              text: "Find your representatives",
              href: "/find-your-representatives",
            },
            {
              text: "County vs national",
              href: "/county-vs-national",
            },
            {
              text: "How public money works",
              href: "/how-public-money-works",
            },
            {
              text: "Contact government",
              href: "/contact-government",
            },
            {
              text: "Constitution of Kenya",
              href: "/constitution",
            },
          ]}
        />
      </div>
    </>
  );
}