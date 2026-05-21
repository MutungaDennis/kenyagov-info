'use client';

import { useState, useMemo } from 'react';

// =========================================================================
// TYPES & DATA INTERFACES
// =========================================================================
interface TownPrice {
  town_name: string;
  price_pms: number;
  price_ago: number;
  price_ik: number;
}

interface NairobiBreakdown {
  landed_cost_kes_pms: number; landed_cost_kes_ago: number; landed_cost_kes_ik: number;
  pipeline_transport_pms: number; pipeline_transport_ago: number; pipeline_transport_ik: number;
  pipeline_losses_pms: number; pipeline_losses_ago: number; pipeline_losses_ik: number;
  depot_losses_pms: number; depot_losses_ago: number; depot_losses_ik: number;
  delivery_nrb_pms: number; delivery_nrb_ago: number; delivery_nrb_ik: number;
  importers_margin_pms: number; importers_margin_ago: number; importers_margin_ik: number;
  dealers_margin_pms: number; dealers_margin_ago: number; dealers_margin_ik: number;
  subsidy_pms: number; subsidy_ago: number; subsidy_ik: number;
  tax_excise_duty_pms: number; tax_excise_duty_ago: number; tax_excise_duty_ik: number;
  levy_road_maintenance_pms: number; levy_road_maintenance_ago: number; levy_road_maintenance_ik: number;
  levy_petroleum_dev_pms: number; levy_petroleum_dev_ago: number; levy_petroleum_dev_ik: number;
  levy_petroleum_reg_pms: number; levy_petroleum_reg_ago: number; levy_petroleum_reg_ik: number;
  levy_railway_dev_pms: number; levy_railway_dev_ago: number; levy_railway_dev_ik: number;
  levy_anti_adulteration_pms: number; levy_anti_adulteration_ago: number; levy_anti_adulteration_ik: number;
  levy_merchant_shipping_pms: number; levy_merchant_shipping_ago: number; levy_merchant_shipping_ik: number;
  levy_import_declaration_pms: number; levy_import_declaration_ago: number; levy_import_declaration_ik: number;
  tax_vat_pms: number; tax_vat_ago: number; tax_vat_ik: number;
}

// =========================================================================
// MAIN CONTAINER COMPONENT
// =========================================================================
export default function FuelCalculator({ towns, breakdown }: { towns: TownPrice[]; breakdown: NairobiBreakdown }) {
  const [calcMode, setCalcMode] = useState<'liters' | 'cash'>('liters');
  const [selectedTown, setSelectedTown] = useState('Nairobi');
  const [fuelType, setFuelType] = useState<'pms' | 'ago' | 'ik'>('pms');
  const [inputValue, setInputValue] = useState<string>('50');
  const [taxCutPercent, setTaxCutPercent] = useState<number>(0);

  // Dynamic Lookup Security fallback
  const townData = towns.find(t => t.town_name === selectedTown) || towns[0];
  const currentPumpPrice = townData ? (fuelType === 'pms' ? townData.price_pms : fuelType === 'ago' ? townData.price_ago : townData.price_ik) : 0;

  // Compute base pricing matrices matching Annex II parameters exactly
  const baseRates = useMemo(() => {
    return {
      landed: fuelType === 'pms' ? breakdown.landed_cost_kes_pms : fuelType === 'ago' ? breakdown.landed_cost_kes_ago : breakdown.landed_cost_kes_ik,
      pipeline: fuelType === 'pms' ? breakdown.pipeline_transport_pms : fuelType === 'ago' ? breakdown.pipeline_transport_ago : breakdown.pipeline_transport_ik,
      pipeLoss: fuelType === 'pms' ? breakdown.pipeline_losses_pms : fuelType === 'ago' ? breakdown.pipeline_losses_ago : breakdown.pipeline_losses_ik,
      depotLoss: fuelType === 'pms' ? breakdown.depot_losses_pms : fuelType === 'ago' ? breakdown.depot_losses_ago : breakdown.depot_losses_ik,
      delivery: fuelType === 'pms' ? breakdown.delivery_nrb_pms : fuelType === 'ago' ? breakdown.delivery_nrb_ago : breakdown.delivery_nrb_ik,
      importer: fuelType === 'pms' ? breakdown.importers_margin_pms : fuelType === 'ago' ? breakdown.importers_margin_ago : breakdown.importers_margin_ik,
      dealer: fuelType === 'pms' ? breakdown.dealers_margin_pms : fuelType === 'ago' ? breakdown.dealers_margin_ago : breakdown.dealers_margin_ik,
      subsidy: fuelType === 'pms' ? breakdown.subsidy_pms : fuelType === 'ago' ? breakdown.subsidy_ago : breakdown.subsidy_ik,
      excise: fuelType === 'pms' ? breakdown.tax_excise_duty_pms : fuelType === 'ago' ? breakdown.tax_excise_duty_ago : breakdown.tax_excise_duty_ik,
      roadMaint: fuelType === 'pms' ? breakdown.levy_road_maintenance_pms : fuelType === 'ago' ? breakdown.levy_road_maintenance_ago : breakdown.levy_road_maintenance_ik,
      pdl: fuelType === 'pms' ? breakdown.levy_petroleum_dev_pms : fuelType === 'ago' ? breakdown.levy_petroleum_dev_ago : breakdown.levy_petroleum_dev_ik,
      reg: fuelType === 'pms' ? breakdown.levy_petroleum_reg_pms : fuelType === 'ago' ? breakdown.levy_petroleum_reg_ago : breakdown.levy_petroleum_reg_ik,
      railway: fuelType === 'pms' ? breakdown.levy_railway_dev_pms : fuelType === 'ago' ? breakdown.levy_railway_dev_ago : breakdown.levy_railway_dev_ik,
      antiAdulteration: fuelType === 'pms' ? breakdown.levy_anti_adulteration_pms : fuelType === 'ago' ? breakdown.levy_anti_adulteration_ago : breakdown.levy_anti_adulteration_ik,
      shipping: fuelType === 'pms' ? breakdown.levy_merchant_shipping_pms : fuelType === 'ago' ? breakdown.levy_merchant_shipping_ago : breakdown.levy_merchant_shipping_ik,
      idf: fuelType === 'pms' ? breakdown.levy_import_declaration_pms : fuelType === 'ago' ? breakdown.levy_import_declaration_ago : breakdown.levy_import_declaration_ik,
      vat: fuelType === 'pms' ? breakdown.tax_vat_pms : fuelType === 'ago' ? breakdown.tax_vat_ago : breakdown.tax_vat_ik,
    };
  }, [fuelType, breakdown]);

  const originalTotalTaxes = baseRates.excise + baseRates.roadMaint + baseRates.pdl + baseRates.reg + baseRates.railway + baseRates.antiAdulteration + baseRates.shipping + baseRates.idf + baseRates.vat;
  const simulatedTaxesPerLitre = originalTotalTaxes * (1 - taxCutPercent / 100);
  const priceReduction = originalTotalTaxes - simulatedTaxesPerLitre;
  const simulatedPumpPrice = currentPumpPrice - priceReduction;

  const computedLiters = calcMode === 'liters' ? (parseFloat(inputValue) || 0) : (parseFloat(inputValue) || 0) / simulatedPumpPrice;
  const totalCost = calcMode === 'liters' ? computedLiters * simulatedPumpPrice : (parseFloat(inputValue) || 0);

  // Inclusive Context Language Formatter
  const getInclusiveLanguageStatement = () => {
    const formattedCash = `KSh ${totalCost.toFixed(2)}`;
    const formattedLiters = `${computedLiters.toFixed(2)} Liters`;
    
    if (fuelType === 'ik') {
      return (
        <>
          Purchasing Kerosene worth <strong>{formattedCash}</strong> secures precisely <strong>{formattedLiters}</strong> for local distribution, domestic household cookstoves, lighting lanterns, or localized heating systems based on official pricing caps.
        </>
      );
    }
    const assetUsage = fuelType === 'pms' ? 'motor vehicles, equipment, or backup petrol generators' : 'commercial transport fleets, industrial machinery, or agricultural diesel generators';
    return (
      <>
        Securing fuel worth <strong>{formattedCash}</strong> dispenses precisely <strong>{formattedLiters}</strong> available for use in {assetUsage} based on local price ceilings.
      </>
    );
  };

  return (
    <div className="govuk-!-margin-top-4">
      
      {/* CONTROL DASHBOARD: Toggles mapped to the top matching GOV.UK usability frameworks */}
      <div style={{ background: '#ffffff', border: '1px solid #bfc1c3', padding: '25px', marginBottom: '30px' }}>
        <div className="govuk-form-group">
          <fieldset className="govuk-fieldset">
            <legend className="govuk-fieldset__legend govuk-!-font-weight-bold">Choose Input Metric</legend>
            <div className="govuk-radios govuk-radios--inline govuk-radios--small">
              <div className="govuk-radios__item">
                <input className="govuk-radios__input" id="m-liters" type="radio" checked={calcMode === 'liters'} onChange={() => setCalcMode('liters')} />
                <label className="govuk-label govuk-radios__label" htmlFor="m-liters">By Fuel Volume (Liters)</label>
              </div>
              <div className="govuk-radios__item">
                <input className="govuk-radios__input" id="m-cash" type="radio" checked={calcMode === 'cash'} onChange={() => setCalcMode('cash')} />
                <label className="govuk-label govuk-radios__label" htmlFor="m-cash">By Cash Budget (KSh)</label>
              </div>
            </div>
          </fieldset>
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label govuk-!-font-weight-bold" htmlFor="main-num-input">
            {calcMode === 'liters' ? 'Volume to Purchase (Liters)' : 'Cash Budget Amount (KSh)'}
          </label>
          <input className="govuk-input govuk-input--width-10" id="main-num-input" type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label govuk-!-font-weight-bold" htmlFor="town-select-node">Select Location Town</label>
          <select className="govuk-select" id="town-select-node" value={selectedTown} onChange={(e) => setSelectedTown(e.target.value)}>
            {towns.map((t, idx) => <option key={idx} value={t.town_name}>{t.town_name}</option>)}
          </select>
        </div>

        <div className="govuk-form-group" style={{ marginBottom: 0 }}>
          <fieldset className="govuk-fieldset">
            <legend className="govuk-fieldset__legend govuk-!-font-weight-bold">Select Fuel Variant</legend>
            <div className="govuk-radios govuk-radios--inline govuk-radios--small">
              <div className="govuk-radios__item">
                <input className="govuk-radios__input" id="f-pms" type="radio" checked={fuelType === 'pms'} onChange={() => setFuelType('pms')} />
                <label className="govuk-label govuk-radios__label" htmlFor="f-pms">Petrol (PMS)</label>
              </div>
              <div className="govuk-radios__item">
                <input className="govuk-radios__input" id="f-ago" type="radio" checked={fuelType === 'ago'} onChange={() => setFuelType('ago')} />
                <label className="govuk-label govuk-radios__label" htmlFor="f-ago">Diesel (AGO)</label>
              </div>
              <div className="govuk-radios__item">
                <input className="govuk-radios__input" id="f-ik" type="radio" checked={fuelType === 'ik'} onChange={() => setFuelType('ik')} />
                <label className="govuk-label govuk-radios__label" htmlFor="f-ik">Kerosene (IK)</label>
              </div>
            </div>
          </fieldset>
        </div>
      </div>

      {/* RESULTS DISPLAY HUB */}
      {computedLiters > 0 && (
        <div>
          <div className="govuk-inset-text" style={{ borderColor: '#005ea5', background: '#f3f2f1', marginTop: '20px', marginBottom: '30px' }}>
            <p className="govuk-body" style={{ margin: 0 }}>{getInclusiveLanguageStatement()}</p>
          </div>

          {/* ITEMP 1: COMPREHENSIVE DISAGGREGATED BREAKDOWN MATRIX */}
          <FuelTaxBreakdownTable rates={baseRates} computedLiters={computedLiters} simulatedPrice={simulatedPumpPrice} taxCutPercent={taxCutPercent} />

          {/* ITEM 2: POLICY ACTION SLIDER SIMULATOR */}
          {/* <TaxSimulationDashboard taxCutPercent={taxCutPercent} setTaxCutPercent={setTaxCutPercent} originalPrice={currentPumpPrice} simulatedPrice={simulatedPumpPrice} /> */}

          {/* ITEM 3: REGIONAL EAC CROSS-BORDER SPECTRUM GRID */}
          <RegionalComparisonTable kePrice={simulatedPumpPrice} fuelType={fuelType} />
        </div>
      )}
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: DISAGGREGATED ACCOUNTABILITY MATRIX TABLE
// =========================================================================
function FuelTaxBreakdownTable({ rates, computedLiters, simulatedPrice, taxCutPercent }: { rates: any; computedLiters: number; simulatedPrice: number; taxCutPercent: number }) {
  const simFactor = 1 - taxCutPercent / 100;
  
  const totalStorageDist = rates.pipeline + rates.pipeLoss + rates.depotLoss + rates.delivery;
  const totalMargins = rates.importer + rates.dealer;

  const taxItems = [
    { name: "Excise Duty Tax", rate: rates.excise, desc: "General consumption duty channelled into national government central financial development pools." },
    { name: "Road Maintenance Levy", rate: rates.roadMaint, desc: "Collected strictly for the Kenya Roads Board (KRB) to fund highway infrastructure upgrades." },
    { name: "Petroleum Development Levy", rate: rates.pdl, desc: "Special development pool financing resource cushions used for consumer price stabilization." },
    { name: "Petroleum Regulatory Levy", rate: rates.reg, desc: "Direct financing capital funding EPRA's everyday market monitoring and compliance enforcement operations." },
    { name: "Railway Development Levy", rate: rates.railway, desc: "Allocated to the construction, management, and continuous growth of the standard gauge network lines." },
    { name: "Anti-Adulteration Levy", rate: rates.antiAdulteration, desc: "Levied on Kerosene to prevent its illegal commercial mixing into automotive diesel supplies." },
    { name: "Merchant Shipping Fees", rate: rates.shipping, desc: "Finances regional maritime customs tracking and port safety protocols." },
    { name: "Import Declaration Fee (IDF)", rate: rates.idf, desc: "Customs processing fee levied during bulk import documentation clearance." },
    { name: "Value Added Tax (VAT)", rate: rates.vat, desc: "Statutory transaction tax capped at a special concessionary threshold of 8% for the energy sector." }
  ];

  const totalTaxesPerLitre = taxItems.reduce((acc, item) => acc + (item.rate * simFactor), 0);

  return (
    <div className="govuk-!-margin-bottom-8">
      <table className="govuk-table">
        <caption className="govuk-table__caption govuk-table__caption--m">Itemized Cost Apportionment Table</caption>
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th scope="col" className="govuk-table__header">Structural Formula Component</th>
            <th scope="col" className="govuk-table__header govuk-table__header--numeric">Rate / Litre</th>
            <th scope="col" className="govuk-table__header govuk-table__header--numeric">Total Cost</th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          
          {/* Baseline Landed Indicator Block */}
          <tr className="govuk-table__row" style={{ background: '#f8f8f8' }}>
            <th scope="row" className="govuk-table__header" colSpan={3}>1. Base Import Logistics (Mombasa Port Landing Price)</th>
          </tr>
          <tr className="govuk-table__row" style={{ borderLeft: '4px solid #005ea5' }}>
            <td className="govuk-table__cell" style={{ paddingLeft: '15px' }}>
              <strong>Weighted Average Landed Cost (a)</strong>
              <span className="govuk-hint" style={{ fontSize: '12px', display: 'block', marginTop: '2px' }}>The baseline product procurement cost on the international market before offloading</span>
            </td>
            <td className="govuk-table__cell govuk-table__cell--numeric" style={{ fontWeight: 'bold' }}>KSh {rates.landed.toFixed(2)}</td>
            <td className="govuk-table__cell govuk-table__cell--numeric" style={{ fontWeight: 'bold' }}>KSh {(computedLiters * rates.landed).toFixed(2)}</td>
          </tr>

          {/* Storage & Transit Rows Disaggregation */}
          <tr className="govuk-table__row" style={{ background: '#f8f8f8' }}>
            <th scope="row" className="govuk-table__header" colSpan={3}>2. Storage &amp; Distribution Details (b)</th>
          </tr>
          <tr className="govuk-table__row">
            <td className="govuk-table__cell" style={{ paddingLeft: '20px' }}>Pipeline Transport Tariff (Mombasa port to Nairobi main depot network)</td>
            <td className="govuk-table__cell govuk-table__cell--numeric">KSh {rates.pipeline.toFixed(2)}</td>
            <td className="govuk-table__cell govuk-table__cell--numeric">KSh {(computedLiters * rates.pipeline).toFixed(2)}</td>
          </tr>
          <tr className="govuk-table__row">
            <td className="govuk-table__cell" style={{ paddingLeft: '20px' }}>Pipeline Operational Volumetric Shrinkage Losses</td>
            <td className="govuk-table__cell govuk-table__cell--numeric">KSh {rates.pipeLoss.toFixed(2)}</td>
            <td className="govuk-table__cell govuk-table__cell--numeric">KSh {(computedLiters * rates.pipeLoss).toFixed(2)}</td>
          </tr>
          <tr className="govuk-table__row">
            <td className="govuk-table__cell" style={{ paddingLeft: '20px' }}>Primary Storage Depot Transshipment Handling Losses</td>
            <td className="govuk-table__cell govuk-table__cell--numeric">KSh {rates.depotLoss.toFixed(2)}</td>
            <td className="govuk-table__cell govuk-table__cell--numeric">KSh {(computedLiters * rates.depotLoss).toFixed(2)}</td>
          </tr>
          <tr className="govuk-table__row">
            <td className="govuk-table__cell" style={{ paddingLeft: '20px' }}>Local Truck Tanker Distribution (within 40km station radius)</td>
            <td className="govuk-table__cell govuk-table__cell--numeric">KSh {rates.delivery.toFixed(2)}</td>
            <td className="govuk-table__cell govuk-table__cell--numeric">KSh {(computedLiters * rates.delivery).toFixed(2)}</td>
          </tr>
          <tr className="govuk-table__row" style={{ fontWeight: '500' }}>
            <td className="govuk-table__cell" style={{ paddingLeft: '20px' }}><em>Subtotal Storage &amp; Distribution Cost</em></td>
            <td className="govuk-table__cell govuk-table__cell--numeric"><em>KSh {totalStorageDist.toFixed(2)}</em></td>
            <td className="govuk-table__cell govuk-table__cell--numeric"><em>KSh {(computedLiters * totalStorageDist).toFixed(2)}</em></td>
          </tr>

          {/* Margins Disaggregation */}
          <tr className="govuk-table__row" style={{ background: '#f8f8f8' }}>
            <th scope="row" className="govuk-table__header" colSpan={3}>3. Wholesale &amp; Retail Marketing Margins (c)</th>
          </tr>
          <tr className="govuk-table__row">
            <td className="govuk-table__cell" style={{ paddingLeft: '20px' }}>Wholesale Sourcing Importer Margin</td>
            <td className="govuk-table__cell govuk-table__cell--numeric">KSh {rates.importer.toFixed(2)}</td>
            <td className="govuk-table__cell govuk-table__cell--numeric">KSh {(computedLiters * rates.importer).toFixed(2)}</td>
          </tr>
          <tr className="govuk-table__row">
            <td className="govuk-table__cell" style={{ paddingLeft: '20px' }}>Retail Station Operator Investment &amp; Overhead Margin</td>
            <td className="govuk-table__cell govuk-table__cell--numeric">KSh {rates.dealer.toFixed(2)}</td>
            <td className="govuk-table__cell govuk-table__cell--numeric">KSh {(computedLiters * rates.dealer).toFixed(2)}</td>
          </tr>
          <tr className="govuk-table__row" style={{ fontWeight: '500' }}>
            <td className="govuk-table__cell" style={{ paddingLeft: '20px' }}><em>Subtotal Oil Marketing Companies Margins</em></td>
            <td className="govuk-table__cell govuk-table__cell--numeric"><em>KSh {totalMargins.toFixed(2)}</em></td>
            <td className="govuk-table__cell govuk-table__cell--numeric"><em>KSh {(computedLiters * totalMargins).toFixed(2)}</em></td>
          </tr>

          {/* Subsidy Overlay */}
          {rates.subsidy !== 0 && (
            <>
              <tr className="govuk-table__row" style={{ background: '#f8f8f8' }}>
                <th scope="row" className="govuk-table__header" colSpan={3}>4. Price Stabilization Framework (d)</th>
              </tr>
              <tr className="govuk-table__row">
                <td className="govuk-table__cell" style={{ paddingLeft: '20px', color: '#00703c', fontWeight: 'bold' }}>Petroleum Development Fund State Cushion Offset</td>
                <td className="govuk-table__cell govuk-table__cell--numeric" style={{ color: '#00703c' }}>KSh {rates.subsidy.toFixed(2)}</td>
                <td className="govuk-table__cell govuk-table__cell--numeric" style={{ color: '#00703c' }}>KSh {(computedLiters * rates.subsidy).toFixed(2)}</td>
              </tr>
            </>
          )}

          {/* Taxes Rows */}
          <tr className="govuk-table__row" style={{ background: '#f8f8f8' }}>
            <th scope="row" className="govuk-table__header" colSpan={3}>5. Statutory Fiscal Taxes &amp; Levies (e)</th>
          </tr>
          {taxItems.map((item, idx) => item.rate > 0 && (
            <tr key={idx} className="govuk-table__row">
              <td className="govuk-table__cell" style={{ paddingLeft: '20px' }}>
                <span style={{ fontWeight: '500', display: 'block' }}>{item.name}</span>
                <span className="govuk-hint" style={{ fontSize: '12px', display: 'block', marginTop: '1px', lineHeight: '1.2' }}>{item.desc}</span>
              </td>
              <td className="govuk-table__cell govuk-table__cell--numeric">KSh {(item.rate * simFactor).toFixed(2)}</td>
              <td className="govuk-table__cell govuk-table__cell--numeric">KSh {(computedLiters * item.rate * simFactor).toFixed(2)}</td>
            </tr>
          ))}

          {/* Totals Summary */}
          <tr className="govuk-table__row" style={{ borderTop: '2px solid #0b0c0c', fontWeight: 'bold' }}>
            <th scope="row" className="govuk-table__header">Total Fiscal Taxes &amp; Levies Contribution</th>
            <td className="govuk-table__cell govuk-table__cell--numeric" style={{ color: '#d4351c' }}>KSh {totalTaxesPerLitre.toFixed(2)}</td>
            <td className="govuk-table__cell govuk-table__cell--numeric" style={{ color: '#d4351c' }}>KSh {(computedLiters * totalTaxesPerLitre).toFixed(2)}</td>
          </tr>
          <tr className="govuk-table__row" style={{ background: '#f3f2f1', fontWeight: 'bold', fontSize: '19px' }}>
            <th scope="row" className="govuk-table__header">Final Consumer Pump Retail Cap</th>
            <td className="govuk-table__cell govuk-table__cell--numeric">KSh {simulatedPrice.toFixed(2)}</td>
            <td className="govuk-table__cell govuk-table__cell--numeric">KSh {(computedLiters * simulatedPrice).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: POLICY FISCAL SLIDER SIMULATOR
// =========================================================================
// function TaxSimulationDashboard({ taxCutPercent, setTaxCutPercent, originalPrice, simulatedPrice, fuelName }: { taxCutPercent: number; setTaxCutPercent: (v: number) => void; originalPrice: number; simulatedPrice: number; fuelName: string }) {
//   return (
//     <div className="govuk-!-margin-bottom-8" style={{ background: '#f3f2f1', border: '3px solid #ffbf47', padding: '20px' }}>
//       <h3 className="govuk-heading-m govuk-!-margin-bottom-2">💡 Policy Tax Reduction Simulator</h3>
//       <p className="govuk-body-s">
//         Adjust this policy simulator slider to calculate how much lower consumer retail prices would drop if Parliament or National Treasury reduced or completely eliminated petroleum taxes.
//       </p>

//       <div className="govuk-form-group govuk-!-margin-top-4" style={{ marginBottom: 0 }}>
//         <label className="govuk-label govuk-!-font-weight-bold" htmlFor="tax-simulation-range">
//           Simulate Fiscal Tax Scale Reduction: <span style={{ color: '#d4351c', fontSize: '20px' }}>{taxCutPercent}% Waived</span>
//         </label>
//         <input 
//           style={{ width: '100%', height: '8px', cursor: 'pointer', display: 'block', marginTop: '15px', marginBottom: '15px' }} 
//           id="tax-simulation-range" type="range" min="0" max="100" step="5" 
//           value={taxCutPercent} onChange={(e) => setTaxCutPercent(parseInt(e.target.value))} 
//         />
//       </div>

//       <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
//         <div style={{ background: '#ffffff', padding: '12px', border: '1px solid #bfc1c3', flex: '1', minWidth: '140px' }}>
//           <span className="govuk-hint" style={{ fontSize: '12px' }}>Official Retail Pump Limit</span>
//           <strong style={{ display: 'block', fontSize: '18px' }}>KSh {originalPrice.toFixed(2)} / L</strong>
//         </div>
//         <div style={{ background: '#ffffff', padding: '12px', border: '1px solid #bfc1c3', flex: '1', minWidth: '140px', borderLeft: '5px solid #00703c' }}>
//           <span className="govuk-hint" style={{ fontSize: '12px', color: '#00703c', fontWeight: 'bold' }}>Simulated Price Under Cut</span>
//           <strong style={{ display: 'block', fontSize: '18px', color: '#00703c' }}>KSh {simulatedPrice.toFixed(2)} / L</strong>
//         </div>
//       </div>
//     </div>
//   );
// }

// =========================================================================
// SUB-COMPONENT: CROSS-BORDER REGIONAL COMPARISON GRID
// =========================================================================
function RegionalComparisonTable({ kePrice, fuelType }: { kePrice: number; fuelType: string }) {
  const regionalData = {
    pms: { uganda: "KSh 225.00 - KSh 240.00", tanzania: "KSh 198.00 - KSh 210.00" },
    ago: { uganda: "KSh 218.00 - KSh 232.00", tanzania: "KSh 190.00 - KSh 204.00" },
    ik:  { uganda: "KSh 185.00 - KSh 198.00", tanzania: "KSh 165.00 - KSh 178.00" }
  };

  const currentRange = regionalData[fuelType as 'pms' | 'ago' | 'ik'] || regionalData.pms;

  return (
    <div className="govuk-!-margin-top-6">
      <table className="govuk-table">
        <caption className="govuk-table__caption govuk-table__caption--m">East African Community (EAC) Price Comparison</caption>
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th scope="col" className="govuk-table__header">Partner State Region</th>
            <th scope="col" className="govuk-table__header govuk-table__header--numeric">Estimated Price Spectrum Range (Equivalent KSh)</th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          <tr className="govuk-table__row" style={{ fontWeight: 'bold', background: '#f8f8f8' }}>
            <td className="govuk-table__cell">🇰🇪 Kenya (Simulated Configuration Model)</td>
            <td className="govuk-table__cell govuk-table__cell--numeric" style={{ color: '#005ea5' }}>KSh {kePrice.toFixed(2)} / L</td>
          </tr>
          <tr className="govuk-table__row">
            <td className="govuk-table__cell">🇺🇬 Uganda (Deregulated Imports Network)</td>
            <td className="govuk-table__cell govuk-table__cell--numeric">{currentRange.uganda} / L</td>
          </tr>
          <tr className="govuk-table__row">
            <td className="govuk-table__cell">🇹🇿 Tanzania (Subsidized Port Freight Corridors)</td>
            <td className="govuk-table__cell govuk-table__cell--numeric">{currentRange.tanzania} / L</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
