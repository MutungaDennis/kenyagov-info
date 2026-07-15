import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
import ExternalLink from "@/components/site/ExternalLink";

export const metadata: Metadata = {
  title: "eCitizen explained",
  description:
    "What Kenya’s eCitizen portal is, how it relates to public services, and how to stay safe from fake sites.",
};

export default function ECitizenPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Digital government", href: "/topics/digital-government" },
          { text: "eCitizen" },
        ]}
        caption="Digital government"
        title="eCitizen explained"
        lead="eCitizen is the Government of Kenya’s main online gateway for many national public services. CitizenGuide.KE is not eCitizen and cannot log you in, take payments or speed up applications."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <p className="govuk-body">
            <ExternalLink
              href="https://www.ecitizen.go.ke"
              className="govuk-button"
            >
              Go to the official eCitizen portal
            </ExternalLink>
          </p>

          <h2 className="govuk-heading-l">What eCitizen is for</h2>
          <p className="govuk-body">
            Through eCitizen you can typically create an account, apply for
            selected services, pay official fees and track applications. Exact
            services available can change as agencies onboard or update systems.
          </p>
          <p className="govuk-body">Examples of service areas often linked to eCitizen include:</p>
          <ul className="govuk-list govuk-list--bullet">
            <li>identity and civil registration related services</li>
            <li>passports and some immigration services</li>
            <li>business registration pathways</li>
            <li>other agency services published on the portal</li>
          </ul>

          <h2 className="govuk-heading-l">How it fits with other systems</h2>
          <p className="govuk-body">
            Some agencies still run their own portals (for example tax on KRA
            iTax, or transport on NTSA systems). You may need more than one
            official account. County services such as single business permits
            are often on county systems, not eCitizen.
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/huduma-centres" className="govuk-link">
                Huduma Centres
              </Link>{" "}
              — assisted, in-person access to many services
            </li>
            <li>
              <Link href="/topics/money-tax" className="govuk-link">
                Tax (KRA)
              </Link>
            </li>
            <li>
              <Link href="/topics/driving-transport" className="govuk-link">
                Driving and transport (NTSA)
              </Link>
            </li>
          </ul>

          <h2 className="govuk-heading-l">Using eCitizen safely</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              Type the address yourself or use a bookmark: check for the official
              government domain
            </li>
            <li>Never share your password or one-time password (OTP)</li>
            <li>
              Do not pay “agents” who ask for your login or promise guaranteed
              approval
            </li>
            <li>
              Prefer official payment options shown inside the portal
            </li>
          </ul>
          <p className="govuk-body">
            Read more on{" "}
            <Link href="/scams" className="govuk-link">
              scams and fake websites
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">If something goes wrong</h2>
          <p className="govuk-body">
            For failed payments, stuck applications or account access problems,
            use the support channels published on the official eCitizen site or
            the agency that owns the service. CitizenGuide.KE cannot reset your
            eCitizen account or reverse a government payment.
          </p>
          <p className="govuk-body">
            <Link href="/contact-government" className="govuk-link">
              Contact government (directory)
            </Link>
          </p>

          <h2 className="govuk-heading-l">Service guides on this website</h2>
          <p className="govuk-body">
            Our service pages explain steps in plain language and then send you
            to official portals to apply.
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/services" className="govuk-link">
                Browse services
              </Link>
            </li>
            <li>
              <Link href="/services/a-z" className="govuk-link">
                Services A to Z
              </Link>
            </li>
            <li>
              <Link href="/topics" className="govuk-link">
                Browse topics
              </Link>
            </li>
          </ul>
        </div>

        <RelatedNav
          links={[
            { text: "Huduma Centres", href: "/huduma-centres" },
            { text: "Digital government topic", href: "/topics/digital-government" },
            { text: "Scams and fake websites", href: "/scams" },
            { text: "Disclaimer", href: "/disclaimer" },
            { text: "Help", href: "/help" },
          ]}
        />
      </div>
    </>
  );
}
