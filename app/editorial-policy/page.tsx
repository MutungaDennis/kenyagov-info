// app/editorial-policy/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Editorial policy",
  description:
    "How CitizenGuide.KE sources, writes, verifies and updates information about Kenyan government, public institutions and services.",
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

export default function EditorialPolicyPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "About", href: "/about" },
          { text: "Editorial policy" },
        ]}
        caption="About this website"
        title="Editorial policy"
        lead="How CitizenGuide.KE decides what to publish, where our information comes from, how we verify it and how we keep it up to date."
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            CitizenGuide.KE is an independent civic information platform. We
            are not the Government of Kenya and do not replace official legal,
            administrative or service information.
          </div>

          <h2 className="govuk-heading-l">Our purpose</h2>

          <p className="govuk-body">
            CitizenGuide.KE helps people understand how government in Kenya
            works, who is responsible for what, and where to find official
            services and records.
          </p>

          <p className="govuk-body">
            We organise information around citizen needs as well as public
            institutions. Our aim is to make complex civic information easier
            to find, understand and verify.
          </p>

          <p className="govuk-body">
            We do not publish information simply because it is available. We
            consider whether it is relevant, verifiable, useful to the public
            and appropriate to include in an independent civic information
            service.
          </p>

          <h2 className="govuk-heading-l">Our editorial principles</h2>

          <p className="govuk-body">
            We aim to follow these principles when publishing and maintaining
            content:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              <strong>Accuracy:</strong> information should be supported by
              reliable sources and presented in the correct context.
            </li>
            <li>
              <strong>Primary sources first:</strong> where possible, we rely on
              the original legal, parliamentary, judicial or institutional
              record.
            </li>
            <li>
              <strong>Clarity:</strong> we explain information in plain language
              without changing its legal or factual meaning.
            </li>
            <li>
              <strong>Independence:</strong> editorial decisions are not made on
              behalf of a ministry, political party, candidate or public body.
            </li>
            <li>
              <strong>Traceability:</strong> users should be able to understand
              where important factual information came from.
            </li>
            <li>
              <strong>Timeliness:</strong> information that changes should be
              reviewed and updated when reliable new information becomes
              available.
            </li>
            <li>
              <strong>Correction:</strong> verified errors should be corrected
              rather than silently left in place.
            </li>
          </ul>

          <h2 className="govuk-heading-l">Source hierarchy</h2>

          <p className="govuk-body">
            We prefer primary and authoritative sources. When sources conflict,
            we generally give greater weight to sources higher in this
            hierarchy:
          </p>

          <ol className="govuk-list govuk-list--number">
            <li>
              the Constitution of Kenya and legislation as officially published
            </li>
            <li>
              Kenya Gazette notices, legal notices, official proclamations and
              commencement notices
            </li>
            <li>
              judgments, rulings and other primary records published by the
              Judiciary
            </li>
            <li>
              parliamentary records, including Acts, Bills, Hansard, committee
              reports and official proceedings
            </li>
            <li>
              records and publications of constitutional commissions and
              independent offices
            </li>
            <li>
              official publications and websites of ministries, departments,
              agencies and county governments
            </li>
            <li>
              structured datasets formally released by public bodies
            </li>
            <li>
              reputable secondary sources where primary material is unavailable
              or additional context is necessary
            </li>
          </ol>

          <p className="govuk-body">
            This hierarchy is a guide rather than an automatic rule. The most
            appropriate source depends on the information being verified. For
            example, a later Gazette notice may supersede information published
            earlier on an institutional website.
          </p>

          <h2 className="govuk-heading-l">
            When official sources disagree
          </h2>

          <p className="govuk-body">
            Official sources are not always updated at the same time. A public
            institution&apos;s website may show one position while a Gazette
            notice, Act, court decision or later official record shows another.
          </p>

          <p className="govuk-body">
            Where there is a material conflict, we try to:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>identify the most authoritative and recent source</li>
            <li>check whether one source legally supersedes another</li>
            <li>record relevant dates</li>
            <li>avoid presenting disputed information as settled fact</li>
            <li>
              explain the conflict where it is important for the user to know
            </li>
          </ul>

          <p className="govuk-body">
            Where the correct position cannot be established confidently, we
            may delay publication, qualify the information or direct users to
            the responsible public body.
          </p>

          <h2 className="govuk-heading-l">
            Social media and secondary sources
          </h2>

          <p className="govuk-body">
            Social media can be useful for identifying announcements, but we do
            not normally treat a social media post on its own as authoritative
            evidence for legal requirements, fees, appointments or the status
            of public offices.
          </p>

          <p className="govuk-body">
            Where an official institution makes an announcement through a
            verified or otherwise clearly authentic official account, we may
            use it as an initial source while seeking confirmation from a more
            permanent official record where appropriate.
          </p>

          <p className="govuk-body">
            We do not treat rumours, forwarded messages, anonymous posts,
            campaign material or unverified screenshots as authoritative
            sources.
          </p>

          <p className="govuk-body">
            News reports, academic work and civil-society publications may be
            used for context or to identify issues for further research, but
            significant factual claims are preferably checked against primary
            material.
          </p>

          <h2 className="govuk-heading-l">What we publish</h2>

          <p className="govuk-body">
            CitizenGuide.KE may publish or organise information including:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>explanations of public institutions and their mandates</li>
            <li>directories of public institutions and office holders</li>
            <li>constitutional and statutory information</li>
            <li>Acts, Bills and legislative information</li>
            <li>court and judicial information</li>
            <li>Gazette notices and other official records</li>
            <li>county government information</li>
            <li>
              guidance that helps users identify the appropriate official
              service or public institution
            </li>
            <li>public-service fees and requirements where reliably sourced</li>
            <li>structured public datasets with source information</li>
            <li>
              civic explainers on subjects such as devolution, elections,
              public finance and the structure of government
            </li>
          </ul>

          <p className="govuk-body">
            The fact that CitizenGuide.KE includes information about an
            institution, person, law or public service does not imply
            endorsement by that institution or person.
          </p>

          <h2 className="govuk-heading-l">What we do not publish</h2>

          <p className="govuk-body">
            CitizenGuide.KE is an informational service rather than a political
            campaign or official transaction platform.
          </p>

          <p className="govuk-body">
            We do not intentionally publish:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>party-political campaigning or candidate endorsements</li>
            <li>unverified rumours presented as fact</li>
            <li>
              allegations about individuals without a reliable and appropriate
              public-interest basis
            </li>
            <li>
              instructions intended to facilitate unlawful access to public or
              private systems
            </li>
            <li>
              pages designed to impersonate an official government service
            </li>
            <li>
              government payment forms or payment collection presented as an
              official government transaction
            </li>
            <li>
              personal information merely because it can technically be found
              somewhere online
            </li>
          </ul>

          <h2 className="govuk-heading-l">
            Public office holders and personal information
          </h2>

          <p className="govuk-body">
            Information about public office holders may be included where it is
            relevant to understanding a public institution, office, legal
            responsibility or official record.
          </p>

          <p className="govuk-body">
            We aim to distinguish between information that is relevant to a
            person&apos;s public role and information relating only to their
            private life.
          </p>

          <p className="govuk-body">
            We do not assume that personal information should be republished
            simply because it appears in a public document. Publication
            decisions also take account of relevance, context, accuracy and
            applicable data-protection obligations.
          </p>

          <p className="govuk-body">
            For information about how we handle personal data, read our{" "}
            <Link href="/privacy" className="govuk-link">
              privacy policy
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">
            How we write and explain information
          </h2>

          <p className="govuk-body">
            We aim to make civic information understandable without
            oversimplifying or changing its meaning.
          </p>

          <p className="govuk-body">
            Our detailed writing conventions are set out in the{" "}
            <Link href="/content-style-guide" className="govuk-link">
              content style guide
            </Link>
            .
          </p>

          <p className="govuk-body">
            In general, we aim to:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>lead with the user&apos;s information need</li>
            <li>use plain, direct language</li>
            <li>use short sentences where possible</li>
            <li>use active voice</li>
            <li>expand unfamiliar acronyms the first time they appear</li>
            <li>separate explanation from the wording of an official source</li>
            <li>
              preserve important legal terminology where replacing it would
              change the meaning
            </li>
            <li>
              identify dates where information may change over time
            </li>
            <li>
              show monetary amounts in Kenyan shillings and give relevant dates
              for fees where possible
            </li>
            <li>
              say when requirements or services vary between counties or
              institutions
            </li>
          </ul>

          <h2 className="govuk-heading-l">
            Plain-language summaries
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE may provide plain-language summaries of laws,
            judgments, reports, institutional mandates and other official
            material.
          </p>

          <p className="govuk-body">
            A summary is intended to help users understand or navigate the
            source. It is not a replacement for the authoritative document.
          </p>

          <p className="govuk-body">
            Where the precise legal wording matters, users should consult the
            original Act, Gazette notice, judgment, regulation or other
            authoritative source.
          </p>

          <h2 className="govuk-heading-l">
            Links to official sources
          </h2>

          <p className="govuk-body">
            Where practical, we link to official sources so users can verify
            information for themselves.
          </p>

          <p className="govuk-body">
            For example, legal material may be linked to{" "}
            <a
              href="https://new.kenyalaw.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="govuk-link"
            >
              Kenya Law
              <ExternalLinkIcon />
              <span className="govuk-visually-hidden">
                {" "}
                (opens in a new tab)
              </span>
            </a>
            , while parliamentary information may link to the relevant official
            Parliament resource.
          </p>

          <p className="govuk-body">
            An external-link symbol indicates that a link opens a website that
            is not part of CitizenGuide.KE.
          </p>

          <h2 className="govuk-heading-l">
            Dates, fees and information that changes
          </h2>

          <p className="govuk-body">
            Some civic information changes frequently. Examples include fees,
            office holders, application procedures, deadlines, tax information
            and election-related information.
          </p>

          <p className="govuk-body">
            Where practical, we show the date on which information was checked,
            published or last updated so users can judge its currency.
          </p>

          <p className="govuk-body">
            A figure or requirement that was correct on one date may later
            change. Users should confirm time-sensitive requirements with the
            responsible public body before relying on them for an important
            transaction.
          </p>

          <h2 className="govuk-heading-l">Updates and review</h2>

          <p className="govuk-body">
            We do not apply the same review frequency to every page.
          </p>

          <p className="govuk-body">
            Information with a higher risk of becoming outdated may be reviewed
            more frequently. This can include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>fees and charges</li>
            <li>election information</li>
            <li>tax and revenue information</li>
            <li>identity and immigration services</li>
            <li>current public office holders</li>
            <li>application requirements and deadlines</li>
          </ul>

          <p className="govuk-body">
            Structural information, such as the constitutional functions of an
            arm of government, may require less frequent review unless the
            relevant law or institutional structure changes.
          </p>

          <p className="govuk-body">
            There may be a delay between an official change and its appearance
            on CitizenGuide.KE. For a transaction or deadline, users should
            confirm the latest position with the responsible public body.
          </p>

          <h2 className="govuk-heading-l">
            Corrections and significant changes
          </h2>

          <p className="govuk-body">
            We correct factual errors when they are identified and can be
            verified.
          </p>

          <p className="govuk-body">
            Minor typographical or formatting changes may be made without a
            separate correction notice. Where a correction materially changes
            the meaning of a page, we may provide additional context or a
            correction note where appropriate.
          </p>

          <p className="govuk-body">
            Read our{" "}
            <Link href="/corrections" className="govuk-link">
              corrections policy
            </Link>{" "}
            to find out how to report an error.
          </p>

          <h2 className="govuk-heading-l">
            Attribution and source provenance
          </h2>

          <p className="govuk-body">
            Where appropriate, we record information about the source,
            publication date, official institution or document from which a
            data point or statement was derived.
          </p>

          <p className="govuk-body">
            Source links can change or disappear over time. A broken external
            link does not necessarily mean the underlying information was
            originally unsourced, but we will try to replace obsolete links
            with current authoritative sources where practical.
          </p>

          <p className="govuk-body">
            For information about ownership and reuse of source material and
            CitizenGuide.KE original content, read our{" "}
            <Link href="/copyright" className="govuk-link">
              copyright and content notices
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">
            Independence and political neutrality
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE is independent of the Government of Kenya, county
            governments, political parties and election candidates.
          </p>

          <p className="govuk-body">
            No ministry, department, agency, county government or political
            organisation controls our editorial decisions merely because we
            publish information about it or link to its services.
          </p>

          <p className="govuk-body">
            We may publish factual information about political parties,
            elections, elected representatives and candidates where it is
            relevant to civic understanding. Doing so does not amount to an
            endorsement.
          </p>

          <p className="govuk-body">
            We aim to describe public institutions and political actors using
            consistent editorial standards regardless of political affiliation.
          </p>

          <p className="govuk-body">
            Read more about the website on our{" "}
            <Link href="/about" className="govuk-link">
              about page
            </Link>{" "}
            and{" "}
            <Link href="/disclaimer" className="govuk-link">
              disclaimer
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">
            Editorial decisions and commercial influence
          </h2>

          <p className="govuk-body">
            Editorial content should not be changed in exchange for favourable
            treatment, payment or commercial advantage.
          </p>

          <p className="govuk-body">
            If CitizenGuide.KE later introduces sponsorships, partnerships,
            grants or other funding arrangements, those arrangements should not
            give a funder control over factual editorial conclusions. Relevant
            relationships should be disclosed where necessary to avoid
            misleading users.
          </p>

          <h2 className="govuk-heading-l">Artificial intelligence</h2>

          <p className="govuk-body">
            Automated tools, including artificial intelligence, may be used to
            assist with tasks such as research organisation, classification,
            drafting or identifying information that requires review.
          </p>

          <p className="govuk-body">
            AI-generated output is not treated as an authoritative source.
            Material intended for publication should be checked against
            appropriate primary or reliable sources before it is presented as
            factual information.
          </p>

          <p className="govuk-body">
            Where an automated system cannot establish a fact reliably, we
            should not present its output as verified simply because it appears
            plausible.
          </p>

          <h2 className="govuk-heading-l">
            Reporting an editorial concern
          </h2>

          <p className="govuk-body">
            If you think information on CitizenGuide.KE is inaccurate,
            misleading, outdated or missing important context, please tell us.
          </p>

          <p className="govuk-body">
            For factual errors, use our{" "}
            <Link href="/corrections" className="govuk-link">
              corrections page
            </Link>
            . For general editorial feedback,{" "}
            <Link href="/feedback" className="govuk-link">
              give feedback
            </Link>{" "}
            or{" "}
            <Link href="/contact" className="govuk-link">
              contact CitizenGuide.KE
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">
            Changes to this policy
          </h2>

          <p className="govuk-body">
            We may update this editorial policy as CitizenGuide.KE develops,
            new types of content are introduced or our editorial processes
            change.
          </p>

          <p className="govuk-body">
            The latest version will always be published on this page.
          </p>

          <p className="govuk-body govuk-!-margin-top-8">
            <strong>Last updated:</strong> 10 September 2026
          </p>
        </div>

        <RelatedNav
          links={[
            { text: "Content style guide", href: "/content-style-guide" },
            { text: "About this website", href: "/about" },
            { text: "Disclaimer", href: "/disclaimer" },
            { text: "Corrections", href: "/corrections" },
            { text: "Copyright and content notices", href: "/copyright" },
            { text: "Give feedback", href: "/feedback" },
            { text: "Contact this website", href: "/contact" },
          ]}
        />
      </div>
    </>
  );
}