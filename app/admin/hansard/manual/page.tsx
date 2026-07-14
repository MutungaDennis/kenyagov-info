'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Link as LinkIcon, Loader2 } from 'lucide-react';

/** Managed Sanity Studio (not embedded in this Next app) */
function studioDocUrl(documentId: string) {
  const base = (
    process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ||
    `https://www.sanity.io/manage/project/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'egkekbgr'}`
  ).replace(/\/$/, '');
  // Structure tool deep-link works on *.sanity.studio; Manage falls back to project home
  if (base.includes('sanity.studio')) {
    return `${base}/structure/hansardSitting;${documentId}`;
  }
  return base;
}

type ContributionType = 'spoken' | 'procedural' | 'header';

interface Contribution {
  order: number;
  type: ContributionType;
  supabaseLeaderId?: string;
  speakerName: string;
  speakerTitle?: string;
  constituency?: string;
  party?: string;
  role?: string;
  speech: any; // Can be string or Portable Text array from Sanity
  startTime?: string;
  sectionHeader?: string;
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
    type: 'spoken',
    speakerName: '',
    speech: '',
  });

  const [leaderSearchResults, setLeaderSearchResults] = useState<LeaderSearchResult[]>([]);
  const [isSearchingLeaders, setIsSearchingLeaders] = useState(false);
  const [showLeaderDropdown, setShowLeaderDropdown] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // For loading existing sittings
  const [existingDocumentId, setExistingDocumentId] = useState<string | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [loadDate, setLoadDate] = useState('');
  const [loadHouse, setLoadHouse] = useState<'national-assembly' | 'senate' | 'county-assembly'>('national-assembly');

  // Helper: Convert Portable Text (from Sanity) to plain text for safe display
  const portableTextToPlain = (blocks: any): string => {
    if (!blocks) return '';
    if (typeof blocks === 'string') return blocks;
    if (!Array.isArray(blocks)) return '';

    return blocks
      .map((block: any) => {
        if (block._type === 'block' && block.children) {
          return block.children.map((child: any) => child.text || '').join('');
        }
        return '';
      })
      .join(' ')
      .trim();
  };

  const getPublicUrl = () => {
    const { houseType, sittingDate } = sitting;
    if (!sittingDate) return '#';
    if (houseType === 'national-assembly') return `/legislature/hansard/national-assembly/${sittingDate}`;
    if (houseType === 'senate') return `/legislature/hansard/senate/${sittingDate}`;
    if (houseType === 'county-assembly') return `/legislature/hansard/county-assemblies/${sittingDate}`;
    return `/legislature/hansard/${sittingDate}`;
  };

  // ==================== LOAD EXISTING SITTING ====================
  const loadExistingSitting = async () => {
    if (!loadDate) {
      alert('Please select a date');
      return;
    }

    setIsLoadingExisting(true);

    try {
      const res = await fetch(`/api/hansard/load-existing?date=${loadDate}&houseType=${loadHouse}`);
      const data = await res.json();

      if (!data.exists) {
        alert('No sitting found for that date and house.');
        setIsLoadingExisting(false);
        return;
      }

      const loaded = data.sitting;

      // Auto-fill the form
      setSitting({
        title: loaded.title || '',
        sittingDate: loaded.sittingDate,
        houseType: loaded.houseType,
        sittingPeriod: loaded.sittingPeriod || 'Morning Sitting',
        parliamentaryTerm: loaded.parliamentaryTerm || '13th Parliament (2022–2027)',
        youtubeUrl: loaded.youtubeUrl || '',
        editorialSummary: loaded.editorialSummary || '',
      });

      setContributions(loaded.contributions || []);
      setExistingDocumentId(loaded._id);

      alert(`Loaded existing sitting with ${loaded.contributions?.length || 0} contributions. You can now add more.`);
    } catch (error) {
      console.error(error);
      alert('Failed to load existing sitting');
    } finally {
      setIsLoadingExisting(false);
    }
  };

  const openAddModal = () => {
    const nextOrder = contributions.length > 0 
      ? Math.max(...contributions.map(c => c.order)) + 1 
      : 1;

    setCurrentContribution({ order: nextOrder, type: 'spoken', speakerName: '', speech: '' });
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
    const type = currentContribution.type;

    if (type === 'header') {
      if (!currentContribution.sectionHeader?.trim()) {
        alert('Section / Order of Business is required for Section Headers.');
        return;
      }
    } else if (type === 'procedural') {
      if (!currentContribution.speech.trim()) {
        alert('Content is required for Procedural Notes.');
        return;
      }
    } else if (type === 'spoken') {
      if (!currentContribution.speakerName.trim() || !currentContribution.speech.trim()) {
        alert('Speaker Name and Content are required for Spoken contributions.');
        return;
      }
    }

    if (editingIndex !== null) {
      const updated = [...contributions];
      updated[editingIndex] = currentContribution;
      setContributions(updated);
    } else {
      setContributions([...contributions, currentContribution]);
    }

    setModalOpen(false);
    setCurrentContribution({ order: 1, type: 'spoken', speakerName: '', speech: '' });
    setEditingIndex(null);
    setLeaderSearchResults([]);
    setShowLeaderDropdown(false);
  };

  const deleteContribution = (index: number) => {
    if (!confirm('Delete this contribution?')) return;
    setContributions(contributions.filter((_, i) => i !== index));
  };

  const moveContribution = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= contributions.length) return;

    const updated = [...contributions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setContributions(updated.map((c, i) => ({ ...c, order: i + 1 })));
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
          type: c.type,
          supabaseLeaderId: c.supabaseLeaderId || undefined,
          speakerName: c.speakerName.trim(),
          speakerTitle: c.speakerTitle?.trim() || '',
          constituency: c.constituency?.trim() || '',
          party: c.party?.trim() || '',
          role: c.role?.trim() || '',
          speech: c.speech,
          startTime: c.startTime?.trim() || '',
          sectionHeader: c.sectionHeader?.trim() || '',
        })),
        existingDocumentId: existingDocumentId || undefined,
      };

      const res = await fetch('/api/hansard/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      setSuccessData(data);
      setShowSuccessBanner(true);
      setContributions([]);
    } catch (error: any) {
      alert('Error saving: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const continueWithSameSitting = () => {
    setShowSuccessBanner(false);
    setSuccessData(null);
  };

  const startNewSitting = () => {
    window.location.reload();
  };

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
      speakerTitle: leader.title || '',
      constituency: leader.constituency || '',
      party: leader.party || '',
      role: leader.role || '',
    });
    setShowLeaderDropdown(false);
    setLeaderSearchResults([]);
  };

  const unlinkLeader = () => {
    setCurrentContribution({ ...currentContribution, supabaseLeaderId: undefined });
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">Manual Hansard Entry</h1>
        <p className="govuk-body-l">
          Upload real Hansard sittings. Use <strong>Section Header</strong> and <strong>Procedural Note</strong> for non-spoken content.
        </p>

        {/* Load Existing Sitting Section */}
        <div className="govuk-inset-text govuk-!-margin-bottom-6" style={{ backgroundColor: '#f3f8f4', borderLeft: '5px solid #1d70b8' }}>
          <h3 className="govuk-heading-s govuk-!-margin-bottom-2">Continue Working on an Existing Sitting</h3>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label className="govuk-label">Sitting Date</label>
                <input type="date" className="govuk-input" value={loadDate} onChange={(e) => setLoadDate(e.target.value)} />
              </div>
            </div>
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label className="govuk-label">House</label>
                <select className="govuk-select" value={loadHouse} onChange={(e) => setLoadHouse(e.target.value as any)}>
                  <option value="national-assembly">National Assembly</option>
                  <option value="senate">Senate</option>
                  <option value="county-assembly">County Assembly</option>
                </select>
              </div>
            </div>
          </div>
          <button onClick={loadExistingSitting} disabled={isLoadingExisting || !loadDate} className="govuk-button">
            {isLoadingExisting ? 'Loading...' : 'Load Existing Sitting & Continue'}
          </button>
          {existingDocumentId && (
            <p className="govuk-body-s govuk-!-margin-top-2" style={{ color: '#137a3a' }}>
              ✓ Currently editing existing sitting
            </p>
          )}
        </div>

        {/* Success Banner */}
        {showSuccessBanner && successData && (
          <div className="govuk-inset-text" style={{ backgroundColor: '#e6f4ea', borderLeft: '6px solid #137a3a', padding: '20px 24px', marginBottom: '32px' }}>
            <h2 className="govuk-heading-m" style={{ color: '#137a3a', marginBottom: '8px' }}>
              ✅ Sitting {successData.action === 'updated' ? 'Updated' : 'Published'} Successfully
            </h2>
            <p className="govuk-body" style={{ marginBottom: '4px' }}><strong>{successData.title}</strong></p>
            <p className="govuk-body-s" style={{ color: '#505a5f', marginBottom: '16px' }}>
              {sitting.houseType.replace('-', ' ')} • {sitting.sittingDate} • {successData.contributionsCount} contributions
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={continueWithSameSitting} className="govuk-button">Continue adding more</button>
              <Link href={getPublicUrl()} target="_blank" className="govuk-button govuk-button--secondary">View on Public Site →</Link>
              <a href={studioDocUrl(successData.documentId)} target="_blank" rel="noopener noreferrer" className="govuk-button govuk-button--secondary">Edit in Sanity Studio</a>
              <button onClick={startNewSitting} className="govuk-button govuk-button--secondary">Start a new sitting</button>
            </div>
          </div>
        )}

        {/* Sitting Details */}
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

        {/* Contributions Table */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="govuk-heading-m" style={{ marginBottom: 0 }}>
                Contributions ({contributions.length})
              </h2>
              <button onClick={openAddModal} className="govuk-button">+ Add Contribution</button>
            </div>

            {contributions.length === 0 ? (
              <div className="govuk-inset-text">No contributions added yet. Click "+ Add Contribution" to start.</div>
            ) : (
              <table className="govuk-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>Order</th>
                    <th style={{ width: '110px' }}>Type</th>
                    <th>Speaker / Section</th>
                    <th>Content</th>
                    <th style={{ width: '140px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.sort((a,b) => a.order - b.order).map((contrib, index) => (
                    <tr key={index}>
                      <td><strong>{contrib.order}</strong></td>
                      <td>
                        {contrib.type === 'spoken' && <span className="govuk-tag govuk-tag--blue">Spoken</span>}
                        {contrib.type === 'procedural' && <span className="govuk-tag govuk-tag--yellow">Procedural</span>}
                        {contrib.type === 'header' && <span className="govuk-tag govuk-tag--grey">Header</span>}
                      </td>
                      <td>
                        {contrib.sectionHeader && <div style={{ fontWeight: 600, color: '#1d70b8' }}>{contrib.sectionHeader}</div>}
                        {contrib.speakerTitle && <span style={{ color: '#505a5f' }}>{contrib.speakerTitle} </span>}
                        <strong>{contrib.speakerName || '—'}</strong>
                        {contrib.supabaseLeaderId && <span style={{ marginLeft: '6px', fontSize: '11px', background: '#e6f4ea', color: '#137a3a', padding: '1px 5px', borderRadius: '3px' }}>LINKED</span>}
                      </td>
                      <td style={{ maxWidth: '380px' }}>
                        {portableTextToPlain(contrib.speech).length > 100 
                          ? portableTextToPlain(contrib.speech).substring(0, 100) + '...' 
                          : portableTextToPlain(contrib.speech)}
                      </td>
                      <td>
                        <button onClick={() => openEditModal(index)} className="govuk-button govuk-button--secondary govuk-!-margin-right-1" style={{ padding: '4px 10px', fontSize: '13px' }}>Edit</button>
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
          <button 
            onClick={handleSaveToSanity} 
            disabled={isSaving || contributions.length === 0} 
            className="govuk-button govuk-button--start" 
            style={{ fontSize: '18px', padding: '14px 32px' }}
          >
            {isSaving ? 'Publishing...' : (existingDocumentId ? 'Update Sitting' : 'Publish to Sanity')}
          </button>
          <p className="govuk-hint govuk-!-margin-top-2">
            {existingDocumentId 
              ? 'This will update the existing sitting with new contributions.' 
              : 'This will create a new sitting.'}
          </p>
        </div>

        {/* Modal */}
        {modalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '4px', width: '90%', maxWidth: '860px', maxHeight: '92vh', overflowY: 'auto' }}>
              <h2 className="govuk-heading-m">{editingIndex !== null ? 'Edit Contribution' : 'Add New Contribution'}</h2>

              {/* Entry Type */}
              <div className="govuk-form-group">
                <label className="govuk-label">Entry Type</label>
                <select className="govuk-select" value={currentContribution.type} onChange={(e) => setCurrentContribution({ ...currentContribution, type: e.target.value as ContributionType })}>
                  <option value="spoken">Spoken Contribution (MP speech)</option>
                  <option value="procedural">Procedural Note (Laughter, consultations, Chair changes, etc.)</option>
                  <option value="header">Section Header (Papers, Bill, Motion, Adjournment, etc.)</option>
                </select>
              </div>

              {/* Section Header */}
              <div className="govuk-form-group">
                <label className="govuk-label">Section / Order of Business</label>
                <input type="text" className="govuk-input" placeholder="e.g. PAPERS LAID or THE SUPPLEMENTARY APPROPRIATION BILL – Second Reading" value={currentContribution.sectionHeader || ''} onChange={(e) => setCurrentContribution({ ...currentContribution, sectionHeader: e.target.value })} />
              </div>

              {/* Leader Search - Only for Spoken */}
              {currentContribution.type === 'spoken' && (
                <div style={{ background: '#f3f8f4', border: '1px solid #cce3d4', padding: '16px', borderRadius: '4px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="govuk-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <LinkIcon size={16} /> Link to Official Leader Record
                    </label>
                    {currentContribution.supabaseLeaderId && <button type="button" onClick={unlinkLeader} style={{ fontSize: '12px', color: '#c62828' }}>Unlink</button>}
                  </div>

                  {currentContribution.supabaseLeaderId ? (
                    <div style={{ color: '#137a3a', fontWeight: 500, fontSize: '14px' }}>✓ Linked to official record. Fields marked * are locked.</div>
                  ) : (
                    <>
                      <input type="text" className="govuk-input" placeholder="Search leader name..." onChange={(e) => searchLeaders(e.target.value)} onFocus={() => leaderSearchResults.length > 0 && setShowLeaderDropdown(true)} />
                      {isSearchingLeaders && <div style={{ fontSize: '13px', color: '#137a3a', marginTop: '6px' }}><Loader2 size={14} className="animate-spin" /> Searching...</div>}
                      {showLeaderDropdown && leaderSearchResults.length > 0 && (
                        <div style={{ marginTop: '6px', border: '1px solid #ccc', borderRadius: '4px', maxHeight: '220px', overflowY: 'auto', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                          {leaderSearchResults.map((leader) => (
                            <button key={leader.id} type="button" onClick={() => selectLeader(leader)} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: 'white', cursor: 'pointer', borderBottom: '1px solid #eee' }}>
                              <div style={{ fontWeight: 600 }}>{leader.full_name}</div>
                              <div style={{ fontSize: '12px', color: '#505a5f' }}>{[leader.constituency, leader.party, leader.role].filter(Boolean).join(' • ')}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Speaker Name - Only for Spoken */}
              {currentContribution.type === 'spoken' && (
                <div className="govuk-form-group">
                  <label className="govuk-label">Speaker Full Name *</label>
                  <input type="text" className="govuk-input" value={currentContribution.speakerName} onChange={(e) => setCurrentContribution({ ...currentContribution, speakerName: e.target.value })} />
                </div>
              )}

              {/* Locked fields for Spoken */}
              {currentContribution.type === 'spoken' && (
                <>
                  <div className="govuk-grid-row">
                    <div className="govuk-grid-column-one-half">
                      <div className="govuk-form-group">
                        <label className="govuk-label">Title / Honorific *</label>
                        <input type="text" className="govuk-input" value={currentContribution.speakerTitle || ''} onChange={(e) => setCurrentContribution({ ...currentContribution, speakerTitle: e.target.value })} disabled={!!currentContribution.supabaseLeaderId} />
                      </div>
                    </div>
                    <div className="govuk-grid-column-one-half">
                      <div className="govuk-form-group">
                        <label className="govuk-label">Constituency / County *</label>
                        <input type="text" className="govuk-input" value={currentContribution.constituency || ''} onChange={(e) => setCurrentContribution({ ...currentContribution, constituency: e.target.value })} disabled={!!currentContribution.supabaseLeaderId} />
                      </div>
                    </div>
                  </div>

                  <div className="govuk-grid-row">
                    <div className="govuk-grid-column-one-half">
                      <div className="govuk-form-group">
                        <label className="govuk-label">Political Party *</label>
                        <input type="text" className="govuk-input" value={currentContribution.party || ''} onChange={(e) => setCurrentContribution({ ...currentContribution, party: e.target.value })} disabled={!!currentContribution.supabaseLeaderId} />
                      </div>
                    </div>
                    <div className="govuk-grid-column-one-half">
                      <div className="govuk-form-group">
                        <label className="govuk-label">Role / Position *</label>
                        <input type="text" className="govuk-input" value={currentContribution.role || ''} onChange={(e) => setCurrentContribution({ ...currentContribution, role: e.target.value })} disabled={!!currentContribution.supabaseLeaderId} />
                      </div>
                    </div>
                  </div>

                  {currentContribution.supabaseLeaderId && <p className="govuk-hint" style={{ fontSize: '13px', marginTop: '-8px', marginBottom: '16px' }}>Fields marked * are locked to the official database record.</p>}
                </>
              )}

              {/* Order + Start Time */}
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-half">
                  <div className="govuk-form-group">
                    <label className="govuk-label">Order</label>
                    <input type="number" className="govuk-input" value={currentContribution.order} onChange={(e) => setCurrentContribution({ ...currentContribution, order: parseInt(e.target.value) })} />
                  </div>
                </div>
                <div className="govuk-grid-column-one-half">
                  <div className="govuk-form-group">
                    <label className="govuk-label">Start Time (optional)</label>
                    <input type="text" className="govuk-input" placeholder="10:23" value={currentContribution.startTime || ''} onChange={(e) => setCurrentContribution({ ...currentContribution, startTime: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="govuk-form-group">
                <label className="govuk-label">
                  {currentContribution.type === 'header' ? 'Content (optional)' : currentContribution.type === 'procedural' ? 'Procedural Note Content *' : 'Full Speech / Contribution *'}
                </label>
                <textarea 
                  className="govuk-textarea" 
                  rows={currentContribution.type === 'header' ? 4 : 10} 
                  value={currentContribution.speech} 
                  onChange={(e) => setCurrentContribution({ ...currentContribution, speech: e.target.value })} 
                  placeholder={
                    currentContribution.type === 'header' 
                      ? 'You can leave this empty or write a short note' 
                      : currentContribution.type === 'procedural' 
                      ? 'e.g. (Laughter) or (Loud consultations) or [The Temporary Speaker left the Chair]' 
                      : 'Paste the full speech here...'
                  } 
                />
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