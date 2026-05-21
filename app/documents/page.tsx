'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

type PolicyDocument = {
  id: string;
  title: string;
  reference: string;
  datePublished: string;
  category: 'Vision' | 'Sessional Paper' | 'MTP';
  era: 'Post-Independence' | 'Liberalization' | 'Constitution 2010';
  summary: string;
  fileUrl: string;
  fileSize: string;
  slug: string;
};

// Audited administrative policy register
const policyDocumentsData: PolicyDocument[] = [
  {
    id: "doc-v2030",
    title: "Kenya Vision 2030 Framework blueprint",
    reference: "Sessional Paper No. 10 of 2012",
    datePublished: "June 2008",
    category: "Vision",
    era: "Constitution 2010",
    summary: "The long-term economic development blueprint seeking to transform Kenya into a newly industrializing, middle-income nation structured across Economic, Social, and Political pillars.",
    fileUrl: "/documents/policies/vision-2030-main.pdf",
    fileSize: "4.8MB",
    slug: "vision-2030"
  },
  {
    id: "doc-mtp4",
    title: "Fourth Medium Term Plan (MTP IV) 2023–2027",
    reference: "National Planning Instrument",
    datePublished: "March 2024",
    category: "MTP",
    era: "Constitution 2010",
    summary: "The active statutory MTP implementing macro-fiscal policies, agricultural value chains, and universal healthcare digitizations mapped directly to bottom-up economic strategies.",
    fileUrl: "/documents/policies/mtp-iv-2023-2027.pdf",
    fileSize: "8.2MB",
    slug: "mtp-iv"
  },
  {
    id: "doc-1965-no10",
    title: "Sessional Paper No. 10 of 1965: African Socialism and its Application to Planning in Kenya",
    reference: "Sessional Paper No. 10 of 1965",
    datePublished: "April 1965",
    category: "Sessional Paper",
    era: "Post-Independence",
    summary: "The fundamental post-independence macro-economic policy blueprint establishing a mixed economy model and prioritizing public investments within high-potential regional zones.",
    fileUrl: "/documents/policies/sessional-paper-1965-no-10.pdf",
    fileSize: "3.1MB",
    slug: "sessional-paper-1965-no-10"
  },
  {
    id: "doc-1986-no1",
    title: "Sessional Paper No. 1 of 1986: Economic Management for Renewed Growth",
    reference: "Sessional Paper No. 1 of 1986",
    datePublished: "March 1986",
    category: "Sessional Paper",
    era: "Liberalization",
    summary: "A milestone economic redirection instrument shifting state policy toward privatization, budget austerity, market liberalization, and structural adjustment execution fields.",
    fileUrl: "/documents/policies/sessional-paper-1986-no-1.pdf",
    fileSize: "2.7MB",
    slug: "sessional-paper-1986-no-1"
  },
  {
    id: "doc-2012-no1",
    title: "Sessional Paper No. 1 of 2012: Policy Framework for Education, Training and Research",
    reference: "Sessional Paper No. 1 of 2012",
    datePublished: "August 2012",
    category: "Sessional Paper",
    era: "Constitution 2010",
    summary: "The master educational re-alignment framework providing the early structural legislative alignments that initiated the phase-out of the legacy 8-4-4 model toward CBC.",
    fileUrl: "/documents/policies/sessional-paper-2012-no-1.pdf",
    fileSize: "1.9MB",
    slug: "sessional-paper-2012-no-1"
  }
];

export default function NationalPolicyIndexPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedEra, setSelectedEra] = useState("");

  const filteredDocuments = useMemo(() => {
    return policyDocumentsData.filter((doc) => {
      const matchesSearch = 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.summary.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = !selectedCategory || doc.category === selectedCategory;
      const matchesEra = !selectedEra || doc.era === selectedEra;

      return matchesSearch && matchesCategory && matchesEra;
    });
  }, [searchTerm, selectedCategory, selectedEra]);

  const hasActiveFilters = searchTerm !== "" || selectedCategory !== "" || selectedEra !== "";

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedEra("");
  };

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Documents and Policies", href: "" },
        ]}
      />

      {/* Reduced padding wrapper to pull directory modules higher above the fold */}
      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">National Policy &amp; Strategy Register</h1>
            <p className="govuk-body-l govuk-!-margin-bottom-6">
              The official public repository of sessional papers, long-term visions, medium-term planning documents, and macroeconomic frameworks of the Republic of Kenya.
            </p>
          </div>
        </div>

        {/* GOV.UK Publication Desk Filter Control Board */}
        <div className="govuk-grid-row govuk-!-margin-bottom-2">
          <div className="govuk-grid-column-one-third govuk-!-margin-bottom-3">
            <div className="govuk-form-group govuk-!-margin-bottom-0">
              <label className="govuk-label govuk-!-font-weight-bold" htmlFor="search-policy">
                Search documents
              </label>
              <input
                className="govuk-input"
                id="search-policy"
                type="search"
                placeholder="Keywords, sessional number, era..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="govuk-grid-column-one-third govuk-!-margin-bottom-3">
            <div className="govuk-form-group govuk-!-margin-bottom-0">
              <label className="govuk-label govuk-!-font-weight-bold" htmlFor="category-select">
                Document Type
              </label>
              <select
                className="govuk-select govuk-!-width-full"
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Document Types</option>
                <option value="Vision">National Vision Blueprints</option>
                <option value="Sessional Paper">Sessional Papers</option>
                <option value="MTP">Medium Term Plans (MTP)</option>
              </select>
            </div>
          </div>

          <div className="govuk-grid-column-one-third govuk-!-margin-bottom-3">
            <div className="govuk-form-group govuk-!-margin-bottom-0">
              <label className="govuk-label govuk-!-font-weight-bold" htmlFor="era-select">
                Macro-Economic Era
              </label>
              <select
                className="govuk-select govuk-!-width-full"
                id="era-select"
                value={selectedEra}
                onChange={(e) => setSelectedEra(e.target.value)}
              >
                <option value="">All Historical Eras</option>
                <option value="Post-Independence">Post-Independence (1963–1979)</option>
                <option value="Liberalization">Market Liberalization (1980–2009)</option>
                <option value="Constitution 2010">Constitution 2010 Era (2010–Present)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Clear Tags Panel */}
        {hasActiveFilters && (
          <div className="govuk-!-margin-bottom-4" style={{ background: '#f8f8f8', padding: '12px', border: '1px solid #bfc1c3' }}>
            <p className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-2">Active filters:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              {searchTerm && (
                <button 
                  type="button" 
                  onClick={() => setSearchTerm("")} 
                  style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center', borderStyle: 'solid' }}
                >
                  Search: &ldquo;{searchTerm}&rdquo; <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                </button>
              )}
              {selectedCategory && (
                <button 
                  type="button" 
                  onClick={() => setSelectedCategory("")} 
                  style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center', borderStyle: 'solid' }}
                >
                  Type: {selectedCategory} <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                </button>
              )}
              {selectedEra && (
                <button 
                  type="button" 
                  onClick={() => setSelectedEra("")} 
                  style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center', borderStyle: 'solid' }}
                >
                  Era: {selectedEra} <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                </button>
              )}
              <button 
                type="button" 
                onClick={clearAllFilters} 
                className="govuk-link govuk-!-font-size-16" 
                style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: '4px' }}
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Results Counter Summary */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h2 className="govuk-heading-m govuk-!-margin-bottom-4" aria-live="polite">
              Showing {filteredDocuments.length} registered strategic papers
            </h2>

            {filteredDocuments.length > 0 ? (
              /* GOV.UK Clean Stack Publication List Layout */
              <ul className="govuk-list" style={{ borderTop: '1px solid #bfc1c3', padding: 0, margin: 0 }}>
                {filteredDocuments.map((doc) => (
                  <li key={doc.id} style={{ borderBottom: '1px solid #bfc1c3', padding: '20px 0', margin: 0 }}>
                    <div className="govuk-grid-row">
                      <div className="govuk-grid-column-two-thirds">
                        <span className="govuk-caption-m govuk-!-font-size-14 govuk-!-font-weight-bold" style={{ textTransform: 'uppercase', color: '#505a5f', display: 'block', marginBottom: '4px' }}>
                          {doc.reference} &bull; Published {doc.datePublished}
                        </span>
                        
                        <h3 className="govuk-heading-m govuk-!-margin-0">
                          <Link href={`/documents/${doc.slug}`} className="govuk-link govuk-!-font-weight-bold">
                            {doc.title}
                          </Link>
                        </h3>

                        <p className="govuk-body-s govuk-!-margin-top-2 govuk-!-margin-bottom-3" style={{ color: '#353c3f' }}>
                          {doc.summary}
                        </p>

                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                          <Link href={`/documents/${doc.slug}`} className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-14">
                            View structured analysis guide &rarr;
                          </Link>
                          <a href={doc.fileUrl} className="govuk-link govuk-!-font-size-14" style={{ color: '#505a5f', textDecoration: 'underline' }}>
                            Download original official document PDF ({doc.fileSize})
                          </a>
                        </div>
                      </div>

                      {/* Right Sidebar Metadata Badges */}
                      <div className="govuk-grid-column-one-third" style={{ textAlign: 'right' }}>
                        <span className={`govuk-tag ${doc.category === 'Vision' ? 'govuk-tag--blue' : doc.category === 'Sessional Paper' ? 'govuk-tag--purple' : 'govuk-tag--green'}`} style={{ display: 'inline-block', marginBottom: '8px' }}>
                          {doc.category}
                        </span>
                        <span className="govuk-body-s d-block" style={{ color: '#505a5f', fontSize: '13px' }}>
                          Era: {doc.era}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="govuk-body govuk-!-margin-top-4">
                <p>No statutory instruments or strategic sessional papers match your specified filter search strings.</p>
              </div>
            )}

            <GovUKFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}
