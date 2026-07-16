import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
import { constitutionRefs } from "@/lib/constitution-links";

export const revalidate = 86400;
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Access to information",
  description:
    "How Kenyans can request information from public bodies under the Constitution and the Access to Information Act.",
};

export default function AccessToInformationPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Help", href: "/help" },
          { text: "Access to information" },
        ]}
        title="Access to information"
        lead="The Constitution and the Access to Information Act give people rights to access information held by the State and some other bodies — subject to lawful limitations."
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-l">Your right in brief</h2>
          <p className="govuk-body">
            <Link
              href={constitutionRefs.accessToInformation.href}
              className="govuk-link"
            >
              {constitutionRefs.accessToInformation.label}
            </Link>{" "}
            protects access to information held by the State. It sits within{" "}
            <Link href={constitutionRefs.billOfRights.href} className="govuk-link">
              {constitutionRefs.billOfRights.label}
            </Link>
            . The Access to Information Act sets out procedures, timelines and
            exemptions in more detail — see{" "}
            <Link href="/acts/parliament" className="govuk-link">
              Acts of Parliament
            </Link>
            .
          </p>
          <p className="govuk-body">
            This page is a plain-language overview. It is not legal advice.
          </p>

          <h2 className="govuk-heading-l">Before you make a formal request</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              Check whether the information is already published (websites,
              Gazette, open data portals, budget documents)
            </li>
            <li>
              Identify the public body that holds the information
            </li>
            <li>
              Be as specific as you can about what you need
            </li>
          </ul>
          <p className="govuk-body">
            Our{" "}
            <Link href="/open-data" className="govuk-link">
              open data
            </Link>{" "}
            and{" "}
            <Link href="/documents" className="govuk-link">
              documents
            </Link>{" "}
            pages may help for some civic datasets and policy papers.
          </p>

          <h2 className="govuk-heading-l">Making a request</h2>
          <p className="govuk-body">
            Requests are usually made in writing to the public entity that holds
            the information, following that entity’s published access to
            information procedures where available. Keep a copy of your request
            and any reference number.
          </p>
          <p className="govuk-body">
            Public bodies should respond within the timelines set in law, or
            explain lawful reasons for delay, refusal or partial disclosure.
          </p>

          <h2 className="govuk-heading-l">If you are refused or ignored</h2>
          <p className="govuk-body">
            Review and appeal routes exist under the Act and related
            institutions. The Commission on Administrative Justice has a role in
            access to information oversight. Serious disputes may end up in
            court. Consider independent legal advice for complex cases.
          </p>
          <p className="govuk-body">
            <Link href="/complain-about-government" className="govuk-link">
              How to complain about government
            </Link>
          </p>

          <h2 className="govuk-heading-l">Limitations</h2>
          <p className="govuk-body">
            Not all information must be released. The law provides exemptions
            (for example certain national security, privacy or commercial
            confidentiality grounds). Bodies should cite the legal basis when
            refusing.
          </p>

          <h2 className="govuk-heading-l">Information on this website</h2>
          <p className="govuk-body">
            CitizenGuide.KE republishes and organises public information. A
            request for records we do not hold should go to the public body, not
            to us. To correct something we published, use{" "}
            <Link href="/corrections" className="govuk-link">
              corrections
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">Related constitutional reading</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link
                href={constitutionRefs.accessToInformation.href}
                className="govuk-link"
              >
                {constitutionRefs.accessToInformation.label}
              </Link>
            </li>
            <li>
              <Link href={constitutionRefs.billOfRights.href} className="govuk-link">
                {constitutionRefs.billOfRights.label}
              </Link>
            </li>
            <li>
              <Link href="/constitution" className="govuk-link">
                Constitution of Kenya (full text browser)
              </Link>
            </li>
            <li>
              <Link href="/acts/parliament" className="govuk-link">
                Acts of Parliament
              </Link>
            </li>
          </ul>
        </div>

        <RelatedNav
          links={[
            { text: "Complain about government", href: "/complain-about-government" },
            { text: "Contact government", href: "/contact-government" },
            { text: "Open data", href: "/open-data" },
            { text: "How public money works", href: "/how-public-money-works" },
            { text: "Editorial policy", href: "/editorial-policy" },
            { text: "Disclaimer", href: "/disclaimer" },
          ]}
        />
      </div>
    </>
  );
}
