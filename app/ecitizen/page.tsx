// app/ecitizen/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
import ExternalLink from "@/components/site/ExternalLink";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "eCitizen explained",
  description:
    "What Kenya’s eCitizen platform is, what services it provides, how it relates to other government systems and how to use it safely.",
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
        lead="eCitizen is a Government of Kenya digital platform used to access many public services online. CitizenGuide.KE is independent of eCitizen and cannot sign you in, process applications, take government payments or change the outcome of an application."
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
              Check that you are on the genuine eCitizen service before
              entering your password, one-time password (OTP), identity
              information or payment details.
            </strong>
          </div>

          <p className="govuk-body">
            <ExternalLink
              href="https://www.ecitizen.go.ke/"
              className="govuk-button"
            >
              Start on the official eCitizen portal
            </ExternalLink>
          </p>

          <p className="govuk-body-s">
            This opens the Government of Kenya eCitizen service in a new tab.
            CitizenGuide.KE does not receive your login details or government
            payments.
          </p>

          <h2 className="govuk-heading-l">What eCitizen is</h2>

          <p className="govuk-body">
            eCitizen provides a common digital entry point for many Government
            of Kenya services. You can sign in with an eCitizen account and
            access services provided by participating public institutions.
          </p>

          <p className="govuk-body">
            Depending on the service, eCitizen may allow you to:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>create or use an eCitizen account</li>
            <li>apply for a government service</li>
            <li>submit information or supporting documents</li>
            <li>make an authorised payment</li>
            <li>check the status of an application</li>
            <li>receive or retrieve documents and application records</li>
          </ul>

          <p className="govuk-body">
            The exact process depends on the public institution providing the
            service.
          </p>

          <h2 className="govuk-heading-l">
            Services available through eCitizen
          </h2>

          <p className="govuk-body">
            Government institutions provide many services through dedicated
            areas within the eCitizen platform. These include services relating
            to immigration, civil registration, business registration, police
            services and other national public functions.
          </p>

          <p className="govuk-body">
            The services available on eCitizen can change as institutions add,
            move or update their digital services.
          </p>

          <div className="govuk-inset-text">
            A service may be added, redesigned, moved to another government
            system or have different requirements over time. Check the current
            information shown by the responsible public institution before
            applying.
          </div>

          <h2 className="govuk-heading-l">
            Not every government service is on eCitizen
          </h2>

          <p className="govuk-body">
            eCitizen is an important government platform, but it is not the
            only digital system used by public institutions in Kenya.
          </p>

          <p className="govuk-body">
            Some institutions operate separate or specialist systems, while
            others may use eCitizen for only part of a process. County
            governments may also provide services through their own platforms.
          </p>

          <p className="govuk-body">
            Use the system identified by the responsible public institution
            rather than assuming every government service must begin on
            eCitizen.
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/topics/money-tax" className="govuk-link">
                Money and tax
              </Link>{" "}
              — including information about Kenya Revenue Authority services
            </li>

            <li>
              <Link
                href="/topics/driving-transport"
                className="govuk-link"
              >
                Driving and transport
              </Link>{" "}
              — including transport and licensing services
            </li>

            <li>
              <Link href="/counties" className="govuk-link">
                County governments
              </Link>{" "}
              — for services administered at county level
            </li>
          </ul>

          <h2 className="govuk-heading-l">Your eCitizen account</h2>

          <p className="govuk-body">
            Your eCitizen account is used to access participating government
            services. Depending on the service and authentication method, you
            may be required to confirm your identity or enter a one-time
            password.
          </p>

          <p className="govuk-body">
            Treat your eCitizen account as you would any other important
            identity or financial account.
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>Use a strong password that is not reused elsewhere.</li>

            <li>
              Keep the email address and phone number associated with your
              account secure.
            </li>

            <li>Never give another person your OTP.</li>

            <li>
              Do not allow an unofficial agent to sign in to your account on
              your behalf.
            </li>

            <li>
              Check what action you are approving before entering an OTP or
              authorising a payment.
            </li>
          </ul>

          <h2 className="govuk-heading-l">Using eCitizen safely</h2>

          <h3 className="govuk-heading-m">Open the genuine service</h3>

          <p className="govuk-body">
            Type the eCitizen address yourself, use a trusted bookmark, or
            follow a link published by the responsible public institution.
          </p>

          <p className="govuk-body">
            Do not assume a website is genuine merely because it uses the
            eCitizen name, government colours or a copied logo.
          </p>

          <h3 className="govuk-heading-m">
            Do not share passwords or OTPs
          </h3>

          <p className="govuk-body">
            You may receive a genuine OTP when signing in or confirming an
            action. Enter it only into the genuine service you deliberately
            opened.
          </p>

          <p className="govuk-body">
            Do not send an OTP to another person through a phone call,
            WhatsApp, SMS, email or social media.
          </p>

          <h3 className="govuk-heading-m">Check before paying</h3>

          <p className="govuk-body">
            Follow the payment instructions shown by the genuine government
            service and check the transaction details before authorising the
            payment.
          </p>

          <p className="govuk-body">
            Be suspicious if somebody asks for a separate personal payment to
            guarantee approval, move an application forward or bypass the
            normal process.
          </p>

          <p className="govuk-body">
            Read our{" "}
            <Link href="/scams" className="govuk-link">
              scams and fake websites
            </Link>{" "}
            guidance for more information.
          </p>

          <h2 className="govuk-heading-l">
            Government payments on eCitizen
          </h2>

          <p className="govuk-body">
            Some eCitizen services allow users to pay government fees and
            charges electronically as part of the application process.
          </p>

          <p className="govuk-body">
            The available payment method and amount depend on the particular
            service. Always check the current fee shown by the responsible
            government service before paying.
          </p>

          <p className="govuk-body">
            Check the payment details carefully before authorising a
            transaction and keep the payment confirmation or receipt until the
            service has been completed.
          </p>

          <h2 className="govuk-heading-l">
            eCitizen and Digital ID
          </h2>

          <p className="govuk-body">
            Digital identity services may be used as part of Kenya&apos;s wider
            digital-government ecosystem to help verify the identity of people
            accessing online public services.
          </p>

          <p className="govuk-body">
            Where you need to use an eCitizen Digital ID service, start from
            the official government service:
          </p>

          <p className="govuk-body">
            <ExternalLink href="https://did.ecitizen.go.ke/">
              eCitizen Digital ID
            </ExternalLink>
          </p>

          <h2 className="govuk-heading-l">
            Getting help with eCitizen
          </h2>

          <p className="govuk-body">
            For problems with your eCitizen account, authentication, payments
            or an application, use the support channels currently published by
            eCitizen or by the public institution responsible for the service.
          </p>

          <p className="govuk-body">
            Contact details can change, so it is safer to use those shown on
            the official platform rather than relying on a phone number or
            email address copied from an old page or social media post.
          </p>

          <p className="govuk-body">
            <ExternalLink href="https://www.ecitizen.go.ke/">
              Get help on the official eCitizen website
            </ExternalLink>
          </p>

          <p className="govuk-body">
            You can also find information about assisted government services
            through{" "}
            <Link href="/huduma-centres" className="govuk-link">
              Huduma Centres
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">If a payment fails</h2>

          <p className="govuk-body">
            If money has been deducted but the application does not show the
            payment, do not immediately make the same payment again unless the
            official service tells you to do so.
          </p>

          <p className="govuk-body">
            Keep the transaction reference, receipt or confirmation message and
            contact the official eCitizen support channel or the institution
            responsible for the application.
          </p>

          <p className="govuk-body">
            CitizenGuide.KE cannot trace, reverse or reconcile government
            payments.
          </p>

          <h2 className="govuk-heading-l">
            If an application is delayed or rejected
          </h2>

          <p className="govuk-body">
            An application submitted through eCitizen is normally handled by
            the public institution responsible for that service.
          </p>

          <p className="govuk-body">
            eCitizen provides the digital platform, while the responsible
            institution may determine whether an application meets the relevant
            legal or administrative requirements.
          </p>

          <p className="govuk-body">
            Use the contact information provided for the service if you need
            clarification about requirements, processing times or a decision.
          </p>

          <p className="govuk-body">
            <Link href="/contact-government" className="govuk-link">
              Find a government institution
            </Link>
          </p>

          <h2 className="govuk-heading-l">
            CitizenGuide.KE and eCitizen
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE and eCitizen serve different purposes.
          </p>

          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                CitizenGuide.KE
              </dt>

              <dd className="govuk-summary-list__value">
                Explains institutions, public services, laws and civic
                processes and helps you find the appropriate official source.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">eCitizen</dt>

              <dd className="govuk-summary-list__value">
                A Government of Kenya digital platform through which
                participating public institutions provide online services.
              </dd>
            </div>
          </dl>

          <div className="govuk-inset-text">
            CitizenGuide.KE does not have access to your eCitizen account,
            application history, government payment records or documents stored
            in eCitizen.
          </div>

          <h2 className="govuk-heading-l">
            Service guides on CitizenGuide.KE
          </h2>

          <p className="govuk-body">
            Our service guides explain requirements and steps in plain language
            and, where an online application exists, direct you to the
            appropriate official service.
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

          <h2 className="govuk-heading-l">Information can change</h2>

          <p className="govuk-body">
            eCitizen services, requirements, fees and government systems can
            change. CitizenGuide.KE may not reflect an official change
            immediately.
          </p>

          <p className="govuk-body">
            For an application, payment or deadline, check the current
            information shown by the responsible government service before
            proceeding.
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
            { text: "Huduma Centres", href: "/huduma-centres" },
            {
              text: "Digital government",
              href: "/topics/digital-government",
            },
            { text: "Scams and fake websites", href: "/scams" },
            {
              text: "Browse government services",
              href: "/services",
            },
            {
              text: "Contact government",
              href: "/contact-government",
            },
            { text: "Help and support", href: "/help" },
          ]}
        />
      </div>
    </>
  );
}