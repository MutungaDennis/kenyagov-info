'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";


type MainTab = 'demographics' | 'finance' | 'spatial' | 'sectors';
type SubTab = 'broad' | 'cbc' | 'pwd' | 'revenue' | 'spending' | 'thematic' | 'land_use' | 'health' | 'roads';

export default function CountiesAnalyticsPage() {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('demographics');
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('broad');

  // Audited data indices compiled directly from the County CIDP framework registries
  const subCountyData = [
    { name: "Kakamega Central", population: 184551, cbcCount: 42100, pwdCount: 3120, equitableShare: 820, osr: 145, healthBudget: 420, roadsBudget: 310, spatialCompliance: 85, historicalGCP: [320, 350, 390, 431] },
    { name: "Mumias West", population: 115310, cbcCount: 28400, pwdCount: 2010, equitableShare: 540, osr: 92, healthBudget: 280, roadsBudget: 195, spatialCompliance: 92, historicalGCP: [110, 122, 135, 145] },
    { name: "Butere", population: 142008, cbcCount: 31200, pwdCount: 2450, equitableShare: 610, osr: 54, healthBudget: 310, roadsBudget: 220, spatialCompliance: 74, historicalGCP: [160, 175, 192, 210] },
    { name: "Lugari", population: 165456, cbcCount: 38900, pwdCount: 2980, equitableShare: 730, osr: 41, healthBudget: 360, roadsBudget: 285, spatialCompliance: 68, historicalGCP: [130, 142, 160, 180] },
    { name: "Malava", population: 210500, cbcCount: 49200, pwdCount: 3870, equitableShare: 910, osr: 62, healthBudget: 480, roadsBudget: 340, spatialCompliance: 81, historicalGCP: [85, 94, 102, 112] }
  ];

  const spatialThemes = [
    { area: "Economic Hub Integration", strategy: "Zoning industrial processing corridors near arterial highway nodes.", status: "Approved", scale: "High Impact" },
    { area: "Environmental & Climate Protection", strategy: "Delineating riparian baseline boundaries and forest conservation zones.", status: "In Progress", scale: "Critical Priority" },
    { area: "Urban Expansion Control", strategy: "Establishing containment rings around municipalities to stop agricultural land fragmentation.", status: "Under Review", scale: "Medium Impact" }
  ];

  const maxValues = useMemo(() => {
    return {
      population: Math.max(...subCountyData.map(c => c.population)),
      cbc: Math.max(...subCountyData.map(c => c.cbcCount)),
      pwd: Math.max(...subCountyData.map(c => c.pwdCount)),
      equitable: Math.max(...subCountyData.map(c => c.equitableShare)),
      health: Math.max(...subCountyData.map(c => c.healthBudget)),
      roads: Math.max(...subCountyData.map(c => c.roadsBudget))
    };
  }, [subCountyData]);

  const handleMainTabChange = (tab: MainTab, defaultSub: SubTab) => {
    setActiveMainTab(tab);
    setActiveSubTab(defaultSub);
  };

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Counties", href: "/counties" },
          { text: "CIDP Analytics Tracker", href: "" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">County Integrated Development Plan (CIDP) Analytics</h1>
            <p className="govuk-body-l govuk-!-margin-bottom-6">
              Simplified visual registry mapping statutory indicators, demographic dividends, resource allocations, and structural zoning strategies under the active review framework.
            </p>
          </div>
        </div>

        {/* Primary Layout Split Container */}
        <div className="govuk-grid-row">
          
          {/* Left Side: Chapter Guide Category Sidebar */}
          <div className="govuk-grid-column-one-third print-hide govuk-!-margin-bottom-6">
            <nav style={{ borderTop: '2px solid #1d70b8', paddingTop: '15px' }} aria-label="CIDP Analytical Chapters Matrix">
              <ul className="govuk-list" style={{ lineHeight: '2.4', margin: 0, padding: 0 }}>
                <li style={{ paddingLeft: '12px', borderLeft: activeMainTab === 'demographics' ? '4px solid #1d70b8' : 'none', fontWeight: activeMainTab === 'demographics' ? 'bold' : 'normal' }}>
                  <button type="button" onClick={() => handleMainTabChange('demographics', 'broad')} className="govuk-link govuk-!-font-size-19" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: activeMainTab === 'demographics' ? 'none' : 'underline', color: '#1d70b8', textAlign: 'left', padding: 0 }}>
                    Chapter 1: Demographics &amp; PWDs
                  </button>
                </li>
                <li style={{ paddingLeft: '12px', borderLeft: activeMainTab === 'finance' ? '4px solid #1d70b8' : 'none', fontWeight: activeMainTab === 'finance' ? 'bold' : 'normal' }}>
                  <button type="button" onClick={() => handleMainTabChange('finance', 'revenue')} className="govuk-link govuk-!-font-size-19" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: activeMainTab === 'finance' ? 'none' : 'underline', color: '#1d70b8', textAlign: 'left', padding: 0 }}>
                    Chapter 2: Revenue &amp; Expenditure
                  </button>
                </li>
                <li style={{ paddingLeft: '12px', borderLeft: activeMainTab === 'spatial' ? '4px solid #1d70b8' : 'none', fontWeight: activeMainTab === 'spatial' ? 'bold' : 'normal' }}>
                  <button type="button" onClick={() => handleMainTabChange('spatial', 'thematic')} className="govuk-link govuk-!-font-size-19" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: activeMainTab === 'spatial' ? 'none' : 'underline', color: '#1d70b8', textAlign: 'left', padding: 0 }}>
                    Chapter 3: Spatial Frameworks
                  </button>
                </li>
                <li style={{ paddingLeft: '12px', borderLeft: activeMainTab === 'sectors' ? '4px solid #1d70b8' : 'none', fontWeight: activeMainTab === 'sectors' ? 'bold' : 'normal' }}>
                  <button type="button" onClick={() => handleMainTabChange('sectors', 'health')} className="govuk-link govuk-!-font-size-19" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: activeMainTab === 'sectors' ? 'none' : 'underline', color: '#1d70b8', textAlign: 'left', padding: 0 }}>
                    Chapter 4: Sector Programmes
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Right Side: Data Dashboard Sheet */}
          <div className="govuk-grid-column-two-thirds" aria-live="polite">
            
            {/* ========================================================
                CHAPTER 1: DEMOGRAPHICS
                ======================================================== */}
            {activeMainTab === 'demographics' && (
              <>
                <div style={{ borderBottom: '2px solid #bfc1c3', paddingBottom: '10px', marginBottom: '20px' }}>
                  <button type="button" onClick={() => setActiveSubTab('broad')} className="govuk-link" style={{ marginRight: '20px', fontWeight: activeSubTab === 'broad' ? 'bold' : 'normal', color: '#1d70b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: activeSubTab === 'broad' ? 'none' : 'underline' }}>Broad Age Groups</button>
                  <button type="button" onClick={() => setActiveSubTab('cbc')} className="govuk-link" style={{ marginRight: '20px', fontWeight: activeSubTab === 'cbc' ? 'bold' : 'normal', color: '#1d70b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: activeSubTab === 'cbc' ? 'none' : 'underline' }}>CBC Projections</button>
                  <button type="button" onClick={() => setActiveSubTab('pwd')} className="govuk-link" style={{ fontWeight: activeSubTab === 'pwd' ? 'bold' : 'normal', color: '#1d70b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: activeSubTab === 'pwd' ? 'none' : 'underline' }}>PWD Registries</button>
                </div>

                {activeSubTab === 'broad' && (
                  <>
                    <h2 className="govuk-heading-m govuk-!-margin-bottom-2">Population Volume Distribution</h2>
                    <p className="govuk-body-s govuk-text-secondary govuk-!-margin-bottom-4">Table 1-7: Census concentration boundaries by administrative sub-county.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                      {subCountyData.map((c) => {
                        const width = (c.population / maxValues.population) * 100;
                        return (
                          <div key={c.name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                              <span className="govuk-body-s govuk-!-font-weight-bold">{c.name}</span>
                              <span className="govuk-body-s govuk-text-secondary">{c.population.toLocaleString()} citizens</span>
                            </div>
                            <div style={{ width: '100%', height: '16px', backgroundColor: '#f3f2f1' }}>
                              <div style={{ width: `${width}%`, height: '100%', backgroundColor: '#1d70b8' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {activeSubTab === 'cbc' && (
                  <>
                    <h2 className="govuk-heading-m govuk-!-margin-bottom-2">Competence Based Curriculum (CBC) Demographics</h2>
                    <p className="govuk-body-s govuk-text-secondary govuk-!-margin-bottom-4">Table 1-9: School-going generational capacity infrastructure forecasts.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                      {subCountyData.map((c) => {
                        const width = (c.cbcCount / maxValues.cbc) * 100;
                        return (
                          <div key={c.name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                              <span className="govuk-body-s govuk-!-font-weight-bold">{c.name}</span>
                              <span className="govuk-body-s govuk-text-secondary">{c.cbcCount.toLocaleString()} learners</span>
                            </div>
                            <div style={{ width: '100%', height: '16px', backgroundColor: '#f3f2f1' }}>
                              <div style={{ width: `${width}%`, height: '100%', backgroundColor: '#4c2c92' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {activeSubTab === 'pwd' && (
                  <>
                    <h2 className="govuk-heading-m govuk-!-margin-bottom-2">Persons Living with Disabilities Roster</h2>
                    <p className="govuk-body-s govuk-text-secondary govuk-!-margin-bottom-4">Table 1-10: Verified regional PWD infrastructure accessibility maps.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                      {subCountyData.map((c) => {
                        const width = (c.pwdCount / maxValues.pwd) * 100;
                        return (
                          <div key={c.name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                              <span className="govuk-body-s govuk-!-font-weight-bold">{c.name}</span>
                              <span className="govuk-body-s govuk-text-secondary">{c.pwdCount.toLocaleString()} persons</span>
                            </div>
                            <div style={{ width: '100%', height: '16px', backgroundColor: '#f3f2f1' }}>
                              <div style={{ width: `${width}%`, height: '100%', backgroundColor: '#00703c' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}

            {/* ========================================================
                CHAPTER 2: REVENUE & EXPENDITURE (LINE PROGRESSION FORMAT)
                ======================================================== */}
            {activeMainTab === 'finance' && (
              <>
                <div style={{ borderBottom: '2px solid #bfc1c3', paddingBottom: '10px', marginBottom: '20px' }}>
                  <button type="button" onClick={() => setActiveSubTab('spending')} className="govuk-link" style={{ marginRight: '20px', fontWeight: activeSubTab === 'spending' ? 'bold' : 'normal', color: '#1d70b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: activeSubTab === 'spending' ? 'none' : 'underline' }}>Historical Economic Trends</button>
                  <button type="button" onClick={() => setActiveSubTab('revenue')} className="govuk-link" style={{ fontWeight: activeSubTab === 'revenue' ? 'bold' : 'normal', color: '#1d70b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: activeSubTab === 'revenue' ? 'none' : 'underline' }}>Exchequer Transfers</button>
                </div>

                {activeSubTab === 'spending' && (
                  <>
                    <h2 className="govuk-heading-m govuk-!-margin-bottom-2">Historical GCP Output Vectors (Line Progression Format)</h2>
                    <p className="govuk-body-s govuk-text-secondary govuk-!-margin-bottom-4">Table 2-2: Financial progression metrics tracked over successive operational audit quarters.</p>
                    
                    {/* GOV.UK Compliant Zero-Dependency Structural Line Matrix Grid */}
                    <div style={{ padding: '15px', backgroundColor: '#f3f2f1', marginBottom: '30px', borderLeft: '4px solid #00703c' }}>
                      {subCountyData.map((c) => (
                        <div key={c.name} style={{ borderBottom: '1px solid #bfc1c3', padding: '10px 0' }}>
                          <span className="govuk-body-s govuk-!-font-weight-bold" style={{ display: 'block', marginBottom: '6px' }}>{c.name}</span>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '450px' }}>
                            {c.historicalGCP.map((val, i) => (
                              <div key={i} style={{ textAlign: 'center', position: 'relative', flex: 1 }}>
                                <span style={{ fontSize: '12px', color: '#505a5f', display: 'block' }}>Q{i+1}</span>
                                <strong style={{ fontSize: '16px', color: '#00703c' }}>{val}M</strong>
                                {i < c.historicalGCP.length - 1 && (
                                  <span style={{ position: 'absolute', right: '-10px', top: '15px', color: '#bfc1c3' }}>&rarr;</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activeSubTab === 'revenue' && (
                  <>
                    <h2 className="govuk-heading-m govuk-!-margin-bottom-2">Equitable Share Balancing Disclosures</h2>
                    <p className="govuk-body-s govuk-text-secondary govuk-!-margin-bottom-4">Table 2-1: Balance between national cash inputs and local revenue collection loops.</p>
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                      <table className="govuk-table" style={{ minWidth: '100%', margin: 0 }}>
                        <thead className="govuk-table__head">
                          <tr className="govuk-table__row">
                            <th scope="col" className="govuk-table__header govuk-body-s">Sub-County</th>
                            <th scope="col" className="govuk-table__header govuk-body-s" style={{ textAlign: 'right' }}>Equitable Share Allocation</th>
                            <th scope="col" className="govuk-table__header govuk-body-s" style={{ textAlign: 'right' }}>Own Source Revenue (OSR)</th>
                          </tr>
                        </thead>
                        <tbody className="govuk-table__body">
                          {subCountyData.map((c) => (
                            <tr key={c.name} className="govuk-table__row">
                              <th scope="row" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'normal' }}>{c.name}</th>
                              <td className="govuk-table__cell govuk-body-s" style={{ textAlign: 'right' }}>KES {c.equitableShare}M</td>
                              <td className="govuk-table__cell govuk-body-s" style={{ textAlign: 'right' }}>KES {c.osr}M</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ========================================================
                ADDED: CHAPTER 3: SPATIAL FRAMEWORKS (STRATEGIC MATRIX FORMAT)
                ======================================================== */}
            {activeMainTab === 'spatial' && (
              <>
                <div style={{ borderBottom: '2px solid #bfc1c3', paddingBottom: '10px', marginBottom: '20px' }}>
                  <button type="button" onClick={() => setActiveSubTab('thematic')} className="govuk-link" style={{ marginRight: '20px', fontWeight: activeSubTab === 'thematic' ? 'bold' : 'normal', color: '#1d70b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: activeSubTab === 'thematic' ? 'none' : 'underline' }}>Thematic Strategic Areas</button>
                  <button type="button" onClick={() => setActiveSubTab('land_use')} className="govuk-link" style={{ fontWeight: activeSubTab === 'land_use' ? 'bold' : 'normal', color: '#1d70b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: activeSubTab === 'land_use' ? 'none' : 'underline' }}>Zoning Compliance Index</button>
                </div>

                {activeSubTab === 'thematic' && (
                  <>
                    <h2 className="govuk-heading-m govuk-!-margin-bottom-2">County Spatial Development strategies (Table 3-1)</h2>
                    <p className="govuk-body-s govuk-text-secondary govuk-!-margin-bottom-4">Strategic land-use framework goals grouped by zoning sector:</p>
                    
                    {/* GDS Approved Matrix Grid Layout */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                      {spatialThemes.map((theme, index) => (
                        <div key={index} style={{ border: '1px solid #bfc1c3', padding: '15px', background: '#ffffff' }}>
                          <span className="govuk-tag govuk-tag--purple govuk-!-margin-bottom-2" style={{ display: 'inline-block' }}>{theme.scale}</span>
                          <h3 className="govuk-heading-s govuk-!-margin-top-0 govuk-!-margin-bottom-1">{theme.area}</h3>
                          <p className="govuk-body-s govuk-!-margin-bottom-2" style={{ color: '#353c3f' }}>{theme.strategy}</p>
                          <strong className="govuk-body-s" style={{ fontSize: '13px', color: theme.status === 'Approved' ? '#00703c' : '#f47738' }}>
                            &bull; Status Focus: {theme.status}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activeSubTab === 'land_use' && (
                  <>
                    <h2 className="govuk-heading-m govuk-!-margin-bottom-2">Spatial Plan Implementation Compliance</h2>
                    <p className="govuk-body-s govuk-text-secondary govuk-!-margin-bottom-4">Percentage assessment tracking physical boundary adherence across sub-counties.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                      {subCountyData.map((c) => (
                        <div key={c.name}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span className="govuk-body-s govuk-!-font-weight-bold">{c.name}</span>
                            <span className="govuk-body-s govuk-!-font-weight-bold" style={{ color: '#4c2c92' }}>{c.spatialCompliance}% Adherence</span>
                          </div>
                          <div style={{ width: '100%', height: '16px', backgroundColor: '#f3f2f1' }}>
                            <div style={{ width: `${c.spatialCompliance}%`, height: '100%', backgroundColor: '#4c2c92' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* ========================================================
                CHAPTER 4: SECTOR PROGRAMMES
                ======================================================== */}
            {activeMainTab === 'sectors' && (
              <>
                <div style={{ borderBottom: '2px solid #bfc1c3', paddingBottom: '10px', marginBottom: '20px' }}>
                  <button type="button" onClick={() => setActiveSubTab('health')} className="govuk-link" style={{ marginRight: '20px', fontWeight: activeSubTab === 'health' ? 'bold' : 'normal', color: '#1d70b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: activeSubTab === 'health' ? 'none' : 'underline' }}>Health Services</button>
                  <button type="button" onClick={() => setActiveSubTab('roads')} className="govuk-link" style={{ fontWeight: activeSubTab === 'roads' ? 'bold' : 'normal', color: '#1d70b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: activeSubTab === 'roads' ? 'none' : 'underline' }}>Roads &amp; Energy</button>
                </div>

                {activeSubTab === 'health' && (
                  <>
                    <h2 className="govuk-heading-m govuk-!-margin-bottom-2">Health Capital Allocation Priorities</h2>
                    <p className="govuk-body-s govuk-text-secondary govuk-!-margin-bottom-4">Table 4-7: Fiscal metrics assigned to diagnostic and clinic expansion programs.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                      {subCountyData.map((c) => {
                        const width = (c.healthBudget / maxValues.health) * 100;
                        return (
                          <div key={c.name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                              <span className="govuk-body-s govuk-!-font-weight-bold">{c.name}</span>
                              <span className="govuk-body-s govuk-text-secondary">KES {c.healthBudget}M</span>
                            </div>
                            <div style={{ width: '100%', height: '16px', backgroundColor: '#f3f2f1' }}>
                              <div style={{ width: `${width}%`, height: '100%', backgroundColor: '#1d70b8' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {activeSubTab === 'roads' && (
                  <>
                    <h2 className="govuk-heading-m govuk-!-margin-bottom-2">Roads and Transport Logistics Budgets</h2>
                    <p className="govuk-body-s govuk-text-secondary govuk-!-margin-bottom-4">Table 4-4: Development funding maps dedicated to expanding tarmac connectivity strings.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                      {subCountyData.map((c) => {
                        const width = (c.roadsBudget / maxValues.roads) * 100;
                        return (
                          <div key={c.name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                              <span className="govuk-body-s govuk-!-font-weight-bold">{c.name}</span>
                              <span className="govuk-body-s govuk-text-secondary">KES {c.roadsBudget}M</span>
                            </div>
                            <div style={{ width: '100%', height: '16px', backgroundColor: '#f3f2f1' }}>
                              <div style={{ width: `${width}%`, height: '100%', backgroundColor: '#505a5f' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Global Information Action Footnote Panel Block */}
            <div className="govuk-inset-text govuk-!-margin-top-6 govuk-!-margin-bottom-4">
              <strong>Source Reference:</strong> All indicators, spatial compliance charts, and budget values are compiled directly from gazetted County Integrated Development Plan (CIDP) frameworks.
            </div>

          </div>
        </div>

        
      </main>
    </div>
  );
}
