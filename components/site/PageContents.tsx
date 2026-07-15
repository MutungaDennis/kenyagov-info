type Item = {
  href: string;
  text: string;
};

type Props = {
  items: Item[];
  title?: string;
};

/**
 * GOV.UK-style on-page contents list for long guidance.
 */
export default function PageContents({
  items,
  title = "Contents",
}: Props) {
  if (!items.length) return null;

  return (
    <nav
      className="govuk-!-margin-bottom-6 app-contents"
      aria-labelledby="page-contents-heading"
    >
      <h2 id="page-contents-heading" className="govuk-heading-s">
        {title}
      </h2>
      <ol className="govuk-list govuk-list--number">
        {items.map((item) => (
          <li key={item.href}>
            <a className="govuk-link" href={item.href}>
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
