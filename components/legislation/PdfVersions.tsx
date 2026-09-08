export function PdfVersions({ versions }: { versions: any[] }) {
  if (!versions.length) return null;
  return (
    <section aria-labelledby="official-files-heading" className="govuk-!-margin-top-8">
      <h2 id="official-files-heading" className="govuk-heading-m">Official files and versions</h2>
      <p className="govuk-body">Use the HTML text on CitizenGuide for easier reading and navigation. PDFs are provided as official source documents.</p>
      <ul className="govuk-list govuk-list--spaced">
        {versions.map((version) => (
          <li key={version.id}>
            <strong>{version.version_label || version.version_date}</strong>{version.is_current ? " — current version" : ""}
            {version.pdf_url ? <><br /><a className="govuk-link" href={version.pdf_url}>Download PDF</a>{version.pdf_page_count ? ` (${version.pdf_page_count} pages` : ""}{version.pdf_file_size_bytes ? `${version.pdf_page_count ? ", " : " ("}${Math.round(version.pdf_file_size_bytes / 1024)} KB` : ""}{version.pdf_page_count || version.pdf_file_size_bytes ? ")" : ""}</> : null}
            {version.pdf_accessibility && version.pdf_accessibility !== "Accessible" ? <><br /><span className="govuk-body-s">PDF accessibility: {version.pdf_accessibility}. An HTML version is provided where available.</span></> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
