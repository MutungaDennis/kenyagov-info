'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";


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
    summary: "Kenya's main long-term plan to become a middle-income industrial country by 2030. It covers economic growth, social services and better governance.",
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
    summary: "The current 5-year plan (2023-2027) for economic growth, farming improvements and digital healthcare.",
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
    summary: "The key 1965 policy that set Kenya's mixed economy approach and focused investment in key regions after independence.",
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
    summary: "1986 policy that moved Kenya toward privatization, smaller government budgets and opening markets to private business.",
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
    summary: "2012 policy that started the change from the old 8-4-4 school system to the new Competency Based Curriculum (CBC).",
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
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Documents and policies" },
        ]}
      />

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Documents and policies</h1>
            <p className="govuk-body-l govuk-!-margin-bottom-6">
              Key government plans and policies. Read the main vision for 2030,
              medium-term plans and important sessional papers.
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
          <div className="govuk-!-margin-bottom-4 govuk-inset-text">
            <p className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-2">Active filters:</p>
            <div className="govuk-!-display-flex govuk-!-flex-wrap-wrap govuk-!-gap-2">
              {searchTerm && (
                <button 
                  type="button" 
                  onClick={() => setSearchTerm("")} 
                  className="govuk-button govuk-button--secondary govuk-!-font-size-14 govuk-!-padding-1 govuk-!-margin-0" style={{ background: '#fff', borderColor: '#1d70b8', color: '#1d70b8' }}
                >
                  Search: &ldquo;{searchTerm}&rdquo; <span className="govuk-!-font-weight-bold" style={{ marginLeft: '8px', color: '#d4351c' }}>&times;</span>
                </button>
              )}
              {selectedCategory && (
                <button 
                  type="button" 
                  onClick={() => setSelectedCategory("")} 
                  className="govuk-button govuk-button--secondary govuk-!-font-size-14 govuk-!-padding-1 govuk-!-margin-0" style={{ background: '#fff', borderColor: '#1d70b8', color: '#1d70b8' }}
                >
                  Type: {selectedCategory} <span className="govuk-!-font-weight-bold" style={{ marginLeft: '8px', color: '#d4351c' }}>&times;</span>
                </button>
              )}
              {selectedEra && (
                <button 
                  type="button" 
                  onClick={() => setSelectedEra("")} 
                  className="govuk-button govuk-button--secondary govuk-!-font-size-14 govuk-!-padding-1 govuk-!-margin-0" style={{ background: '#fff', borderColor: '#1d70b8', color: '#1d70b8' }}
                >
                  Era: {selectedEra} <span className="govuk-!-font-weight-bold" style={{ marginLeft: '8px', color: '#d4351c' }}>&times;</span>
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
              {filteredDocuments.length} key policy documents
            </h2>

            {filteredDocuments.length > 0 ? (
              /* GOV.UK Clean Stack Publication List Layout */
              <ul className="govuk-list govuk-!-margin-top-0">
                {filteredDocuments.map((doc) => (
                  <li key={doc.id} className="govuk-!-padding-top-3 govuk-!-padding-bottom-3 govuk-!-border-bottom-1">
                    <div className="govuk-grid-row">
                      <div className="govuk-grid-column-two-thirds">
                        <span className="govuk-caption-m govuk-!-font-size-14 govuk-!-font-weight-bold govuk-!-text-colour-secondary govuk-!-display-block govuk-!-margin-bottom-1">
                          {doc.reference} &bull; Published {doc.datePublished}
                        </span>
                        
                        <h3 className="govuk-heading-m govuk-!-margin-0">
                          <Link href={`/documents/${doc.slug}`} className="govuk-link govuk-!-font-weight-bold">
                            {doc.title}
                          </Link>
                        </h3>

                        <p className="govuk-body-s govuk-!-margin-top-2 govuk-!-margin-bottom-3 govuk-!-text-colour-secondary">
                          {doc.summary}
                        </p>

                        <div className="govuk-!-display-flex govuk-!-gap-3 govuk-!-align-items-center">
                          <Link href={`/documents/${doc.slug}`} className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-14">
                            View structured analysis guide &rarr;
                          </Link>
                          <a href={doc.fileUrl} className="govuk-link govuk-!-font-size-14 govuk-!-text-colour-secondary">
                            Download original official document PDF ({doc.fileSize})
                          </a>
                        </div>
                      </div>

                      {/* Right Sidebar Metadata Badges */}
                      <div className="govuk-grid-column-one-third govuk-!-text-align-right">
                        <span className={`govuk-tag ${doc.category === 'Vision' ? 'govuk-tag--blue' : doc.category === 'Sessional Paper' ? 'govuk-tag--purple' : 'govuk-tag--green'} govuk-!-display-inline-block govuk-!-margin-bottom-2`}>
                          {doc.category}
                        </span>
                        <span className="govuk-body-s govuk-!-display-block govuk-!-text-colour-secondary govuk-!-font-size-13">
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

            
          </div>
        </div>
      
    
  
  </>
);
}
