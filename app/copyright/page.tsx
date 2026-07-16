import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";

export const revalidate = 86400;
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Copyright and content notices",
  description:
    "How CitizenGuide.KE handles copyright, official emblems and requests to correct or remove content under Kenyan law — not a US DMCA agent page.",
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
        lead="CitizenGuide.KE is an independent civic information website. This page explains how we treat intellectual property and how rights holders or public bodies can ask us to correct or remove material."
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              This is <strong>not</strong> a United States DMCA (Digital
              Millennium Copyright Act) designated-agent filing. We operate in
              Kenya and use a good-faith notice-and-review process. This page is
              information for the public, not legal advice.
            </p>
          </div>

          <h2 className="govuk-heading-l">What this website is</h2>
          <p className="govuk-body">
            We publish factual information about Kenyan public institutions,
            laws, services and national calendars to help people find their way.
            We are not the Government of Kenya and do not process applications
            or payments. See our{" "}
            <Link href="/disclaimer" className="govuk-link">
              disclaimer
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">Copyright in our materials</h2>
          <p className="govuk-body">
            Unless we say otherwise, original text, layout and compilation on
            CitizenGuide.KE are protected by copyright. You may quote short
            extracts for personal, educational or non-commercial use with a clear
            link back to the page. Do not copy large parts of the site, scrape
            it to rebuild a competing service, or present our content as an
            official government product.
          </p>
          <p className="govuk-body">
            Third-party logos, photos, trademarks and documents remain the
            property of their owners.
          </p>

          <h2 className="govuk-heading-l">Public-sector information</h2>
          <p className="govuk-body">
            We rely heavily on material that is public or intended for public
            use — for example constitutional and legislative text, gazetted
            notices, and factual registers. Summaries and guides on this site are
            our own writing unless we attribute another source.
          </p>
          <p className="govuk-body">
            We avoid using official coats of arms, ministry logos or similar
            protected emblems as our site branding. Where an institution is named,
            we may link to its official website.
          </p>
          <p className="govuk-body">
            If you believe a page misuses a protected emblem, proprietary report
            or other rights-protected material, use the notice process below.
          </p>

          <h2 className="govuk-heading-l">Notice and review (takedown / correction)</h2>
          <p className="govuk-body">
            Public bodies, rights holders and members of the public can ask us to
            remove or correct content. We review legitimate requests in good faith
            and act promptly where a claim is clear and valid.
          </p>
          <p className="govuk-body">
            This process covers, for example:
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>alleged copyright infringement</li>
            <li>misuse of official logos or protected emblems</li>
            <li>materially wrong or outdated official figures that we should correct</li>
            <li>privacy or personal-data concerns about something we published</li>
          </ul>

          <h3 className="govuk-heading-m">How to send a notice</h3>
          <p className="govuk-body">
            Email{" "}
            <a className="govuk-link" href="mailto:legal@citizenguide.ke">
              legal@citizenguide.ke
            </a>{" "}
            with the subject line{" "}
            <strong>Content notice — CitizenGuide.KE</strong>.
          </p>
          <p className="govuk-body">Please include:</p>
          <ol className="govuk-list govuk-list--number">
            <li>
              Your full name, organisation (if any) and a contact email. Prefer an
              official domain (for example <code className="govuk-!-font-size-16">@go.ke</code>{" "}
              or your institution’s domain) for public-sector requests.
            </li>
            <li>
              The exact page URL(s) on citizenguide.ke (and, if relevant, a
              screenshot or quote of the passage).
            </li>
            <li>
              A clear explanation of the problem — for example copyright
              ownership, emblem misuse, or which fact is wrong and what the
              correct information is (with a public source if possible).
            </li>
            <li>
              For rights claims: a statement that you are the rights holder or
              are authorised to act for them.
            </li>
            <li>
              For public bodies: role or letterhead / official correspondence if
              you cannot use an institutional email.
            </li>
          </ol>
          <p className="govuk-body">
            Incomplete notices may be delayed or returned with a request for more
            detail. We may not action anonymous or abusive messages.
          </p>

          <h3 className="govuk-heading-m">What we will do</h3>
          <ul className="govuk-list govuk-list--bullet">
            <li>Acknowledge receipt when we can.</li>
            <li>
              Review the material against our{" "}
              <Link href="/editorial-policy" className="govuk-link">
                editorial policy
              </Link>{" "}
              and{" "}
              <Link href="/corrections" className="govuk-link">
                corrections
              </Link>{" "}
              process.
            </li>
            <li>
              Correct, update, attribute or remove content where the claim is
              well founded — or explain why we will leave it in place.
            </li>
          </ul>
          <p className="govuk-body">
            Factual updates (wrong dates, superseded office holders) are often
            handled as corrections rather than full removal. Copyright or emblem
            claims may require removal of specific assets.
          </p>

          <h2 className="govuk-heading-l">Counter-notice</h2>
          <p className="govuk-body">
            If we remove or change content because of a notice and you believe
            that was a mistake, write to{" "}
            <a className="govuk-link" href="mailto:legal@citizenguide.ke">
              legal@citizenguide.ke
            </a>{" "}
            with the page URL, what was removed, and why you think the content
            should be restored. We will review in good faith.
          </p>

          <h2 className="govuk-heading-l">Hosting and third-party complaints</h2>
          <p className="govuk-body">
            If a complaint is made to our hosting or CDN provider, a clear
            designated contact helps them pass the issue to us first. Use{" "}
            <a className="govuk-link" href="mailto:legal@citizenguide.ke">
              legal@citizenguide.ke
            </a>{" "}
            for abuse and rights notices about this site.
          </p>

          <h2 className="govuk-heading-l">General contact</h2>
          <p className="govuk-body">
            For ordinary questions, feedback or bug reports that are not formal
            rights notices, use{" "}
            <Link href="/contact" className="govuk-link">
              contact CitizenGuide.KE
            </Link>
            .
          </p>
        </div>

        <RelatedNav
          links={[
            { text: "Disclaimer", href: "/disclaimer" },
            { text: "Terms and conditions", href: "/terms" },
            { text: "Privacy policy", href: "/privacy" },
            { text: "Editorial policy", href: "/editorial-policy" },
            { text: "Corrections", href: "/corrections" },
            { text: "Contact", href: "/contact" },
          ]}
        />
      </div>
    </>
  );
}
