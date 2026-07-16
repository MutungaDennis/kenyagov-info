import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";

export const revalidate = 86400;
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Scams and fake websites",
  description:
    "How to spot fake eCitizen, KRA, NTSA and other government scams in Kenya — and how to stay safe.",
};

export default function ScamsPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Help", href: "/help" },
          { text: "Scams and fake websites" },
        ]}
        title="Scams and fake websites"
        lead="Criminals often impersonate government services to steal money, passwords or identity documents. CitizenGuide.KE will never ask for your eCitizen password, OTP or M-Pesa pin."
      
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-warning-text">
            <span className="govuk-warning-text__icon" aria-hidden="true">
              !
            </span>
            <strong className="govuk-warning-text__text">
              <span className="govuk-visually-hidden">Warning </span>
              Government services do not ask you to pay bribes to “speed up”
              applications. Official fees are paid through official channels.
            </strong>
          </div>

          <h2 className="govuk-heading-l">Common scam patterns</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              Fake websites that look like eCitizen, KRA, NTSA, immigration or
              police clearance portals
            </li>
            <li>
              SMS or WhatsApp messages with urgent links about refunds, warrants
              or “unclaimed” funds
            </li>
            <li>
              Agents who demand your OTP, ID photos and full passwords
            </li>
            <li>
              Job offers that require an upfront “registration fee” for
              government employment
            </li>
            <li>
              Social media forms promising cash transfers, fertiliser or
              bursaries outside official programmes
            </li>
          </ul>

          <h2 className="govuk-heading-l">How to check a website</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>Type the address yourself instead of clicking unknown links</li>
            <li>
              Prefer known official domains (for example government{" "}
              <strong>.go.ke</strong> services) and the URLs published on
              official sites
            </li>
            <li>Look carefully at spelling (extra letters, odd domains)</li>
            <li>Check that payment pages sit inside the official service</li>
            <li>
              If in doubt, stop and verify using a phone number or address from
              an official website you already trust
            </li>
          </ul>

          <h2 className="govuk-heading-l">Official starting points on this site</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/ecitizen" className="govuk-link">
                eCitizen explained
              </Link>{" "}
              — how the official portal works and how to open it safely
            </li>
            <li>
              <Link href="/topics/money-tax" className="govuk-link">
                Money and tax
              </Link>{" "}
              — tax guidance; only pay through official KRA channels
            </li>
            <li>
              <Link href="/topics/driving-transport" className="govuk-link">
                Driving and transport
              </Link>{" "}
              — NTSA-related processes
            </li>
            <li>
              <Link href="/huduma-centres" className="govuk-link">
                Huduma Centres
              </Link>{" "}
              for assisted in-person services
            </li>
            <li>
              <Link href="/contact-government" className="govuk-link">
                Contact government directory
              </Link>
            </li>
          </ul>

          <h2 className="govuk-heading-l">Protect your accounts</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>Never share one-time passwords (OTPs)</li>
            <li>Use unique passwords for government portals</li>
            <li>Do not install unknown “helper” apps from unofficial links</li>
            <li>
              Review mobile money statements after any unexpected prompt
            </li>
          </ul>

          <h2 className="govuk-heading-l">If you think you were scammed</h2>
          <ol className="govuk-list govuk-list--number">
            <li>Stop further payments and do not send more OTPs.</li>
            <li>
              Change passwords on affected accounts if you still have access.
            </li>
            <li>
              Report to the police and keep evidence (messages, numbers,
              receipts).
            </li>
            <li>
              Notify your mobile money provider or bank through official support
              channels if money moved.
            </li>
            <li>
              Report corruption-related solicitation to official anti-corruption
              channels where relevant — see{" "}
              <Link href="/complain-about-government" className="govuk-link">
                complain about government
              </Link>
              .
            </li>
          </ol>

          <h2 className="govuk-heading-l">Phishing that mentions CitizenGuide.KE</h2>
          <p className="govuk-body">
            We do not process applications or collect government fees. If someone
            claims they are us and asks for payment for a passport, ID or tax
            filing, treat it as a scam and{" "}
            <Link href="/contact" className="govuk-link">
              tell us
            </Link>
            .
          </p>
        </div>

        <RelatedNav
          links={[
            { text: "eCitizen explained", href: "/ecitizen" },
            { text: "Help", href: "/help" },
            { text: "Disclaimer", href: "/disclaimer" },
            { text: "Emergency and safety", href: "/emergency-and-safety" },
            { text: "Digital government", href: "/topics/digital-government" },
          ]}
        />
      </div>
    </>
  );
}
