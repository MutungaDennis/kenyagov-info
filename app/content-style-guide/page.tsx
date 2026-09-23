// app/content-style-guide/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
import PageContents from "@/components/site/PageContents";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Content style guide",
  description:
    "How CitizenGuide.KE writes and structures civic information using plain language, consistent terminology and accessible content design.",
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

export default function ContentStyleGuidePage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "About", href: "/about" },
          { text: "Content style guide" },
        ]}
        caption="About this website"
        title="Content style guide"
        lead="Rules for writing and structuring information on CitizenGuide.KE. We use plain language and public-service content design principles adapted for Kenyan civic information."
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            CitizenGuide.KE is an independent civic information platform. This
            guide is inspired by established public-service content design
            practices, including GOV.UK patterns, but CitizenGuide.KE is not
            GOV.UK and is not a Government of Kenya website.
          </div>

          <PageContents
            items={[
              { href: "#principles", text: "Principles" },
              { href: "#structure", text: "Page structure" },
              { href: "#headings", text: "Headings and summaries" },
              { href: "#language", text: "Language and style" },
              { href: "#services", text: "Service pages" },
              { href: "#institutions", text: "Institutions and office holders" },
              { href: "#law", text: "Laws and legal material" },
              { href: "#links", text: "Links" },
              { href: "#dates", text: "Dates, money and numbers" },
              { href: "#tables", text: "Tables and structured data" },
              { href: "#sources", text: "Sources and attribution" },
              { href: "#accessibility", text: "Accessibility" },
              { href: "#ai", text: "AI-assisted content" },
              { href: "#do-not", text: "Do not" },
              { href: "#review", text: "Review before publishing" },
            ]}
          />

          <section id="principles" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">Principles</h2>

            <p className="govuk-body">
              Content should help someone understand a civic issue, identify
              the responsible institution or find the correct official source
              without having to understand the structure of government first.
            </p>

            <ul className="govuk-list govuk-list--bullet">
              <li>Start with the user need, not the organisation chart.</li>
              <li>Give each page one clear main purpose.</li>
              <li>Be accurate, neutral and politically independent.</li>
              <li>Prefer primary and authoritative sources.</li>
              <li>Use plain language without changing legal meaning.</li>
              <li>Make important dates, fees and limitations easy to find.</li>
              <li>Say when information can change or varies by county.</li>
              <li>
                Make it clear when users are leaving CitizenGuide.KE for an
                official service.
              </li>
              <li>
                Never imply that CitizenGuide.KE is a government department,
                official portal or government payment service.
              </li>
            </ul>

            <p className="govuk-body">
              Our sourcing and verification rules are explained in the{" "}
              <Link href="/editorial-policy" className="govuk-link">
                editorial policy
              </Link>
              .
            </p>
          </section>

          <section id="structure" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">Page structure</h2>

            <p className="govuk-body">
              Use a predictable structure so users can quickly understand a
              page and find the information they need.
            </p>

            <p className="govuk-body">
              A typical CitizenGuide.KE page should contain:
            </p>

            <ol className="govuk-list govuk-list--number">
              <li>breadcrumbs showing where the page sits</li>
              <li>one clear H1</li>
              <li>a short lead explaining what the page helps the user do</li>
              <li>
                an independence, safety or scam warning where it is genuinely
                useful
              </li>
              <li>a contents list on longer pages</li>
              <li>H2 sections in the order users are likely to need them</li>
              <li>source or update information where relevant</li>
              <li>related internal links</li>
            </ol>

            <p className="govuk-body">
              Do not add sections simply to make a page look complete. Every
              section should answer a likely user question.
            </p>
          </section>

          <section id="headings" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">Headings and summaries</h2>

            <h3 className="govuk-heading-m">Page titles</h3>

            <p className="govuk-body">
              Page titles should describe the subject or user task clearly.
              Avoid promotional wording, slogans and internal administrative
              terminology.
            </p>

            <p className="govuk-body">
              For services, prefer a verb-led title where that accurately
              describes the task.
            </p>

            <p className="govuk-body">
              For example:
            </p>

            <ul className="govuk-list govuk-list--bullet">
              <li>
                <strong>Use:</strong> Apply for a passport
              </li>
              <li>
                <strong>Avoid:</strong> Passport application services
              </li>
            </ul>

            <h3 className="govuk-heading-m">Lead paragraphs</h3>

            <p className="govuk-body">
              The lead should explain the value of the page in one or two
              sentences. Do not repeat the H1 word for word.
            </p>

            <h3 className="govuk-heading-m">Section headings</h3>

            <p className="govuk-body">
              Use descriptive headings that make sense when scanned on their
              own.
            </p>

            <ul className="govuk-list govuk-list--bullet">
              <li>
                <strong>Use:</strong> Who can apply
              </li>
              <li>
                <strong>Avoid:</strong> Eligibility information
              </li>
              <li>
                <strong>Use:</strong> How much it costs
              </li>
              <li>
                <strong>Avoid:</strong> Fees section
              </li>
            </ul>

            <p className="govuk-body">
              Do not skip heading levels. An H3 should sit within an H2
              section, not directly under the page title without a reason.
            </p>
          </section>

          <section id="language" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">Language and style</h2>

            <p className="govuk-body">
              Use Kenyan English for primary English-language content.
            </p>

            <ul className="govuk-list govuk-list--bullet">
              <li>Use active voice wherever it makes the sentence clearer.</li>
              <li>Address the reader as “you” when giving guidance.</li>
              <li>Prefer everyday words to formal administrative language.</li>
              <li>Keep sentences reasonably short.</li>
              <li>Keep paragraphs focused on one idea.</li>
              <li>Avoid marketing language, hype and superlatives.</li>
              <li>Avoid unnecessarily academic or legalistic wording.</li>
              <li>
                Keep necessary legal terms where simplifying them could change
                their meaning.
              </li>
            </ul>

            <h3 className="govuk-heading-m">Active voice</h3>

            <ul className="govuk-list govuk-list--bullet">
              <li>
                <strong>Use:</strong> Apply through eCitizen.
              </li>
              <li>
                <strong>Avoid:</strong> Applications may be made through
                eCitizen.
              </li>
            </ul>

            <h3 className="govuk-heading-m">Acronyms</h3>

            <p className="govuk-body">
              Spell out an unfamiliar organisation or term the first time it
              appears, followed by the acronym in brackets if the acronym will
              be used again.
            </p>

            <p className="govuk-body">
              For example: Kenya Revenue Authority (KRA).
            </p>

            <p className="govuk-body">
              Do not expand an acronym repeatedly on the same page unless
              users may enter the page at a section where the context would
              otherwise be unclear.
            </p>

            <h3 className="govuk-heading-m">Capital letters</h3>

            <p className="govuk-body">
              Use capitals for proper names and official titles where
              appropriate. Do not capitalise ordinary concepts simply to make
              them appear important.
            </p>

            <ul className="govuk-list govuk-list--bullet">
              <li>Parliament of Kenya</li>
              <li>National Assembly</li>
              <li>Ministry of Health</li>
              <li>county government</li>
              <li>public service</li>
              <li>government services</li>
            </ul>

            <h3 className="govuk-heading-m">Kiswahili and other languages</h3>

            <p className="govuk-body">
              English is currently the primary language of CitizenGuide.KE.
              Kiswahili and other Kenyan-language versions may be introduced
              where appropriate.
            </p>

            <p className="govuk-body">
              A translation should preserve the meaning of the source rather
              than translate administrative terminology literally where doing
              so makes the result unclear.
            </p>
          </section>

          <section id="services" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">Service pages</h2>

            <p className="govuk-body">
              Service pages help users understand what they need before they
              leave CitizenGuide.KE for an official service.
            </p>

            <p className="govuk-body">
              Where relevant, include:
            </p>

            <ul className="govuk-list govuk-list--bullet">
              <li>a task-focused title</li>
              <li>the responsible institution</li>
              <li>who can use the service</li>
              <li>what the user needs before starting</li>
              <li>fees and charges</li>
              <li>processing times, if reliably sourced</li>
              <li>the official service link</li>
              <li>the date the information was checked or updated</li>
            </ul>

            <h3 className="govuk-heading-m">Start buttons</h3>

            <p className="govuk-body">
              Use one main Start button where a page has a clear official
              online service.
            </p>

            <p className="govuk-body">
              The button must take the user to the real official service. Do
              not place a Start button on a page if there is no action for the
              user to start.
            </p>

            <p className="govuk-body">
              Make it clear that the destination is external where the service
              is not operated by CitizenGuide.KE.
            </p>

            <h3 className="govuk-heading-m">Fees</h3>

            <p className="govuk-body">
              State the fee, what it covers and the date or source where
              possible.
            </p>

            <p className="govuk-body">
              If charges may vary, say so instead of presenting one amount as
              universally applicable.
            </p>
          </section>

          <section id="institutions" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">
              Institutions and office holders
            </h2>

            <h3 className="govuk-heading-m">Institution names</h3>

            <p className="govuk-body">
              Use the institution&apos;s official name on first reference.
              Use a recognised acronym afterwards where this makes the page
              easier to read.
            </p>

            <p className="govuk-body">
              Avoid informal abbreviations that the institution itself does not
              use.
            </p>

            <h3 className="govuk-heading-m">Office holders</h3>

            <p className="govuk-body">
              Make clear whether a page is describing an office or the current
              person holding that office.
            </p>

            <p className="govuk-body">
              Current office-holder information should be dated or regularly
              reviewed because appointments, elections, resignations and court
              decisions can change it.
            </p>

            <p className="govuk-body">
              Use titles only where they help identify the person&apos;s
              official role. Avoid honorific inflation.
            </p>
          </section>

          <section id="law" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">Laws and legal material</h2>

            <p className="govuk-body">
              Legal material should be described accurately and without
              implying that a CitizenGuide.KE summary is the law itself.
            </p>

            <h3 className="govuk-heading-m">Legislation</h3>

            <p className="govuk-body">
              Use the official title of an Act on first reference. Include the
              year and chapter or citation where this is useful for
              identification.
            </p>

            <p className="govuk-body">
              Distinguish clearly between:
            </p>

            <ul className="govuk-list govuk-list--bullet">
              <li>the Constitution</li>
              <li>an Act of Parliament</li>
              <li>a Bill</li>
              <li>regulations</li>
              <li>a Gazette notice</li>
              <li>a court judgment or ruling</li>
              <li>a policy or administrative guideline</li>
            </ul>

            <p className="govuk-body">
              Do not describe a Bill as law before it has completed the
              necessary legislative process.
            </p>

            <h3 className="govuk-heading-m">Articles and sections</h3>

            <p className="govuk-body">
              Use the formal numbering of the source.
            </p>

            <p className="govuk-body">
              For Constitution pages, internal links may use routes such as:
            </p>

            <p className="govuk-body">
              <code className="govuk-!-font-size-16">
                /constitution/chapter/4/article/35
              </code>
            </p>

            <p className="govuk-body">
              Link labels should give users meaningful context, for example:
              <strong> Article 35 — Access to information</strong>.
            </p>

            <h3 className="govuk-heading-m">Plain-language explanations</h3>

            <p className="govuk-body">
              Explain what a provision means in practical terms, but do not
              present an interpretation as the statutory text.
            </p>

            <p className="govuk-body">
              Where exact wording matters, direct the user to the authoritative
              source.
            </p>
          </section>

          <section id="links" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">Links</h2>

            <h3 className="govuk-heading-m">Internal links</h3>

            <p className="govuk-body">
              Link to relevant CitizenGuide.KE pages when they help the user
              understand the subject or continue their journey.
            </p>

            <p className="govuk-body">
              Do not add internal links merely for search-engine optimisation.
            </p>

            <h3 className="govuk-heading-m">External links</h3>

            <p className="govuk-body">
              Use external links when the external destination is authoritative
              or materially useful to the user.
            </p>

            <p className="govuk-body">
              Prefer the official source over a secondary copy where a usable
              official source exists.
            </p>

            <p className="govuk-body">
              External links that open in a new tab should display the external
              link arrow and include hidden text for assistive technologies.
            </p>

            <p className="govuk-body">
              Example:{" "}
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
            </p>

            <p className="govuk-body">
              Link text should describe the destination or action.
            </p>

            <ul className="govuk-list govuk-list--bullet">
              <li>
                <strong>Use:</strong> Read the Access to Information Act
              </li>
              <li>
                <strong>Avoid:</strong> Click here
              </li>
            </ul>

            <p className="govuk-body">
              Avoid linking entire sentences unless the whole sentence is the
              meaningful link label.
            </p>
          </section>

          <section id="dates" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">
              Dates, money and numbers
            </h2>

            <h3 className="govuk-heading-m">Dates</h3>

            <p className="govuk-body">
              Use day, month, year without unnecessary punctuation.
            </p>

            <ul className="govuk-list govuk-list--bullet">
              <li>
                <strong>Use:</strong> 15 July 2026
              </li>
              <li>
                <strong>Avoid:</strong> 15/07/26
              </li>
            </ul>

            <p className="govuk-body">
              Include a year where there is any reasonable chance of ambiguity.
            </p>

            <p className="govuk-body">
              Use exact dates rather than relative wording such as
              &quot;yesterday&quot; on long-lived civic information pages.
            </p>

            <h3 className="govuk-heading-m">Money</h3>

            <p className="govuk-body">
              Use <strong>KSh</strong> for Kenyan shillings in ordinary
              CitizenGuide.KE prose.
            </p>

            <ul className="govuk-list govuk-list--bullet">
              <li>KSh 500</li>
              <li>KSh 1,050</li>
              <li>KSh 25,000</li>
              <li>KSh 1.5 million where precision to the shilling is unnecessary</li>
            </ul>

            <p className="govuk-body">
              Do not write <strong>Kshs</strong>, <strong>KES.</strong> or
              multiple different currency styles on the same page unless you
              are reproducing an official source exactly.
            </p>

            <h3 className="govuk-heading-m">Percentages</h3>

            <p className="govuk-body">
              Use numerals with the percentage sign where this is clearest:
              <strong> 10%</strong>.
            </p>

            <h3 className="govuk-heading-m">Large numbers</h3>

            <p className="govuk-body">
              Use commas to make large exact numbers easier to read:
              <strong> 1,250,000</strong>.
            </p>
          </section>

          <section id="tables" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">
              Tables and structured data
            </h2>

            <p className="govuk-body">
              Use a table when users need to compare values across rows and
              columns. Do not use a table merely to align ordinary text.
            </p>

            <p className="govuk-body">
              Tables should:
            </p>

            <ul className="govuk-list govuk-list--bullet">
              <li>have meaningful column headings</li>
              <li>have an accessible caption where appropriate</li>
              <li>remain usable on smaller screens</li>
              <li>use consistent formats for dates, money and status values</li>
              <li>avoid unexplained abbreviations</li>
            </ul>

            <p className="govuk-body">
              For large datasets, provide search, filtering or pagination when
              those tools genuinely help users find a record.
            </p>

            <p className="govuk-body">
              Do not hide important explanatory information inside a table if
              it should instead appear in the surrounding page content.
            </p>
          </section>

          <section id="sources" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">
              Sources and attribution
            </h2>

            <p className="govuk-body">
              Important factual claims should be traceable to reliable source
              material.
            </p>

            <p className="govuk-body">
              Where appropriate, record:
            </p>

            <ul className="govuk-list govuk-list--bullet">
              <li>the source institution</li>
              <li>the document or publication title</li>
              <li>the date of the source</li>
              <li>the relevant Act, Gazette notice or record identifier</li>
              <li>a link to the authoritative online source</li>
              <li>the date the information was checked</li>
            </ul>

            <p className="govuk-body">
              Do not make a source look more authoritative than it is. A social
              media post, news report and Gazette notice should not be labelled
              as though they carry the same evidential weight.
            </p>

            <p className="govuk-body">
              Read the{" "}
              <Link href="/editorial-policy" className="govuk-link">
                editorial policy
              </Link>{" "}
              for our source hierarchy.
            </p>
          </section>

          <section id="accessibility" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">Accessibility</h2>

            <p className="govuk-body">
              Content should remain understandable and navigable when users
              rely on assistive technologies, keyboard navigation, zoom or
              smaller screens.
            </p>

            <ul className="govuk-list govuk-list--bullet">
              <li>Use headings in a logical order.</li>
              <li>Use descriptive link text.</li>
              <li>Do not communicate meaning through colour alone.</li>
              <li>Give informative images meaningful alternative text.</li>
              <li>Give decorative images empty alternative text.</li>
              <li>Use lists only when the information is genuinely a list.</li>
              <li>Use proper table headings for tabular information.</li>
              <li>Avoid unnecessarily long blocks of text.</li>
              <li>
                Identify links that open external websites in a new tab.
              </li>
            </ul>

            <p className="govuk-body">
              Read our{" "}
              <Link href="/accessibility" className="govuk-link">
                accessibility statement
              </Link>
              .
            </p>
          </section>

          <section id="ai" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">
              AI-assisted content
            </h2>

            <p className="govuk-body">
              Artificial intelligence and other automated tools may assist with
              research organisation, drafting, summarisation, classification or
              identifying material for review.
            </p>

            <p className="govuk-body">
              AI output must not be treated as a source.
            </p>

            <p className="govuk-body">
              Before publishing factual civic information produced or assisted
              by an automated tool:
            </p>

            <ul className="govuk-list govuk-list--bullet">
              <li>verify factual claims against appropriate sources</li>
              <li>check names, dates, offices, fees and legal references</li>
              <li>check that summaries have not changed the source meaning</li>
              <li>remove unsupported conclusions</li>
              <li>review language for neutrality and clarity</li>
              <li>
                make sure generated text does not invent an institution,
                procedure, requirement or legal provision
              </li>
            </ul>

            <p className="govuk-body">
              If a fact cannot be verified confidently, do not publish it as
              established fact.
            </p>
          </section>

          <section id="do-not" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">Do not</h2>

            <ul className="govuk-list govuk-list--bullet">
              <li>invent fees, deadlines, requirements or eligibility rules</li>
              <li>guess the current holder of a public office</li>
              <li>present a Bill as though it is already an Act</li>
              <li>present an editorial summary as the official legal text</li>
              <li>collect government application passwords or credentials</li>
              <li>pretend to process an official government transaction</li>
              <li>endorse political parties, candidates or campaigns</li>
              <li>publish unverified allegations as fact</li>
              <li>copy promotional language from an institution uncritically</li>
              <li>use “click here” as link text</li>
              <li>use unnecessary all-capital headings</li>
              <li>
                use stock-photo hero banners or marketing card grids as a
                substitute for useful civic content
              </li>
              <li>
                describe CitizenGuide.KE as “Kenya&apos;s GOV.UK” or imply that
                it is an official government platform
              </li>
            </ul>
          </section>

          <section id="review" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">
              Review before publishing
            </h2>

            <p className="govuk-body">
              Before publishing or materially updating a page, check:
            </p>

            <ol className="govuk-list govuk-list--number">
              <li>Does the page answer a clear user need?</li>
              <li>Is the title accurate and specific?</li>
              <li>Are important facts supported by appropriate sources?</li>
              <li>Are names, dates and office holders current?</li>
              <li>Are any quoted fees or deadlines dated or qualified?</li>
              <li>
                Is the difference between CitizenGuide.KE content and official
                source material clear?
              </li>
              <li>Are external destinations clearly identified?</li>
              <li>Do external links still work?</li>
              <li>Is the writing neutral and free from political advocacy?</li>
              <li>Is the page readable on mobile and with assistive technology?</li>
              <li>
                Does any legal summary accurately reflect the source without
                overstating its effect?
              </li>
              <li>
                Is there anything on the page that could make a user think
                CitizenGuide.KE is the government?
              </li>
            </ol>

            <p className="govuk-body">
              If a material factual error is discovered after publication, use
              the{" "}
              <Link href="/corrections" className="govuk-link">
                corrections process
              </Link>
              .
            </p>
          </section>

          <h2 className="govuk-heading-l">
            Changes to this guide
          </h2>

          <p className="govuk-body">
            This guide will develop as CitizenGuide.KE adds new types of civic
            information and improves its publishing tools.
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
            { text: "Editorial policy", href: "/editorial-policy" },
            { text: "Corrections", href: "/corrections" },
            { text: "Copyright and content notices", href: "/copyright" },
            { text: "Disclaimer", href: "/disclaimer" },
            { text: "Accessibility statement", href: "/accessibility" },
            { text: "About CitizenGuide.KE", href: "/about" },
          ]}
        />
      </div>
    </>
  );
}