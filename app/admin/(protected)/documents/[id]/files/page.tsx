import Link from "next/link";
import { notFound } from "next/navigation";

import { adminPath } from "@/lib/admin-path";
import { getAdminDocument, getAdminDocumentFiles, getAdminDocumentVersions } from "@/lib/documents/admin-queries";
import DocumentFilesManager from "@/components/documents/admin/DocumentFilesManager";

export default async function DocumentFilesPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const [document,files,versions]=await Promise.all([getAdminDocument(id),getAdminDocumentFiles(id),getAdminDocumentVersions(id)]);
  if(!document)notFound();
  return <>
    <Link className="govuk-back-link" href={adminPath(`documents/${id}`)}>Back to document</Link>
    <span className="govuk-caption-xl">{document.title}</span>
    <h1 className="govuk-heading-xl">Files and source documents</h1>
    <p className="govuk-body-l">Record original official sources, accessible copies and files already held in Supabase Storage.</p>
    <DocumentFilesManager documentId={id} files={files} versions={versions}/>
  </>;
}
