import Link from "next/link";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function AboutPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "About", href: "/about" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">About KenyaGovInfo.KE</h1>
            
            <p className="govuk-body-l">
              KenyaGovInfo.KE is an independent platform that makes Kenyan government easier to understand.
            </p>

            <div className="govuk-inset-text">
              We are <strong>not</strong> part of the Government of Kenya. 
              This is a citizen-focused informational website.
            </div>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">Why this site exists</h2>
            
            <p className="govuk-body">
              The Government of Kenya has over <strong>280</strong> ministries, state departments, 
              semi-autonomous agencies (SAGAs), authorities, commissions, funds, and corporations. 
              Each runs its own website, uses different jargon, and publishes information in its own way.
            </p>

            <p className="govuk-body">
              For the average Kenyan, the State often feels like an alphabet soup:
              <strong> KRA, KEBS, NTSA, NEMA, NSSF, SHA, EPRA, RBA, KPLC, WASREB, CA, PPB...</strong>
            </p>

            <p className="govuk-body">
              Many citizens don’t know which institution does what, who to call when they have a problem, 
              or even that some organisations exist — even though their taxes fund them.
            </p>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">The Problem</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>Fragmented information across hundreds of websites</li>
              <li>Low public awareness of government institutions and their roles</li>
              <li>Difficulty finding the right service or the right office</li>
              <li>Spread of misinformation and fake news due to lack of clear official information</li>
            </ul>

            <p className="govuk-body govuk-!-margin-top-6">
              This lack of transparency and accessibility contributed to public frustration. 
              In <strong>June 2025</strong>, widespread protests (commonly known as the Gen Z protests) 
              against the Finance Bill highlighted how many young Kenyans felt disconnected from 
              their own government.
            </p>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Our Mission</h2>
            <p className="govuk-body">
              KenyaGovInfo.KE was created to bridge this gap — to become the <strong>single, clear, 
              and neutral</strong> directory of Kenyan public institutions, services, and leaders.
            </p>

            <div className="govuk-panel govuk-panel--info">
              <h3 className="govuk-panel__title">Our Goal</h3>
              <p className="govuk-body">
                To make government more understandable, accessible, and transparent for every Kenyan.
              </p>
            </div>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Design Approach</h2>
            <p className="govuk-body">
              This website follows the design principles of the <strong>UK Government Digital Service (GOV.UK)</strong> — 
              widely regarded as one of the best government digital platforms in the world. 
              We use the official GOV.UK Frontend design system to ensure clarity, simplicity, and accessibility.
            </p>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Important Disclaimer</h2>
            <div className="govuk-inset-text">
              KenyaGovInfo.KE is a completely <strong>independent</strong> project. 
              We are not affiliated with, endorsed by, or funded by the Government of Kenya. 
              All information is compiled from publicly available official sources. 
              For official services and transactions, always use <a href="https://www.ecitizen.go.ke" target="_blank" className="govuk-link"> eCitizen</a>  
              or the relevant government website.
            </div>

            <p className="govuk-body govuk-!-margin-top-9">
              Thank you for visiting. We hope this platform helps you better understand and engage with your government.
            </p>
          </div>
        </div>

        <GovUKFeedback />
      </main>
    </div>
  );
}