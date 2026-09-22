// app/terms/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Terms and conditions",
  description:
    "Terms and conditions for using CitizenGuide.KE, an independent civic information platform.",
};

export default function TermsPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Terms and conditions" },
        ]}
        title="Terms and conditions"
        lead="These terms explain the rules that apply when you use CitizenGuide.KE."
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-warning-text">
            <span
              className="govuk-warning-text__icon"
              aria-hidden="true"
            >
              !
            </span>
            <strong className="govuk-warning-text__text">
              <span className="govuk-visually-hidden">
                Important
              </span>
              CitizenGuide.KE is an independent website. It is not a
              Government of Kenya website and does not provide government
              services.
            </strong>
          </div>

          <p className="govuk-body">
            By using CitizenGuide.KE, you agree to these terms and conditions.
            If you do not agree to them, you should not use the website.
          </p>

          <h2 className="govuk-heading-l">
            Who we are
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE is an independent civic information platform
            operated by Citizen Guide Africa Limited.
          </p>

          <p className="govuk-body">
            In these terms, &ldquo;CitizenGuide.KE&rdquo;, &ldquo;we&rdquo;,
            &ldquo;us&rdquo; and &ldquo;our&rdquo; refer to Citizen Guide
            Africa Limited and the CitizenGuide.KE service.
          </p>

          <p className="govuk-body">
            CitizenGuide.KE is not part of the Government of Kenya, a county
            government or any other public body. We do not act on their behalf.
          </p>

          <h2 className="govuk-heading-l">
            Using CitizenGuide.KE
          </h2>

          <p className="govuk-body">
            You may use CitizenGuide.KE to find, read and understand civic and
            public information about Kenya.
          </p>

          <p className="govuk-body">
            You agree to use the website only for lawful purposes and in a way
            that does not interfere with the website or prevent other people
            from using it.
          </p>

          <p className="govuk-body">
            You must not:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              attempt to gain unauthorised access to the website, its systems
              or data
            </li>
            <li>
              deliberately damage, disrupt or impair the website or its
              infrastructure
            </li>
            <li>
              use the website to carry out unlawful, fraudulent or harmful
              activity
            </li>
            <li>
              misrepresent CitizenGuide.KE as an official government service
            </li>
            <li>
              use our name, branding or content in a way that suggests we
              endorse you or your organisation when we do not
            </li>
          </ul>

          <h2 className="govuk-heading-l">
            Government services and transactions
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE provides information and guidance. It does not
            process government applications, issue official documents, collect
            government payments or make decisions on behalf of public bodies.
          </p>

          <div className="govuk-inset-text">
            When you need to apply for a service, make an official payment or
            submit information to government, use the website, system or office
            authorised by the responsible public body.
          </div>

          <p className="govuk-body">
            Our{" "}
            <Link href="/services" className="govuk-link">
              service guides
            </Link>{" "}
            may help you identify the appropriate government service and find
            its official source.
          </p>

          <h2 className="govuk-heading-l">
            Information on this website
          </h2>

          <p className="govuk-body">
            We collect, organise and explain information from public sources.
            These may include legislation, the Kenya Gazette, parliamentary
            records, court records, official websites, government publications
            and publications from other public bodies.
          </p>

          <p className="govuk-body">
            We take reasonable steps to make our information accurate and
            useful. However, we cannot guarantee that every page will always be
            complete, current or free from error.
          </p>

          <p className="govuk-body">
            Laws, regulations, public offices, procedures, fees, deadlines and
            other government information can change. There may be a delay
            between an official change and an update appearing on
            CitizenGuide.KE.
          </p>

          <div className="govuk-inset-text">
            If information affects a legal obligation, application, payment,
            deadline or other important decision, check the original or latest
            official source before relying on it.
          </div>

          <p className="govuk-body">
            If you find information that appears to be wrong, incomplete or
            out of date, you can{" "}
            <Link href="/corrections" className="govuk-link">
              report a correction
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">
            No professional advice
          </h2>

          <p className="govuk-body">
            Content on CitizenGuide.KE is provided for general civic and
            informational purposes. It is not legal, financial, tax,
            immigration or other professional advice.
          </p>

          <p className="govuk-body">
            You should get appropriate professional advice or contact the
            responsible public body where your circumstances require it.
          </p>

          <h2 className="govuk-heading-l">
            Using our content
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE publishes information from many different sources.
            Rights in source material remain with the relevant copyright owner
            or are subject to the terms that apply to that material.
          </p>

          <p className="govuk-body">
            We do not claim ownership of legislation, official records or
            other source material merely because it appears on
            CitizenGuide.KE.
          </p>

          <p className="govuk-body">
            CitizenGuide.KE&apos;s original editorial content, summaries,
            organisation of information, graphics, branding, software and
            other original material may be protected by copyright, trade mark
            or other intellectual property rights.
          </p>

          <p className="govuk-body">
            You may link to pages on CitizenGuide.KE, provided you do so
            lawfully and do not suggest an association with or endorsement by
            CitizenGuide.KE where none exists.
          </p>

          <p className="govuk-body">
            For more information about copying, attribution and reuse, read our{" "}
            <Link href="/copyright" className="govuk-link">
              copyright and content notices
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">
            Automated access
          </h2>

          <p className="govuk-body">
            Search engines and other automated services may access publicly
            available pages where permitted by our technical instructions,
            including our robots.txt rules.
          </p>

          <p className="govuk-body">
            You must not use automated tools in a way that places an
            unreasonable load on CitizenGuide.KE, attempts to bypass security
            controls, or gains unauthorised access to non-public systems or
            data.
          </p>

          <p className="govuk-body">
            If you need large-scale or structured access to CitizenGuide.KE
            data,{" "}
            <Link href="/contact" className="govuk-link">
              contact us
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">
            Availability of the website
          </h2>

          <p className="govuk-body">
            We aim to keep CitizenGuide.KE available and working properly, but
            we cannot guarantee uninterrupted access.
          </p>

          <p className="govuk-body">
            We may change, suspend or remove parts of the website when needed,
            including for maintenance, security, technical or editorial
            reasons.
          </p>

          <h2 className="govuk-heading-l">
            Our responsibility
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE is provided on an &ldquo;as available&rdquo; basis.
            We take reasonable care in providing the service but do not
            guarantee that all content will always be accurate, complete,
            current or available.
          </p>

          <p className="govuk-body">
            To the extent permitted by Kenyan law, Citizen Guide Africa Limited
            is not responsible for loss or damage arising from your use of, or
            inability to use, CitizenGuide.KE, or from reliance on information
            published on the website.
          </p>

          <p className="govuk-body">
            Nothing in these terms excludes or limits any responsibility that
            cannot lawfully be excluded or limited.
          </p>

          <h2 className="govuk-heading-l">
            Links to other websites
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE contains links to government websites and other
            external sources. These links are provided to help you find
            official services, source material and further information.
          </p>

          <p className="govuk-body">
            We do not control external websites and are not responsible for
            their content, availability, security, accessibility or privacy
            practices.
          </p>

          <p className="govuk-body">
            A link from CitizenGuide.KE does not necessarily mean that we
            endorse the website, organisation, product or service concerned.
          </p>

          <h2 className="govuk-heading-l">
            Privacy
          </h2>

          <p className="govuk-body">
            Our{" "}
            <Link href="/privacy" className="govuk-link">
              privacy policy
            </Link>{" "}
            explains how we collect, use and protect personal data when you use
            CitizenGuide.KE.
          </p>

          <p className="govuk-body">
            Information about cookies and similar technologies is available in
            our{" "}
            <Link href="/cookies" className="govuk-link">
              cookies policy
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">
            Changes to these terms
          </h2>

          <p className="govuk-body">
            We may update these terms when CitizenGuide.KE, the law or the way
            we provide the service changes.
          </p>

          <p className="govuk-body">
            The latest version will always be published on this page. Where a
            change is significant, we may also provide a notice elsewhere on
            the website.
          </p>

          <h2 className="govuk-heading-l">
            Governing law
          </h2>

          <p className="govuk-body">
            These terms are governed by the laws of Kenya.
          </p>

          <p className="govuk-body">
            Any dispute relating to these terms or your use of CitizenGuide.KE
            will be subject to the jurisdiction of the courts of Kenya.
          </p>

          <h2 className="govuk-heading-l">
            Contact us
          </h2>

          <p className="govuk-body">
            If you have a question about these terms, intellectual property or
            use of CitizenGuide.KE data,{" "}
            <Link href="/contact" className="govuk-link">
              contact CitizenGuide.KE
            </Link>
            .
          </p>

          <p className="govuk-body govuk-!-margin-top-8">
            <strong>Last updated:</strong> 9 September 2026
          </p>
        </div>

        <RelatedNav
          links={[
            { text: "Privacy policy", href: "/privacy" },
            { text: "Copyright and content notices", href: "/copyright" },
            { text: "Cookies policy", href: "/cookies" },
            { text: "Accessibility statement", href: "/accessibility" },
            { text: "Disclaimer", href: "/disclaimer" },
            { text: "Contact this website", href: "/contact" },
          ]}
        />
      </div>
    </>
  );
}