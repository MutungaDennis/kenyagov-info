import Link from "next/link";

type Item = { article_number: number; title: string } | null;
export default function ReaderNavigation({ prev, next }: { prev: Item; next: Item }) {
  return <nav aria-label="Article navigation" className="constitution-reader-nav">
    <div>{prev ? <Link className="govuk-link govuk-link--no-visited-state" href={`/constitution/article/${prev.article_number}`}><span className="govuk-caption-s">Previous</span><strong>Article {prev.article_number}</strong><span className="nav-title">{prev.title}</span></Link> : null}</div>
    <div className="next">{next ? <Link className="govuk-link govuk-link--no-visited-state" href={`/constitution/article/${next.article_number}`}><span className="govuk-caption-s">Next</span><strong>Article {next.article_number}</strong><span className="nav-title">{next.title}</span></Link> : null}</div>
  </nav>;
}
