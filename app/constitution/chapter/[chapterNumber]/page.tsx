import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ConstitutionShell from "@/components/constitution/ConstitutionShell";
import { getChapter } from "@/lib/constitution/data";

type Props = { params: Promise<{ chapterNumber: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chapterNumber } = await params;
  const data = await getChapter(Number(chapterNumber));
  return data ? { title: `Chapter ${data.chapter.chapter_number}: ${data.chapter.title} | Constitution of Kenya` } : {};
}

export default async function ChapterPage({ params }: Props) {
  const { chapterNumber } = await params;
  const data = await getChapter(Number(chapterNumber));
  if (!data) notFound();
  const { chapter, parts, articles } = data;

  return <ConstitutionShell title={chapter.title} caption={`Chapter ${chapter.chapter_number} · Constitution of Kenya, 2010`}>
    <p className="govuk-body-l">Choose an Article to read the constitutional text in a focused reader.</p>
    {parts.length === 0 ? (
      <ArticleList articles={articles} />
    ) : (
      <>
        {parts.map((part: any) => (
          <section id={`part-${part.part_number}`} key={part.id} className="govuk-!-margin-bottom-7">
            <span className="govuk-caption-l">Part {part.part_number}</span>
            <h2 className="govuk-heading-l">{part.title}</h2>
            <ArticleList articles={articles.filter((a: any) => a.part_id === part.id)} />
          </section>
        ))}
        {articles.some((a: any) => !a.part_id) && <ArticleList articles={articles.filter((a: any) => !a.part_id)} />}
      </>
    )}
  </ConstitutionShell>;
}

function ArticleList({ articles }: { articles: any[] }) {
  return <ol className="govuk-list constitution-article-list">
    {articles.map((article) => <li key={article.id}>
      <Link className="govuk-link govuk-link--no-visited-state" href={`/constitution/article/${article.article_number}`}>
        <strong>Article {article.article_number}</strong><span>{article.title}</span>
      </Link>
    </li>)}
  </ol>;
}
