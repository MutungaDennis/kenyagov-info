// app/scams/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Scams and fake websites",
  description:
    "How to recognise fake government websites, phishing messages and payment scams in Kenya, and what to do if you think you have been scammed.",
};

function ExternalLinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{
        marginLeft: "4px",
        verticalAlign: "middle",
        display: "inline-block",
      }}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

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
        lead="Criminals may impersonate government services to steal money, passwords or personal information. Learn how to recognise suspicious websites and messages, verify official services and protect yourself."
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
              CitizenGuide.KE will never ask for your eCitizen password,
              one-time password (OTP), mobile-money PIN or online-banking
              password.
            </strong>
          </div>

          <p className="govuk-body">
            CitizenGuide.KE does not process government applications or collect
            government fees. When a government service must be completed
            elsewhere, we direct you to the relevant official service.
          </p>

          <h2 className="govuk-heading-l">Common warning signs</h2>

          <p className="govuk-body">
            Be cautious if a website, message, caller or social media account:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              asks for your password, OTP, mobile-money PIN or banking PIN
            </li>
            <li>
              pressures you to act immediately or threatens arrest, penalties or
              account closure unless you pay
            </li>
            <li>
              promises a refund, grant, bursary, job or benefit that you did not
              apply for
            </li>
            <li>
              asks you to pay an individual&apos;s personal mobile-money number
              for an official government service
            </li>
            <li>
              asks for an unofficial &quot;facilitation&quot; or
              &quot;speed-up&quot; payment
            </li>
            <li>
              uses a web address that closely imitates an official institution
              but contains extra letters, unusual spellings or an unrelated
              domain
            </li>
            <li>
              sends you an unexpected attachment or asks you to install an app
              from a link
            </li>
            <li>
              asks you to send photographs of identity documents through an
              unofficial channel without a clear reason
            </li>
          </ul>

          <h2 className="govuk-heading-l">Common scam patterns</h2>

          <h3 className="govuk-heading-m">Fake government websites</h3>

          <p className="govuk-body">
            A fake website may copy the colours, logos and layout of eCitizen,
            KRA, NTSA, immigration, police or another public institution.
          </p>

          <p className="govuk-body">
            The appearance of a website does not prove that it is genuine.
            Check the web address before entering personal information or making
            a payment.
          </p>

          <h3 className="govuk-heading-m">Phishing messages</h3>

          <p className="govuk-body">
            Scam SMS, email and WhatsApp messages may claim that:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>you have an unpaid government penalty</li>
            <li>your account will be suspended</li>
            <li>you are entitled to a tax or government refund</li>
            <li>a warrant or legal case has been issued against you</li>
            <li>you have received an unexpected government benefit</li>
          </ul>

          <p className="govuk-body">
            The message may contain a link to a fake login or payment page.
          </p>

          <h3 className="govuk-heading-m">Fake government jobs</h3>

          <p className="govuk-body">
            Be suspicious of supposed government recruitment that requires you
            to make an upfront registration, interview, medical or processing
            payment to an individual.
          </p>

          <h3 className="govuk-heading-m">
            Fake grants, bursaries and public programmes
          </h3>

          <p className="govuk-body">
            Scam forms may promise cash transfers, fertiliser, bursaries, loans
            or other government benefits in exchange for a fee or personal
            information.
          </p>

          <p className="govuk-body">
            Verify the programme with the responsible institution before
            providing information or making a payment.
          </p>

          <h2 className="govuk-heading-l">How to check a website</h2>

          <h3 className="govuk-heading-m">Check the full web address</h3>

          <p className="govuk-body">
            Look at the complete domain name before signing in or paying.
            Criminals may use addresses that differ from the genuine website by
            only one letter or word.
          </p>

          <p className="govuk-body">
            For example, do not assume a website is genuine simply because its
            name contains words such as <strong>eCitizen</strong>,{" "}
            <strong>KRA</strong>, <strong>NTSA</strong> or{" "}
            <strong>government</strong>.
          </p>

          <h3 className="govuk-heading-m">Use official starting points</h3>

          <p className="govuk-body">
            Many Kenyan public institutions use <strong>.go.ke</strong> domains.
            This can be a useful indicator, but the domain ending alone should
            not be your only check.
          </p>

          <p className="govuk-body">
            Start from a website you already know belongs to the responsible
            institution and follow its link to the service you need.
          </p>

          <h3 className="govuk-heading-m">
            Do not trust the padlock by itself
          </h3>

          <p className="govuk-body">
            A padlock or <strong>https</strong> connection means the connection
            to the website is encrypted. It does not prove that the website
            belongs to the government or that the organisation behind it is
            trustworthy.
          </p>

          <h3 className="govuk-heading-m">Check where a payment is going</h3>

          <p className="govuk-body">
            Before authorising a payment, check the recipient or organisation
            shown by your bank or mobile-money service.
          </p>

          <p className="govuk-body">
            If an official-looking website unexpectedly tells you to send money
            to a personal number, stop and verify the payment instructions
            independently.
          </p>

          <h2 className="govuk-heading-l">
            Official starting points on CitizenGuide.KE
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE explains public services before directing you to the
            responsible official service.
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/ecitizen" className="govuk-link">
                eCitizen explained
              </Link>{" "}
              — understand how to reach the official eCitizen service safely
            </li>
            <li>
              <Link href="/topics/money-tax" className="govuk-link">
                Money and tax
              </Link>{" "}
              — find tax information and official KRA services
            </li>
            <li>
              <Link
                href="/topics/driving-transport"
                className="govuk-link"
              >
                Driving and transport
              </Link>{" "}
              — find information about NTSA and transport services
            </li>
            <li>
              <Link href="/huduma-centres" className="govuk-link">
                Huduma Centres
              </Link>{" "}
              — find information about assisted government services
            </li>
            <li>
              <Link href="/contact-government" className="govuk-link">
                Contact government
              </Link>{" "}
              — find the responsible public institution
            </li>
          </ul>

          <h2 className="govuk-heading-l">
            Protect your passwords and one-time passwords
          </h2>

          <p className="govuk-body">
            Treat your passwords, PINs and one-time passwords as confidential.
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>Use a different password for important accounts.</li>
            <li>Do not send passwords or OTPs through WhatsApp or SMS.</li>
            <li>
              Do not read an OTP to someone who calls and asks you for it.
            </li>
            <li>
              Check what you are approving before entering a mobile-money or
              banking PIN.
            </li>
            <li>
              Do not save passwords on a shared or public computer.
            </li>
            <li>
              Enable additional account security where the service provides it.
            </li>
          </ul>

          <div className="govuk-inset-text">
            An organisation may send you a genuine OTP when you are signing in
            or confirming an action. The important rule is that you should enter
            it only into the genuine service you deliberately opened — not give
            it to another person.
          </div>

          <h2 className="govuk-heading-l">
            Protect your identity documents
          </h2>

          <p className="govuk-body">
            Identity documents can be used for impersonation and other fraud.
            Do not send copies of your national ID, passport, certificate or
            other personal records simply because somebody asks for them in a
            message.
          </p>

          <p className="govuk-body">
            Before sharing a document, check who is requesting it, why they need
            it and whether you are using the organisation&apos;s official
            process.
          </p>

          <h2 className="govuk-heading-l">
            If you clicked a suspicious link
          </h2>

          <p className="govuk-body">
            Clicking a suspicious link does not always mean your account has
            been compromised, but take extra care.
          </p>

          <ol className="govuk-list govuk-list--number">
            <li>Close the suspicious page.</li>
            <li>
              Do not enter passwords, OTPs, card details or mobile-money PINs.
            </li>
            <li>
              If a file or application downloaded unexpectedly, do not open it.
            </li>
            <li>
              Open the genuine service independently rather than returning
              through the suspicious message.
            </li>
            <li>
              Check the relevant account for unexpected activity.
            </li>
          </ol>

          <h2 className="govuk-heading-l">
            If you entered your password or OTP
          </h2>

          <p className="govuk-body">
            If you entered credentials into a website that you now suspect was
            fake, act quickly.
          </p>

          <ol className="govuk-list govuk-list--number">
            <li>
              Go directly to the genuine service and change the affected
              password.
            </li>
            <li>
              Change the password anywhere else you used the same password.
            </li>
            <li>
              Sign out of other sessions if the service provides that option.
            </li>
            <li>
              Review account activity and contact the responsible institution
              if you see changes you did not make.
            </li>
            <li>
              If you disclosed banking or mobile-money information, contact the
              financial provider through its official support channel.
            </li>
          </ol>

          <h2 className="govuk-heading-l">
            If you sent money
          </h2>

          <ol className="govuk-list govuk-list--number">
            <li>Do not send any more money.</li>
            <li>
              Contact your bank or mobile-money provider as soon as possible
              using an official support channel.
            </li>
            <li>
              Keep the transaction confirmation, recipient details and any
              messages relating to the payment.
            </li>
            <li>
              Report the matter to the appropriate law-enforcement or
              cyber-security authority.
            </li>
          </ol>

          <p className="govuk-body">
            Be cautious if the same person contacts you again and claims they
            can recover your money for another advance fee. This can be a second
            scam targeting people who have already lost money.
          </p>

          <h2 className="govuk-heading-l">
            Keep evidence
          </h2>

          <p className="govuk-body">
            If you need to report a scam, keep evidence where it is safe to do
            so. Useful information can include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>the website address</li>
            <li>screenshots</li>
            <li>SMS, WhatsApp or email messages</li>
            <li>phone numbers and account names</li>
            <li>payment or transaction references</li>
            <li>the date and approximate time of the incident</li>
          </ul>

          <p className="govuk-body">
            Do not publish sensitive evidence publicly if it contains passwords,
            identification numbers, bank details or other personal information.
          </p>

          <h2 className="govuk-heading-l">
            Report a cyber-security incident
          </h2>

          <p className="govuk-body">
            Kenya&apos;s National Kenya Computer Incident Response Team
            Coordination Centre (KE-CIRT/CC) provides a channel for reporting
            cyber-security incidents.
          </p>

          <p className="govuk-body">
            <a
              href="https://ke-cirt.go.ke/report-an-incident/"
              target="_blank"
              rel="noopener noreferrer"
              className="govuk-link"
            >
              Report an incident to KE-CIRT/CC
              <ExternalLinkIcon />
              <span className="govuk-visually-hidden">
                {" "}
                (opens in a new tab)
              </span>
            </a>
          </p>

          <h2 className="govuk-heading-l">
            Report bribery or corruption
          </h2>

          <p className="govuk-body">
            If somebody demands a bribe or another improper payment in
            connection with a public service, you can report suspected
            corruption to the Ethics and Anti-Corruption Commission (EACC).
          </p>

          <p className="govuk-body">
            <a
              href="https://eacc.go.ke/en/default/report-corruption/"
              target="_blank"
              rel="noopener noreferrer"
              className="govuk-link"
            >
              Report corruption to EACC
              <ExternalLinkIcon />
              <span className="govuk-visually-hidden">
                {" "}
                (opens in a new tab)
              </span>
            </a>
          </p>

          <p className="govuk-body">
            You can also read our{" "}
            <Link
              href="/complain-about-government"
              className="govuk-link"
            >
              complain about government
            </Link>{" "}
            guidance to find the appropriate complaint route.
          </p>

          <h2 className="govuk-heading-l">
            Phishing that mentions CitizenGuide.KE
          </h2>

          <p className="govuk-body">
            Someone may falsely claim to represent CitizenGuide.KE or copy our
            branding.
          </p>

          <p className="govuk-body">
            CitizenGuide.KE does not process government applications, issue
            licences or certificates, or collect government service fees.
          </p>

          <p className="govuk-body">
            Treat a message as suspicious if somebody claiming to represent
            CitizenGuide.KE asks you to:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>pay for a passport, ID, licence or government application</li>
            <li>send an eCitizen, KRA or other government-service password</li>
            <li>provide an OTP or mobile-money PIN</li>
            <li>
              send money to an individual so that a government application can
              be approved or accelerated
            </li>
          </ul>

          <p className="govuk-body">
            If you encounter a website, message or account impersonating
            CitizenGuide.KE,{" "}
            <Link href="/contact" className="govuk-link">
              tell us
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">
            Before you pay for a government service
          </h2>

          <p className="govuk-body">
            Before making an important payment:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              make sure you deliberately opened the official service
            </li>
            <li>check the amount against current official information</li>
            <li>check the recipient shown before authorising payment</li>
            <li>keep the official receipt or transaction confirmation</li>
            <li>
              stop if somebody asks for an additional unofficial payment to
              complete or accelerate the process
            </li>
          </ul>

          <h2 className="govuk-heading-l">
            Information on CitizenGuide.KE
          </h2>

          <p className="govuk-body">
            We try to link users to authoritative government sources and
            identify external destinations clearly. However, government web
            addresses, payment methods and procedures can change.
          </p>

          <p className="govuk-body">
            For an important transaction, check the responsible
            institution&apos;s current information before providing sensitive
            information or making a payment.
          </p>

          <p className="govuk-body">
            Read our{" "}
            <Link href="/disclaimer" className="govuk-link">
              disclaimer
            </Link>{" "}
            for more information about using CitizenGuide.KE.
          </p>

          <p className="govuk-body govuk-!-margin-top-8">
            <strong>Last updated:</strong> 10 September 2026
          </p>
        </div>

        <RelatedNav
          links={[
            { text: "eCitizen explained", href: "/ecitizen" },
            { text: "Help and support", href: "/help" },
            {
              text: "Complain about government",
              href: "/complain-about-government",
            },
            {
              text: "Emergency and safety",
              href: "/emergency-and-safety",
            },
            {
              text: "Digital government",
              href: "/topics/digital-government",
            },
            { text: "Disclaimer", href: "/disclaimer" },
          ]}
        />
      </div>
    </>
  );
}