// Pure aggregation helpers — safe to import from client components.
// No 'use server' directive here so these are not treated as Server Actions.

export type ViewRow = { path: string; viewed_at: string; referrer?: string | null };

export type PageStat = { path: string; views: number; percentage: number };
export type DailyStat = { date: string; count: number; formattedDate: string };
export type WeeklyStat = { date: string; count: number; formattedDate: string };
export type ReferrerStat = { source: string; views: number; percentage: number };
export type WeekdayStat = { day: string; wd: number; count: number };

export function aggregateViews(views: ViewRow[]) {
  const totalViews = views.length;
  const uniquePages = new Set(views.map(v => v.path)).size;

  const counts: Record<string, number> = {};
  views.forEach(v => { counts[v.path] = (counts[v.path] || 0) + 1; });

  const topPages = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([path, views]) => ({
      path,
      views,
      percentage: totalViews > 0 ? Math.round((views / totalViews) * 100) : 0
    }));

  // Daily
  const dailyMap: Record<string, number> = {};
  views.forEach(view => {
    const date = new Date(view.viewed_at);
    const dayKey = date.toISOString().split('T')[0];
    dailyMap[dayKey] = (dailyMap[dayKey] || 0) + 1;
  });
  const dailyViews = Object.entries(dailyMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({
      date,
      count,
      formattedDate: new Date(date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })
    }));

  // Weekly
  const weeklyMap: Record<string, number> = {};
  views.forEach(view => {
    const date = new Date(view.viewed_at);
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    weeklyMap[weekKey] = (weeklyMap[weekKey] || 0) + 1;
  });
  const weeklyViews = Object.entries(weeklyMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({
      date,
      count,
      formattedDate: `Week of ${new Date(date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}`
    }));

  // Referrers
  const refCounts: Record<string, number> = {};
  views.forEach(view => {
    let ref = '(direct)';
    const r = view.referrer;
    if (r) {
      try {
        const host = new URL(r.startsWith('http') ? r : `https://${r}`).hostname.replace(/^www\./, '');
        ref = host;
      } catch { ref = String(r).slice(0, 64); }
    }
    refCounts[ref] = (refCounts[ref] || 0) + 1;
  });
  const topReferrers = Object.entries(refCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([source, views]) => ({
      source,
      views,
      percentage: totalViews > 0 ? Math.round((views / totalViews) * 100) : 0
    }));

  // Weekdays
  const weekdayMap: Record<number, number> = { 0:0,1:0,2:0,3:0,4:0,5:0,6:0 };
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  views.forEach(view => {
    const d = new Date(view.viewed_at);
    weekdayMap[d.getDay()] = (weekdayMap[d.getDay()] || 0) + 1;
  });
  const weekdayViews = Object.entries(weekdayMap).map(([wd, count]) => ({
    day: dayNames[Number(wd)],
    wd: Number(wd),
    count
  }));

  return { totalViews, uniquePages, topPages, dailyViews, weeklyViews, topReferrers, weekdayViews };
}