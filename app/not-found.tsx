import Link from "next/link";

/**
 * Public GOV.UK-style 404 page.
 */
export default function NotFound() {
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <h1 className="govuk-heading-xl">Page not found</h1>
        <p className="govuk-body">
          If you typed the web address, check it is correct.
        </p>
        <p className="govuk-body">
          If you pasted the web address, check you copied the entire address.
        </p>
        <p className="govuk-body">You can:</p>
        <ul className="govuk-list govuk-list--bullet">
          <li>
            <Link href="/" className="govuk-link">
              go to the homepage
            </Link>
          </li>
          <li>
            <Link href="/topics" className="govuk-link">
              browse topics
            </Link>
          </li>
          <li>
            <Link href="/services" className="govuk-link">
              search services
            </Link>
          </li>
          <li>
            <Link href="/sitemap" className="govuk-link">
              use the sitemap
            </Link>
          </li>
          <li>
            <Link href="/contact" className="govuk-link">
              contact this website
            </Link>{" "}
            if you need further help
          </li>
        </ul>
      </div>
    </div>
  );
}
