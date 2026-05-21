'use client';

// Define a structured object signature matching your parent calculator calculations
interface ActiveLevies {
  excise: boolean;
  roadMaintFlexible: boolean; // Handles the flexible KSh 18.00 portion of the KSh 25.00 levy
  pdl: boolean;
  reg: boolean;
  railway: boolean;
  antiAdulteration: boolean;
  shippingAndIdf: boolean;
  vat: boolean;
}

interface SimulationProps {
  activeLevies: ActiveLevies;
  setActiveLevies: React.Dispatch<React.SetStateAction<ActiveLevies>>;
  originalPrice: number;
  simulatedPrice: number;
  hasRoadMaint: boolean;
  hasAntiAdulteration: boolean;
}

export default function TaxSimulationDashboard({ 
  activeLevies, 
  setActiveLevies, 
  originalPrice, 
  simulatedPrice,
  hasRoadMaint,
  hasAntiAdulteration
}: SimulationProps) {
  
  // Clean handler to switch Boolean flags on check/uncheck events
  const toggleLevy = (key: keyof ActiveLevies) => {
    setActiveLevies(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="govuk-!-margin-bottom-8" style={{ background: '#f3f2f1', border: '3px solid #ffbf47', padding: '25px' }}>
      <h3 className="govuk-heading-m govuk-!-margin-bottom-2">💡 Policy Tax Reduction Simulator</h3>
      <p className="govuk-body-s">
        Uncheck specific fiscal options below to calculate how low local retail pump prices would drop if Parliament or the National Treasury eliminated individual tax pools.
      </p>

      <div className="govuk-grid-row govuk-!-margin-top-4">
        
        {/* COLUMN 1: ADJUSTABLE FISCAL TAXES (EASY TO CUT VIA FINANCE BILL) */}
        <div className="govuk-grid-column-one-half">
          <div className="govuk-form-group">
            <fieldset className="govuk-fieldset" aria-describedby="flexible-hint">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                <h4 className="govuk-heading-s govuk-!-margin-0">Flexible Policy Taxes (Adjustable)</h4>
              </legend>
              <div id="flexible-hint" className="govuk-hint govuk-!-font-size-14 govuk-!-margin-bottom-3">
                Uncheck an option to drop its statutory cost from the final fuel price equation:
              </div>
              
              <div className="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes">
                <div className="govuk-checkboxes__item">
                  <input className="govuk-checkboxes__input" id="sim-excise" type="checkbox" checked={activeLevies.excise} onChange={() => toggleLevy('excise')} />
                  <label className="govuk-label govuk-checkboxes__label" htmlFor="sim-excise">Excise Duty Tax</label>
                </div>

                {hasRoadMaint && (
                  <div className="govuk-checkboxes__item">
                    <input className="govuk-checkboxes__input" id="sim-road-maint" type="checkbox" checked={activeLevies.roadMaintFlexible} onChange={() => toggleLevy('roadMaintFlexible')} />
                    <label className="govuk-label govuk-checkboxes__label" htmlFor="sim-road-maint">Road Maintenance Levy (Flexible Portion)</label>
                    <span className="govuk-hint govuk-checkboxes__hint govuk-!-font-size-12">Removes KSh 18.00 of the KSh 25.00 levy pool used for standard road patching.</span>
                  </div>
                )}

                <div className="govuk-checkboxes__item">
                  <input className="govuk-checkboxes__input" id="sim-pdl" type="checkbox" checked={activeLevies.pdl} onChange={() => toggleLevy('pdl')} />
                  <label className="govuk-label govuk-checkboxes__label" htmlFor="sim-pdl">Petroleum Development Levy</label>
                </div>

                <div className="govuk-checkboxes__item">
                  <input className="govuk-checkboxes__input" id="sim-railway" type="checkbox" checked={activeLevies.railway} onChange={() => toggleLevy('railway')} />
                  <label className="govuk-label govuk-checkboxes__label" htmlFor="sim-railway">Railway Development Levy</label>
                </div>

                {hasAntiAdulteration && (
                  <div className="govuk-checkboxes__item">
                    <input className="govuk-checkboxes__input" id="sim-adulteration" type="checkbox" checked={activeLevies.antiAdulteration} onChange={() => toggleLevy('antiAdulteration')} />
                    <label className="govuk-label govuk-checkboxes__label" htmlFor="sim-adulteration">Anti-Adulteration Levy</label>
                  </div>
                )}

                <div className="govuk-checkboxes__item">
                  <input className="govuk-checkboxes__input" id="sim-shipping" type="checkbox" checked={activeLevies.shippingAndIdf} onChange={() => toggleLevy('shippingAndIdf')} />
                  <label className="govuk-label govuk-checkboxes__label" htmlFor="sim-shipping">Import Declaration &amp; Marine Fees</label>
                </div>

                <div className="govuk-checkboxes__item">
                  <input className="govuk-checkboxes__input" id="sim-vat" type="checkbox" checked={activeLevies.vat} onChange={() => toggleLevy('vat')} />
                  <label className="govuk-label govuk-checkboxes__label" htmlFor="sim-vat">Value Added Tax (8% VAT)</label>
                </div>
              </div>
            </fieldset>
          </div>
        </div>

        {/* COLUMN 2: FIXED OVERHEADS & BOUND INTERESTS (HARD TO REMOVE IN REALITY) */}
        <div className="govuk-grid-column-one-half">
          <div className="govuk-form-group">
            <fieldset className="govuk-fieldset">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                <h4 className="govuk-heading-s govuk-!-margin-0">Fixed Framework Overheads (Locked)</h4>
              </legend>
              <div className="govuk-hint govuk-!-font-size-14 govuk-!-margin-bottom-3">
                These elements are frozen and cannot be waived due to binding legal or structural debt parameters:
              </div>
              
              <div className="govuk-checkboxes govuk-checkboxes--small">
                {hasRoadMaint && (
                  <div className="govuk-checkboxes__item" style={{ opacity: 0.65 }}>
                    <input className="govuk-checkboxes__input" id="lock-road-debt" type="checkbox" checked disabled />
                    <label className="govuk-label govuk-!-font-weight-bold govuk-checkboxes__label" htmlFor="lock-road-debt">Road Maintenance Levy (Securitized Debt)</label>
                    <span className="govuk-hint govuk-checkboxes__hint govuk-!-font-size-12">KSh 7.00 is legally ring-fenced to amortize outstanding sovereign road infrastructure bonds.</span>
                  </div>
                )}

                <div className="govuk-checkboxes__item" style={{ opacity: 0.65 }}>
                  <input className="govuk-checkboxes__input" id="lock-pipeline" type="checkbox" checked disabled />
                  <label className="govuk-label govuk-!-font-weight-bold govuk-checkboxes__label" htmlFor="lock-pipeline">Pipeline Logistics &amp; Transport Tariffs</label>
                  <span className="govuk-hint govuk-checkboxes__hint govuk-!-font-size-12">Fixed operational service fees required by KPC to pump fuel through the network.</span>
                </div>

                <div className="govuk-checkboxes__item" style={{ opacity: 0.65 }}>
                  <input className="govuk-checkboxes__input" id="lock-regulatory" type="checkbox" checked disabled />
                  <label className="govuk-label govuk-!-font-weight-bold govuk-checkboxes__label" htmlFor="lock-regulatory">EPRA Regulatory Levy</label>
                  <span className="govuk-hint govuk-checkboxes__hint govuk-!-font-size-12">Statutory oversight fee financing quality testing and consumer safety protocols.</span>
                </div>
              </div>
            </fieldset>
          </div>
        </div>

      </div>

      {/* OUTCOME FORECAST BENCHMARK BOXES */}
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '25px', borderTop: '1px solid #bfc1c3', paddingTop: '20px' }}>
        <div style={{ background: '#ffffff', padding: '15px', border: '1px solid #bfc1c3', flex: '1', minWidth: '160px' }}>
          <span className="govuk-hint" style={{ fontSize: '13px' }}>Current Official Price</span>
          <strong style={{ display: 'block', fontSize: '22px', color: '#0b0c0c' }}>KSh {originalPrice.toFixed(2)} / L</strong>
        </div>
        <div style={{ background: '#ffffff', padding: '15px', border: '1px solid #bfc1c3', flex: '1', minWidth: '160px', borderLeft: '5px solid #00703c' }}>
          <span className="govuk-hint" style={{ fontSize: '13px', color: '#00703c', fontWeight: 'bold' }}>Simulated Price Under Configuration</span>
          <strong style={{ display: 'block', fontSize: '22px', color: '#00703c' }}>KSh {simulatedPrice.toFixed(2)} / L</strong>
        </div>
      </div>
    </div>
  );
}
