"use server";

import { createClient } from "./server";

/**
 * Admin-only: recent page views for the analytics dashboard.
 * Keep the row limit low so Free-tier Worker CPU stays under budget.
 */
export async function getPageViews() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("page_views")
    .select("path, viewed_at, referrer")
    .order("viewed_at", { ascending: false })
    .limit(2500);

  if (error || !data) {
    console.error("Error fetching page views:", error);
    return {
      totalViews: 0,
      uniquePages: 0,
      topPages: [],
      dailyViews: [],
      weeklyViews: [],
      topReferrers: [],
      weekdayViews: [],
      allViews: [] as { path: string; viewed_at: string; referrer: string | null }[],
    };
  }

  const totalViews = data.length;
  const paths = data.map((v) => v.path);
  const uniquePages = new Set(paths).size;

  const counts: Record<string, number> = {};
  for (const p of paths) {
    counts[p] = (counts[p] || 0) + 1;
  }

  const topPages = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([path, views]) => ({
      path,
      views,
      percentage: totalViews > 0 ? Math.round((views / totalViews) * 100) : 0,
    }));

  const dailyMap: Record<string, number> = {};
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  for (const view of data) {
    const date = new Date(view.viewed_at);
    if (date >= thirtyDaysAgo) {
      const dayKey = date.toISOString().split("T")[0];
      dailyMap[dayKey] = (dailyMap[dayKey] || 0) + 1;
    }
  }

  const dailyViews = Object.entries(dailyMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(0, 30)
    .map(([date, count]) => ({
      date,
      count,
      formattedDate: new Date(date).toLocaleDateString("en-KE", {
        month: "short",
        day: "numeric",
      }),
    }));

  const weeklyMap: Record<string, number> = {};
  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

  for (const view of data) {
    const date = new Date(view.viewed_at);
    if (date >= twelveWeeksAgo) {
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];
      weeklyMap[weekKey] = (weeklyMap[weekKey] || 0) + 1;
    }
  }

  const weeklyViews = Object.entries(weeklyMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({
      date,
      count,
      formattedDate: `Week of ${new Date(date).toLocaleDateString("en-KE", {
        month: "short",
        day: "numeric",
      })}`,
    }));

  const refCounts: Record<string, number> = {};
  for (const view of data) {
    let ref = "(direct)";
    if (view.referrer) {
      try {
        const host = new URL(
          view.referrer.startsWith("http")
            ? view.referrer
            : `https://${view.referrer}`,
        ).hostname;
        ref = host.replace(/^www\./, "");
      } catch {
        ref = String(view.referrer).slice(0, 64);
      }
    }
    refCounts[ref] = (refCounts[ref] || 0) + 1;
  }

  const topReferrers = Object.entries(refCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([source, views]) => ({
      source,
      views,
      percentage: totalViews > 0 ? Math.round((views / totalViews) * 100) : 0,
    }));

  const weekdayMap: Record<number, number> = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (const view of data) {
    const wd = new Date(view.viewed_at).getDay();
    weekdayMap[wd] = (weekdayMap[wd] || 0) + 1;
  }
  const weekdayViews = Object.entries(weekdayMap).map(([wd, count]) => ({
    day: dayNames[Number(wd)],
    wd: Number(wd),
    count,
  }));

  // Cap raw rows passed to the client for filter UI
  const allViews = data.slice(0, 1500).map((v) => ({
    path: v.path,
    viewed_at: v.viewed_at,
    referrer: v.referrer || null,
  }));

  return {
    totalViews,
    uniquePages,
    topPages,
    dailyViews,
    weeklyViews,
    topReferrers,
    weekdayViews,
    allViews,
  };
}
