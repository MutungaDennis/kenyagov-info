'use client';

interface BreakdownTableProps {
  rates: any;
  computedLiters: number;
  pumpPrice: number;
  simulatedPrice: number;
  taxCutPercent: number;
}

export default function FuelTaxBreakdownTable({ rates, computedLiters, pumpPrice, simulatedPrice, taxCutPercent }: BreakdownTableProps) {
  const simFactor = 1 - taxCutPercent / 100;

  const rowItems = [
    { name: "Excise Duty Tax", rate: rates.excise, desc: "A general consumption excise tax channelled directly into national government central budgetary allocation streams." },
    { name: "Road Maintenance Levy", rate: rates.roadMaint, desc: "Collected strictly on behalf of the Kenya Roads Board (KRB) to fund maintenance, rehabilitation, and infrastructure network upgrades down-country." },
    { name: "Petroleum Development Levy", rate: rates.pdl, desc: "A special development funding reserve utilized primarily by the state to operate strategic fuel stabilization interventions during global cost crises." },
    { name: "Petroleum Regulatory Levy", rate: rates.reg, desc: "Direct financing capital funding EPRA's everyday compliance audits, pricing operations, and vendor quality enforcement programs." },
    { name: "Railway Development Levy", rate: rates.railway, desc: "Allocated strictly towards the continuous expansion, management, and strategic growth of the localized Standard Gauge Railway network infrastructure." },
    { name: "Anti-Adulteration Levy", rate: rates.antiAdulteration, desc: "Applied selectively on illuminating kerosene rows to discourage malicious commercial mixing loops into automotive diesel shipments." },
    { name: "Merchant Shipping & IDF Fees", rate: rates.shipping + rates.idf, desc: "Combined customs tracking fees financing regional marine logistics tracking infrastructure and the state Import Declaration framework." },
    { name: "Value Added Tax (VAT)", rate: rates.vat, desc: "The statutory value-added calculation locked down at a specialized concessionary rate of 8% for essential petroleum products." }
  ];

  const totalSimulatedTaxes = rowItems.reduce((acc, item) => acc + (item.rate * simFactor), 0);

  return (
    <div className="govuk-!-margin-bottom-8">
      <table className="govuk-table">
        <caption className="govuk-table__caption govuk-table__caption--m">Itemized Taxes &amp; Public Fund Explanations</caption>
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th scope="col" className="govuk-table__header">Statutory Levy Classification</th>
            <th scope="col" className="govuk-table__header govuk-table__header--numeric">Rate / Litre</th>
            <th scope="col" className="govuk-table__header govuk-table__header--numeric">Total Contribution</th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          <tr className="govuk-table__row epra-section-row">
            <td className="govuk-table__cell" colSpan={3}><strong>Base Product Logistics &amp; Margins</strong></td>
          </tr>
          <tr className="govuk-table__row">
            <td className="govuk-table__cell">FOB Landed Price, Storage &amp; Operator Margins</td>
            <td className="govuk-table__cell govuk-table__cell--numeric">KSh {(rates.landed + rates.storage + rates.margins + rates.subsidy).toFixed(2)}</td>
            <td className="govuk-table__cell govuk-table__cell--numeric">KSh {(computedLiters * (rates.landed + rates.storage + rates.margins + rates.subsidy)).toFixed(2)}</td>
          </tr>
          
          <tr className="govuk-table__row epra-section-row">
            <td className="govuk-table__cell" colSpan={3}><strong>Itemized Fiscal Levy Framework</strong></td>
          </tr>
          {rowItems.map((item, idx) => item.rate > 0 && (
            <tr key={idx} className="govuk-table__row">
              <td className="govuk-table__cell">
                <span className="govuk-!-font-weight-bold govuk-!-display-block">{item.name}</span>
                <span className="govuk-hint govuk-!-font-size-13 govuk-!-display-block govuk-!-margin-top-1 govuk-!-line-height-1-3">{item.desc}</span>
              </td>
              <td className="govuk-table__cell govuk-table__cell--numeric">KSh {(item.rate * simFactor).toFixed(2)}</td>
              <td className="govuk-table__cell govuk-table__cell--numeric">KSh {(computedLiters * item.rate * simFactor).toFixed(2)}</td>
            </tr>
          ))}
          <tr className="govuk-table__row epra-total-row govuk-!-border-top-2">
            <th scope="row" className="govuk-table__header">Aggregated Taxes Paid</th>
            <td className="govuk-table__cell govuk-table__cell--numeric govuk-!-text-colour-red">KSh {totalSimulatedTaxes.toFixed(2)}</td>
            <td className="govuk-table__cell govuk-table__cell--numeric govuk-!-text-colour-red">KSh {(computedLiters * totalSimulatedTaxes).toFixed(2)}</td>
          </tr>
          <tr className="govuk-table__row epra-total-row">
            <th scope="row" className="govuk-table__header">Final Consumer Price Tag</th>
            <td className="govuk-table__cell govuk-table__cell--numeric">KSh {simulatedPrice.toFixed(2)}</td>
            <td className="govuk-table__cell govuk-table__cell--numeric">KSh {(computedLiters * simulatedPrice).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
