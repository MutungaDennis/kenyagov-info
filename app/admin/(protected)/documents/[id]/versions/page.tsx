import Link from "next/link";
import { notFound } from "next/navigation";

import { adminPath } from "@/lib/admin-path";
import { getAdminDocument, getAdminDocumentVersions } from "@/lib/documents/admin-queries";
import DocumentVersionsManager from "@/components/documents/admin/DocumentVersionsManager";

export default async function DocumentVersionsPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const [document,versions]=await Promise.all([getAdminDocument(id),getAdminDocumentVersions(id)]);
  if(!document)notFound();
  return <>
    <Link className="govuk-back-link" href={adminPath(`documents/${id}`)}>Back to document</Link>
    <span className="govuk-caption-xl">{document.title}</span>
    <h1 className="govuk-heading-xl">Document versions</h1>
    <div className="govuk-inset-text">Use versions for editions of the same document. A later policy or plan that replaces this document should normally be a separate document linked with a relationship.</div>
    <DocumentVersionsManager documentId={id} versions={versions}/>
  </>;
}
