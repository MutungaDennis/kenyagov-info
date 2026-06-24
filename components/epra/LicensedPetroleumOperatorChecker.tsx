'use client';

import { useState } from 'react';
import { createClient } from "@/lib/supabase/client";

interface EnforcementRecord {
  id: string;
  inspection_date: string;
  facility_name: string;
  location_county: string;
  town_or_highway: string;
  offence_type: string;
  offence_details: string;
  penalty_imposed: string;
  current_status: string;
}

export default function LicensedPetroleumOperatorChecker() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('All');
  const [records, setRecords] = useState<EnforcementRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const supabase = createClient();

  // Active county listings based on Kenya devolved structures
  const counties = [
    "All", "Nairobi", "Mombasa", "Kiambu", "Nakuru", "Kisumu", "Eldoret", "Uasin Gishu", "Machakos", "Kajiado", "Garissa", "Mandera", "Kilifi", "Kwale"
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);

    try {
      let query = supabase
        .from('epra_enforcement_log')
        .select('*')
        .order('inspection_date', { ascending: false });

      if (searchQuery.trim() !== '') {
        query = query.ilike('facility_name', `%${searchQuery}%`);
      }

      if (selectedCounty !== 'All') {
        query = query.eq('location_county', selectedCounty);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error executing enforcement lookup:", error);
        setRecords([]);
      } else {
        setRecords(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="govuk-!-margin-top-6 govuk-!-background-white govuk-!-padding-5 govuk-!-border-1">
      <p className="govuk-body">
        Search public compliance safety enforcement logs. Verify if an area petrol station, LPG packaging depot, or transporter has been red-flagged or penalized by EPRA for fuel adulteration or operating without a statutory license.
      </p>

      <form onSubmit={handleSearch} className="govuk-!-margin-bottom-8">
        <div className="govuk-form-group">
          <label className="govuk-label govuk-!-font-weight-bold" htmlFor="operator-search">
            Facility Name / Petrol Station Brand
          </label>
          <div className="govuk-hint" id="search-hint">
            For example, enter the name of an independent retailer or specific highway filling station.
          </div>
          <input 
            className="govuk-input govuk-input--width-20" 
            id="operator-search" 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-describedby="search-hint"
          />
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label govuk-!-font-weight-bold" htmlFor="county-filter">
            Filter by County Location
          </label>
          <select 
            className="govuk-select" 
            id="county-filter" 
            value={selectedCounty}
            onChange={(e) => setSelectedCounty(e.target.value)}
          >
            {counties.map((county, index) => (
              <option key={index} value={county}>{county}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="govuk-button" data-module="govuk-button" disabled={loading}>
          {loading ? 'Searching Registry...' : 'Verify Status & Open Logs'}
        </button>
      </form>

      {hasSearched && (
        <div className="govuk-!-margin-top-6">
          {records.length === 0 ? (
            <div className="govuk-inset-text govuk-!-border-color-green govuk-!-background-grey">
              <h3 className="govuk-heading-s govuk-!-margin-0">No Safety Infractions Recorded</h3>
              <p className="govuk-body-s govuk-!-margin-top-2">
                No active regulatory alerts, contamination shutdowns, or enforcement penalties match your exact parameters. The tracked vendor currently holds a clean operational profile.
              </p>
            </div>
          ) : (
            <div>
              <h3 className="govuk-heading-m govuk-!-margin-bottom-4">Registry Search Results ({records.length})</h3>
              
              {records.map((record) => (
                <div 
                  key={record.id} 
                  className="govuk-!-padding-4 govuk-!-margin-bottom-4 govuk-!-border-1 epra-offence-card" 
                >
                  <span className="govuk-caption-m govuk-!-text-colour-secondary">
                    Inspection Date: {new Date(record.inspection_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <h4 className="govuk-heading-s govuk-!-margin-top-1 govuk-!-margin-bottom-2">
                    {record.facility_name} — {record.town_or_highway} ({record.location_county} County)
                  </h4>
                  
                  <ul className="govuk-list govuk-!-margin-0 govuk-!-font-size-16">
                    <li><strong>Offence Triggered:</strong> <span className="govuk-!-text-colour-red govuk-!-font-weight-bold">{record.offence_type}</span></li>
                    <li className="govuk-!-margin-top-1"><strong>Technical Details:</strong> {record.offence_details}</li>
                    <li className="govuk-!-margin-top-1"><strong>EPRA Penalty Sanction:</strong> {record.penalty_imposed}</li>
                    <li className="govuk-!-margin-top-2">
                      <strong>Current Legal Status:</strong>{' '}
                      <span 
                        className={`govuk-!-font-weight-bold ${record.current_status.toLowerCase().includes('reopened') ? 'govuk-!-text-colour-green' : 'govuk-!-text-colour-red'} govuk-!-background-white govuk-!-padding-1 govuk-!-border-1`}
                      >
                        {record.current_status}
                      </span>
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
