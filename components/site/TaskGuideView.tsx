import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
import ExternalLink from "@/components/site/ExternalLink";
import { taskGuideNote, type TaskGuide } from "@/lib/guides/task-guides";

export default function TaskGuideView({ guide }: { guide: TaskGuide }) {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Guides", href: "/guides" },
          { text: guide.title },
        ]}
        caption="Step by step"
        title={guide.title}
        lead={guide.lead}
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            This website explains the process. Applications and payments are made on
            official systems and at government offices, not here. {taskGuideNote}
          </div>

          <h2 className="govuk-heading-m">What you need</h2>
          <ul className="govuk-list govuk-list--bullet">
            {guide.before.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2 className="govuk-heading-m">What to do</h2>
          <ol className="govuk-list govuk-list--number">
            {guide.steps.map((step) => (
              <li key={step.heading} className="govuk-!-margin-bottom-4">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">{step.heading}</h3>
                {step.paragraphs?.map((p) => (
                  <p key={p} className="govuk-body">
                    {p}
                  </p>
                ))}
                {step.bullets ? (
                  <ul className="govuk-list govuk-list--bullet">
                    {step.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>

          {guide.warning ? (
            <div className="govuk-warning-text">
              <span className="govuk-warning-text__icon" aria-hidden="true">
                !
              </span>
              <strong className="govuk-warning-text__text">
                <span className="govuk-visually-hidden">Warning</span>
                {guide.warning}
              </strong>
            </div>
          ) : null}

          <h2 className="govuk-heading-m">Official sources</h2>
          <ul className="govuk-list">
            {guide.official.map((link) => (
              <li key={link.href}>
                <ExternalLink href={link.href}>{link.text}</ExternalLink>
              </li>
            ))}
          </ul>

          <p className="govuk-body">
            If someone asks you for a bribe, read{" "}
            <Link href="/scams" className="govuk-link">
              how to report scams and corruption
            </Link>
            .
          </p>

          <p className="govuk-body govuk-!-margin-top-8">
            <strong>Last updated:</strong> {guide.updated}
          </p>
        </div>

        <RelatedNav links={guide.related} />
      </div>
    </>
  );
}