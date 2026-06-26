'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Link as LinkIcon, Loader2, X } from 'lucide-react';

interface Contribution {
  order: number;
  supabaseLeaderId?: string;           // NEW
  speakerName: string;
  speakerTitle?: string;
  constituency?: string;
  party?: string;
  role?: string;
  speech: string;
  startTime?: string;
}

interface SittingForm {
  title: string;
  sittingDate: string;
  houseType: 'national-assembly' | 'senate' | 'county-assembly';
  sittingPeriod: string;
  parliamentaryTerm: string;
  youtubeUrl?: string;
  editorialSummary?: string;
}

interface LeaderSearchResult {
  id: string;
  full_name: string;
  title?: string;
  constituency?: string;
  party?: string;
  role?: string;
}

export default function ManualHansardEntry() {
  const [sitting, setSitting] = useState<SittingForm>({
    title: '',
    sittingDate: '',
    houseType: 'national-assembly',
    sittingPeriod: 'Morning Sitting',
    parliamentaryTerm: '13th Parliament (2022–2027)',
    youtubeUrl: '',
    editorialSummary: '',
  });

  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentContribution, setCurrentContribution] = useState<Contribution>({
    order: 1,
    speakerName: '',
    speech: '',
  });

  // Leader search state
  const [leaderSearchResults, setLeaderSearchResults] = useState<LeaderSearchResult[]>([]);
  const [isSearchingLeaders, setIsSearchingLeaders] = useState(false);
  const [showLeaderDropdown, setShowLeaderDropdown] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const openAddModal = () => {
    const nextOrder = contributions.length > 0 
      ? Math.max(...contributions.map(c => c.order)) + 1 
      : 1;

    setCurrentContribution({
      order: nextOrder,
      speakerName: '',
      speech: '',
    });
    setEditingIndex(null);
    setLeaderSearchResults([]);
    setShowLeaderDropdown(false);
    setModalOpen(true);
  };

  const openEditModal = (index: number) => {
    setCurrentContribution({ ...contributions[index] });
    setEditingIndex(index);
    setLeaderSearchResults([]);
    setShowLeaderDropdown(false);
    setModalOpen(true);
  };

  const saveContribution = () => {
    if (!currentContribution.speakerName.trim() || !currentContribution.speech.trim()) {
      alert('Speaker Name and Speech are required.');
      return;
    }

    if (editingIndex !== null) {
      const updated = [...contributions];
      updated[editingIndex] = currentContribution;
      setContributions(updated);
    } else {
      setContributions([...contributions, currentContribution]);
    }

    setModalOpen(false);
    setCurrentContribution({ order: 1, speakerName: '', speech: '' });
    setEditingIndex(null);
    setLeaderSearchResults([]);
    setShowLeaderDropdown(false);
  };

  const deleteContribution = (index: number) => {
    if (!confirm('Delete this contribution?')) return;
    const updated = contributions.filter((_, i) => i !== index);
    setContributions(updated);
  };

  const moveContribution = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= contributions.length) return;

    const updated = [...contributions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    const renumbered = updated.map((c, i) => ({ ...c, order: i + 1 }));
    setContributions(renumbered);
  };

  const handleSaveToSanity = async () => {
    if (!sitting.title || !sitting.sittingDate) {
      alert('Please fill in Title and Sitting Date.');
      return;
    }
    if (contributions.length === 0) {
      alert('Please add at least one contribution.');
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        houseType: sitting.houseType,
        sittingDate: sitting.sittingDate,
        title: sitting.title,
        sittingPeriod: sitting.sittingPeriod,
        parliamentaryTerm: sitting.parliamentaryTerm,
        youtubeUrl: sitting.youtubeUrl || undefined,
        editorialSummary: sitting.editorialSummary || undefined,
        contributions: contributions.map(c => ({
          order: c.order,
          supabaseLeaderId: c.supabaseLeaderId || undefined,   // NEW
          speakerName: c.speakerName.trim(),
          speakerTitle: c.speakerTitle?.trim() || '',
          constituency: c.constituency?.trim() || '',
          party: c.party?.trim() || '',
          role: c.role?.trim() || '',
          speech: c.speech.trim(),
          startTime: c.startTime?.trim() || '',
        })),
      };

      const res = await fetch('/api/hansard/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      setSuccessData(data);
    } catch (error: any) {
      alert('Error saving: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Search leaders from Supabase
  const searchLeaders = async (query: string) => {
    if (query.length < 2) {
      setLeaderSearchResults([]);
      setShowLeaderDropdown(false);
      return;
    }

    setIsSearchingLeaders(true);
    try {
      const res = await fetch(`/api/leaders/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderSearchResults(data.leaders || []);
        setShowLeaderDropdown(true);
      }
    } catch (err) {
      console.error('Leader search failed', err);
    } finally {
      setIsSearchingLeaders(false);
    }
  };

  const selectLeader = (leader: LeaderSearchResult) => {
    setCurrentContribution({
      ...currentContribution,
      supabaseLeaderId: leader.id,
      speakerName: leader.full_name || '',
      speakerTitle: leader.title || currentContribution.speakerTitle || '',
      constituency: leader.constituency || currentContribution.constituency || '',
      party: leader.party || currentContribution.party || '',
      role: leader.role || currentContribution.role || '',
    });
    setShowLeaderDropdown(false);
    setLeaderSearchResults([]);
  };

  const unlinkLeader = () => {
    setCurrentContribution({
      ...currentContribution,
      supabaseLeaderId: undefined,
    });
  };

  if (successData) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper">
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <h1 className="govuk-heading-xl">✅ Hansard Sitting Published</h1>
            <p className="govuk-body-l">{successData.title}</p>
            
            <div className="govuk-inset-text">
              {successData.contributionsCount} contributions saved successfully.
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href={`/legislature/hansard/${successData.slug}`} target="_blank" className="govuk-button">
                View on Public Site
              </Link>
              <a href={`https://your-sanity-studio-url.sanity.studio/desk/hansardSitting;${successData.documentId}`} target="_blank" className="govuk-button govuk-button--secondary">
                Edit in Sanity Studio
              </a>
              <button onClick={() => window.location.reload()} className="govuk-button govuk-button--secondary">
                Create Another Sitting
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">Manual Hansard Entry</h1>
        <p className="govuk-body-l">Add or create Hansard sittings and contributions manually. Use the leader search to link speakers to the official records.</p>

        {/* Sitting Metadata */}
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-heading-m">Sitting Details</h2>
            
            <div className="govuk-form-group">
              <label className="govuk-label">Sitting Title *</label>
              <input type="text" className="govuk-input" value={sitting.title} onChange={(e) => setSitting({ ...sitting, title: e.target.value })} placeholder="e.g. Thursday, 18 June 2026 – Morning Sitting" />
            </div>

            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-half">
                <div className="govuk-form-group">
                  <label className="govuk-label">Sitting Date *</label>
                  <input type="date" className="govuk-input" value={sitting.sittingDate} onChange={(e) => setSitting({ ...sitting, sittingDate: e.target.value })} />
                </div>
              </div>
              <div className="govuk-grid-column-one-half">
                <div className="govuk-form-group">
                  <label className="govuk-label">House *</label>
                  <select className="govuk-select" value={sitting.houseType} onChange={(e) => setSitting({ ...sitting, houseType: e.target.value as any })}>
                    <option value="national-assembly">National Assembly</option>
                    <option value="senate">Senate</option>
                    <option value="county-assembly">County Assembly</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-half">
                <div className="govuk-form-group">
                  <label className="govuk-label">Sitting Period</label>
                  <select className="govuk-select" value={sitting.sittingPeriod} onChange={(e) => setSitting({...sitting, sittingPeriod: e.target.value})}>
                    <option>Morning Sitting</option><option>Afternoon Sitting</option><option>Evening Sitting</option><option>Special Sitting</option>
                  </select>
                </div>
              </div>
              <div className="govuk-grid-column-one-half">
                <div className="govuk-form-group">
                  <label className="govuk-label">Parliamentary Term</label>
                  <input type="text" className="govuk-input" value={sitting.parliamentaryTerm} onChange={(e) => setSitting({...sitting, parliamentaryTerm: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label">YouTube URL (optional)</label>
              <input type="url" className="govuk-input" value={sitting.youtubeUrl} onChange={(e) => setSitting({...sitting, youtubeUrl: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Contributions Section */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="govuk-heading-m" style={{ marginBottom: 0 }}>Contributions ({contributions.length})</h2>
              <button onClick={openAddModal} className="govuk-button">+ Add Contribution</button>
            </div>

            {contributions.length === 0 ? (
              <div className="govuk-inset-text">No contributions added yet. Click "Add Contribution" to start.</div>
            ) : (
              <table className="govuk-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>Order</th>
                    <th>Speaker</th>
                    <th>Party / Role</th>
                    <th style={{ width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.sort((a, b) => a.order - b.order).map((contrib, index) => (
                    <tr key={index}>
                      <td><strong>{contrib.order}</strong></td>
                      <td>
                        {contrib.speakerTitle && <span style={{ color: '#505a5f' }}>{contrib.speakerTitle} </span>}
                        <strong>{contrib.speakerName}</strong>
                        {contrib.supabaseLeaderId && <span style={{ marginLeft: '8px', fontSize: '11px', background: '#e6f4ea', color: '#137a3a', padding: '1px 6px', borderRadius: '3px' }}>LINKED</span>}
                        {contrib.constituency && <div className="govuk-body-s">{contrib.constituency}</div>}
                      </td>
                      <td>
                        {contrib.party && <span className="govuk-tag govuk-tag--blue">{contrib.party}</span>}
                        {contrib.role && <div className="govuk-body-s">{contrib.role}</div>}
                      </td>
                      <td>
                        <button onClick={() => openEditModal(index)} className="govuk-button govuk-button--secondary govuk-!-margin-right-1" style={{ padding: '4px 12px', fontSize: '13px' }}>Edit</button>
                        <button onClick={() => moveContribution(index, 'up')} className="govuk-button govuk-button--secondary" style={{ padding: '4px 8px', fontSize: '13px' }}>↑</button>
                        <button onClick={() => moveContribution(index, 'down')} className="govuk-button govuk-button--secondary" style={{ padding: '4px 8px', fontSize: '13px' }}>↓</button>
                        <button onClick={() => deleteContribution(index)} className="govuk-button govuk-button--warning" style={{ padding: '4px 8px', fontSize: '13px', marginLeft: '4px' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="govuk-!-margin-top-8">
          <button onClick={handleSaveToSanity} disabled={isSaving || contributions.length === 0} className="govuk-button govuk-button--start" style={{ fontSize: '18px', padding: '14px 32px' }}>
            {isSaving ? 'Publishing...' : 'Publish to Sanity'}
          </button>
        </div>

        {/* Modal */}
        {modalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '4px', width: '90%', maxWidth: '820px', maxHeight: '92vh', overflowY: 'auto' }}>
              <h2 className="govuk-heading-m">{editingIndex !== null ? 'Edit Contribution' : 'Add New Contribution'}</h2>

              {/* === SEARCHABLE LEADER DROPDOWN === */}
              <div style={{ background: '#f3f8f4', border: '1px solid #cce3d4', padding: '16px', borderRadius: '4px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="govuk-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LinkIcon size={16} /> Link to Official Leader Record (from Supabase)
                  </label>
                  {currentContribution.supabaseLeaderId && (
                    <button type="button" onClick={unlinkLeader} style={{ fontSize: '12px', color: '#c62828' }}>Unlink</button>
                  )}
                </div>

                {currentContribution.supabaseLeaderId ? (
                  <div style={{ color: '#137a3a', fontWeight: 500, fontSize: '14px' }}>
                    ✓ Linked to official leader record
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      className="govuk-input"
                      placeholder="Search leader name (e.g. Moses Wetang'ula, John Kiarie...)"
                      onChange={(e) => searchLeaders(e.target.value)}
                      onFocus={() => leaderSearchResults.length > 0 && setShowLeaderDropdown(true)}
                    />

                    {isSearchingLeaders && (
                      <div style={{ fontSize: '13px', color: '#137a3a', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Loader2 size={14} className="animate-spin" /> Searching leaders...
                      </div>
                    )}

                    {showLeaderDropdown && leaderSearchResults.length > 0 && (
                      <div style={{ marginTop: '6px', border: '1px solid #ccc', borderRadius: '4px', maxHeight: '220px', overflowY: 'auto', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        {leaderSearchResults.map((leader) => (
                          <button
                            key={leader.id}
                            type="button"
                            onClick={() => selectLeader(leader)}
                            style={{ width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: 'white', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                          >
                            <div style={{ fontWeight: 600 }}>{leader.full_name}</div>
                            <div style={{ fontSize: '12px', color: '#505a5f' }}>
                              {[leader.constituency, leader.party, leader.role].filter(Boolean).join(' • ')}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Rest of the form fields */}
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-half">
                  <div className="govuk-form-group">
                    <label className="govuk-label">Order</label>
                    <input type="number" className="govuk-input" value={currentContribution.order} onChange={(e) => setCurrentContribution({...currentContribution, order: parseInt(e.target.value)})} />
                  </div>
                </div>
                <div className="govuk-grid-column-one-half">
                  <div className="govuk-form-group">
                    <label className="govuk-label">Start Time (optional)</label>
                    <input type="text" className="govuk-input" placeholder="10:23" value={currentContribution.startTime || ''} onChange={(e) => setCurrentContribution({...currentContribution, startTime: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label">Speaker Full Name *</label>
                <input type="text" className="govuk-input" value={currentContribution.speakerName} onChange={(e) => setCurrentContribution({...currentContribution, speakerName: e.target.value})} />
              </div>

              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-half">
                  <div className="govuk-form-group">
                    <label className="govuk-label">Title / Honorific</label>
                    <input type="text" className="govuk-input" placeholder="Hon." value={currentContribution.speakerTitle || ''} onChange={(e) => setCurrentContribution({...currentContribution, speakerTitle: e.target.value})} />
                  </div>
                </div>
                <div className="govuk-grid-column-one-half">
                  <div className="govuk-form-group">
                    <label className="govuk-label">Constituency / County</label>
                    <input type="text" className="govuk-input" value={currentContribution.constituency || ''} onChange={(e) => setCurrentContribution({...currentContribution, constituency: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-half">
                  <div className="govuk-form-group">
                    <label className="govuk-label">Political Party</label>
                    <input type="text" className="govuk-input" placeholder="UDA / ODM / Independent" value={currentContribution.party || ''} onChange={(e) => setCurrentContribution({...currentContribution, party: e.target.value})} />
                  </div>
                </div>
                <div className="govuk-grid-column-one-half">
                  <div className="govuk-form-group">
                    <label className="govuk-label">Role / Position</label>
                    <input type="text" className="govuk-input" placeholder="Speaker, Chair of Committee..." value={currentContribution.role || ''} onChange={(e) => setCurrentContribution({...currentContribution, role: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label">Full Speech / Contribution *</label>
                <textarea className="govuk-textarea" rows={12} value={currentContribution.speech} onChange={(e) => setCurrentContribution({...currentContribution, speech: e.target.value})} placeholder="Paste or type the full speech here..." />
                <div className="govuk-hint">Use normal line breaks for paragraphs. Procedural notes like (Laughter) or (Applause) are welcome.</div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button onClick={saveContribution} className="govuk-button">Save Contribution</button>
                <button onClick={() => { setModalOpen(false); setLeaderSearchResults([]); setShowLeaderDropdown(false); }} className="govuk-button govuk-button--secondary">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}