// app/help/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Help using CitizenGuide.KE",
  description:
    "Help using CitizenGuide.KE, including accessibility, privacy, cookies, editorial standards, corrections, government services and how to contact us.",
};

const helpPages = [
  {
    title: "About CitizenGuide.KE",
    href: "/about",
    description:
      "Find out what CitizenGuide.KE is, why it exists and how the website is maintained.",
  },
  {
    title: "Accessibility",
    href: "/accessibility",
    description:
      "How we make CitizenGuide.KE accessible and how to report an accessibility problem.",
  },
  {
    title: "Cookies",
    href: "/cookies",
    description:
      "Find out which cookies CitizenGuide.KE uses and what each cookie is for.",
  },
  {
    title: "Privacy",
    href: "/privacy",
    description:
      "How CitizenGuide.KE collects, uses, stores and protects personal information.",
  },
  {
    title: "Terms and conditions",
    href: "/terms",
    description:
      "The terms that apply when you use CitizenGuide.KE.",
  },
  {
    title: "Disclaimer",
    href: "/disclaimer",
    description:
      "Important information about the limits of CitizenGuide.KE and the difference between this website and official government services.",
  },
  {
    title: "Editorial policy",
    href: "/editorial-policy",
    description:
      "How we source, verify, write and update information about Kenyan government and public institutions.",
  },
  {
    title: "Corrections",
    href: "/corrections",
    description:
      "How to report inaccurate, outdated or misleading information on CitizenGuide.KE.",
  },
  {
    title: "Copyright and reuse",
    href: "/copyright",
    description:
      "Information about source material, CitizenGuide.KE content, attribution and reuse.",
  },
  {
    title: "Content style guide",
    href: "/content-style-guide",
    description:
      "The writing, terminology and content-design standards used across CitizenGuide.KE.",
  },
  {
    title: "Give feedback",
    href: "/feedback",
    description:
      "Tell us what worked, what did not work or how CitizenGuide.KE could be improved.",
  },
  {
    title: "Contact CitizenGuide.KE",
    href: "/contact",
    description:
      "How to contact us about the website, its content or a general enquiry.",
  },
];

const practicalHelpPages = [
  {
    title: "Help with government services",
    href: "/ecitizen",
    description:
      "Understand eCitizen and how to find the correct official government service.",
  },
  {
    title: "Contact government",
    href: "/contact-government",
    description:
      "Find the ministry, county, commission or public institution responsible for your issue.",
  },
  {
    title: "Visit a Huduma Centre",
    href: "/huduma-centres",
    description:
      "Find out what Huduma Centres are and when an in-person government service may be useful.",
  },
  {
    title: "Complain about government",
    href: "/complain-about-government",
    description:
      "Find the correct route for complaints about public services, maladministration, corruption, police conduct or human rights.",
  },
  {
    title: "Scams and fake websites",
    href: "/scams",
    description:
      "How to identify fake government websites, phishing messages, payment scams and impersonation.",
  },
  {
    title: "Emergency and safety information",
    href: "/emergency-and-safety",
    description:
      "Emergency numbers and official sources of help for urgent safety situations in Kenya.",
  },
];

export default function HelpPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Help" },
        ]}
        title="Help using CitizenGuide.KE"
        lead="Find out about CitizenGuide.KE, including accessibility, privacy, cookies, editorial standards, corrections and how to get help."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            CitizenGuide.KE is an independent civic information platform. It is
            not a Government of Kenya website and does not provide government
            services or process official transactions.
          </div>

          <ul className="govuk-list govuk-list--spaced">
            {helpPages.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold"
                >
                  {page.title}
                </Link>

                <p className="govuk-body govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                  {page.description}
                </p>
              </li>
            ))}
          </ul>

          <h2 className="govuk-heading-l govuk-!-margin-top-8">
            Help with government services and public issues
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE can help you understand where to go, but official
            applications, payments, complaints and emergency responses are
            handled by the responsible public institution.
          </p>

          <ul className="govuk-list govuk-list--spaced">
            {practicalHelpPages.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold"
                >
                  {page.title}
                </Link>

                <p className="govuk-body govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                  {page.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}