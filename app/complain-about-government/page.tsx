import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";

export const metadata: Metadata = {
  title: "How to complain about government",
  description:
    "Where to take complaints about public services, maladministration, corruption and electoral issues in Kenya.",
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
        lead="Different problems go to different institutions. Choose the path that matches your issue. This website cannot investigate public bodies or reverse official decisions."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-l">Start with the organisation involved</h2>
          <p className="govuk-body">
            For delayed services, wrong information from a counter, or a
            specific application, contact the ministry, agency or county that
            handles the service first. Keep reference numbers, receipts and
            dates.
          </p>
          <p className="govuk-body">
            <Link href="/contact-government" className="govuk-link">
              Contact government directory
            </Link>
          </p>

          <h2 className="govuk-heading-l">Maladministration (ombudsman)</h2>
          <p className="govuk-body">
            The Commission on Administrative Justice (Office of the Ombudsman)
            handles complaints about unfair administrative action by public
            officers and bodies within its legal mandate — for example
            unreasonable delay, abuse of power or denial of information in
            applicable cases.
          </p>
          <p className="govuk-body">
            Use the Commission’s official channels. See also{" "}
            <Link href="/government/commissions" className="govuk-link">
              commissions
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">Corruption</h2>
          <p className="govuk-body">
            Suspected corruption, bribery or economic crime involving public
            officers can be reported to the Ethics and Anti-Corruption Commission
            (EACC) through its official reporting mechanisms. Do not pay bribes
            to “unlock” a service.
          </p>
          <p className="govuk-body">
            <Link href="/scams" className="govuk-link">
              Scams and fake websites
            </Link>
          </p>

          <h2 className="govuk-heading-l">Elections</h2>
          <p className="govuk-body">
            Complaints about voter registration, polling or party processes
            should go through IEBC procedures and, where the law provides, the
            courts. Start from our{" "}
            <Link href="/elections" className="govuk-link">
              elections hub
            </Link>{" "}
            and official IEBC sites.
          </p>

          <h2 className="govuk-heading-l">Human rights</h2>
          <p className="govuk-body">
            Alleged human rights violations may be taken to the Kenya National
            Commission on Human Rights (KNCHR) or other specialised bodies,
            depending on the issue. Serious crimes should also be reported to the
            police.
          </p>

          <h2 className="govuk-heading-l">Courts</h2>
          <p className="govuk-body">
            Some disputes require legal action. The Judiciary is independent.
            Consider legal advice or legal aid where available. This site does
            not provide legal representation.
          </p>
          <p className="govuk-body">
            <Link href="/topics/crime-justice" className="govuk-link">
              Crime, justice and the law
            </Link>
          </p>

          <h2 className="govuk-heading-l">Access to information</h2>
          <p className="govuk-body">
            If a public body withholds information you are entitled to request,
            see{" "}
            <Link href="/access-to-information" className="govuk-link">
              access to information
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">Errors on this website</h2>
          <p className="govuk-body">
            If CitizenGuide.KE shows wrong information, that is not a government
            complaint — use our{" "}
            <Link href="/corrections" className="govuk-link">
              corrections process
            </Link>
            .
          </p>
        </div>

        <RelatedNav
          links={[
            { text: "Access to information", href: "/access-to-information" },
            { text: "Contact government", href: "/contact-government" },
            { text: "Commissions", href: "/government/commissions" },
            { text: "Emergency and safety", href: "/emergency-and-safety" },
            { text: "Help", href: "/help" },
          ]}
        />
      </div>
    </>
  );
}
