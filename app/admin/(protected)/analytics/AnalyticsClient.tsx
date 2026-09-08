'use client';

import React, { useState, useMemo } from 'react';
import { aggregateViews, type ViewRow } from '@/lib/supabase/analytics-aggregate';

// Re-export type for local use in this file only (avoids duplicate)
type ViewRowType = ViewRow;

// Types from shared pure aggregator (also match server return shape)
import type { PageStat, DailyStat, WeeklyStat, ReferrerStat, WeekdayStat } from '@/lib/supabase/analytics-aggregate';

interface InitialData {
  totalViews: number;
  uniquePages: number;
  topPages: PageStat[];
  dailyViews: DailyStat[];
  weeklyViews: WeeklyStat[];
  topReferrers: ReferrerStat[];
  weekdayViews: WeekdayStat[];
  allViews: ViewRowType[];
}

interface AnalyticsClientProps {
  initialData: InitialData;
}

const RANGE_OPTIONS = [
  { label: 'Last 7 days', value: '7' as const },
  { label: 'Last 30 days', value: '30' as const },
  { label: 'Last 90 days', value: '90' as const },
  { label: 'All time', value: 'all' as const },
];

function formatNumber(n: number) {
  return n.toLocaleString('en-KE');
}

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AnalyticsClient({ initialData }: AnalyticsClientProps) {
  const [data, setData] = useState<InitialData>(initialData);
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'all' | 'custom'>('30');
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');
  const [pathQuery, setPathQuery] = useState('');
  const [topN, setTopN] = useState<10 | 20 | 50 | 100>(20);
  const [sortKey, setSortKey] = useState<'views' | 'path'>('views');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [chartMode, setChartMode] = useState<'daily' | 'weekly'>('daily');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compute filtered raw views from current filters (GA-like live filtering)
  const filteredViews = useMemo(() => {
    let views = [...(data.allViews || [])];

    // Date filtering
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (dateRange === '7') {
      startDate = new Date(now.getTime() - 7 * 86400000);
    } else if (dateRange === '30') {
      startDate = new Date(now.getTime() - 30 * 86400000);
    } else if (dateRange === '90') {
      startDate = new Date(now.getTime() - 90 * 86400000);
    } else if (dateRange === 'custom') {
      if (customFrom) startDate = new Date(customFrom);
      if (customTo) {
        endDate = new Date(customTo);
        endDate.setHours(23, 59, 59, 999);
      }
    }

    if (startDate) {
      views = views.filter(v => new Date(v.viewed_at) >= startDate!);
    }
    if (endDate) {
      views = views.filter(v => new Date(v.viewed_at) <= endDate!);
    }

    // Path search
    const q = pathQuery.trim().toLowerCase();
    if (q) {
      views = views.filter(v => v.path.toLowerCase().includes(q));
    }

    return views;
  }, [data.allViews, dateRange, customFrom, customTo, pathQuery]);

  // Re-aggregate everything from the filtered set (powerful client-side like GA segments)
  const agg = useMemo(() => aggregateViews(filteredViews), [filteredViews]);

  // Client-side sorted + limited top pages for table + bars
  const sortedTopPages = useMemo(() => {
    const arr = [...agg.topPages];
    arr.sort((a, b) => {
      if (sortKey === 'path') {
        const cmp = a.path.localeCompare(b.path);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      // views
      const cmp = a.views - b.views;
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return arr.slice(0, topN);
  }, [agg.topPages, sortKey, sortDir, topN]);

  const maxTopViews = Math.max(1, ...sortedTopPages.map(p => p.views));

  // Time series for the active chart (use agg)
  const timeSeries = chartMode === 'daily' ? agg.dailyViews : agg.weeklyViews;
  const maxTimeCount = Math.max(1, ...timeSeries.map(d => d.count));

  // Weekday bars (use filtered agg)
  const maxWeekday = Math.max(1, ...agg.weekdayViews.map(w => w.count));

  // Referrers (filtered)
  const maxRef = Math.max(1, ...(agg.topReferrers || []).map(r => r.views));

  // Summary metrics for cards (filtered scope)
  const periodTotal = agg.totalViews;
  const periodUnique = agg.uniquePages;
  const avgDaily = timeSeries.length > 0 ? Math.round(periodTotal / Math.max(1, timeSeries.length)) : periodTotal;
  const topShare = sortedTopPages.length > 0 ? sortedTopPages[0].percentage : 0;

  // Date range label for display
  const rangeLabel = dateRange === 'custom'
    ? (customFrom || customTo ? `Custom: ${customFrom || '…'} → ${customTo || '…'}` : 'Custom range')
    : (RANGE_OPTIONS.find(r => r.value === dateRange)?.label || 'Selected');

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      const mod = await import('@/lib/supabase/analytics');
      const fresh = await mod.getPageViews();
      setData(fresh as any);
      // keep current filters — they will re-apply automatically
    } catch (e) {
      console.error('Refresh failed', e);
      alert('Failed to refresh analytics data. Check console.');
    } finally {
      setIsRefreshing(false);
    }
  }

  function setRange(val: '7' | '30' | '90' | 'all' | 'custom') {
    setDateRange(val);
    if (val !== 'custom') {
      // clear custom dates when switching away
      setCustomFrom('');
      setCustomTo('');
    }
  }

  function applyCustom() {
    setDateRange('custom');
  }

  function resetFilters() {
    setDateRange('30');
    setCustomFrom('');
    setCustomTo('');
    setPathQuery('');
    setTopN(20);
    setSortKey('views');
    setSortDir('desc');
    setChartMode('daily');
  }

  function toggleSort(newKey: 'views' | 'path') {
    if (sortKey === newKey) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(newKey);
      setSortDir(newKey === 'views' ? 'desc' : 'asc');
    }
  }

  function exportCurrent() {
    const rows: string[][] = [
      ['Path', 'Views', '% of filtered', 'Filtered period']
    ];
    sortedTopPages.forEach(p => {
      rows.push([p.path, String(p.views), String(p.percentage) + '%', rangeLabel]);
    });
    const fname = `analytics-top-pages-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCSV(fname, rows);
  }

  // Simple inline SVG trend line for the time series (nice visual)
  function renderTrendLine(series: { count: number }[]) {
    if (!series.length) return null;
    const w = 620;
    const h = 92;
    const pts = series.map((d, i) => {
      const x = (i / Math.max(1, series.length - 1)) * w;
      const y = h - ((d.count / maxTimeCount) * (h - 8)) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    const last = series[series.length - 1];
    return (
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
        {/* subtle grid */}
        <line x1="0" y1={h - 4} x2={w} y2={h - 4} stroke="#b1b4b6" strokeWidth="1" />
        <polyline
          points={pts}
          fill="none"
          stroke="#1d70b8"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* dots */}
        {series.map((d, i) => {
          const x = (i / Math.max(1, series.length - 1)) * w;
          const y = h - ((d.count / maxTimeCount) * (h - 8)) - 4;
          return <circle key={i} cx={x} cy={y} r="2.5" fill="#1d70b8" />;
        })}
        <text x={w - 4} y={14} fontSize="10" fill="#505a5f" textAnchor="end">
          {last.count} views
        </text>
      </svg>
    );
  }

  return (
    <div>
      {/* Header area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 className="govuk-heading-xl" style={{ marginBottom: 4 }}>Analytics</h1>
          <p className="govuk-body-s" style={{ color: '#505a5f', margin: 0 }}>
            Custom GOV.UK-style page views (path + timestamp). Use alongside Google Analytics 4 for sessions, users and demographics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="govuk-button govuk-button--secondary"
            style={{ margin: 0, padding: '6px 14px', fontSize: 14 }}
          >
            {isRefreshing ? 'Refreshing…' : 'Refresh data'}
          </button>
          <button
            onClick={resetFilters}
            className="govuk-button govuk-button--secondary"
            style={{ margin: 0, padding: '6px 14px', fontSize: 14, background: 'transparent', color: '#1d70b8', border: '1px solid #1d70b8' }}
          >
            Reset filters
          </button>
        </div>
      </div>

      {/* Filter bar — Google Analytics style quick controls */}
      <div style={{ 
        background: '#f8f8f8', 
        border: '1px solid #b1b4b6', 
        borderRadius: 4, 
        padding: '12px 16px', 
        marginBottom: 16 
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#505a5f', marginRight: 4 }}>Date range</div>
          {RANGE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              style={{
                padding: '4px 10px',
                border: dateRange === opt.value ? '2px solid #1d70b8' : '1px solid #b1b4b6',
                background: dateRange === opt.value ? '#fff' : '#fff',
                borderRadius: 3,
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: dateRange === opt.value ? 600 : 400,
              }}
            >
              {opt.label}
            </button>
          ))}
          <button
            onClick={() => setRange('custom')}
            style={{
              padding: '4px 10px',
              border: dateRange === 'custom' ? '2px solid #1d70b8' : '1px solid #b1b4b6',
              background: '#fff',
              borderRadius: 3,
              fontSize: 13,
              fontWeight: dateRange === 'custom' ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            Custom
          </button>

          {/* Custom date inputs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
            <input
              type="date"
              value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
              onBlur={applyCustom}
              style={{ fontSize: 13, padding: '3px 6px', border: '1px solid #b1b4b6' }}
            />
            <span style={{ fontSize: 12, color: '#505a5f' }}>to</span>
            <input
              type="date"
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              onBlur={applyCustom}
              style={{ fontSize: 13, padding: '3px 6px', border: '1px solid #b1b4b6' }}
            />
            <button onClick={applyCustom} style={{ fontSize: 12, padding: '2px 8px' }}>Apply</button>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="text"
              placeholder="Filter pages (e.g. /counties)"
              value={pathQuery}
              onChange={e => setPathQuery(e.target.value)}
              style={{ width: 240, fontSize: 14, padding: '6px 10px', border: '1px solid #b1b4b6', borderRadius: 3 }}
            />
            <select
              value={topN}
              onChange={e => setTopN(Number(e.target.value) as any)}
              style={{ fontSize: 13, padding: '5px 8px', border: '1px solid #b1b4b6' }}
            >
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
              <option value={100}>Top 100</option>
            </select>
            <button onClick={exportCurrent} style={{ fontSize: 13, padding: '5px 12px', border: '1px solid #b1b4b6', background: '#fff', cursor: 'pointer' }}>
              Export CSV
            </button>
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#505a5f', marginTop: 6 }}>
          Showing <strong>{formatNumber(periodTotal)}</strong> views across <strong>{formatNumber(periodUnique)}</strong> pages • Range: {rangeLabel}
        </div>
      </div>

      {/* Summary cards — modeled on GA overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#fff', border: '1px solid #b1b4b6', borderRadius: 4, padding: '12px 16px' }}>
          <div style={{ fontSize: 12, color: '#505a5f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Page views (filtered)</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#0b0c0c', lineHeight: 1.1 }}>{formatNumber(periodTotal)}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #b1b4b6', borderRadius: 4, padding: '12px 16px' }}>
          <div style={{ fontSize: 12, color: '#505a5f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unique pages</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#0b0c0c', lineHeight: 1.1 }}>{formatNumber(periodUnique)}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #b1b4b6', borderRadius: 4, padding: '12px 16px' }}>
          <div style={{ fontSize: 12, color: '#505a5f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg per day (chart span)</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#0b0c0c', lineHeight: 1.1 }}>{formatNumber(avgDaily)}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #b1b4b6', borderRadius: 4, padding: '12px 16px' }}>
          <div style={{ fontSize: 12, color: '#505a5f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top page share</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#0b0c0c', lineHeight: 1.1 }}>{topShare}<span style={{ fontSize: 18, fontWeight: 500 }}>%</span></div>
        </div>
      </div>

      {/* Time series section with chart mode toggle */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h2 className="govuk-heading-m" style={{ margin: 0 }}>Traffic over time</h2>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setChartMode('daily')}
              style={{
                fontSize: 13, padding: '2px 10px', borderRadius: 3,
                border: chartMode === 'daily' ? '2px solid #1d70b8' : '1px solid #b1b4b6',
                background: '#fff', cursor: 'pointer', fontWeight: chartMode === 'daily' ? 600 : 400
              }}
            >
              Daily
            </button>
            <button
              onClick={() => setChartMode('weekly')}
              style={{
                fontSize: 13, padding: '2px 10px', borderRadius: 3,
                border: chartMode === 'weekly' ? '2px solid #1d70b8' : '1px solid #b1b4b6',
                background: '#fff', cursor: 'pointer', fontWeight: chartMode === 'weekly' ? 600 : 400
              }}
            >
              Weekly
            </button>
          </div>
        </div>

        {/* Bar chart (CSS) */}
        <div style={{ background: '#fff', border: '1px solid #b1b4b6', padding: '12px 12px 4px', borderRadius: 4, marginBottom: 8 }}>
          {timeSeries.length === 0 ? (
            <div style={{ padding: '24px', color: '#505a5f' }}>No data in current filter.</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: 168, paddingBottom: 4, overflowX: 'auto' }}>
              {timeSeries.map((point, idx) => {
                const h = Math.max(3, Math.round((point.count / maxTimeCount) * 142));
                const label = chartMode === 'daily' ? point.formattedDate : point.formattedDate.replace('Week of ', '');
                return (
                  <div key={idx} style={{ flex: '0 0 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                    <div
                      title={`${label}: ${point.count} views`}
                      style={{
                        width: '100%',
                        height: h,
                        background: '#1d70b8',
                        borderRadius: '2px 2px 0 0',
                        transition: 'height 120ms ease'
                      }}
                    />
                    <div style={{ fontSize: 9, color: '#505a5f', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 42, textAlign: 'center' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#0b0c0c' }}>{point.count}</div>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ fontSize: 11, color: '#505a5f', marginTop: 4 }}>Bars show views per {chartMode === 'daily' ? 'day' : 'week'} (filtered)</div>
        </div>

        {/* Trend line */}
        <div style={{ background: '#fff', border: '1px solid #b1b4b6', padding: '8px 12px', borderRadius: 4 }}>
          <div style={{ fontSize: 12, marginBottom: 4, color: '#505a5f' }}>Trend</div>
          {renderTrendLine(timeSeries as any)}
        </div>
      </div>

      {/* Top pages — bars + table (core analysis) */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 className="govuk-heading-m" style={{ margin: 0 }}>Top pages</h2>
          <span style={{ fontSize: 12, color: '#505a5f' }}>{formatNumber(agg.topPages.length)} pages in scope</span>
        </div>

        {/* Horizontal bar visual list */}
        <div style={{ background: '#fff', border: '1px solid #b1b4b6', borderRadius: 4, padding: '10px 12px 4px', marginBottom: 10 }}>
          {sortedTopPages.length === 0 && <div style={{ padding: 12, color: '#505a5f' }}>No matching pages.</div>}
          {sortedTopPages.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 220, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.path}>
                {p.path}
              </div>
              <div style={{ flex: 1, height: 18, background: '#f3f2f1', position: 'relative', borderRadius: 2 }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 0, top: 0, bottom: 0,
                    width: `${Math.max(2, Math.round((p.views / maxTopViews) * 100))}%`,
                    background: '#1d70b8',
                    borderRadius: 2,
                  }}
                  title={`${p.views} views`}
                />
              </div>
              <div style={{ width: 58, textAlign: 'right', fontSize: 13, fontWeight: 600 }}>{formatNumber(p.views)}</div>
              <div style={{ width: 42, textAlign: 'right', fontSize: 12, color: '#505a5f' }}>{p.percentage}%</div>
            </div>
          ))}
        </div>

        {/* Sortable/filtered table */}
        <table className="govuk-table" style={{ width: '100%', fontSize: 14 }}>
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th
                onClick={() => toggleSort('path')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                className="govuk-table__header"
              >
                Path {sortKey === 'path' && (sortDir === 'desc' ? '↓' : '↑')}
              </th>
              <th
                onClick={() => toggleSort('views')}
                style={{ cursor: 'pointer', width: 90, userSelect: 'none' }}
                className="govuk-table__header"
              >
                Views {sortKey === 'views' && (sortDir === 'desc' ? '↓' : '↑')}
              </th>
              <th className="govuk-table__header" style={{ width: 70 }}>%</th>
              <th className="govuk-table__header" style={{ width: 160 }}>Visual</th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {sortedTopPages.length === 0 && (
              <tr className="govuk-table__row"><td colSpan={4} className="govuk-table__cell" style={{ color: '#505a5f' }}>No data matches current filters.</td></tr>
            )}
            {sortedTopPages.map((p, idx) => (
              <tr key={idx} className="govuk-table__row">
                <td className="govuk-table__cell" style={{ fontFamily: 'monospace', fontSize: 13 }}>{p.path}</td>
                <td className="govuk-table__cell" style={{ fontWeight: 600 }}>{formatNumber(p.views)}</td>
                <td className="govuk-table__cell">{p.percentage}%</td>
                <td className="govuk-table__cell">
                  <div style={{ height: 16, background: '#f3f2f1', borderRadius: 2, position: 'relative' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.max(1, Math.round((p.views / maxTopViews) * 100))}%`,
                        background: '#1d70b8',
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: 11, color: '#505a5f', marginTop: 4 }}>
          Click column headers to sort. Table and bars respect the path filter and date range above.
        </div>
      </div>

      {/* Acquisition / Entry sources + Weekday patterns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 12 }}>
        {/* Top referrers (entry sources) */}
        <div>
          <h2 className="govuk-heading-m" style={{ marginBottom: 8 }}>Top entry sources (referrers)</h2>
          <div style={{ background: '#fff', border: '1px solid #b1b4b6', borderRadius: 4, padding: '10px 12px' }}>
            {(agg.topReferrers || []).length === 0 && <div style={{ color: '#505a5f', padding: '8px 0' }}>No referrer data yet (or all direct).</div>}
            {(agg.topReferrers || []).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <div style={{ width: 158, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.source}>
                  {r.source}
                </div>
                <div style={{ flex: 1, height: 16, background: '#f3f2f1', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.max(2, Math.round((r.views / maxRef) * 100))}%`, background: '#1d70b8' }} />
                </div>
                <div style={{ width: 48, textAlign: 'right', fontSize: 13 }}>{formatNumber(r.views)}</div>
                <div style={{ width: 36, fontSize: 12, color: '#505a5f' }}>{r.percentage}%</div>
              </div>
            ))}
            <div style={{ fontSize: 11, color: '#505a5f', marginTop: 6 }}>(direct) = no referrer / typed / bookmark</div>
          </div>
        </div>

        {/* Day of week pattern */}
        <div>
          <h2 className="govuk-heading-m" style={{ marginBottom: 8 }}>By day of week</h2>
          <div style={{ background: '#fff', border: '1px solid #b1b4b6', borderRadius: 4, padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 132 }}>
              {agg.weekdayViews.map((w, i) => {
                const h = Math.max(6, Math.round((w.count / maxWeekday) * 106));
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                      title={`${w.day}: ${w.count}`}
                      style={{ width: '100%', maxWidth: 28, height: h, background: '#1d70b8', borderRadius: '2px 2px 0 0' }}
                    />
                    <div style={{ fontSize: 11, marginTop: 4 }}>{w.day}</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{w.count}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: '#505a5f', marginTop: 8 }}>Distribution of views by weekday (filtered)</div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="govuk-inset-text" style={{ fontSize: 13, marginTop: 20 }}>
        Data is aggregated server-side from anonymized page visits. It does not include personal information.
        Compare trends here with your Google Analytics 4 property for a complete picture (sessions, bounce rate, device breakdown, geography).
      </div>
    </div>
  );
}
