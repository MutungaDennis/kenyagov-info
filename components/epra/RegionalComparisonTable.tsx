'use client';

export default function RegionalComparisonTable({ kePrice, fuelType }: { kePrice: number; fuelType: string }) {
  // Estimated approximate retail spectrum ranges for cross-border markets in equivalent KSh value
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
            <th scope="col" className="govuk-table__header">Partner State Country</th>
            <th scope="col" className="govuk-table__header govuk-table__header--numeric">Price Spectrum Range (Equivalent KSh / Litre)</th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          <tr className="govuk-table__row" style={{ fontWeight: 'bold', background: '#f8f8f8' }}>
            <td className="govuk-table__cell">🇰🇪 Kenya (Your Current Configured View)</td>
            <td className="govuk-table__cell govuk-table__cell--numeric" style={{ color: '#005ea5' }}>KSh {kePrice.toFixed(2)}</td>
          </tr>
          <tr className="govuk-table__row">
            <td className="govuk-table__cell">🇺🇬 Uganda (Deregulated Open Market Imports)</td>
            <td className="govuk-table__cell govuk-table__cell--numeric">{currentRange.uganda}</td>
          </tr>
          <tr className="govuk-table__row">
            <td className="govuk-table__cell">🇹🇿 Tanzania (Subsidized Port Corridor Tariffs)</td>
            <td className="govuk-table__cell govuk-table__cell--numeric">{currentRange.tanzania}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
