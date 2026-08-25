import { notFound } from "next/navigation";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import PrintPageButton from "@/components/govuk/PrintPageButton";
import { JsonLd } from "@/components/JsonLd";
import ChapterReader from "@/components/constitution/ChapterReader";
import {
  getConstitutionChapter,
  getConstitutionSettings,
  getChapters,
  getConstitutionLinkPhrases,
} from "@/lib/sanity/client";
import { defaultChapterTitle } from "@/lib/constitution/chapters";

export const revalidate = 3600;

type Props = {
  params: Promise<{ chapter: string }>;
};

export default async function ConstitutionChapterPage({ params }: Props) {
  const { chapter } = await params;
  const chapterNum = parseInt(chapter, 10);

  if (isNaN(chapterNum) || chapterNum < 0 || chapterNum > 18) {
    notFound();
  }

  const [rawArticles, settings, allChapters, linkPhrases] = await Promise.all([
    getConstitutionChapter(chapterNum),
    getConstitutionSettings(),
    getChapters(),
    getConstitutionLinkPhrases(),
  ]);

  if (!rawArticles || rawArticles.length === 0) {
    notFound();
  }

  const articles = [...rawArticles].sort(
    (a: { articleNumber: number }, b: { articleNumber: number }) =>
      Number(a.articleNumber) - Number(b.articleNumber),
  );

  const chapterTitle =
    articles[0]?.chapterTitle || defaultChapterTitle(chapterNum);

  const sortedChapterNums = (allChapters || [])
    .map((c: { chapter: number }) => Number(c.chapter))
    .filter((n: number) => Number.isFinite(n))
    .sort((a: number, b: number) => a - b);

  const idx = sortedChapterNums.indexOf(chapterNum);
  const prevNum = idx > 0 ? sortedChapterNums[idx - 1] : null;
  const nextNum =
    idx >= 0 && idx < sortedChapterNums.length - 1
      ? sortedChapterNums[idx + 1]
      : null;

  const titleFor = (n: number | null) => {
    if (n == null) return null;
    const row = (allChapters || []).find(
      (c: { chapter: number }) => Number(c.chapter) === n,
    );
    return {
      chapter: n,
      title: row?.chapterTitle || defaultChapterTitle(n),
    };
  };

  const breadcrumbs = [
    { text: "Home", href: "/" },
    { text: "Constitution", href: "/constitution" },
    { text: `Chapter ${chapter}`, href: "#" },
  ];

  const chapterSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Chapter ${chapter}: ${chapterTitle}`,
    description: `Full text of Chapter ${chapter} of the Constitution of Kenya 2010`,
    isPartOf: {
      "@type": "Legislation",
      name: "Constitution of Kenya, 2010",
      legislationIdentifier: "Constitution of Kenya 2010",
    },
    url: `https://www.citizenguide.ke/constitution/chapter/${chapter}`,
    numberOfItems: articles.length,
  };

  return (
    <>
      <GovUKBreadcrumbs items={breadcrumbs} />
      <JsonLd data={chapterSchema} />

      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <div className="govuk-!-margin-bottom-4">
            <span className="govuk-caption-l">
              The Constitution of Kenya 2010
            </span>
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">
              Chapter {chapter}: {chapterTitle}
            </h1>
            <p className="govuk-body">
              Read this chapter continuously — scroll articles in order, jump
              from contents, or open an individual article page to share a
              deep link.
            </p>
            <PrintPageButton />
          </div>

          <ChapterReader
            chapter={chapterNum}
            chapterTitle={chapterTitle}
            articles={articles}
            settings={settings}
            linkPhrases={linkPhrases}
            prevChapter={titleFor(prevNum)}
            nextChapter={titleFor(nextNum)}
          />
        </main>
      </div>
    </>
  );
}
