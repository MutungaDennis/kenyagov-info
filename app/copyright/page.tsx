// app/copyright/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Copyright and content notices",
  description:
    "How CitizenGuide.KE handles copyright, source material, attribution, protected emblems and requests to correct or remove content.",
};

export default function CopyrightPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Copyright and content notices" },
        ]}
        title="Copyright and content notices"
        lead="This page explains how CitizenGuide.KE treats source material, original content, attribution and requests to correct or remove material."
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              CitizenGuide.KE operates in Kenya and uses a good-faith
              notice-and-review process for copyright, attribution and other
              content concerns. This is not a United States DMCA
              designated-agent filing and this page is not legal advice.
            </p>
          </div>

          <h2 className="govuk-heading-l">About CitizenGuide.KE</h2>

          <p className="govuk-body">
            CitizenGuide.KE is an independent civic information platform. We
            organise and explain information about Kenyan public institutions,
            laws, court records, leaders, services, elections, counties and
            other civic matters.
          </p>

          <p className="govuk-body">
            CitizenGuide.KE is not a Government of Kenya website and does not
            issue official documents, process government applications or
            collect government payments.
          </p>

          <p className="govuk-body">
            Read our{" "}
            <Link href="/disclaimer" className="govuk-link">
              disclaimer
            </Link>{" "}
            for more information about the status of this website and how its
            information should be used.
          </p>

          <h2 className="govuk-heading-l">
            Official and third-party source material
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE uses, references and links to information from
            official and other public sources. These may include legislation,
            the Kenya Gazette, parliamentary records, court decisions,
            government publications, public registers and material published
            by public bodies.
          </p>

          <p className="govuk-body">
            CitizenGuide.KE does not claim ownership of legislation, official
            records, government publications or other third-party source
            material merely because that material is reproduced, indexed,
            quoted or referenced on this website.
          </p>

          <p className="govuk-body">
            Copyright, trade mark and other rights in source material remain
            subject to applicable law and to any terms that apply to the
            original source.
          </p>

          <p className="govuk-body">
            Where practical, we identify or link to the original source so that
            users can verify the information and consult the authoritative
            record.
          </p>

          <h2 className="govuk-heading-l">
            CitizenGuide.KE original content
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE also creates original material and adds editorial
            and technical value to information collected from public sources.
          </p>

          <p className="govuk-body">
            Unless otherwise stated, our original material may include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>plain-language summaries and explanatory guides</li>
            <li>original descriptions and editorial commentary</li>
            <li>classifications, indexes and navigational structures</li>
            <li>
              original relationships and cross-references between institutions,
              people, laws and records
            </li>
            <li>original graphics, illustrations and visual material</li>
            <li>CitizenGuide.KE branding and identity</li>
            <li>software and other original technical work</li>
          </ul>

          <p className="govuk-body">
            These materials may be protected by copyright, trade mark or other
            applicable intellectual property rights.
          </p>

          <h2 className="govuk-heading-l">
            Using CitizenGuide.KE content
          </h2>

          <p className="govuk-body">
            You may link to CitizenGuide.KE and may quote reasonable extracts
            from our original editorial material for purposes such as
            commentary, education, research, journalism or other lawful use.
          </p>

          <p className="govuk-body">
            Where you reproduce CitizenGuide.KE original material, we ask that
            you identify CitizenGuide.KE as the source and provide a link to the
            relevant page where reasonably possible.
          </p>

          <p className="govuk-body">
            You must not:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              reproduce substantial amounts of our original content in a way
              that substitutes for CitizenGuide.KE
            </li>
            <li>
              systematically extract or copy our structured information in
              order to reproduce a substantial part of the service
            </li>
            <li>
              bypass access controls, rate limits or other technical
              protections
            </li>
            <li>
              present CitizenGuide.KE content as an official government record
              or government service
            </li>
            <li>
              use CitizenGuide.KE branding in a way that suggests our
              endorsement or an official relationship where none exists
            </li>
          </ul>

          <p className="govuk-body">
            If you want to reuse substantial amounts of CitizenGuide.KE
            original or structured material for a commercial product, data
            service or large-scale publication,{" "}
            <Link href="/contact" className="govuk-link">
              contact us
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">
            Automated access and indexing
          </h2>

          <p className="govuk-body">
            Search engines and other automated services may access publicly
            available pages where permitted by our technical instructions,
            including our robots.txt rules.
          </p>

          <p className="govuk-body">
            Automated access must not interfere with the operation of
            CitizenGuide.KE, circumvent security controls, gain unauthorised
            access to non-public systems or systematically extract information
            in breach of these terms.
          </p>

          <p className="govuk-body">
            Where a third-party service uses CitizenGuide.KE original
            summaries, analysis or other editorial work, clear attribution and
            a link to the relevant CitizenGuide.KE page are encouraged and may
            be required where applicable under licence or law.
          </p>

          <h2 className="govuk-heading-l">
            Logos, trade marks and official emblems
          </h2>

          <p className="govuk-body">
            Third-party trade marks, logos, photographs and other protected
            material remain the property of their respective owners.
          </p>

          <p className="govuk-body">
            CitizenGuide.KE maintains its own independent branding and does not
            use the National Flag, Armorial Ensigns, Public Seal or other
            protected state emblems as its own identity.
          </p>

          <p className="govuk-body">
            Kenyan law regulates the use of certain national flags, emblems,
            names and likenesses. CitizenGuide.KE seeks to avoid any use that
            could falsely suggest government status, authorisation or
            endorsement.
          </p>

          <p className="govuk-body">
            Where the name of a ministry, public institution or other body is
            used, this is generally for factual identification and navigation.
            We may link to the body&apos;s official website.
          </p>

          <h2 className="govuk-heading-l">
            GOV.UK Frontend and design patterns
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE uses and adapts components and design patterns from
            GOV.UK Frontend.
          </p>

          <p className="govuk-body">
            GOV.UK Frontend is made available under the MIT Licence.
            CitizenGuide.KE is independent of the UK Government and Government
            Digital Service and does not claim any endorsement by them.
          </p>

          <p className="govuk-body">
            CitizenGuide.KE uses its own name, branding, content and identity.
          </p>

          <h2 className="govuk-heading-l">
            Reporting a copyright or content concern
          </h2>

          <p className="govuk-body">
            Rights holders, public bodies and members of the public may contact
            us about material published on CitizenGuide.KE.
          </p>

          <p className="govuk-body">
            This process may be used for concerns including:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>alleged copyright infringement</li>
            <li>trade mark concerns</li>
            <li>possible misuse of a protected state emblem</li>
            <li>incorrect attribution of third-party material</li>
            <li>materially inaccurate or outdated factual information</li>
            <li>privacy or personal-data concerns</li>
          </ul>

          <h3 className="govuk-heading-m">How to send a notice</h3>

          <p className="govuk-body">
            Email{" "}
            <a
              href="mailto:legal@citizenguide.ke"
              className="govuk-link"
            >
              legal@citizenguide.ke
            </a>{" "}
            with the subject line{" "}
            <strong>Content notice — CitizenGuide.KE</strong>.
          </p>

          <p className="govuk-body">
            Please provide enough information for us to understand and assess
            the request, including:
          </p>

          <ol className="govuk-list govuk-list--number">
            <li>
              your full name, organisation if applicable, and a reliable
              contact email address
            </li>
            <li>
              the exact CitizenGuide.KE page URL or URLs concerned
            </li>
            <li>
              a description of the material concerned
            </li>
            <li>
              a clear explanation of the issue and the action you are asking us
              to take
            </li>
            <li>
              any evidence or source material that supports your request
            </li>
            <li>
              if you are making a rights claim, an explanation of your rights
              in the material or your authority to act for the rights holder
            </li>
          </ol>

          <p className="govuk-body">
            Public bodies are encouraged to contact us using an official
            institutional email address where one is available.
          </p>

          <p className="govuk-body">
            If we do not have enough information to assess a request, we may ask
            for further details.
          </p>

          <h3 className="govuk-heading-m">
            What happens after we receive a notice
          </h3>

          <p className="govuk-body">
            We will review the request and the relevant material. Depending on
            the issue, we may:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>correct or update information</li>
            <li>add or improve attribution</li>
            <li>add context or link to a newer official source</li>
            <li>temporarily restrict access while a claim is reviewed</li>
            <li>remove material where appropriate</li>
            <li>
              leave material in place where we consider the request is not
              supported
            </li>
          </ul>

          <p className="govuk-body">
            We may also contact the person or organisation that provided the
            material, or consult the relevant official source, where this is
            appropriate.
          </p>

          <p className="govuk-body">
            Factual errors such as incorrect dates, superseded office holders
            or outdated figures will normally be handled through our{" "}
            <Link href="/corrections" className="govuk-link">
              corrections process
            </Link>{" "}
            rather than by removing an entire page.
          </p>

          <h2 className="govuk-heading-l">
            Asking us to reconsider a decision
          </h2>

          <p className="govuk-body">
            If material has been removed or changed following a notice and you
            believe the decision was based on incomplete or incorrect
            information, you may ask us to reconsider it.
          </p>

          <p className="govuk-body">
            Email{" "}
            <a
              href="mailto:legal@citizenguide.ke"
              className="govuk-link"
            >
              legal@citizenguide.ke
            </a>{" "}
            and include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>the relevant CitizenGuide.KE page</li>
            <li>what was removed or changed</li>
            <li>why you believe the decision should be reconsidered</li>
            <li>any supporting evidence</li>
          </ul>

          <p className="govuk-body">
            We will review the matter again in good faith.
          </p>

          <h2 className="govuk-heading-l">
            Privacy and personal-data requests
          </h2>

          <p className="govuk-body">
            Copyright and factual corrections are different from requests about
            personal data.
          </p>

          <p className="govuk-body">
            If your concern is about personal data that CitizenGuide.KE holds
            or publishes, read our{" "}
            <Link href="/privacy" className="govuk-link">
              privacy policy
            </Link>{" "}
            for information about your data protection rights and how to make a
            request.
          </p>

          <h2 className="govuk-heading-l">
            Complaints sent to our service providers
          </h2>

          <p className="govuk-body">
            A rights holder may sometimes contact a hosting, infrastructure or
            other service provider instead of contacting CitizenGuide.KE
            directly.
          </p>

          <p className="govuk-body">
            Where a provider forwards a complaint to us, we will review it using
            the same principles described on this page.
          </p>

          <p className="govuk-body">
            For copyright, trade mark, emblem or other rights-related notices
            concerning CitizenGuide.KE, you can contact{" "}
            <a
              href="mailto:legal@citizenguide.ke"
              className="govuk-link"
            >
              legal@citizenguide.ke
            </a>
            .
          </p>

          <h2 className="govuk-heading-l">General contact</h2>

          <p className="govuk-body">
            For ordinary feedback, questions or technical problems that are not
            rights-related notices,{" "}
            <Link href="/contact" className="govuk-link">
              contact CitizenGuide.KE
            </Link>
            .
          </p>

          <p className="govuk-body govuk-!-margin-top-8">
            <strong>Last updated:</strong> 10 September 2026
          </p>
        </div>

        <RelatedNav
          links={[
            { text: "Disclaimer", href: "/disclaimer" },
            { text: "Terms and conditions", href: "/terms" },
            { text: "Privacy policy", href: "/privacy" },
            { text: "Editorial policy", href: "/editorial-policy" },
            { text: "Corrections", href: "/corrections" },
            { text: "Contact this website", href: "/contact" },
          ]}
        />
      </div>
    </>
  );
}