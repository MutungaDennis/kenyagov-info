import DocumentsFinder from "@/components/documents/DocumentsFinder";

import {
  getDocumentFilters,
  searchPublicDocuments,
  type DocumentFinderRow,
  type DocumentSearchParams,
} from "@/lib/documents/queries";

export const dynamic = "force-dynamic";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<DocumentSearchParams>;
}) {
  const params = await searchParams;

  const [
    {
      rows,
      total,
      page,
      pageSize,
    },
    filters,
  ] = await Promise.all([
    searchPublicDocuments(params),
    getDocumentFilters(),
  ]);

  const documents: DocumentFinderRow[] =
    rows.map((document) => ({
      ...document,
      href: `/documents/${document.slug}`,
    }));

  return (
    <DocumentsFinder
      params={params}
      rows={documents}
      total={total}
      page={page}
      pageSize={pageSize}
      categories={filters.categories}
      types={filters.types}
      topics={filters.topics}
    />
  );
}