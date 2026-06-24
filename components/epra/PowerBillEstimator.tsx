'use client';

import { useState } from 'react';

export default function PowerBillEstimator() {
  const [calcMode, setCalcMode] = useState<'tokens' | 'bill'>('tokens');
  const [inputValue, setInputValue] = useState<string>('1000');

  // Input sanitization
  const monetarySpend = calcMode === 'tokens' ? (parseFloat(inputValue) || 0) : 0;
  const targetedKwh = calcMode === 'bill' ? (parseFloat(inputValue) || 0) : 0;

  // Static EPRA Regulatory Cost constants
  const FCC = 3.20;      // Fuel Cost Charge per kWh
  const FX = 1.05;       // Forex Adjustment per kWh
  const INFLATION = 0.35; // Inflation adjustment per kWh
  const WRA = 0.02;      // Water Resource Levy per kWh
  const EPRA_LEVY = 0.08; // EPRA Regulatory fee per kWh

  // Function to calculate exact bill breakdown given a specific kWh volume
  const calculateBreakdownForKwh = (kwh: number) => {
    // 1. Determine Base Energy Tariff based on Consumption Band Tier
    let baseRate = 16.30; // Default Domestic Ordinary
    if (kwh <= 30) {
      baseRate = 12.22; // Domestic Lifeline Subsidized
    } else if (kwh > 100) {
      baseRate = 20.95; // High Consumption Premium
    }

    const baseCost = kwh * baseRate;
    
    // 2. Compute Variable EPRA Pass-through Costs
    const fuelCost = kwh * FCC;
    const forexCost = kwh * FX;
    const inflationCost = kwh * INFLATION;
    const wraCost = kwh * WRA;
    const epraCost = kwh * EPRA_LEVY;

    // 3. Compute Government Taxes & Levies
    const repCost = baseCost * 0.05; // REP is strictly 5% of Base Energy Cost
    
    // VAT is 16% applied to Energy + Pass-throughs + EPRA Levy (Excludes REP)
    const vatVatableAmount = baseCost + fuelCost + forexCost + inflationCost + epraCost;
    const vatCost = vatVatableAmount * 0.16;

    const totalBillAmount = baseCost + fuelCost + forexCost + inflationCost + wraCost + epraCost + repCost + vatCost;

    return {
      baseRate,
      baseCost,
      fuelCost,
      forexCost,
      inflationCost,
      wraCost,
      epraCost,
      repCost,
      vatCost,
      totalBillAmount
    };
  };

  // Reverse Engineering Token Math: Iterative approach to find matching kWh for a cash target
  const estimateKwhForTokens = (cashAmount: number) => {
    if (cashAmount <= 0) return { kwh: 0, breakdown: null };
    
    let low = 0;
    let high = cashAmount; // Upper bound safe approximation
    let estimatedKwh = 0;
    let finalBreakdown = null;

    // Binary search convergence over 20 iterations for absolute mathematical precision
    //  CORRECTED TYPE-SAFE CODE:
for (let i = 0; i < 20; i++) {
  const mid = (low + high) / 2;
  const result = calculateBreakdownForKwh(mid);
  
  // Cleaned up the loose property name to strictly match camelCase
  if (result.totalBillAmount > cashAmount) {
    high = mid;
  } else {
    low = mid;
    estimatedKwh = mid;
    finalBreakdown = result;
  }
}


    return { kwh: estimatedKwh, breakdown: finalBreakdown };
  };

  // Execute computation depending on selected toggles
  let displayKwh = 0;
  let breakdown = null;

  if (calcMode === 'bill') {
    displayKwh = targetedKwh;
    breakdown = calculateBreakdownForKwh(targetedKwh);
  } else {
    const tokenCalc = estimateKwhForTokens(monetarySpend);
    displayKwh = tokenCalc.kwh;
    breakdown = tokenCalc.breakdown;
  }

  return (
    <div className="govuk-!-margin-top-6 govuk-!-background-white govuk-!-padding-5 govuk-!-border-1">
      
      <div className="govuk-form-group">
        <fieldset className="govuk-fieldset">
          <legend className="govuk-fieldset__legend govuk-!-font-weight-bold">What would you like to estimate?</legend>
          <div className="govuk-radios govuk-radios--inline govuk-radios--small">
            <div className="govuk-radios__item">
              <input className="govuk-radios__input" id="estimator-tokens" type="radio" checked={calcMode === 'tokens'} onChange={() => setCalcMode('tokens')} />
              <label className="govuk-label govuk-radios__label" htmlFor="estimator-tokens">Prepaid Token Purchase (KSh)</label>
            </div>
            <div className="govuk-radios__item">
              <input className="govuk-radios__input" id="estimator-bill" type="radio" checked={calcMode === 'bill'} onChange={() => setCalcMode('bill')} />
              <label className="govuk-label govuk-radios__label" htmlFor="estimator-bill">Postpaid Monthly Bill (kWh)</label>
            </div>
          </div>
        </fieldset>
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label govuk-!-font-weight-bold" htmlFor="estimator-input">
          {calcMode === 'tokens' ? 'Enter Total Cash Amount (KSh)' : 'Enter Target Monthly Consumption (Kilowatt-hours / Units)'}
        </label>
        <input className="govuk-input govuk-input--width-10" id="estimator-input" type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
      </div>

      {displayKwh > 0 && breakdown && (
        <div className="govuk-!-margin-top-6">
          
          <div className="govuk-inset-text govuk-!-border-color-blue govuk-!-background-grey">
            <h3 className="govuk-heading-s govuk-!-margin-0">Electricity Billing Forecast</h3>
            <p className="govuk-body-m govuk-!-margin-top-2">
              {calcMode === 'tokens' ? (
                <>Spending <strong>KSh {monetarySpend.toFixed(2)}</strong> yields approximately <strong>{displayKwh.toFixed(2)} Units (kWh)</strong>.</>
              ) : (
                <>Consuming <strong>{targetedKwh.toFixed(2)} Units</strong> results in an estimated bill of <strong>KSh {breakdown.totalBillAmount.toFixed(2)}</strong>.</>
              )}
            </p>
            <p className="govuk-body-s govuk-!-margin-bottom-0 govuk-!-text-colour-secondary">
              Current Tier: {displayKwh <= 30 ? 'Domestic Lifeline (Subsidized)' : displayKwh <= 100 ? 'Domestic Ordinary' : 'Domestic Premium (High Usage)'}
            </p>
          </div>

          <table className="govuk-table">
            <caption className="govuk-table__caption govuk-table__caption--m">Itemized Invoice Breakdown</caption>
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th scope="col" className="govuk-table__header">Cost Element</th>
                <th scope="col" className="govuk-table__header govuk-table__header--numeric">Computation Base</th>
                <th scope="col" className="govuk-table__header govuk-table__header--numeric">Total (KSh)</th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header">Base Energy Consumption Charge</th>
                <td className="govuk-table__cell govuk-table__cell--numeric">{displayKwh.toFixed(1)} kWh × KSh {breakdown.baseRate.toFixed(2)}</td>
                <td className="govuk-table__cell govuk-table__cell--numeric">KSh {breakdown.baseCost.toFixed(2)}</td>
              </tr>
              
              {/* EPRA Pass-Through Section */}
              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header">Fuel Energy Cost Charge (FCC)</th>
                <td className="govuk-table__cell govuk-table__cell--numeric">{displayKwh.toFixed(1)} kWh × KSh {FCC.toFixed(2)}</td>
                <td className="govuk-table__cell govuk-table__cell--numeric">KSh {breakdown.fuelCost.toFixed(2)}</td>
              </tr>
              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header">Forex Fluctuation Adjustment (FX)</th>
                <td className="govuk-table__cell govuk-table__cell--numeric">{displayKwh.toFixed(1)} kWh × KSh {FX.toFixed(2)}</td>
                <td className="govuk-table__cell govuk-table__cell--numeric">KSh {breakdown.forexCost.toFixed(2)}</td>
              </tr>
              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header">Inflation &amp; WRA Levies</th>
                <td className="govuk-table__cell govuk-table__cell--numeric">{displayKwh.toFixed(1)} kWh × KSh {(INFLATION + WRA).toFixed(2)}</td>
                <td className="govuk-table__cell govuk-table__cell--numeric">KSh {(breakdown.inflationCost + breakdown.wraCost).toFixed(2)}</td>
              </tr>

              {/* Taxes Section */}
              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header">Rural Electrification (REP) Levy</th>
                <td className="govuk-table__cell govuk-table__cell--numeric">5% of Base Energy Cost</td>
                <td className="govuk-table__cell govuk-table__cell--numeric">KSh {breakdown.repCost.toFixed(2)}</td>
              </tr>
              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header">EPRA Regulatory Oversight Levy</th>
                <td className="govuk-table__cell govuk-table__cell--numeric">{displayKwh.toFixed(1)} kWh × KSh {EPRA_LEVY.toFixed(2)}</td>
                <td className="govuk-table__cell govuk-table__cell--numeric">KSh {breakdown.epraCost.toFixed(2)}</td>
              </tr>
              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header">Value Added Tax (VAT)</th>
                <td className="govuk-table__cell govuk-table__cell--numeric">16% on Energy &amp; Pass-throughs</td>
                <td className="govuk-table__cell govuk-table__cell--numeric">KSh {breakdown.vatCost.toFixed(2)}</td>
              </tr>

              {/* Total Summary */}
              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header govuk-!-font-size-19">Total Out-of-Pocket Cost</th>
                <td className="govuk-table__cell govuk-table__cell--numeric"></td>
                <td className="govuk-table__cell govuk-table__cell--numeric govuk-!-font-weight-bold govuk-!-font-size-19 govuk-!-border-bottom-2">
                  KSh {(calcMode === 'tokens' ? monetarySpend : breakdown.totalBillAmount).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="govuk-inset-text govuk-!-padding-2 govuk-!-margin-top-3">
            <p className="govuk-body-s govuk-!-margin-0 govuk-!-text-colour-secondary">
              <strong>Notice:</strong> This calculation uses the gazetted multi-year electricity tariffs and baseline monthly adjustments regulated by EPRA. Actual token strings might slightly vary based on KPLC administrative reconciliation windows.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
