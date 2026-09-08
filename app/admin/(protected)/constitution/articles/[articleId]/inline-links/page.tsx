import InlineConstitutionLinker
  from "@/components/constitution/admin/InlineConstitutionLinker";

type Props = {
  params: Promise<{
    articleId: string;
  }>;
};

export const dynamic =
  "force-dynamic";

export default async function InlineLinksPage({
  params,
}: Props) {
  const { articleId } =
    await params;

  return (
    <main className="govuk-width-container govuk-!-padding-top-6 govuk-!-padding-bottom-9">
      <InlineConstitutionLinker
        articleId={articleId}
      />
    </main>
  );
}