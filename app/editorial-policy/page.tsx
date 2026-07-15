import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";

export const metadata: Metadata = {
  title: "Editorial policy",
  description:
    "How CitizenGuide.KE sources, writes and updates information about Kenyan government and public services.",
};

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
        lead="How we decide what to publish, where information comes from, and how we keep it accurate."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-l">Our purpose</h2>
          <p className="govuk-body">
            CitizenGuide.KE helps people understand how government in Kenya
            works and how to find official services. We write in plain language
            and organise content around citizen needs as well as institutions.
          </p>

          <h2 className="govuk-heading-l">Source hierarchy</h2>
          <p className="govuk-body">
            When sources conflict, we prefer information in this order:
          </p>
          <ol className="govuk-list govuk-list--number">
            <li>
              The Constitution of Kenya and Acts of Parliament as published
            </li>
            <li>Kenya Gazette notices and official proclamations</li>
            <li>
              Primary records from Parliament (including Hansard), the Judiciary
              and constitutional commissions
            </li>
            <li>
              Official websites and publications of ministries, agencies and
              county governments
            </li>
            <li>
              Structured open data released by public bodies (used carefully and
              dated)
            </li>
          </ol>
          <p className="govuk-body">
            We do not treat social media posts, campaign materials or unpaid
            forwards as authoritative sources for fees, legal requirements or
            appointments.
          </p>

          <h2 className="govuk-heading-l">What we will publish</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>Explanations of public institutions and their mandates</li>
            <li>Directories of public office holders when sourced</li>
            <li>
              Guidance that helps people start official processes (with links
              out)
            </li>
            <li>Open datasets we host with clear provenance</li>
            <li>Civic explainers (devolution, elections, public finance)</li>
          </ul>

          <h2 className="govuk-heading-l">What we will not publish</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>Party-political campaigning or endorsements</li>
            <li>Unverified rumours about appointments or investigations</li>
            <li>Instructions that encourage breaking the law</li>
            <li>
              Content that pretends to be an official government service or
              payment page
            </li>
          </ul>

          <h2 className="govuk-heading-l">How we write</h2>
          <p className="govuk-body">
            We aim to follow public content principles. Full detail is in the{" "}
            <Link href="/content-style-guide" className="govuk-link">
              content style guide
            </Link>
            :
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>lead with the user need</li>
            <li>use short sentences and everyday words where possible</li>
            <li>expand acronyms the first time they appear</li>
            <li>use active voice</li>
            <li>
              show currency as Kenyan shillings (KSh) and date-stamp fees when
              we quote them
            </li>
            <li>say when something varies by county or can change</li>
          </ul>

          <h2 className="govuk-heading-l">Updates and review</h2>
          <p className="govuk-body">
            High-risk pages — fees, elections, tax and identity services — are
            reviewed more often. Structural pages (for example arms of
            government) are updated when official sources change.
          </p>
          <p className="govuk-body">
            There may be a short delay between an official announcement and our
            update. For the latest position, use the responsible public body’s
            website.
          </p>

          <h2 className="govuk-heading-l">Corrections</h2>
          <p className="govuk-body">
            We correct factual errors promptly when verified. Read how to
            request a correction on our{" "}
            <Link href="/corrections" className="govuk-link">
              corrections page
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">Independence</h2>
          <p className="govuk-body">
            This website is independent of the Government of Kenya. Editorial
            decisions are not controlled by any ministry, county or political
            party. See our{" "}
            <Link href="/disclaimer" className="govuk-link">
              disclaimer
            </Link>{" "}
            and{" "}
            <Link href="/about" className="govuk-link">
              about page
            </Link>
            .
          </p>
        </div>

        <RelatedNav
          links={[
            { text: "Content style guide", href: "/content-style-guide" },
            { text: "About this website", href: "/about" },
            { text: "Disclaimer", href: "/disclaimer" },
            { text: "Corrections", href: "/corrections" },
            { text: "Give feedback", href: "/feedback" },
            { text: "Contact", href: "/contact" },
          ]}
        />
      </div>
    </>
  );
}
