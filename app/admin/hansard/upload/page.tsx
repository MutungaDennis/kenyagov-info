'use client';

import React, { useState } from 'react';
import { Upload, FileText, Edit2, CheckCircle, AlertCircle, Loader2, X, Link as LinkIcon } from 'lucide-react';

// Types matching our backend + new supabaseLeaderId
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

export default function HansardUploadPage() {
  const [houseType, setHouseType] = useState<'national-assembly' | 'senate' | 'county-assembly'>('national-assembly');
  const [sittingDate, setSittingDate] = useState('');
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [structuredData, setStructuredData] = useState<StructuredHansard | null>(null);
  const [editingContribution, setEditingContribution] = useState<Contribution | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<SaveResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Leader search states (NEW)
  const [leaderSearchResults, setLeaderSearchResults] = useState<LeaderSearchResult[]>([]);
  const [isSearchingLeaders, setIsSearchingLeaders] = useState(false);
  const [showLeaderDropdown, setShowLeaderDropdown] = useState(false);

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

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('File is too large. Maximum size is 50MB.');
      return;
    }
    setSelectedFile(file);
    setError(null);
    setStructuredData(null);
    setSaveResult(null);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  // Process the PDF
  const handleProcess = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file first');
      return;
    }
    if (!sittingDate) {
      setError('Please select the sitting date');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setStructuredData(null);
    setSaveResult(null);

    try {
      setProcessingStep('Uploading PDF to server...');
      
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('houseType', houseType);

      setProcessingStep('Extracting text with LlamaParse (layout-aware)...');
      
      const response = await fetch('/api/hansard/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Processing failed');
      }

      const result = await response.json();

      if (!result.success || !result.structured) {
        throw new Error(result.error || 'No structured data returned');
      }

      setProcessingStep('Structuring speeches with Grok AI...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setStructuredData(result.structured);
      setProcessingStep('');
      
      setTimeout(() => {
        const previewEl = document.getElementById('preview-section');
        previewEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to process Hansard. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Open edit modal for a contribution
  const openEditModal = (contrib: Contribution, index: number) => {
    setEditingContribution({ ...contrib });
    setEditIndex(index);
    // Reset leader search state
    setLeaderSearchResults([]);
    setShowLeaderDropdown(false);
    setIsSearchingLeaders(false);
  };

  // Save edited contribution (includes supabaseLeaderId)
  const saveEditedContribution = () => {
    if (!editingContribution || editIndex === null || !structuredData) return;

    const updated = [...structuredData.contributions];
    updated[editIndex] = editingContribution;

    setStructuredData({
      ...structuredData,
      contributions: updated,
    });

    // Close modal + reset search state
    setEditingContribution(null);
    setEditIndex(null);
    setLeaderSearchResults([]);
    setShowLeaderDropdown(false);
  };

  // Close edit modal without saving
  const closeEditModal = () => {
    setEditingContribution(null);
    setEditIndex(null);
    setLeaderSearchResults([]);
    setShowLeaderDropdown(false);
  };

  // Publish to Sanity (now sends supabaseLeaderId)
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
        contributions: structuredData.contributions, // includes supabaseLeaderId
        editorialSummary: structuredData.editorialSummary,
        suggestedTopics: structuredData.suggestedTopics,
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

  // Reset everything
  const handleStartOver = () => {
    setSelectedFile(null);
    setStructuredData(null);
    setSaveResult(null);
    setError(null);
    setProcessingStep('');
    setLeaderSearchResults([]);
    setShowLeaderDropdown(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Select a leader from search results
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
    });
    setShowLeaderDropdown(false);
    setLeaderSearchResults([]);
  };

  // Unlink leader
  const unlinkLeader = () => {
    if (!editingContribution) return;
    setEditingContribution({
      ...editingContribution,
      supabaseLeaderId: undefined,
    });
  };

  // Format party badge color
  const getPartyColor = (party?: string) => {
    if (!party) return 'bg-gray-100 text-gray-700';
    const p = party.toLowerCase();
    if (p.includes('odm')) return 'bg-orange-100 text-orange-700';
    if (p.includes('uda')) return 'bg-blue-100 text-blue-700';
    if (p.includes('jubilee')) return 'bg-yellow-100 text-yellow-700';
    if (p.includes('anc')) return 'bg-green-100 text-green-700';
    return 'bg-purple-100 text-purple-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-semibold text-gray-900">Upload / Manual Hansard Entry</h1>
          </div>
          <p className="text-gray-600 max-w-2xl">
            Upload a Hansard PDF (AI-assisted) or manually edit contributions. 
            Use the <strong>searchable leader dropdown</strong> to link speakers to the official <code>leaders</code> table in Supabase.
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
                  <a 
                    href={`https://your-sanity-studio-url/desk/hansardSitting;${saveResult.documentId}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-emerald-300 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-50"
                  >
                    View in Sanity Studio
                  </a>
                  <button 
                    onClick={handleStartOver}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                  >
                    Create Another Sitting
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

            {/* Upload Section */}
            <div className="p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Upload Hansard PDF (or use manual editing below)</h2>

              {!selectedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input')?.click()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                    isDragging 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="mx-auto w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-7 h-7 text-gray-500" />
                  </div>
                  <p className="text-lg font-medium text-gray-700">Drop your Hansard PDF here</p>
                  <p className="text-sm text-gray-500 mt-1">or click to browse files</p>
                  <p className="text-xs text-gray-400 mt-3">PDF files up to 50MB • Official parliamentary Hansards work best</p>
                  <input
                    id="file-input"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-lg border">
                      <FileText className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to process
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setStructuredData(null);
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <X className="w-4 h-4" /> Remove
                  </button>
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={handleProcess}
                  disabled={!selectedFile || !sittingDate || isProcessing}
                  className="w-full md:w-auto flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-all active:scale-[0.985]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {processingStep || 'Processing...'}
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" /> Process with Grok + LlamaParse
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center md:text-left">
                  AI-assisted extraction. You can still manually edit every contribution afterward.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Preview Section */}
        {structuredData && !saveResult && (
          <div id="preview-section" className="mt-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              
              <div className="px-8 py-6 border-b bg-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Preview & Edit Contributions</h2>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {structuredData.contributions.length} contributions • Click <strong>Edit</strong> to use the searchable leader dropdown
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-semibold text-emerald-600 tabular-nums">
                    {structuredData.contributions.length}
                  </div>
                  <div className="text-xs text-gray-500 -mt-1">CONTRIBUTIONS</div>
                </div>
              </div>

              {/* Contributions List */}
              <div className="divide-y divide-gray-100">
                {structuredData.contributions.map((contrib, index) => (
                  <div key={index} className="px-8 py-6 group hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="font-mono text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                            #{contrib.order}
                          </div>
                          <div className="font-semibold text-lg text-gray-900">
                            {contrib.speakerTitle ? `${contrib.speakerTitle} ` : ''}{contrib.speakerName}
                          </div>
                          
                          {contrib.supabaseLeaderId && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                              <LinkIcon className="w-3 h-3" /> LINKED
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

              {/* Action Bar */}
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
              
              {/* === SEARCHABLE LEADER DROPDOWN === */}
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
                      placeholder="Search by name (e.g. Moses Wetang'ula, John Kiarie, Gladys Wanga...)"
                      className="w-full border border-emerald-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      onChange={(e) => searchLeaders(e.target.value)}
                      onFocus={() => {
                        if (leaderSearchResults.length > 0) setShowLeaderDropdown(true);
                      }}
                    />

                    {/* Search Results Dropdown */}
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

              {/* Speaker Fields */}
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

              {/* Speech (read-only for now) */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">FULL SPEECH (read-only in this version)</label>
                <div className="max-h-40 overflow-auto text-sm bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-700 whitespace-pre-wrap">
                  {editingContribution.speech}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Speech text is preserved exactly as extracted.</p>
              </div>
            </div>

            {/* Modal Footer */}
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