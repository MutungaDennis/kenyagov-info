'use server';

import { createClient } from './server';

export async function logPageView(path: string, referrer?: string | null) {
  // Use anon client for insert (RLS allows)
  const supabase = await createClient();
  
  // Avoid logging admin pages or assets if desired, but caller controls
  const adminBase =
    process.env.NEXT_PUBLIC_ADMIN_BASE_PATH?.replace(/\/$/, "") || "/admin";
  if (
    !path ||
    path.startsWith("/admin") ||
    path === adminBase ||
    path.startsWith(`${adminBase}/`) ||
    path.includes(".")
  ) {
    return;
  }

  try {
    const payload: { path: string; referrer?: string | null } = { path };
    if (referrer) {
      payload.referrer = referrer;
    }
    await supabase.from('page_views').insert(payload);
  } catch (error) {
    // Silent fail for analytics, don't break UX
    console.error('Failed to log page view:', error);
  }
}

export async function getPageViews() {
  const supabase = await createClient();

  // Fetch recent views for aggregation (limit to reasonable for perf, e.g. last ~10k)
  // Include referrer for entry/acquisition analysis
  const { data, error } = await supabase
    .from('page_views')
    .select('path, viewed_at, referrer')
    .order('viewed_at', { ascending: false })
    .limit(10000);

  if (error || !data) {
    console.error('Error fetching page views:', error);
    return { 
      totalViews: 0, 
      uniquePages: 0, 
      topPages: [], 
      dailyViews: [], 
      weeklyViews: [],
      topReferrers: [],
      weekdayViews: [],
      allViews: [] as any
    };
  }

  const totalViews = data.length;
  const paths = data.map(v => v.path);
  const uniquePages = new Set(paths).size;

  // Count per path
  const counts: Record<string, number> = {};
  paths.forEach(p => {
    counts[p] = (counts[p] || 0) + 1;
  });

  const topPages = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([path, views]) => ({ 
      path, 
      views, 
      percentage: totalViews > 0 ? Math.round((views / totalViews) * 100) : 0 
    }));

  // Daily aggregation (last 30 days)
  const dailyMap: Record<string, number> = {};
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  data.forEach(view => {
    const date = new Date(view.viewed_at);
    if (date >= thirtyDaysAgo) {
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      dailyMap[dayKey] = (dailyMap[dayKey] || 0) + 1;
    }
  });

  const dailyViews = Object.entries(dailyMap)
    .sort((a, b) => a[0].localeCompare(b[0])) // oldest first for chart
    .slice(0, 30)
    .map(([date, count]) => ({ 
      date, 
      count,
      formattedDate: new Date(date).toLocaleDateString('en-KE', { 
        month: 'short', day: 'numeric' 
      })
    }));

  // Weekly aggregation (last ~12 weeks)
  const weeklyMap: Record<string, number> = {};
  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

  data.forEach(view => {
    const date = new Date(view.viewed_at);
    if (date >= twelveWeeksAgo) {
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday start
      const weekKey = weekStart.toISOString().split('T')[0];
      weeklyMap[weekKey] = (weeklyMap[weekKey] || 0) + 1;
    }
  });

  const weeklyViews = Object.entries(weeklyMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ 
      date, 
      count,
      formattedDate: `Week of ${new Date(date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}`
    }));

  // Top referrers (acquisition / entry sources) - cleaned hostnames
  const refCounts: Record<string, number> = {};
  data.forEach(view => {
    let ref = '(direct)';
    if (view.referrer) {
      try {
        const host = new URL(view.referrer.startsWith('http') ? view.referrer : `https://${view.referrer}`).hostname;
        ref = host.replace(/^www\./, '');
      } catch {
        ref = String(view.referrer).slice(0, 64);
      }
    }
    refCounts[ref] = (refCounts[ref] || 0) + 1;
  });

  const topReferrers = Object.entries(refCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([source, views]) => ({ 
      source, 
      views, 
      percentage: totalViews > 0 ? Math.round((views / totalViews) * 100) : 0 
    }));

  // Weekday breakdown (0=Sun ... 6=Sat)
  const weekdayMap: Record<number, number> = { 0:0,1:0,2:0,3:0,4:0,5:0,6:0 };
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  data.forEach(view => {
    const d = new Date(view.viewed_at);
    const wd = d.getDay();
    weekdayMap[wd] = (weekdayMap[wd] || 0) + 1;
  });
  const weekdayViews = Object.entries(weekdayMap).map(([wd, count]) => ({
    day: dayNames[Number(wd)],
    wd: Number(wd),
    count
  }));

  // Raw views for powerful client-side filtering / re-aggregation (no PII)
  const allViews = data.map(v => ({
    path: v.path,
    viewed_at: v.viewed_at,
    referrer: v.referrer || null
  }));

  return { 
    totalViews, 
    uniquePages, 
    topPages, 
    dailyViews, 
    weeklyViews, 
    topReferrers,
    weekdayViews,
    allViews 
  };
}
