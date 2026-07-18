'use client';

import React, { useState } from 'react';
import { FileText, Edit2, CheckCircle, AlertCircle, Loader2, X, Link as LinkIcon, HelpCircle } from 'lucide-react';

// Types matching our backend + new supabaseLeaderId
interface Contribution {
  order: number;
  type?: 'spoken' | 'members' | 'procedural' | 'header' | 'mini-header';
  supabaseLeaderId?: string;
  speakerName: string;
  speakerTitle?: string;
  constituency?: string;
  party?: string;
  role?: string;
  speech: string;
  startTime?: string;
  matchStatus?: 'linked' | 'ambiguous' | 'unmatched' | 'skip';
}

interface LeaderCandidate {
  id: string;
  full_name: string;
  constituency?: string | null;
  party?: string | null;
  role?: string | null;
  score: number;
}

interface SpeakerMatchIssue {
  speakerName: string;
  constituency?: string;
  party?: string;
  contributionOrders: number[];
  status: 'ambiguous' | 'unmatched';
  candidates: LeaderCandidate[];
}

interface StructuredHansard {
  contributions: Contribution[];
  suggestedTopics?: string[];
  editorialSummary?: string;
}

interface SaveResponse {
  success: boolean;
  documentId?: string;
  slug?: string;
  title?: string;
  contributionsCount?: number;
  message?: string;
  error?: string;
}

interface LeaderSearchResult {
  id: string;
  full_name: string;
  title?: string;
  constituency?: string;
  party?: string;
  role?: string;
  house?: string;
}

export type UploadPanelProps = {
  embedded?: boolean;
};

export default function HansardUploadPanel({ embedded = false }: UploadPanelProps = {}) {
  const [houseType, setHouseType] = useState<'national-assembly' | 'senate' | 'county-assembly'>('national-assembly');
  const [sittingDate, setSittingDate] = useState('');
  const [title, setTitle] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [structuredData, setStructuredData] = useState<StructuredHansard | null>(null);
  const [matchIssues, setMatchIssues] = useState<SpeakerMatchIssue[]>([]);
  const [matchStats, setMatchStats] = useState<{ linked: number; ambiguous: number; unmatched: number } | null>(null);
  const [editingContribution, setEditingContribution] = useState<Contribution | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<SaveResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Leader search states
  const [leaderSearchResults, setLeaderSearchResults] = useState<LeaderSearchResult[]>([]);
  const [isSearchingLeaders, setIsSearchingLeaders] = useState(false);
  const [showLeaderDropdown, setShowLeaderDropdown] = useState(false);
  const [issueSearchQuery, setIssueSearchQuery] = useState<Record<string, string>>({});
  const [issueSearchResults, setIssueSearchResults] = useState<Record<string, LeaderSearchResult[]>>({});
  const [issueSearching, setIssueSearching] = useState<Record<string, boolean>>({});

  // Auto-generate title when date or house changes
  React.useEffect(() => {
    if (sittingDate) {
      const dateObj = new Date(sittingDate);
      const formattedDate = dateObj.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const houseLabel =
        houseType === 'national-assembly' ? 'National Assembly' :
        houseType === 'senate' ? 'Senate' : 'County Assembly';

      setTitle(`${houseLabel} Hansard — ${formattedDate}`);
    }
  }, [sittingDate, houseType]);

  const issueKey = (issue: SpeakerMatchIssue) =>
    `${issue.speakerName}::${issue.constituency || ''}`;

  // Process pasted text with Grok
  const handleProcess = async () => {
    if (pastedText.trim().length < 50) {
      setError('Paste at least 50 characters of Hansard text');
      return;
    }
    if (!sittingDate) {
      setError('Please select the sitting date');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setStructuredData(null);
    setMatchIssues([]);
    setMatchStats(null);
    setSaveResult(null);

    try {
      setProcessingStep('Grok is reading the Hansard (ignoring disclaimers)…');

      const response = await fetch('/api/hansard/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          houseType,
          text: pastedText.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.structured) {
        throw new Error(result.error || 'Processing failed');
      }

      setStructuredData(result.structured);
      setMatchIssues(Array.isArray(result.matchIssues) ? result.matchIssues : []);
      setMatchStats(result.matchStats || null);
      setProcessingStep('');

      setTimeout(() => {
        const resolveEl = document.getElementById('match-resolve-section');
        const previewEl = document.getElementById('preview-section');
        (resolveEl || previewEl)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to process Hansard. Please try again.',
      );
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  /** Apply a leader choice to all contributions for a match issue */
  const resolveMatchIssue = (issue: SpeakerMatchIssue, leader: {
    id: string;
    full_name: string;
    constituency?: string | null;
    party?: string | null;
    role?: string | null;
  }) => {
    if (!structuredData) return;

    const orderSet = new Set(issue.contributionOrders);
    const nameNorm = issue.speakerName.trim().toLowerCase();

    const updated = structuredData.contributions.map((c) => {
      const matchesOrder = orderSet.has(c.order);
      const matchesName =
        c.speakerName.trim().toLowerCase() === nameNorm ||
        c.speakerName.trim().toLowerCase().includes(nameNorm) ||
        nameNorm.includes(c.speakerName.trim().toLowerCase());

      if (!matchesOrder && !matchesName) return c;

      // Prefer order match; for name-only still update if same extracted name
      if (!matchesOrder && c.speakerName.trim().toLowerCase() !== nameNorm) {
        return c;
      }

      return {
        ...c,
        supabaseLeaderId: leader.id,
        speakerName: leader.full_name || c.speakerName,
        constituency: leader.constituency || c.constituency,
        party: leader.party || c.party,
        role: leader.role || c.role,
        matchStatus: 'linked' as const,
      };
    });

    setStructuredData({ ...structuredData, contributions: updated });
    setMatchIssues((prev) => prev.filter((i) => issueKey(i) !== issueKey(issue)));
    setMatchStats((prev) =>
      prev
        ? {
            linked: prev.linked + 1,
            ambiguous: Math.max(0, prev.ambiguous - (issue.status === 'ambiguous' ? 1 : 0)),
            unmatched: Math.max(0, prev.unmatched - (issue.status === 'unmatched' ? 1 : 0)),
          }
        : prev,
    );
  };

  const skipMatchIssue = (issue: SpeakerMatchIssue) => {
    setMatchIssues((prev) => prev.filter((i) => issueKey(i) !== issueKey(issue)));
  };

  const searchLeadersForIssue = async (issue: SpeakerMatchIssue, query: string) => {
    const key = issueKey(issue);
    setIssueSearchQuery((q) => ({ ...q, [key]: query }));
    if (query.length < 2) {
      setIssueSearchResults((r) => ({ ...r, [key]: [] }));
      return;
    }
    setIssueSearching((s) => ({ ...s, [key]: true }));
    try {
      const res = await fetch(`/api/leaders/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setIssueSearchResults((r) => ({ ...r, [key]: data.leaders || [] }));
      }
    } catch (err) {
      console.error('Leader search failed', err);
    } finally {
      setIssueSearching((s) => ({ ...s, [key]: false }));
    }
  };

  // Open edit modal for a contribution
  const openEditModal = (contrib: Contribution, index: number) => {
    setEditingContribution({ ...contrib });
    setEditIndex(index);
    setLeaderSearchResults([]);
    setShowLeaderDropdown(false);
    setIsSearchingLeaders(false);
  };

  const saveEditedContribution = () => {
    if (!editingContribution || editIndex === null || !structuredData) return;

    const updated = [...structuredData.contributions];
    updated[editIndex] = {
      ...editingContribution,
      matchStatus: editingContribution.supabaseLeaderId ? 'linked' : editingContribution.matchStatus,
    };

    setStructuredData({
      ...structuredData,
      contributions: updated,
    });

    setEditingContribution(null);
    setEditIndex(null);
    setLeaderSearchResults([]);
    setShowLeaderDropdown(false);
  };

  const closeEditModal = () => {
    setEditingContribution(null);
    setEditIndex(null);
    setLeaderSearchResults([]);
    setShowLeaderDropdown(false);
  };

  const handlePublishToSanity = async () => {
    if (!structuredData || !sittingDate || !title) {
      setError('Missing required information');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        houseType,
        sittingDate,
        title,
        status: 'publish' as const,
        isActive: true,
        contributions: structuredData.contributions.map((c, i) => ({
          order: c.order || i + 1,
          type: c.type || ('spoken' as const),
          supabaseLeaderId: c.supabaseLeaderId || undefined,
          speakerName: c.speakerName,
          speakerTitle: c.speakerTitle,
          constituency: c.constituency,
          party: c.party,
          role: c.role,
          speech: c.speech,
          startTime: c.startTime,
        })),
        editorialSummary: structuredData.editorialSummary,
      };

      const res = await fetch('/api/hansard/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: SaveResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save to Sanity');
      }

      setSaveResult(data);

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);

    } catch (err: any) {
      setError(err.message || 'Failed to publish to Sanity');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartOver = () => {
    setPastedText('');
    setStructuredData(null);
    setMatchIssues([]);
    setMatchStats(null);
    setSaveResult(null);
    setError(null);
    setProcessingStep('');
    setLeaderSearchResults([]);
    setShowLeaderDropdown(false);
    setIssueSearchQuery({});
    setIssueSearchResults({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (!editingContribution) return;

    setEditingContribution({
      ...editingContribution,
      supabaseLeaderId: leader.id,
      speakerName: leader.full_name || '',
      speakerTitle: leader.title || editingContribution.speakerTitle || '',
      constituency: leader.constituency || editingContribution.constituency || '',
      party: leader.party || editingContribution.party || '',
      role: leader.role || editingContribution.role || '',
      matchStatus: 'linked',
    });
    setShowLeaderDropdown(false);
    setLeaderSearchResults([]);
  };

  const unlinkLeader = () => {
    if (!editingContribution) return;
    setEditingContribution({
      ...editingContribution,
      supabaseLeaderId: undefined,
      matchStatus: 'unmatched',
    });
  };

  const getPartyColor = (party?: string) => {
    if (!party) return 'bg-gray-100 text-gray-700';
    const p = party.toLowerCase();
    if (p.includes('odm')) return 'bg-orange-100 text-orange-700';
    if (p.includes('uda')) return 'bg-blue-100 text-blue-700';
    if (p.includes('jubilee')) return 'bg-yellow-100 text-yellow-700';
    if (p.includes('anc')) return 'bg-green-100 text-green-700';
    return 'bg-purple-100 text-purple-700';
  };

  const linkedCount = structuredData
    ? structuredData.contributions.filter((c) => c.supabaseLeaderId).length
    : 0;

  return (
    <div className={embedded ? "" : "min-h-screen bg-gray-50 py-8"}>
      <div className={embedded ? "" : "max-w-5xl mx-auto px-4"}>

        {/* Header */}
        <div className="mb-6">
          <h2 className="govuk-heading-m govuk-!-margin-bottom-2">
            Paste Hansard (Grok)
          </h2>
          <p className="govuk-body">
            Paste the Hansard text (copy from PDF or website). Grok extracts speeches,
            skips disclaimers and boilerplate, and matches speakers to Supabase leaders.
            When a name is unclear, you will be asked to pick the right member — constituency
            is used when names vary slightly.
          </p>
        </div>

        {/* Success Banner */}
        {saveResult && saveResult.success && (
          <div className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex items-start gap-4">
              <div className="p-1 bg-emerald-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-emerald-800 text-lg">Hansard Published Successfully!</h3>
                <p className="text-emerald-700 mt-1">
                  {saveResult.contributionsCount} contributions saved as <strong>{saveResult.title}</strong>
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {sittingDate && (
                    <a
                      href={`/government/legislature/hansard/${houseType}/${sittingDate}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-emerald-300 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-50"
                    >
                      View public page
                    </a>
                  )}
                  <button
                    onClick={handleStartOver}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                  >
                    Create another sitting
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 text-red-700 text-sm">{error}</div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Form Card */}
        {!saveResult && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

            {/* Metadata Section */}
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Sitting Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">House / Chamber</label>
                  <select
                    value={houseType}
                    onChange={(e) => setHouseType(e.target.value as any)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="national-assembly">National Assembly</option>
                    <option value="senate">Senate</option>
                    <option value="county-assembly">County Assembly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sitting Date</label>
                  <input
                    type="date"
                    value={sittingDate}
                    onChange={(e) => setSittingDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. National Assembly Hansard — 12 June 2025"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">This will be the public title on CitizenGuide.KE</p>
                </div>
              </div>
            </div>

            {/* Paste Section */}
            <div className="p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Paste Hansard contents</h2>
              <p className="text-sm text-gray-600 mb-4">
                Open the official Hansard PDF or web page, select the proceedings text, and paste it below.
                Grok will strip disclaimers, headers, and other noise, then structure each contribution.
              </p>

              <textarea
                value={pastedText}
                onChange={(e) => {
                  setPastedText(e.target.value);
                  setStructuredData(null);
                  setMatchIssues([]);
                  setMatchStats(null);
                }}
                rows={14}
                placeholder={`Paste Hansard text here, for example:

The Temporary Speaker (Hon. Martha Wangari): Order, hon. Members.

The Hon. John Kiarie, MP for Dagoretti South (UDA): Thank you, Temporary Speaker. I rise to…

Hon. Members: Put the question!

…`}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                <p className="text-xs text-gray-500">
                  {pastedText.trim().length.toLocaleString()} characters
                  {pastedText.trim().length > 0 && pastedText.trim().length < 50
                    ? ' (need at least 50)'
                    : ''}
                  {' · '}Requires <code>XAI_API_KEY</code>
                </p>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleProcess}
                  disabled={pastedText.trim().length < 50 || !sittingDate || isProcessing}
                  className="w-full md:w-auto flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-all active:scale-[0.985]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {processingStep || 'Processing...'}
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" /> Extract with Grok
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center md:text-left">
                  Speakers are auto-matched using name and constituency. You will be prompted
                  when a match is unclear. Review before publishing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Match resolution — Grok asks for help */}
        {structuredData && !saveResult && matchIssues.length > 0 && (
          <div id="match-resolve-section" className="mt-8">
            <div className="bg-amber-50 rounded-2xl shadow-sm border border-amber-200 overflow-hidden">
              <div className="px-8 py-5 border-b border-amber-200 flex items-start gap-3">
                <HelpCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-lg font-semibold text-amber-900">
                    Help match these speakers
                  </h2>
                  <p className="text-sm text-amber-800 mt-1">
                    Grok found {matchIssues.length} speaker
                    {matchIssues.length === 1 ? '' : 's'} that need your confirmation.
                    Names can vary slightly — pick the correct member (constituency is shown
                    to help). Or search the database.
                  </p>
                  {matchStats && (
                    <p className="text-xs text-amber-700 mt-2">
                      Auto-linked: {matchStats.linked} · Needs review: {matchStats.ambiguous} ·
                      No match: {matchStats.unmatched}
                    </p>
                  )}
                </div>
              </div>

              <div className="divide-y divide-amber-100">
                {matchIssues.map((issue) => {
                  const key = issueKey(issue);
                  return (
                    <div key={key} className="px-8 py-5 bg-white/60">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="font-semibold text-gray-900 text-base">
                            {issue.speakerName}
                          </div>
                          <div className="text-sm text-gray-600 mt-0.5">
                            {[issue.constituency, issue.party].filter(Boolean).join(' · ') ||
                              'No constituency in Hansard'}
                            {issue.contributionOrders?.length ? (
                              <span className="text-gray-400">
                                {' '}
                                · #{issue.contributionOrders.slice(0, 8).join(', #')}
                                {issue.contributionOrders.length > 8 ? '…' : ''}
                              </span>
                            ) : null}
                          </div>
                          <span
                            className={`inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${
                              issue.status === 'ambiguous'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {issue.status === 'ambiguous' ? 'Ambiguous match' : 'Not found'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => skipMatchIssue(issue)}
                          className="text-xs text-gray-500 hover:text-gray-800"
                        >
                          Skip for now
                        </button>
                      </div>

                      {issue.candidates.length > 0 && (
                        <div className="space-y-1.5 mb-3">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Suggested matches
                          </p>
                          {issue.candidates.map((cand) => (
                            <button
                              key={cand.id}
                              type="button"
                              onClick={() => resolveMatchIssue(issue, cand)}
                              className="w-full text-left flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-gray-200 bg-white hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
                            >
                              <div>
                                <div className="font-medium text-gray-900 text-sm">
                                  {cand.full_name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {[cand.constituency, cand.party].filter(Boolean).join(' · ')}
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-gray-400">
                                score {cand.score}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Search leaders database
                        </label>
                        <input
                          type="text"
                          value={issueSearchQuery[key] || ''}
                          onChange={(e) => searchLeadersForIssue(issue, e.target.value)}
                          placeholder="Type a name or constituency…"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        {issueSearching[key] && (
                          <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Searching…
                          </div>
                        )}
                        {(issueSearchResults[key] || []).length > 0 && (
                          <div className="mt-1 max-h-40 overflow-auto border border-gray-200 rounded-lg bg-white divide-y">
                            {issueSearchResults[key].map((leader) => (
                              <button
                                key={leader.id}
                                type="button"
                                onClick={() =>
                                  resolveMatchIssue(issue, {
                                    id: leader.id,
                                    full_name: leader.full_name,
                                    constituency: leader.constituency,
                                    party: leader.party,
                                    role: leader.role,
                                  })
                                }
                                className="w-full text-left px-3 py-2 hover:bg-emerald-50 text-sm"
                              >
                                <span className="font-medium">{leader.full_name}</span>
                                <span className="text-xs text-gray-500 block">
                                  {[leader.constituency, leader.party].filter(Boolean).join(' · ')}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Preview Section */}
        {structuredData && !saveResult && (
          <div id="preview-section" className="mt-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

              <div className="px-8 py-6 border-b bg-gray-50 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Preview & Edit Contributions</h2>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {structuredData.contributions.length} contributions · {linkedCount} linked to leaders
                    {matchIssues.length > 0
                      ? ` · ${matchIssues.length} still need matching above`
                      : ''}
                    {' · '}Click <strong>Edit</strong> to re-link any speaker
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-semibold text-emerald-600 tabular-nums">
                    {structuredData.contributions.length}
                  </div>
                  <div className="text-xs text-gray-500 -mt-1">CONTRIBUTIONS</div>
                </div>
              </div>

              {structuredData.editorialSummary && (
                <div className="px-8 py-4 bg-emerald-50/50 border-b border-emerald-100 text-sm text-gray-700">
                  <span className="font-medium text-emerald-800">Summary: </span>
                  {structuredData.editorialSummary}
                </div>
              )}

              <div className="divide-y divide-gray-100">
                {structuredData.contributions.map((contrib, index) => (
                  <div key={index} className="px-8 py-6 group hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="font-mono text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                            #{contrib.order}
                          </div>
                          {contrib.type && contrib.type !== 'spoken' && (
                            <span className="text-[10px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                              {contrib.type}
                            </span>
                          )}
                          <div className="font-semibold text-lg text-gray-900">
                            {contrib.speakerTitle ? `${contrib.speakerTitle} ` : ''}{contrib.speakerName}
                          </div>

                          {contrib.supabaseLeaderId && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                              <LinkIcon className="w-3 h-3" /> LINKED
                            </span>
                          )}
                          {!contrib.supabaseLeaderId && contrib.matchStatus === 'ambiguous' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              NEEDS MATCH
                            </span>
                          )}
                          {!contrib.supabaseLeaderId && contrib.matchStatus === 'unmatched' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                              UNMATCHED
                            </span>
                          )}

                          {contrib.party && (
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getPartyColor(contrib.party)}`}>
                              {contrib.party}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                          {contrib.constituency && <span>{contrib.constituency}</span>}
                          {contrib.role && <span className="text-emerald-600 font-medium">{contrib.role}</span>}
                          {contrib.startTime && <span className="text-gray-400">• {contrib.startTime}</span>}
                        </div>

                        <div className="mt-3 text-sm text-gray-700 line-clamp-3 pr-4">
                          {contrib.speech.length > 280
                            ? contrib.speech.substring(0, 280) + '...'
                            : contrib.speech}
                        </div>
                      </div>

                      <button
                        onClick={() => openEditModal(contrib, index)}
                        className="opacity-60 group-hover:opacity-100 flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-8 py-5 bg-gray-50 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={handleStartOver}
                  className="text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Start over
                </button>

                <button
                  onClick={handlePublishToSanity}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold px-8 py-3 rounded-xl text-base transition-all min-w-[260px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Publishing to Sanity...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" /> Publish {structuredData.contributions.length} Contributions to Sanity
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500 mt-4">
              All edits (including leader links) are saved locally until you publish.
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal with Searchable Leader Dropdown */}
      {editingContribution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">

            <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
              <div>
                <div className="font-semibold text-lg">Edit Contribution #{editingContribution.order}</div>
                <div className="text-sm text-gray-500">Correct details or link to official leader record</div>
              </div>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5" /> LINK TO LEADER (from Supabase leaders table)
                  </label>
                  {editingContribution.supabaseLeaderId && (
                    <button
                      onClick={unlinkLeader}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Unlink
                    </button>
                  )}
                </div>

                {editingContribution.supabaseLeaderId ? (
                  <div className="text-sm text-emerald-700 font-medium flex items-center gap-2">
                    ✓ Linked to official leader record
                    <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                      {editingContribution.supabaseLeaderId.slice(0, 8)}...
                    </span>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Search by name or constituency…"
                      className="w-full border border-emerald-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      onChange={(e) => searchLeaders(e.target.value)}
                      onFocus={() => {
                        if (leaderSearchResults.length > 0) setShowLeaderDropdown(true);
                      }}
                    />

                    {showLeaderDropdown && leaderSearchResults.length > 0 && (
                      <div className="mt-1 max-h-56 overflow-auto border border-emerald-200 rounded-lg bg-white shadow-xl z-50 divide-y">
                        {leaderSearchResults.map((leader) => (
                          <button
                            key={leader.id}
                            type="button"
                            onClick={() => selectLeader(leader)}
                            className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors flex flex-col gap-0.5"
                          >
                            <div className="font-semibold text-gray-900">{leader.full_name}</div>
                            <div className="text-xs text-gray-500">
                              {[leader.constituency, leader.party, leader.role].filter(Boolean).join(' • ')}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {isSearchingLeaders && (
                      <div className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin" /> Searching leaders table...
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">SPEAKER FULL NAME</label>
                  <input
                    type="text"
                    value={editingContribution.speakerName}
                    onChange={(e) => setEditingContribution({ ...editingContribution, speakerName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">HONORIFIC / TITLE</label>
                  <input
                    type="text"
                    value={editingContribution.speakerTitle || ''}
                    onChange={(e) => setEditingContribution({ ...editingContribution, speakerTitle: e.target.value })}
                    placeholder="Hon., Dr., Rt. Hon., etc."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">CONSTITUENCY / COUNTY</label>
                  <input
                    type="text"
                    value={editingContribution.constituency || ''}
                    onChange={(e) => setEditingContribution({ ...editingContribution, constituency: e.target.value })}
                    placeholder="e.g. Kibra Constituency"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">POLITICAL PARTY</label>
                  <input
                    type="text"
                    value={editingContribution.party || ''}
                    onChange={(e) => setEditingContribution({ ...editingContribution, party: e.target.value })}
                    placeholder="e.g. ODM, UDA, Jubilee Party"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">OFFICIAL ROLE / POSITION</label>
                <input
                  type="text"
                  value={editingContribution.role || ''}
                  onChange={(e) => setEditingContribution({ ...editingContribution, role: e.target.value })}
                  placeholder="e.g. Speaker, Deputy Speaker, Leader of the Majority Party"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">FULL SPEECH</label>
                <textarea
                  value={editingContribution.speech}
                  onChange={(e) => setEditingContribution({ ...editingContribution, speech: e.target.value })}
                  rows={6}
                  className="w-full max-h-48 overflow-auto text-sm border border-gray-200 rounded-lg p-3 text-gray-700 whitespace-pre-wrap focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={closeEditModal}
                className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={saveEditedContribution}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
