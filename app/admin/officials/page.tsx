'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminPath } from "@/lib/admin-path";

interface Official {
  id: string;
  full_name: string;
  position_id?: number;
  county?: string;
  political_party_id?: number;
  is_active: boolean;
}

export default function OfficialsAdminPage() {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    position: '',
    county: '',
    party: '',
  });

  useEffect(() => {
    fetchOfficials();
  }, []);

  const fetchOfficials = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/officials');
      if (!response.ok) throw new Error('Failed to fetch officials');
      const data = await response.json();
      setOfficials(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading officials');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/officials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to add official');
      setFormData({ first_name: '', last_name: '', position: '', county: '', party: '' });
      setShowForm(false);
      fetchOfficials();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding official');
    }
  };

  return (
    <div className="govuk-width-container">
      <Link href={adminPath()} className="govuk-back-link">
        Back to Admin
      </Link>

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-xl">Government Officials</h1>
            <p className="govuk-body-l">
              Add, edit, or delete government officials from the database
            </p>

            <button
              onClick={() => setShowForm(!showForm)}
              className="govuk-button"
              style={{ marginTop: '1rem', marginBottom: '2rem' }}
            >
              {showForm ? 'Cancel' : 'Add New Official'}
            </button>

            {showForm && (
              <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
                <div className="govuk-form-group">
                  <label className="govuk-label">First Name</label>
                  <input
                    className="govuk-input"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>

                <div className="govuk-form-group">
                  <label className="govuk-label">Last Name</label>
                  <input
                    className="govuk-input"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>

                <div className="govuk-form-group">
                  <label className="govuk-label">Position</label>
                  <input
                    className="govuk-input"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g., Governor, Senator"
                  />
                </div>

                <div className="govuk-form-group">
                  <label className="govuk-label">County</label>
                  <input
                    className="govuk-input"
                    value={formData.county}
                    onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                    placeholder="e.g., Nairobi, Mombasa"
                  />
                </div>

                <div className="govuk-form-group">
                  <label className="govuk-label">Political Party</label>
                  <input
                    className="govuk-input"
                    value={formData.party}
                    onChange={(e) => setFormData({ ...formData, party: e.target.value })}
                    placeholder="e.g., UDA, ODM"
                  />
                </div>

                <button type="submit" className="govuk-button">
                  Add Official
                </button>
              </form>
            )}

            {error && (
              <div className="govuk-error-summary" role="alert">
                <h2 className="govuk-error-summary__title">{error}</h2>
              </div>
            )}

            {loading ? (
              <p className="govuk-body">Loading officials...</p>
            ) : (
              <>
                <p className="govuk-body">Total officials: {officials.length}</p>

                {officials.length > 0 ? (
                  <table className="govuk-table">
                    <thead className="govuk-table__head">
                      <tr className="govuk-table__row">
                        <th className="govuk-table__header" scope="col">
                          Name
                        </th>
                        <th className="govuk-table__header" scope="col">
                          Position
                        </th>
                        <th className="govuk-table__header" scope="col">
                          County
                        </th>
                        <th className="govuk-table__header" scope="col">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="govuk-table__body">
                      {officials.slice(0, 20).map((official) => (
                        <tr key={official.id} className="govuk-table__row">
                          <td className="govuk-table__cell">{official.full_name}</td>
                          <td className="govuk-table__cell">{official.position_id || 'N/A'}</td>
                          <td className="govuk-table__cell">{official.county || 'N/A'}</td>
                          <td className="govuk-table__cell">
                            <Link href={`/admin/officials/${official.id}/edit`} className="govuk-link">
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="govuk-body">No officials found. Add one to get started.</p>
                )}

                {officials.length > 20 && (
                  <p className="govuk-body" style={{ marginTop: '1rem' }}>
                    Showing 20 of {officials.length} officials. Full list view coming soon.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
