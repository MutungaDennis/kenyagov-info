// app/complain-about-government/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
import ExternalLink from "@/components/site/ExternalLink";
import { constitutionRefs } from "@/lib/constitution-links";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "How to complain about government",
  description:
    "Where to complain about public services, maladministration, corruption, police conduct, human rights violations, access to information and electoral issues in Kenya.",
};

export default function ComplainAboutGovernmentPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Help", href: "/help" },
          { text: "Complain about government" },
        ]}
        title="How to complain about government"
        lead="Different complaints about government go to different institutions. Use this guide to identify the right place to start and what information to keep."
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            CitizenGuide.KE cannot investigate a public body, order compensation,
            reverse an official decision or act as your lawyer. We can help you
            identify the institution that may handle your complaint.
          </div>

          <h2 className="govuk-heading-l">
            Choose the type of complaint
          </h2>

          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Poor service, delay or unfair treatment
              </dt>
              <dd className="govuk-summary-list__value">
                Start with the public institution involved. If the matter is not
                resolved, the Commission on Administrative Justice may be able
                to consider it.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Corruption or bribery
              </dt>
              <dd className="govuk-summary-list__value">
                Report suspected corruption to the Ethics and Anti-Corruption
                Commission (EACC).
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Police misconduct
              </dt>
              <dd className="govuk-summary-list__value">
                Complaints about police conduct can be made to the Independent
                Policing Oversight Authority (IPOA).
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Human rights violation
              </dt>
              <dd className="govuk-summary-list__value">
                The Kenya National Commission on Human Rights (KNCHR) receives
                complaints about alleged human rights violations.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Information refused by a public body
              </dt>
              <dd className="govuk-summary-list__value">
                Follow the access to information process. The Commission on
                Administrative Justice oversees and enforces the Access to
                Information Act.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Election complaint
              </dt>
              <dd className="govuk-summary-list__value">
                The correct route depends on whether the issue concerns voter
                registration, nomination, electoral conduct or a dispute after
                election results have been declared.
              </dd>
            </div>
          </dl>

          <h2 className="govuk-heading-l">
            Start with the organisation involved
          </h2>

          <p className="govuk-body">
            For many service complaints, start with the ministry, department,
            agency, commission or county government responsible for the service.
          </p>

          <p className="govuk-body">
            This is particularly useful for issues such as:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>an application that has been delayed</li>
            <li>a payment that has not been reflected</li>
            <li>incorrect information given by an office</li>
            <li>a document that has not been issued</li>
            <li>a service that was not provided as expected</li>
            <li>a decision you want the institution to explain or review</li>
          </ul>

          <p className="govuk-body">
            Use the institution&apos;s official complaints, customer care or
            review process where one exists.
          </p>

          <p className="govuk-body">
            <Link href="/contact-government" className="govuk-link">
              Find a government institution
            </Link>
          </p>

          <h2 className="govuk-heading-l">
            What to include in a complaint
          </h2>

          <p className="govuk-body">
            A clear complaint is easier for an institution to understand and
            investigate.
          </p>

          <p className="govuk-body">
            Where relevant, include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>your name and contact details</li>
            <li>the institution or office involved</li>
            <li>what happened</li>
            <li>the date and location</li>
            <li>application, receipt, case or reference numbers</li>
            <li>the names or positions of officers involved, if known</li>
            <li>copies of relevant documents or correspondence</li>
            <li>what you have already done to resolve the matter</li>
            <li>what outcome you are asking for</li>
          </ul>

          <div className="govuk-inset-text">
            Keep copies of complaints, receipts, emails, letters and reference
            numbers. Do not hand over original documents unless an official
            process specifically requires them.
          </div>

          <h2 className="govuk-heading-l">
            Poor administration or unfair treatment
          </h2>

          <p className="govuk-body">
            The Commission on Administrative Justice (CAJ), also known as the
            Office of the Ombudsman, deals with maladministration in the public
            sector.
          </p>

          <p className="govuk-body">
            Its mandate includes complaints involving matters such as:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>unreasonable delay</li>
            <li>abuse of power</li>
            <li>unfair treatment</li>
            <li>manifest injustice</li>
            <li>discourtesy by public officers</li>
          </ul>

          <p className="govuk-body">
            The Commission&apos;s mandate extends to national and county
            government administration.
          </p>

          <p className="govuk-body">
            Independent commissions are provided for under{" "}
            <Link
              href={constitutionRefs.commissions.href}
              className="govuk-link"
            >
              {constitutionRefs.commissions.label}
            </Link>
            .
          </p>

          <p className="govuk-body">
            <ExternalLink href="https://www.ombudsman.go.ke/">
              Complain to the Commission on Administrative Justice
            </ExternalLink>
          </p>

          <p className="govuk-body">
            You can also read about{" "}
            <Link href="/government/commissions" className="govuk-link">
              constitutional commissions
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">
            Access to information
          </h2>

          <p className="govuk-body">
            Article 35 of the Constitution protects the right of access to
            information in the circumstances provided by the Constitution. The
            Access to Information Act, 2016 provides procedures for exercising
            that right.
          </p>

          <p className="govuk-body">
            The Commission on Administrative Justice oversees and enforces
            implementation of the Access to Information Act.
          </p>

          <p className="govuk-body">
            If a request has been refused, ignored or otherwise not handled in
            accordance with the applicable process, see:
          </p>

          <p className="govuk-body">
            <Link href="/access-to-information" className="govuk-link">
              How to request access to information
            </Link>
          </p>

          <h2 className="govuk-heading-l">
            Corruption and bribery
          </h2>

          <p className="govuk-body">
            Suspected corruption, bribery or economic crime can be reported to
            the Ethics and Anti-Corruption Commission (EACC).
          </p>

          <p className="govuk-body">
            EACC currently accepts reports through several channels, including
            in person, by telephone, in writing and through an anonymous
            reporting system.
          </p>

          <p className="govuk-body">
            <ExternalLink href="https://eacc.go.ke/en/default/report-corruption/">
              Report corruption to EACC
            </ExternalLink>
          </p>

          <p className="govuk-body">
            Do not make an unofficial payment to someone who claims they can
            guarantee, accelerate or &quot;unlock&quot; a government service.
          </p>

          <p className="govuk-body">
            Read{" "}
            <Link href="/scams" className="govuk-link">
              scams and fake websites
            </Link>{" "}
            if the incident involves suspicious payments, impersonation or
            phishing.
          </p>

          <h2 className="govuk-heading-l">
            Complaints about the police
          </h2>

          <p className="govuk-body">
            The Independent Policing Oversight Authority (IPOA) provides
            independent civilian oversight of policing and receives complaints
            relating to police conduct within its mandate.
          </p>

          <p className="govuk-body">
            Complaints may concern matters such as alleged misconduct, abuse of
            police powers or other conduct that falls within IPOA&apos;s legal
            mandate.
          </p>

          <p className="govuk-body">
            <ExternalLink href="https://www.ipoa.go.ke/">
              Make or learn about a complaint to IPOA
            </ExternalLink>
          </p>

          <div className="govuk-inset-text">
            If somebody is in immediate danger or a crime is happening now,
            deal with the emergency first. See{" "}
            <Link href="/emergency-and-safety" className="govuk-link">
              emergency and safety information
            </Link>
            .
          </div>

          <h2 className="govuk-heading-l">
            Human rights violations
          </h2>

          <p className="govuk-body">
            The Kenya National Commission on Human Rights (KNCHR) receives
            complaints about alleged violations of human rights.
          </p>

          <p className="govuk-body">
            Its complaint system can be relevant where a person believes that a
            right or fundamental freedom has been violated.
          </p>

          <p className="govuk-body">
            <ExternalLink href="https://www.knchr.org/">
              Make a human rights complaint to KNCHR
            </ExternalLink>
          </p>

          <p className="govuk-body">
            Serious criminal conduct should also be reported through the
            appropriate law-enforcement process.
          </p>

          <h2 className="govuk-heading-l">
            Elections and electoral disputes
          </h2>

          <p className="govuk-body">
            The correct route for an election complaint depends on what has
            happened and when.
          </p>

          <p className="govuk-body">
            The Independent Electoral and Boundaries Commission (IEBC) handles
            electoral disputes within its constitutional and statutory mandate,
            including certain disputes relating to voter registration,
            nominations and electoral conduct.
          </p>

          <p className="govuk-body">
            However, IEBC&apos;s dispute-resolution mandate does not extend to
            election petitions and disputes arising after the declaration of
            election results. Those matters may fall to the courts under the
            applicable election law.
          </p>

          <div className="govuk-warning-text">
            <span className="govuk-warning-text__icon" aria-hidden="true">
              !
            </span>

            <strong className="govuk-warning-text__text">
              <span className="govuk-visually-hidden">Warning </span>
              Electoral complaints can have strict filing deadlines. Do not
              delay while relying only on general guidance.
            </strong>
          </div>

          <p className="govuk-body">
            <ExternalLink href="https://www.iebc.or.ke/">
              Independent Electoral and Boundaries Commission
            </ExternalLink>
          </p>

          <p className="govuk-body">
            You can also start from the{" "}
            <Link href="/elections" className="govuk-link">
              CitizenGuide.KE elections hub
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">
            If the issue involves a political party
          </h2>

          <p className="govuk-body">
            Some disputes involving political parties fall under processes
            separate from IEBC, including the Political Parties Disputes
            Tribunal where the law gives it jurisdiction.
          </p>

          <p className="govuk-body">
            The correct route depends on the type of dispute, the parties
            involved and the stage of the electoral process.
          </p>

          <p className="govuk-body">
            If a legal deadline may apply, consider getting legal advice
            promptly.
          </p>

          <h2 className="govuk-heading-l">
            Going to court
          </h2>

          <p className="govuk-body">
            Some disputes cannot be resolved through an ordinary complaints
            process and may require review or determination by a court or
            tribunal.
          </p>

          <p className="govuk-body">
            This may be particularly important where you are challenging:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>the legality of an administrative decision</li>
            <li>a decision affecting constitutional rights</li>
            <li>an election result</li>
            <li>a decision for which legislation provides a specific appeal</li>
            <li>a matter requiring an enforceable court order</li>
          </ul>

          <p className="govuk-body">
            The Judiciary is independent. Court procedures, jurisdiction and
            filing deadlines depend on the type of case.
          </p>

          <p className="govuk-body">
            Consider legal advice or legal aid where appropriate.
            CitizenGuide.KE does not provide legal representation.
          </p>

          <p className="govuk-body">
            <Link href="/topics/crime-justice" className="govuk-link">
              Crime, justice and the law
            </Link>
          </p>

          <h2 className="govuk-heading-l">
            If more than one institution may be involved
          </h2>

          <p className="govuk-body">
            A single incident can involve more than one issue.
          </p>

          <p className="govuk-body">
            For example, an allegation about a police officer demanding a bribe
            could raise both police-conduct and corruption issues. A public
            institution refusing information could raise both an internal
            service complaint and an access-to-information issue.
          </p>

          <p className="govuk-body">
            You do not need to force every problem into one category. Use the
            complaint route that matches each part of the issue and follow any
            referral instructions given by the responsible institution.
          </p>

          <h2 className="govuk-heading-l">
            If your complaint is not accepted
          </h2>

          <p className="govuk-body">
            An institution may decide that a complaint falls outside its legal
            mandate or that another process must be used.
          </p>

          <p className="govuk-body">
            If this happens:
          </p>

          <ol className="govuk-list govuk-list--number">
            <li>ask for the reason where it is not already clear</li>
            <li>ask whether another institution or appeal route is appropriate</li>
            <li>keep the response and any reference number</li>
            <li>
              check whether there is a deadline for review, appeal or court
              action
            </li>
          </ol>

          <h2 className="govuk-heading-l">
            Complaints about CitizenGuide.KE
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE is not a government institution. If your concern is
            about information published on this website, do not send the
            complaint to a government oversight body simply because the page is
            about government.
          </p>

          <p className="govuk-body">
            If information on CitizenGuide.KE appears inaccurate, outdated or
            misleading, use our{" "}
            <Link href="/corrections" className="govuk-link">
              corrections process
            </Link>
            .
          </p>

          <p className="govuk-body">
            For another issue concerning this website,{" "}
            <Link href="/contact" className="govuk-link">
              contact CitizenGuide.KE
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">
            Before you submit a complaint
          </h2>

          <p className="govuk-body">
            Check that:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>you have identified the correct institution</li>
            <li>you have described what happened clearly</li>
            <li>important dates and reference numbers are included</li>
            <li>supporting evidence is organised</li>
            <li>you have said what outcome you are seeking</li>
            <li>
              you have checked for any complaint, appeal or filing deadline
            </li>
            <li>
              you are using the institution&apos;s genuine website or official
              contact channel
            </li>
          </ul>

          <p className="govuk-body govuk-!-margin-top-8">
            <strong>Last updated:</strong> 10 September 2026
          </p>
        </div>

        <RelatedNav
          links={[
            {
              text: "Access to information",
              href: "/access-to-information",
            },
            {
              text: "Contact government",
              href: "/contact-government",
            },
            {
              text: "Commissions",
              href: "/government/commissions",
            },
            {
              text: "Emergency and safety",
              href: "/emergency-and-safety",
            },
            {
              text: "Scams and fake websites",
              href: "/scams",
            },
            {
              text: "Help and support",
              href: "/help",
            },
          ]}
        />
      </div>
    </>
  );
}