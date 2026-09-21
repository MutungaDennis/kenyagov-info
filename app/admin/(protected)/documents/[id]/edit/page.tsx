import { notFound } from "next/navigation";

import DocumentEditor from "@/components/documents/admin/DocumentEditor";
import { getAdminDocument } from "@/lib/documents/admin-queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const document = await getAdminDocument(id);

  if (!document) {
    notFound();
  }

  const supabase = await createClient();

  const { data: types, error } = await supabase
    .from("document_types")
    .select("id,name")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return (
    <>
      <h1 className="govuk-heading-xl">Edit document</h1>
      <DocumentEditor document={document} types={types ?? []} />
    </>
  );
}
