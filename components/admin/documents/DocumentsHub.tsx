// components/admin/documents/DocumentsHub.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminPath } from "@/lib/admin-path";
import DocumentUploadPanel from "@/components/admin/documents/DocumentUploadPanel";
import DocumentEditPanel from "@/components/admin/documents/DocumentEditPanel";

export type DocumentRow = {
  _id: string;
  title: string;
  shortTitle?: string | null;
  referenceNumber?: string | null;
  yearPublished?: number | null;
  functionalCategory?: string | null;
  historicalEra?: string | null;
  hasFullText?: boolean;
  hasPdf?: boolean;
};

type Props = {
  documents: DocumentRow[];
  studioBase: string;
};

export default function DocumentsHub({ documents, studioBase }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"list" | "upload">("list");
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  const formatCategory = (cat?: string | null) => {
    if (!cat) return "—";
    return cat.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleEditClick = (docId: string) => {
    setEditingDocId(docId);
  };

  const handleEditSuccess = () => {
    setEditingDocId(null);
    router.refresh();
  };

  const handleEditCancel = () => {
    setEditingDocId(null);
  };

  const handleDeleteClick = async (docId: string, docTitle: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${docTitle}"? This cannot be undone.`)) {
      return;
    }

    setDeletingDocId(docId);

    try {
      const res = await fetch("/api/admin/documents/delete", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: docId }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Delete failed");
      }

      router.refresh();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete document. Please try again.");
    } finally {
      setDeletingDocId(null);
    }
  };

  // If editing, show the edit panel
  if (editingDocId) {
    return (
      <DocumentEditPanel 
        documentId={editingDocId} 
        onCancel={handleEditCancel} 
        onSuccess={handleEditSuccess} 
      />
    );
  }

  return (
    <div>
      <div className="govuk-!-margin-bottom-6">
        <span className="govuk-caption-l">Law &amp; Policy</span>
        <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
          Government Publications &amp; Documents
        </h1>
        <p className="govuk-body-l">
          Manage Sessional Papers, CIDPs, Task Force Reports, and other public records.
        </p>
      </div>

      {/* Tab Navigation */}
      <nav className="govuk-!-margin-bottom-6" aria-label="Documents admin tabs">
        <ul className="govuk-list" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <li style={{ margin: 0 }}>
            <button
              type="button"
              className={
                activeTab === "list"
                  ? "govuk-button govuk-!-margin-bottom-0"
                  : "govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
              }
              aria-current={activeTab === "list" ? "page" : undefined}
              onClick={() => setActiveTab("list")}
            >
              All Documents ({documents.length})
            </button>
          </li>
          <li style={{ margin: 0 }}>
            <button
              type="button"
              className={
                activeTab === "upload"
                  ? "govuk-button govuk-!-margin-bottom-0"
                  : "govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
              }
              aria-current={activeTab === "upload" ? "page" : undefined}
              onClick={() => setActiveTab("upload")}
            >
              Upload Document
            </button>
          </li>
        </ul>
      </nav>

      {/* Tab Content */}
      {activeTab === "list" && (
        <div>
          <h2 className="govuk-heading-l">All Documents</h2>
          <p className="govuk-body">
            View, edit, or delete existing government publications.
          </p>

          {documents.length === 0 ? (
            <div className="govuk-inset-text">
              <p className="govuk-body">
                No documents found yet. Use the <strong>Upload Document</strong> tab to add your first publication.
              </p>
            </div>
          ) : (
            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">Title / Reference</th>
                  <th scope="col" className="govuk-table__header">Year</th>
                  <th scope="col" className="govuk-table__header">Category</th>
                  <th scope="col" className="govuk-table__header">Era</th>
                  <th scope="col" className="govuk-table__header">Status</th>
                  <th scope="col" className="govuk-table__header">Actions</th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {documents.map((doc) => (
                  <tr key={doc._id} className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">
                      <a
                        href={`${studioBase}/structure/governmentPublication;${doc._id}`}
                        className="govuk-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {doc.title}
                      </a>
                      {doc.referenceNumber && (
                        <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                          {doc.referenceNumber}
                        </span>
                      )}
                    </th>
                    <td className="govuk-table__cell">{doc.yearPublished || "—"}</td>
                    <td className="govuk-table__cell">{formatCategory(doc.functionalCategory)}</td>
                    <td className="govuk-table__cell">
                      {doc.historicalEra ? doc.historicalEra.replace(/_/g, " ") : "—"}
                    </td>
                    <td className="govuk-table__cell">
                      {doc.hasFullText ? (
                        <strong className="govuk-tag govuk-tag--blue">Text</strong>
                      ) : (
                        <span className="govuk-hint">No text</span>
                      )}
                      {doc.hasPdf && (
                        <strong className="govuk-tag govuk-tag--green govuk-!-margin-left-1">PDF</strong>
                      )}
                    </td>
                    <td className="govuk-table__cell">
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="govuk-link"
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            font: "inherit",
                            cursor: "pointer",
                            textDecoration: "underline",
                            color: "#1d70b8",
                          }}
                          onClick={() => handleEditClick(doc._id)}
                        >
                          Edit
                        </button>
                        <a
                          href={`/documents/${doc.shortTitle?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || doc._id}`}
                          className="govuk-link"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: "inherit" }}
                        >
                          View
                        </a>
                        <button
                          type="button"
                          className="govuk-link"
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            font: "inherit",
                            cursor: deletingDocId === doc._id ? "wait" : "pointer",
                            textDecoration: "underline",
                            color: "#d4351c",
                          }}
                          onClick={() => handleDeleteClick(doc._id, doc.title)}
                          disabled={deletingDocId === doc._id}
                        >
                          {deletingDocId === doc._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <p className="govuk-body govuk-!-margin-top-6">
            <Link href={adminPath()} className="govuk-back-link">
              Back to admin dashboard
            </Link>
          </p>
        </div>
      )}

      {activeTab === "upload" && <DocumentUploadPanel />}
    </div>
  );
}