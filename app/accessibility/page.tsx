// app/accessibility/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Accessibility statement",
  description:
    "Accessibility statement for CitizenGuide.KE, including our accessibility standards, known limitations, testing and how to report a problem.",
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

export default function AccessibilityPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Accessibility statement" },
        ]}
        title="Accessibility statement for CitizenGuide.KE"
        lead="We want as many people as possible to be able to use CitizenGuide.KE, regardless of technology, ability or how they access the web."
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            CitizenGuide.KE is an independent civic information platform. We
            design and improve the website with accessibility in mind and aim
            to meet WCAG 2.2 Level AA and align with Kenya Standard KS 2952.
          </div>

          <h2 className="govuk-heading-l">
            Using this website
          </h2>

          <p className="govuk-body">
            We want you to be able to use CitizenGuide.KE in the way that works
            best for you.
          </p>

          <p className="govuk-body">
            We design the website so that you should be able to:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              change colours, contrast levels and fonts using your browser or
              device settings
            </li>
            <li>
              zoom in up to 400% without text becoming unreadable or requiring
              unnecessary horizontal scrolling
            </li>
            <li>
              navigate the website using a keyboard without relying on a mouse
            </li>
            <li>
              use speech recognition software to navigate and interact with the
              website
            </li>
            <li>
              use screen readers such as NVDA, JAWS and VoiceOver
            </li>
            <li>
              understand links and controls from their accessible names and
              surrounding context
            </li>
            <li>
              use the website across different screen sizes and mobile devices
            </li>
          </ul>

          <p className="govuk-body">
            We also aim to write content in plain language and use consistent
            headings, navigation and page structures.
          </p>

          <p className="govuk-body">
            <a
              href="https://mcmw.abilitynet.org.uk/"
              target="_blank"
              rel="noopener noreferrer"
              className="govuk-link"
            >
              AbilityNet
              <ExternalLinkIcon />
              <span className="govuk-visually-hidden">
                {" "}
                (opens in a new tab)
              </span>
            </a>{" "}
            has guidance on making your computer, phone or tablet easier to use
            if you have a disability.
          </p>

          <h2 className="govuk-heading-l">
            Accessibility standards we use
          </h2>

          <p className="govuk-body">
            Our accessibility work is guided primarily by:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              the Kenya Standard on Accessibility of ICT Products and Services
              (KS 2952)
            </li>
            <li>
              the Web Content Accessibility Guidelines (WCAG) 2.2
            </li>
          </ul>

          <h3 className="govuk-heading-m">
            Kenya Standard KS 2952
          </h3>

          <p className="govuk-body">
            Kenya Standard KS 2952 sets accessibility requirements for ICT
            products and services, including considerations relevant to digital
            services used by people with disabilities.
          </p>

          <p className="govuk-body">
            You can read the{" "}
            <a
              href="https://cms.icta.go.ke/sites/default/files/2024-10/Kenya-Accessibility-Standard-ICT-Products-and-Services_KS-2952-1-2-2022_May_2023_.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="govuk-link"
            >
              Kenya Standard on Accessibility of ICT Products and Services
              <ExternalLinkIcon />
              <span className="govuk-visually-hidden">
                {" "}
                (PDF, opens in a new tab)
              </span>
            </a>
            .
          </p>

          <h3 className="govuk-heading-m">
            WCAG 2.2
          </h3>

          <p className="govuk-body">
            We use{" "}
            <a
              href="https://www.w3.org/TR/WCAG22/"
              target="_blank"
              rel="noopener noreferrer"
              className="govuk-link"
            >
              Web Content Accessibility Guidelines (WCAG) 2.2
              <ExternalLinkIcon />
              <span className="govuk-visually-hidden">
                {" "}
                (opens in a new tab)
              </span>
            </a>{" "}
            as our main web accessibility benchmark and aim for Level AA.
          </p>

          <p className="govuk-body">
            WCAG covers areas such as text alternatives, keyboard access,
            colour contrast, page structure, forms, focus behaviour and
            compatibility with assistive technologies.
          </p>

          <h2 className="govuk-heading-l">
            How accessible CitizenGuide.KE is
          </h2>

          <p className="govuk-body">
            We are continually reviewing CitizenGuide.KE against our
            accessibility targets. Most of the main website interface is
            designed with accessibility in mind, but we know that some content
            and features may not yet fully meet those targets.
          </p>

          <p className="govuk-body">
            Known limitations include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              some older PDF documents and historical public records may not be
              fully accessible to screen-reader users
            </li>
            <li>
              some source documents provided by external public bodies may have
              incomplete headings, tagging or text alternatives
            </li>
            <li>
              some complex tables may require horizontal scrolling on smaller
              screens
            </li>
            <li>
              updates to live search results or filters may not always be
              announced immediately by every screen reader
            </li>
            <li>
              accessibility of content on external websites linked from
              CitizenGuide.KE is outside our control
            </li>
          </ul>

          <p className="govuk-body">
            If you find another accessibility problem, please tell us. Reports
            from users are an important part of how we identify and prioritise
            improvements.
          </p>

          <h2 className="govuk-heading-l">
            PDFs and source documents
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE may link to or make available legislation, Gazette
            notices, reports and other documents originally published by
            government institutions or other public bodies.
          </p>

          <p className="govuk-body">
            Some historical or third-party PDFs may not have been created with
            accessibility in mind. For example, a document may:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>contain scanned pages without accessible text</li>
            <li>have missing or incorrect document tags</li>
            <li>lack a logical heading structure</li>
            <li>contain tables that are difficult for screen readers to interpret</li>
            <li>lack appropriate text descriptions for informative images</li>
          </ul>

          <p className="govuk-body">
            Where practical, we aim to provide accessible HTML information
            alongside important source documents or link users to an accessible
            version where one is available.
          </p>

          <p className="govuk-body">
            If you cannot access information contained in a document,{" "}
            <Link href="/contact" className="govuk-link">
              contact us
            </Link>{" "}
            and tell us which document or page you need.
          </p>

          <h2 className="govuk-heading-l">
            Live search, filters and dynamic content
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE contains search tools, filters, tables and other
            interactive components for navigating large amounts of civic
            information.
          </p>

          <p className="govuk-body">
            We aim to make changes in dynamic content understandable to
            assistive technologies, including by using appropriate focus
            management, semantic HTML and status messages where needed.
          </p>

          <p className="govuk-body">
            Some live search or filtering updates may not yet be announced
            consistently by every combination of browser and screen reader. We
            are continuing to improve these components.
          </p>

          <h2 className="govuk-heading-l">
            External websites
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE links to websites operated by government
            institutions, courts, Parliament, counties and other organisations.
          </p>

          <p className="govuk-body">
            We do not control the accessibility of those external websites or
            documents.
          </p>

          <p className="govuk-body">
            External links that open in a new tab are identified visually with
            an external-link symbol and include additional text for screen
            readers indicating that the link opens in a new tab.
          </p>

          <h2 className="govuk-heading-l">
            What we have done to improve accessibility
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE uses accessible design patterns and semantic web
            technologies as the foundation of its interface.
          </p>

          <p className="govuk-body">
            Our approach includes:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>using semantic HTML wherever possible</li>
            <li>maintaining a logical heading structure</li>
            <li>providing visible keyboard focus states</li>
            <li>supporting keyboard navigation</li>
            <li>
              designing text and interface elements with sufficient colour
              contrast
            </li>
            <li>
              providing alternative text for images that communicate
              information
            </li>
            <li>hiding purely decorative images from assistive technologies</li>
            <li>providing labels and instructions for form controls</li>
            <li>providing clear validation and error messages</li>
            <li>
              avoiding generic link text such as &quot;click here&quot; where a
              more descriptive link can be used
            </li>
            <li>supporting browser zoom and responsive layouts</li>
            <li>
              using accessible tables and responsive table containers where
              tabular information is necessary
            </li>
            <li>
              identifying external links that open in a new browser tab
            </li>
          </ul>

          <h3 className="govuk-heading-m">
            GOV.UK Frontend
          </h3>

          <p className="govuk-body">
            CitizenGuide.KE uses and adapts open-source components and patterns
            from{" "}
            <a
              href="https://design-system.service.gov.uk/"
              target="_blank"
              rel="noopener noreferrer"
              className="govuk-link"
            >
              GOV.UK Frontend and the GOV.UK Design System
              <ExternalLinkIcon />
              <span className="govuk-visually-hidden">
                {" "}
                (opens in a new tab)
              </span>
            </a>{" "}
            as part of our accessibility foundation.
          </p>

          <p className="govuk-body">
            CitizenGuide.KE has its own content, branding and identity. We are
            independent of the UK Government, Government Digital Service and
            the Government of Kenya.
          </p>

          <h2 className="govuk-heading-l">
            How we test accessibility
          </h2>

          <p className="govuk-body">
            We use a combination of automated and manual checks when reviewing
            the accessibility of CitizenGuide.KE.
          </p>

          <p className="govuk-body">
            Our testing may include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>automated accessibility checks using axe and Lighthouse</li>
            <li>keyboard-only navigation</li>
            <li>focus order and visible focus checks</li>
            <li>screen-reader testing using NVDA and VoiceOver</li>
            <li>colour-contrast checks</li>
            <li>browser zoom testing</li>
            <li>testing layouts at different viewport sizes</li>
            <li>reviewing semantic HTML and ARIA use</li>
            <li>reviewing forms, errors and validation messages</li>
          </ul>

          <p className="govuk-body">
            Automated testing can identify many accessibility problems, but it
            cannot establish accessibility on its own. We therefore combine it
            with manual checks.
          </p>

          <h2 className="govuk-heading-l">
            Reporting an accessibility problem
          </h2>

          <p className="govuk-body">
            We are always looking to improve the accessibility of
            CitizenGuide.KE.
          </p>

          <p className="govuk-body">
            If you find an accessibility problem, or if something on the
            website is difficult or impossible for you to use,{" "}
            <Link href="/contact" className="govuk-link">
              contact CitizenGuide.KE
            </Link>
            .
          </p>

          <p className="govuk-body">
            It helps if you tell us:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>the page or feature where you experienced the problem</li>
            <li>what you were trying to do</li>
            <li>what went wrong</li>
            <li>
              the browser, device or assistive technology you were using, if
              you know it
            </li>
          </ul>

          <p className="govuk-body">
            We will consider the issue and use the information to help us
            investigate and improve the website.
          </p>

          <h2 className="govuk-heading-l">
            Requesting information in another format
          </h2>

          <p className="govuk-body">
            If you need information published on CitizenGuide.KE in a different
            accessible format, contact us and tell us what you need.
          </p>

          <p className="govuk-body">
            This may include a request for:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>accessible HTML</li>
            <li>an accessible version of a PDF</li>
            <li>large-print text</li>
            <li>a simplified or easier-to-read explanation</li>
            <li>another reasonable accessible format</li>
          </ul>

          <p className="govuk-body">
            <Link href="/contact" className="govuk-link">
              Contact us about an accessible format
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">
            Contacting CitizenGuide.KE
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE is primarily an online platform. The best way to
            contact us about an accessibility issue is through our{" "}
            <Link href="/contact" className="govuk-link">
              contact page
            </Link>
            .
          </p>

          <p className="govuk-body">
            You can also use our{" "}
            <Link href="/feedback" className="govuk-link">
              feedback service
            </Link>{" "}
            to tell us about problems with the website.
          </p>

          <h2 className="govuk-heading-l">
            Reviewing this statement
          </h2>

          <p className="govuk-body">
            We review this accessibility statement as CitizenGuide.KE develops,
            particularly when we introduce significant new interfaces or
            functionality.
          </p>

          <p className="govuk-body">
            Accessibility testing is also part of our ongoing development and
            quality-assurance work.
          </p>

          <p className="govuk-body govuk-!-margin-top-8">
            <strong>Last updated:</strong> 10 September 2026
          </p>
        </div>

        <RelatedNav
          links={[
            { text: "About CitizenGuide.KE", href: "/about" },
            { text: "Privacy policy", href: "/privacy" },
            { text: "Cookies policy", href: "/cookies" },
            { text: "Terms and conditions", href: "/terms" },
            { text: "Disclaimer", href: "/disclaimer" },
            { text: "Contact this website", href: "/contact" },
          ]}
        />
      </div>
    </>
  );
}