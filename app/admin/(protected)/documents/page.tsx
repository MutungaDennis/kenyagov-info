// app/admin/documents/page.tsx
import { createSanityWriteClient } from "@/lib/sanity/createSanityClient";
import { getSanityStudioUrl } from "@/lib/sanity/studioUrl";
import DocumentsHub, {
  type DocumentRow,
  type DocumentsTab,
} from "@/components/admin/documents/DocumentsHub";

type PageProps = {
  searchParams: Promise<{ tab?: string; edit?: string }>;
};

function parseTab(raw?: string): DocumentsTab {
  if (raw === "list" || raw === "upload" || raw === "edit") {
    return raw;
  }
  return "list";
}

export default async function DocumentsAdminPage({ searchParams }: PageProps) {
  const sanity = createSanityWriteClient();
  const studioBase = getSanityStudioUrl();
  
  const sp = await searchParams;

  const documents = await sanity.fetch<DocumentRow[]>(
    `*[_type == "governmentPublication"] | order(yearPublished desc) {
      _id,
      title,
      shortTitle,
      referenceNumber,
      yearPublished,
      functionalCategory,
      historicalEra,
      "hasFullText": defined(fullText) && count(fullText) > 0,
      "hasPdf": defined(officialPdf.asset)
    }`,
  );

  return (
    <DocumentsHub
      documents={documents || []}
      studioBase={studioBase}
      initialTab={parseTab(sp.tab)}
      editId={sp.edit}
    />
  );
}