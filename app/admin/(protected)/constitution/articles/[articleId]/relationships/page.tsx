import ConstitutionRelationships
  from "@/components/constitution/admin/ConstitutionRelationships";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    articleId: string;
  }>;
};

export default async function ConstitutionArticleRelationshipsPage({
  params,
}: Props) {
  const { articleId } = await params;

  return (
    <ConstitutionRelationships
      articleId={articleId}
    />
  );
}