import { createSanityWriteClient } from "@/lib/sanity/createSanityClient";
import { getSanityStudioUrl } from "@/lib/sanity/studioUrl";
import {
  CONSTITUTION_SETTINGS_ID,
  type ConstitutionSettings,
} from "@/lib/constitution/plain-english";
import ConstitutionHub, {
  type ConstitutionArticleRow,
  type ConstitutionTab,
} from "@/components/admin/constitution/ConstitutionHub";

const sanity = createSanityWriteClient();
const studioBase = getSanityStudioUrl();

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

function parseTab(raw?: string): ConstitutionTab {
  if (
    raw === "upload" ||
    raw === "settings" ||
    raw === "chapters" ||
    raw === "links" ||
    raw === "schedules"
  ) {
    return raw;
  }
  return "chapters";
}

export default async function ConstitutionAdminPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const [articles, settingsDoc] = await Promise.all([
    sanity.fetch<ConstitutionArticleRow[]>(
      `*[_type == "constitutionArticle"] | order(chapter asc, articleNumber asc) {
        _id,
        chapter,
        chapterTitle,
        articleNumber,
        articleTitle,
        "hasPlainEnglish": defined(amplifiedText) && count(amplifiedText) > 0
      }`,
    ),
    sanity.fetch<ConstitutionSettings | null>(
      `*[_type == "constitutionSettings" && _id == $id][0]{
        _id,
        showPlainEnglishGlobal,
        chapterPlainEnglish[]{ chapter, showPlainEnglish }
      }`,
      { id: CONSTITUTION_SETTINGS_ID },
    ),
  ]);

  const settings: ConstitutionSettings = settingsDoc || {
    _id: CONSTITUTION_SETTINGS_ID,
    showPlainEnglishGlobal: true,
    chapterPlainEnglish: [],
  };

  return (
    <ConstitutionHub
      articles={articles || []}
      settings={settings}
      studioBase={studioBase}
      initialTab={parseTab(sp.tab)}
    />
  );
}
