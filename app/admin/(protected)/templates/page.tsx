import Link from "next/link";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { adminPath } from "@/lib/admin-path";
import { INSTITUTION_TEMPLATES } from "@/lib/institutions/templates";

export default function AdminTemplatesPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBackLink href={adminPath()} />
      <GovUKBreadcrumbs items={[{ text: "Home", href: "/" }, { text: "Admin", href: adminPath() }, { text: "Templates", href: adminPath("templates") }]} />
      <main className="govuk-main-wrapper">
        <span className="govuk-caption-l">Content design</span>
        <h1 className="govuk-heading-xl">Institution templates</h1>
        <p className="govuk-body-l">Templates control which information people see first and how an institution page is organised. Assign one while editing an institution to use its patient or service-focused layout.</p>
        <div className="template-catalogue">
          {INSTITUTION_TEMPLATES.filter((template) => ["default", "healthcare"].includes(template.key)).map((template) => (
            <article className="template-catalogue__card" key={template.key}>
              <p className="govuk-caption-m">{template.key === "default" ? "Default" : "Available template"}</p>
              <h2 className="govuk-heading-l">{template.name}</h2>
              <p className="govuk-body">{template.summary}</p>
              <p className="govuk-body"><strong>For:</strong> {template.audience}</p>
              <h3 className="govuk-heading-m">Page sections</h3>
              <ul className="govuk-list govuk-list--bullet">{template.sections.map((section) => <li key={section}>{section}</li>)}</ul>
              {template.fields.length > 0 && <><h3 className="govuk-heading-m">Additional fields</h3><dl className="govuk-summary-list">{template.fields.map((field) => <div className="govuk-summary-list__row" key={field.key}><dt className="govuk-summary-list__key">{field.label}</dt><dd className="govuk-summary-list__value">{field.description}</dd></div>)}</dl></>}
              <Link className="govuk-button govuk-button--secondary" href={adminPath("institutions")}>Assign from institutions</Link>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
