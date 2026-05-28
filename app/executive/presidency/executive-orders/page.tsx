'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";


type ExecutiveOrder = {
  id: string;
  orderNumber: string;
  title: string;
  dateIssued: string;
  category: 'State Department Restructuring' | 'National Security' | 'Public Service Commission' | 'Anti-Corruption Mandate';
  summary: string;
  gazetteNoticeUrl: string;
  fileSize: string;
};

// Official records matching administrative dispatches from State House
const executiveOrdersData: ExecutiveOrder[] = [
  {
    id: "eo-2024-01",
    orderNumber: "Executive Order No. 1 of 2024",
    title: "Organization of the Government of the Republic of Kenya",
    dateIssued: "09 January 2024",
    category: "State Department Restructuring",
    summary: "Establishes structural compositions of Ministries, State Departments, and Constitutional Portfolios following executive assignments.",
    gazetteNoticeUrl: "/documents/orders/executive-order-no1-2024.pdf",
    fileSize: "1.4MB"
  },
  {
    id: "eo-2024-02",
    orderNumber: "Executive Order No. 2 of 2024",
    title: "Framework for Digitization of Public Procurement Networks",
    dateIssued: "14 March 2024",
    category: "Anti-Corruption Mandate",
    summary: "Mandates the automated processing of all ministerial and county-level public tender applications through verified tracking portals.",
    gazetteNoticeUrl: "/documents/orders/executive-order-no2-2024.pdf",
    fileSize: "680KB"
  },
  {
    id: "eo-2023-04",
    orderNumber: "Executive Order No. 4 of 2023",
    title: "Establishment of the National Climate Change Council Framework",
    dateIssued: "11 November 2023",
    category: "State Department Restructuring",
    summary: "Creates the inter-ministerial structural council to oversee green funding distributions and climate mitigation infrastructure compliance.",
    gazetteNoticeUrl: "/documents/orders/executive-order-no4-2023.pdf",
    fileSize: "920KB"
  },
  {
    id: "eo-2023-03",
    orderNumber: "Executive Order No. 3 of 2023",
    title: "National Security Operations Coordination Amendment",
    dateIssued: "05 September 2023",
    category: "National Security",
    summary: "Re-aligns operational command channels between regional police controllers and national border monitoring agencies.",
    gazetteNoticeUrl: "/documents/orders/executive-order-no3-2023.pdf",
    fileSize: "512KB"
  }
];

export default function ExecutiveOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const filteredOrders = useMemo(() => {
    return executiveOrdersData.filter((order) => {
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.summary.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = !selectedCategory || order.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const hasActiveFilters = searchTerm !== "" || selectedCategory !== "";

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
  };

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Executive", href: "/executive" },
          { text: "The Presidency", href: "/executive/presidency" },
          { text: "Executive Orders", href: "" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Presidential Executive Orders</h1>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Official public register of policy directives, statutory organizational structures, and administrative instruments issued by the President under the Constitution of Kenya.
            </p>

            {/* Mobile Responsive Filter Options Form Grid */}
            <div className="govuk-grid-row govuk-!-margin-bottom-2">
              <div className="govuk-grid-column-one-half govuk-!-margin-bottom-3">
                <div className="govuk-form-group govuk-!-margin-bottom-0">
                  <label className="govuk-label govuk-!-font-weight-bold" htmlFor="search-order">
                    Search orders
                  </label>
                  <input
                    className="govuk-input"
                    id="search-order"
                    type="search"
                    placeholder="Order number, keyword, or title text..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="govuk-grid-column-one-half govuk-!-margin-bottom-3">
                <div className="govuk-form-group govuk-!-margin-bottom-0">
                  <label className="govuk-label govuk-!-font-weight-bold" htmlFor="category-select">
                    Administrative Category
                  </label>
                  <select
                    className="govuk-select govuk-!-width-full"
                    id="category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    <option value="State Department Restructuring">State Department Restructuring</option>
                    <option value="National Security">National Security</option>
                    <option value="Public Service Commission">Public Service Commission</option>
                    <option value="Anti-Corruption Mandate">Anti-Corruption Mandate</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Clear Filter Tags Panel */}
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
                      Keywords: &ldquo;{searchTerm}&rdquo; <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </button>
                  )}
                  {selectedCategory && (
                    <button 
                      type="button" 
                      onClick={() => setSelectedCategory("")} 
                      style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center', borderStyle: 'solid' }}
                    >
                      Category: {selectedCategory} <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
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

            <h2 className="govuk-heading-m govuk-!-margin-bottom-4" aria-live="polite">
              Showing {filteredOrders.length} executive instruments
            </h2>

            {filteredOrders.length > 0 ? (
              /* Mobile Safe Horizontal Scroll Wrapper Container */
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '25px' }}>
                <table className="govuk-table" style={{ minWidth: '850px' }}>
                  <caption className="govuk-table__caption govuk-visually-hidden">Log of presidential executive orders with issuing dates, legal classifications, and text summaries.</caption>
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '200px' }}>Order Reference</th>
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '120px' }}>Date Issued</th>
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '180px' }}>Classification</th>
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold' }}>Summary of Legal Instruments & Documents</th>
                    </tr>
                  </thead>
                  <tbody className="govuk-table__body">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="govuk-table__row">
                        <th scope="row" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'normal' }}>
                          <span className="govuk-!-font-weight-bold" style={{ display: 'block', fontSize: '16px' }}>{order.orderNumber}</span>
                          <span style={{ fontSize: '14px', color: '#505a5f', display: 'block', marginTop: '2px' }}>{order.title}</span>
                        </th>
                        <td className="govuk-table__cell govuk-body-s">{order.dateIssued}</td>
                        <td className="govuk-table__cell govuk-body-s">
                          <strong className={`govuk-tag ${order.category === 'State Department Restructuring' ? 'govuk-tag--blue' : order.category === 'National Security' ? 'govuk-tag--red' : 'govuk-tag--grey'}`}>
                            {order.category}
                          </strong>
                        </td>
                        <td className="govuk-table__cell govuk-body-s">
                          <p className="govuk-body-s govuk-!-margin-bottom-2">{order.summary}</p>
                          <Link 
                            href={order.gazetteNoticeUrl} 
                            className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-14"
                          >
                            Download Gazette Notice PDF ({order.fileSize}) [1]
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="govuk-body govuk-!-margin-top-4">
                <p>No presidential executive orders match your active keyword or category parameters.</p>
              </div>
            )}

            
          </div>
        </div>
      </main>
    </div>
  );
}
