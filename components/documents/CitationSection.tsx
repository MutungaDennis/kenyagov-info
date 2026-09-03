// components/documents/CitationSection.tsx
"use client";

import { useState } from "react";

interface CitationSectionProps {
  doc: {
    title: string;
    shortTitle: string;
    referenceNumber: string;
    yearPublished: number;
    issuingBody: string;
    slug: string;
    officialExternalUrl?: string | null;
  };
}

export default function CitationSection({ doc }: CitationSectionProps) {
  const [copiedType, setCopiedType] = useState<'platform' | 'original' | null>(null);

  const platformCitation = `${doc.title}. ${doc.issuingBody}, ${doc.yearPublished}. Retrieved from CitizenGuide.KE: https://www.citizenguide.ke/documents/${doc.slug}`;
  
  const originalCitation = doc.officialExternalUrl
    ? `${doc.title} (${doc.referenceNumber}). ${doc.issuingBody}, ${doc.yearPublished}. Retrieved from ${doc.officialExternalUrl}`
    : `${doc.title} (${doc.referenceNumber}). ${doc.issuingBody}, ${doc.yearPublished}.`;

  const handleCopy = async (text: string, type: 'platform' | 'original') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error("Failed to copy citation: ", err);
    }
  };

  return (
    <div id="citation" className="govuk-!-margin-top-8 govuk-!-padding-5 govuk-!-background-grey govuk-!-border-top-4" style={{ borderTopColor: '#00703c' }}>
      <h3 className="govuk-heading-m govuk-!-margin-top-0">Cite this document</h3>
      
      <div className="govuk-!-margin-bottom-6">
        <h4 className="govuk-heading-s govuk-!-margin-bottom-2">Cite the CitizenGuide.KE version</h4>
        <div className="govuk-inset-text govuk-!-margin-bottom-2">
          <p className="govuk-body-s govuk-!-margin-bottom-0">{platformCitation}</p>
        </div>
        <button
          onClick={() => handleCopy(platformCitation, 'platform')}
          className="govuk-button govuk-button--secondary govuk-!-font-size-14 govuk-!-margin-bottom-0"
          data-module="govuk-button"
        >
          {copiedType === 'platform' ? (
            <>
              <span aria-hidden="true">✓</span> Citation copied
            </>
          ) : (
            <>
              <span aria-hidden="true">📋</span> Copy platform citation
            </>
          )}
        </button>
      </div>

      {doc.officialExternalUrl && (
        <div className="govuk-!-margin-bottom-4">
          <h4 className="govuk-heading-s govuk-!-margin-bottom-2">Cite the original source</h4>
          <div className="govuk-inset-text govuk-!-margin-bottom-2">
            <p className="govuk-body-s govuk-!-margin-bottom-0">{originalCitation}</p>
          </div>
          <button
            onClick={() => handleCopy(originalCitation, 'original')}
            className="govuk-button govuk-button--secondary govuk-!-font-size-14 govuk-!-margin-bottom-0"
            data-module="govuk-button"
          >
            {copiedType === 'original' ? (
              <>
                <span aria-hidden="true">✓</span> Citation copied
              </>
            ) : (
              <>
                <span aria-hidden="true">📋</span> Copy original citation
              </>
            )}
          </button>
        </div>
      )}

      <div className="govuk-!-margin-top-4">
        <p className="govuk-body-s govuk-!-margin-bottom-0">
          <strong>Note:</strong> This page reproduces official government text for civic reference. 
          For legal proceedings and official submissions, always consult the original source or the Kenya Gazette.
        </p>
      </div>
    </div>
  );
}