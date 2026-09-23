import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Find government contact details",
  description:
    "Find the right Kenyan government institution, public office, county government or elected representative to contact.",
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
        title="Find government contact details"
        lead="Find the right government institution, office or service to contact. CitizenGuide.KE does not receive enquiries on behalf of government institutions."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">

          <h2 className="govuk-heading-l">What do you need to do?</h2>

          <ul className="govuk-list govuk-list--spaced">
            <li>
              <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                <Link
                  href="/government/institutions"
                  className="govuk-link govuk-link--no-visited-state"
                >
                  Contact a government institution
                </Link>
              </h3>

              <p className="govuk-body">
                Find ministries, state departments, agencies, authorities and
                other public bodies.
              </p>
            </li>

            <li>
              <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                <Link
                  href="/services"
                  className="govuk-link govuk-link--no-visited-state"
                >
                  Get help with a government service
                </Link>
              </h3>

              <p className="govuk-body">
                Find the institution responsible for applications, licences,
                registrations, payments and other public services.
              </p>
            </li>

            <li>
              <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                <Link
                  href="/government/counties"
                  className="govuk-link govuk-link--no-visited-state"
                >
                  Contact a county government
                </Link>
              </h3>

              <p className="govuk-body">
                Find official contact information and services for Kenya&apos;s 47
                county governments.
              </p>
            </li>

            <li>
              <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                <Link
                  href="/find-your-representatives"
                  className="govuk-link govuk-link--no-visited-state"
                >
                  Contact an elected representative
                </Link>
              </h3>

              <p className="govuk-body">
                Find your MP, senator, woman representative, governor and other
                elected representatives.
              </p>
            </li>

            <li>
              <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                <Link
                  href="/complain-about-government"
                  className="govuk-link govuk-link--no-visited-state"
                >
                  Complain about a government service
                </Link>
              </h3>

              <p className="govuk-body">
                Find out where to make a complaint, report misconduct or seek
                help from an oversight body.
              </p>
            </li>
          </ul>

          <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

          <h2 className="govuk-heading-l">Browse government organisations</h2>

          <ul className="govuk-list govuk-list--spaced">
            <li>
              <Link
                href="/government/institutions"
                className="govuk-link govuk-link--no-visited-state"
              >
                Ministries, departments, agencies and public bodies
              </Link>
            </li>

            <li>
              <Link
                href="/government/legislature"
                className="govuk-link govuk-link--no-visited-state"
              >
                Parliament
              </Link>
            </li>

            <li>
              <Link
                href="/government/judiciary"
                className="govuk-link govuk-link--no-visited-state"
              >
                Judiciary
              </Link>
            </li>

            <li>
              <Link
                href="/government/commissions"
                className="govuk-link govuk-link--no-visited-state"
              >
                Constitutional commissions and independent offices
              </Link>
            </li>

            <li>
              <Link
                href="/government/counties"
                className="govuk-link govuk-link--no-visited-state"
              >
                County governments
              </Link>
            </li>
          </ul>

          <h2 className="govuk-heading-l">Emergencies</h2>

          <div className="govuk-inset-text">
            If someone is in immediate danger or you need urgent assistance,
            see{" "}
            <Link href="/emergency-and-safety" className="govuk-link">
              emergency and safety contacts
            </Link>
            .
          </div>

          <h2 className="govuk-heading-l">Contact CitizenGuide.KE</h2>

          <p className="govuk-body">
            CitizenGuide.KE is an independent civic information service. We
            cannot access government records, applications or case files and
            cannot respond on behalf of a government institution.
          </p>

          <p className="govuk-body">
            To report a problem with this website, suggest a correction or
            contact our team, use{" "}
            <Link href="/contact" className="govuk-link">
              contact CitizenGuide.KE
            </Link>
            .
          </p>
        </div>

        <RelatedNav
          links={[
            {
              text: "Government institutions",
              href: "/government/institutions",
            },
            {
              text: "Find your representatives",
              href: "/find-your-representatives",
            },
            {
              text: "County governments",
              href: "/government/counties",
            },
            {
              text: "Government services",
              href: "/services",
            },
            {
              text: "Emergency and safety",
              href: "/emergency-and-safety",
            },
            {
              text: "Contact CitizenGuide.KE",
              href: "/contact",
            },
          ]}
        />
      </div>
    </>
  );
}