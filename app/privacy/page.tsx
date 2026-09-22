// app/privacy/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How CitizenGuide.KE collects, uses and protects personal data, and your rights under Kenya's data protection law.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Privacy policy" },
        ]}
        title="Privacy policy"
        lead="This policy explains what personal data CitizenGuide.KE collects, how we use it and your data protection rights."
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            CitizenGuide.KE is an independent civic information platform. It is
            not a Government of Kenya website.
          </div>

          <p className="govuk-body">
            We are committed to handling personal data responsibly and in
            accordance with applicable Kenyan data protection law, including
            the Data Protection Act, 2019.
          </p>

          <h2 className="govuk-heading-l">
            Who is responsible for your data
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE is operated by Citizen Guide Africa Limited.
          </p>

          <p className="govuk-body">
            Where Citizen Guide Africa Limited determines why and how personal
            data is processed through CitizenGuide.KE, it is the data
            controller for that information.
          </p>

          <p className="govuk-body">
            If you have a question about how we use your personal data, you can{" "}
            <Link href="/contact" className="govuk-link">
              contact us
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">
            What personal data we collect
          </h2>

          <p className="govuk-body">
            You can browse most of CitizenGuide.KE without giving us your name
            or contact details.
          </p>

          <h3 className="govuk-heading-m">
            Information you give us
          </h3>

          <p className="govuk-body">
            We may collect personal data when you choose to contact us, send
            feedback or report a correction.
          </p>

          <p className="govuk-body">
            Depending on how you contact us, this may include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>your name, if you provide it</li>
            <li>your email address or other contact details</li>
            <li>the information contained in your message</li>
            <li>
              any supporting information or documents you choose to provide
            </li>
          </ul>

          <p className="govuk-body">
            Do not send us sensitive personal information unless it is
            necessary for us to deal with your request.
          </p>

          <h3 className="govuk-heading-m">
            Technical and usage information
          </h3>

          <p className="govuk-body">
            When you use CitizenGuide.KE, some technical information may be
            collected automatically by our systems or service providers.
          </p>

          <p className="govuk-body">
            This may include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>pages you visit and how you use the website</li>
            <li>the date and time of your visit</li>
            <li>your browser and device type</li>
            <li>technical information such as your IP address</li>
            <li>an approximate location derived from technical information</li>
            <li>information about errors, performance and security events</li>
          </ul>

          <p className="govuk-body">
            Where possible, we use aggregated or de-identified information to
            understand how people use CitizenGuide.KE.
          </p>

          <h2 className="govuk-heading-l">
            Personal data in public records
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE collects, organises and links information from
            publicly available civic and government sources. These may include
            the Kenya Gazette, legislation, parliamentary records, court
            records and publications from public bodies.
          </p>

          <p className="govuk-body">
            Public records may contain personal data. For example, they may
            identify public officers, elected representatives, judicial
            officers, company officers or other people named in an official
            record.
          </p>

          <p className="govuk-body">
            The fact that information is publicly available does not mean that
            we treat it as having no data protection considerations. We aim to
            process and present personal data from public records lawfully,
            fairly and in a way that is relevant to CitizenGuide.KE&apos;s
            civic information purpose.
          </p>

          <p className="govuk-body">
            We may retain links between people, institutions and public records
            where those relationships are supported by the source material.
          </p>

          <p className="govuk-body">
            If you believe personal data about you has been published
            incorrectly, attributed to the wrong person or presented without
            appropriate context, you can{" "}
            <Link href="/corrections" className="govuk-link">
              report a correction
            </Link>{" "}
            or{" "}
            <Link href="/contact" className="govuk-link">
              contact us
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">
            Why we use personal data
          </h2>

          <p className="govuk-body">
            We only use personal data where we have a reason to do so and a
            lawful basis under applicable data protection law.
          </p>

          <p className="govuk-body">
            Depending on the circumstances, we may use personal data to:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>respond to questions, feedback and correction requests</li>
            <li>operate, maintain and improve CitizenGuide.KE</li>
            <li>understand how the website is being used</li>
            <li>detect and prevent misuse, fraud or security threats</li>
            <li>
              organise and present information from public and civic records
            </li>
            <li>comply with legal and regulatory obligations</li>
          </ul>

          <h3 className="govuk-heading-m">
            Our lawful bases
          </h3>

          <p className="govuk-body">
            The lawful basis we rely on depends on why the information is being
            processed. This may include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              <strong>consent</strong>, where you have given us permission for
              a particular use
            </li>
            <li>
              <strong>legitimate interests</strong>, where processing is
              necessary for operating, securing or improving CitizenGuide.KE
              and those interests are not overridden by your rights
            </li>
            <li>
              <strong>legal obligation</strong>, where we need to process
              information to comply with the law
            </li>
            <li>
              other lawful grounds available under Kenyan data protection law
              where they apply to the circumstances
            </li>
          </ul>

          <h2 className="govuk-heading-l">
            Cookies and analytics
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE may use cookies and similar technologies that are
            necessary for the website to work, remember choices you make or
            help us understand how the website is used.
          </p>

          <p className="govuk-body">
            We do not use personal data collected through CitizenGuide.KE for
            third-party behavioural advertising.
          </p>

          <p className="govuk-body">
            Read our{" "}
            <Link href="/cookies" className="govuk-link">
              cookies policy
            </Link>{" "}
            for more information about the cookies and similar technologies we
            use and the choices available to you.
          </p>

          <h2 className="govuk-heading-l">
            Who we share personal data with
          </h2>

          <p className="govuk-body">
            We do not sell or rent your personal data.
          </p>

          <p className="govuk-body">
            We may use trusted service providers to help us operate
            CitizenGuide.KE. These may include providers of:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>website hosting and infrastructure</li>
            <li>database and content management services</li>
            <li>website analytics</li>
            <li>email and communications services</li>
            <li>security, monitoring and error reporting</li>
          </ul>

          <p className="govuk-body">
            Where these providers process personal data on our behalf, we take
            appropriate steps to require them to protect it and use it only for
            the purposes for which it was provided.
          </p>

          <p className="govuk-body">
            We may also disclose personal data where required or permitted by
            law, including where necessary to respond to a lawful request from
            a court, regulator or other authorised public body.
          </p>

          <h2 className="govuk-heading-l">
            Transfers outside Kenya
          </h2>

          <p className="govuk-body">
            Some of the service providers we use may process or store
            information outside Kenya.
          </p>

          <p className="govuk-body">
            Where personal data is transferred outside Kenya, we take
            appropriate steps to ensure that the transfer is made in accordance
            with applicable Kenyan data protection requirements and that the
            information remains appropriately protected.
          </p>

          <h2 className="govuk-heading-l">
            How long we keep personal data
          </h2>

          <p className="govuk-body">
            We keep personal data only for as long as it is reasonably
            necessary for the purpose for which it was collected, including
            where we need to retain it for legal, security, operational or
            record-keeping purposes.
          </p>

          <p className="govuk-body">
            Different types of information may therefore be kept for different
            periods.
          </p>

          <p className="govuk-body">
            Information contained in public records may remain available for
            longer where retaining the record continues to serve a lawful civic
            or public information purpose.
          </p>

          <h2 className="govuk-heading-l">
            How we protect personal data
          </h2>

          <p className="govuk-body">
            We use appropriate technical and organisational measures to protect
            personal data against unauthorised access, alteration, disclosure,
            loss or destruction.
          </p>

          <p className="govuk-body">
            No website or online service can guarantee absolute security. We
            review our safeguards as CitizenGuide.KE and the technologies we
            use develop.
          </p>

          <h2 className="govuk-heading-l">
            Your data protection rights
          </h2>

          <p className="govuk-body">
            Kenyan data protection law gives you rights over your personal
            data. Depending on the circumstances, you may have the right to:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>be informed about how your personal data is being used</li>
            <li>ask for access to personal data we hold about you</li>
            <li>ask us to correct inaccurate or misleading personal data</li>
            <li>ask for personal data to be deleted where the law allows</li>
            <li>object to certain uses of your personal data</li>
            <li>ask us to restrict certain processing</li>
            <li>request data portability where applicable</li>
            <li>
              withdraw consent where we rely on your consent to process
              personal data
            </li>
          </ul>

          <p className="govuk-body">
            Some rights are subject to legal conditions and exceptions. For
            example, a request to delete personal data does not necessarily
            require the removal of information that must or may lawfully remain
            in an official or historical public record.
          </p>

          <p className="govuk-body">
            To exercise a data protection right,{" "}
            <Link href="/contact" className="govuk-link">
              contact us
            </Link>{" "}
            and tell us what you are requesting. We may need to verify your
            identity before acting on a request.
          </p>

          <h2 className="govuk-heading-l">
            Complaints
          </h2>

          <p className="govuk-body">
            If you are concerned about how CitizenGuide.KE has handled your
            personal data, please contact us first so that we can look into the
            matter.
          </p>

          <p className="govuk-body">
            You also have the right to make a complaint to Kenya&apos;s Office
            of the Data Protection Commissioner (ODPC).
          </p>

          <h2 className="govuk-heading-l">
            Links to other websites
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE links to government websites and other external
            sources. This privacy policy applies only to CitizenGuide.KE.
          </p>

          <p className="govuk-body">
            When you follow a link to another website, that website is
            responsible for its own privacy practices. You should read its
            privacy information to understand how it handles your personal
            data.
          </p>

          <h2 className="govuk-heading-l">
            Changes to this policy
          </h2>

          <p className="govuk-body">
            We may update this privacy policy when CitizenGuide.KE, our data
            practices or applicable law changes.
          </p>

          <p className="govuk-body">
            The latest version will always be published on this page. If we
            make a significant change, we may also provide a notice elsewhere
            on the website.
          </p>

          <h2 className="govuk-heading-l">
            Contact us
          </h2>

          <p className="govuk-body">
            If you have a question about this policy, want to exercise a data
            protection right or want to raise a concern about your personal
            data,{" "}
            <Link href="/contact" className="govuk-link">
              contact CitizenGuide.KE
            </Link>
            .
          </p>

          <p className="govuk-body">
            You can also email{" "}
            <a
              href="mailto:privacy@citizenguide.ke"
              className="govuk-link"
            >
              privacy@citizenguide.ke
            </a>
            .
          </p>

          <p className="govuk-body govuk-!-margin-top-8">
            <strong>Last updated:</strong> 9 September 2026
          </p>
        </div>

        <RelatedNav
          links={[
            { text: "Cookies policy", href: "/cookies" },
            { text: "Terms and conditions", href: "/terms" },
            { text: "Disclaimer", href: "/disclaimer" },
            { text: "Copyright and content notices", href: "/copyright" },
            { text: "Accessibility statement", href: "/accessibility" },
            { text: "Contact this website", href: "/contact" },
          ]}
        />
      </div>
    </>
  );
}