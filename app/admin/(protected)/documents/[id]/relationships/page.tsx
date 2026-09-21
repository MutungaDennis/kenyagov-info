import Link from "next/link";
import { notFound } from "next/navigation";

import { adminPath } from "@/lib/admin-path";
import { getAdminDocument, getAdminDocumentRelationships } from "@/lib/documents/admin-queries";
import DocumentRelationshipsManager from "@/components/documents/admin/DocumentRelationshipsManager";

export default async function DocumentRelationshipsPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const [document,relationships]=await Promise.all([getAdminDocument(id),getAdminDocumentRelationships(id)]);
  if(!document)notFound();
  return <>
    <Link className="govuk-back-link" href={adminPath(`documents/${id}`)}>Back to document</Link>
    <span className="govuk-caption-xl">{document.title}</span>
    <h1 className="govuk-heading-xl">Document relationships</h1>
    <p className="govuk-body-l">Connect this record to successor documents, laws, Constitution records, institutions and Gazette material.</p>
    <DocumentRelationshipsManager documentId={id} relationships={relationships}/>
  </>;
}
