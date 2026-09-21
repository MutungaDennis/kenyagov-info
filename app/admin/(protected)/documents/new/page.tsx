import DocumentEditor from "@/components/documents/admin/DocumentEditor";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewDocumentPage() {
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
      <h1 className="govuk-heading-xl">Add document</h1>
      <DocumentEditor types={types ?? []} />
    </>
  );
}
