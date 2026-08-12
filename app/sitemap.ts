import { MetadataRoute } from 'next';
import { createPublicClient } from '@/lib/supabase/public';
import {
  hasRealSupabasePublicEnv,
  resolveSupabasePublicEnv,
} from '@/lib/supabase/env';
import { sanityClient } from '@/lib/sanity/client';
import { getAllTopicSlugs } from '@/lib/topics';
import { getAllNationalEventSlugs } from '@/lib/data/national-events';
import { getAllAskProfileSlugs } from '@/lib/data/ask-shows';
import { counties } from '@/data/counties';

/** Rebuild periodically — crawlers must not force heavy Worker work each hit. */
export const revalidate = 3600;

const BASE_URL = 'https://www.citizenguide.ke';

interface SitemapEntry {
  url: string;
  lastModified?: Date | string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

type SlugRow = { slug: string; updated_at?: string | null };

/** Paginate Supabase so we stay under default max-rows and Worker time limits. */
async function fetchAllSlugs(
  table: string,
  options: {
    /** Extra PostgREST filters applied after select (eq/neq). */
    apply?: (q: any) => any;
    pageSize?: number;
    maxRows?: number;
  } = {},
): Promise<SlugRow[]> {
  const pageSize = options.pageSize ?? 500;
  const maxRows = options.maxRows ?? 5000;
  const rows: SlugRow[] = [];

  try {
    const supabase = createPublicClient();
    for (let from = 0; from < maxRows; from += pageSize) {
      const to = from + pageSize - 1;
      let q: any = supabase.from(table).select('slug, updated_at').range(from, to);
      if (options.apply) {
        q = options.apply(q);
      }
      const { data, error } = await q;
      if (error) {
        console.error(`[sitemap] ${table} page ${from}-${to}:`, error.message);
        break;
      }
      if (!data?.length) break;
      for (const row of data as { slug?: string; updated_at?: string | null }[]) {
        if (row.slug) rows.push({ slug: row.slug, updated_at: row.updated_at });
      }
      if (data.length < pageSize) break;
    }
  } catch (e) {
    console.error(`[sitemap] ${table} failed:`, e);
  }

  return rows;
}

/**
 * Fallback when Supabase client fails on the Worker: direct PostgREST.
 * Uses runtime env (Cloudflare Worker vars), not build-time placeholders alone.
 */
async function fetchSlugsViaRest(
  table: string,
  queryExtra = '',
  maxRows = 2000,
): Promise<{ slug: string; updated_at?: string | null }[]> {
  const env = resolveSupabasePublicEnv(false);
  if (!hasRealSupabasePublicEnv(env)) {
    console.error('[sitemap] Supabase env missing at runtime — dynamic URLs skipped');
    return [];
  }

  const rows: { slug: string; updated_at?: string | null }[] = [];
  const pageSize = 500;

  try {
    for (let from = 0; from < maxRows; from += pageSize) {
      const to = from + pageSize - 1;
      const qs = new URLSearchParams();
      qs.set('select', 'slug,updated_at');
      const url = `${env.url}/rest/v1/${table}?${qs.toString()}${queryExtra ? `&${queryExtra}` : ''}`;
      const res = await fetch(url, {
        headers: {
          apikey: env.key,
          Authorization: `Bearer ${env.key}`,
          Range: `${from}-${to}`,
          Prefer: 'count=exact',
        },
        // Cache at the edge for the route revalidate window
        next: { revalidate: 3600 },
      });
      if (!res.ok) {
        console.error(`[sitemap] REST ${table} ${res.status}:`, await res.text().catch(() => ''));
        break;
      }
      const data = (await res.json()) as { slug?: string; updated_at?: string | null }[];
      if (!Array.isArray(data) || data.length === 0) break;
      for (const row of data) {
        if (row.slug) rows.push({ slug: row.slug, updated_at: row.updated_at });
      }
      if (data.length < pageSize) break;
    }
  } catch (e) {
    console.error(`[sitemap] REST ${table} failed:`, e);
  }

  return rows;
}

async function getSupabaseUrls(): Promise<SitemapEntry[]> {
  const urls: SitemapEntry[] = [];
  const envOk = hasRealSupabasePublicEnv(resolveSupabasePublicEnv(false));

  // 1. LEADERS → /government/people/[slug]
  let leaders = envOk
    ? await fetchAllSlugs('leaders', {
        apply: (q) => q.eq('is_active', true),
        maxRows: 2000,
      })
    : [];
  if (leaders.length === 0) {
    leaders = await fetchSlugsViaRest('leaders', 'is_active=eq.true', 2000);
  }
  for (const leader of leaders) {
    urls.push({
      url: `${BASE_URL}/government/people/${leader.slug}`,
      lastModified: leader.updated_at ? new Date(leader.updated_at) : undefined,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  // 2. MCAs (published) → same people path
  let mcas = envOk
    ? await fetchAllSlugs('mcas', {
        apply: (q) => q.neq('status', 'Unpublished'),
        maxRows: 3000,
      })
    : [];
  if (mcas.length === 0) {
    mcas = await fetchSlugsViaRest('mcas', 'status=neq.Unpublished', 3000);
  }
  const peopleSlugs = new Set(urls.map((u) => u.url));
  for (const mca of mcas) {
    const url = `${BASE_URL}/government/people/${mca.slug}`;
    if (peopleSlugs.has(url)) continue;
    urls.push({
      url,
      lastModified: mca.updated_at ? new Date(mca.updated_at) : undefined,
      changeFrequency: 'monthly',
      priority: 0.55,
    });
  }

  // 3. INSTITUTIONS
  let institutions = envOk
    ? await fetchAllSlugs('institutions', {
        apply: (q) => q.eq('is_active', true),
        maxRows: 2000,
      })
    : [];
  if (institutions.length === 0) {
    // Include inactive/historical if active filter returns empty (or use all)
    institutions = await fetchSlugsViaRest('institutions', 'is_active=eq.true', 2000);
    if (institutions.length === 0) {
      institutions = await fetchSlugsViaRest('institutions', '', 2000);
    }
  }
  for (const inst of institutions) {
    urls.push({
      url: `${BASE_URL}/government/institutions/${inst.slug}`,
      lastModified: inst.updated_at ? new Date(inst.updated_at) : undefined,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // 4. COUNTIES — always include static 47 (DB slug format may differ)
  const staticCountySlugs = counties.map((c) => c.slug);
  for (const slug of staticCountySlugs) {
    urls.push({
      url: `${BASE_URL}/government/counties/${slug}`,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }
  // Also DB counties if different slugs exist
  let dbCounties = envOk ? await fetchAllSlugs('counties', { maxRows: 100 }) : [];
  if (dbCounties.length === 0) {
    dbCounties = await fetchSlugsViaRest('counties', '', 100);
  }
  const countyUrlSet = new Set(staticCountySlugs.map((s) => `${BASE_URL}/government/counties/${s}`));
  for (const c of dbCounties) {
    const url = `${BASE_URL}/government/counties/${c.slug}`;
    if (countyUrlSet.has(url)) continue;
    urls.push({
      url,
      lastModified: c.updated_at ? new Date(c.updated_at) : undefined,
      changeFrequency: 'monthly',
      priority: 0.65,
    });
  }

  // 5. WARDS (cap — large table)
  let wards = envOk
    ? await fetchAllSlugs('wards', { maxRows: 2000, pageSize: 500 })
    : [];
  if (wards.length === 0) {
    wards = await fetchSlugsViaRest('wards', '', 2000);
  }
  for (const w of wards) {
    urls.push({
      url: `${BASE_URL}/government/counties/wards/${w.slug}/about`,
      lastModified: w.updated_at ? new Date(w.updated_at) : undefined,
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  }

  // Index pages (canonical destinations only — no redirect sources)
  urls.push(
    { url: `${BASE_URL}/government`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/government/people`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/government/institutions`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/government/counties`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/government/legislature`, changeFrequency: 'weekly', priority: 0.8 },
  );

  console.info(
    `[sitemap] supabase urls: leaders=${leaders.length} mcas=${mcas.length} institutions=${institutions.length} wards=${wards.length} total_dynamic=${urls.length}`,
  );

  return urls;
}

async function getSanityUrls(): Promise<SitemapEntry[]> {
  const urls: SitemapEntry[] = [];

  try {
    const guides = await sanityClient.fetch(
      `*[_type == "guide" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`,
    );
    guides?.forEach((g: { slug?: string; _updatedAt?: string }) => {
      if (!g.slug) return;
      urls.push({
        url: `${BASE_URL}/guides/${g.slug}`,
        lastModified: g._updatedAt ? new Date(g._updatedAt) : undefined,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    });
  } catch (e) {
    console.error('[sitemap] guides:', e);
  }

  try {
    const articles = await sanityClient.fetch(
      `*[_type == "constitutionArticle" && defined(chapter) && defined(articleNumber)]{ 
        chapter, 
        articleNumber, 
        _updatedAt
      }`,
    );

    if (articles && articles.length > 0) {
      const uniqueChapters = new Map<number, { _updatedAt?: string }>();

      articles.forEach((a: { chapter: number; _updatedAt?: string }) => {
        if (!uniqueChapters.has(a.chapter)) {
          uniqueChapters.set(a.chapter, a);
        }
      });

      uniqueChapters.forEach((chapterData, chapterNum) => {
        urls.push({
          url: `${BASE_URL}/constitution/chapter/${chapterNum}`,
          lastModified: chapterData._updatedAt ? new Date(chapterData._updatedAt) : undefined,
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      });

      articles.forEach(
        (a: { chapter: number; articleNumber: number; _updatedAt?: string }) => {
          urls.push({
            url: `${BASE_URL}/constitution/chapter/${a.chapter}/article/${a.articleNumber}`,
            lastModified: a._updatedAt ? new Date(a._updatedAt) : undefined,
            changeFrequency: 'monthly',
            priority: 0.8,
          });
        },
      );
    }
  } catch (e) {
    console.error('[sitemap] constitution:', e);
  }

  try {
    const acts = await sanityClient.fetch(
      `*[_type == "actOfParliament" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`,
    );
    acts?.forEach((a: { slug?: string; _updatedAt?: string }) => {
      if (!a.slug) return;
      urls.push({
        url: `${BASE_URL}/acts/parliament/${a.slug}`,
        lastModified: a._updatedAt ? new Date(a._updatedAt) : undefined,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    });
  } catch (e) {
    console.error('[sitemap] acts:', e);
  }

  try {
    const trips = await sanityClient.fetch(
      `*[_type == "presidentialTrip" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`,
    );
    trips?.forEach((t: { slug?: string; _updatedAt?: string }) => {
      if (!t.slug) return;
      urls.push({
        url: `${BASE_URL}/government/presidential-visits/${t.slug}`,
        lastModified: t._updatedAt ? new Date(t._updatedAt) : undefined,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });
  } catch (e) {
    console.error('[sitemap] trips:', e);
  }

  try {
    const parties = await sanityClient.fetch(
      `*[_type == "politicalParty" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`,
    );
    parties?.forEach((p: { slug?: string; _updatedAt?: string }) => {
      if (!p.slug) return;
      urls.push({
        url: `${BASE_URL}/elections/political-parties/${p.slug}`,
        lastModified: p._updatedAt ? new Date(p._updatedAt) : undefined,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });
  } catch (e) {
    console.error('[sitemap] parties:', e);
  }

  return urls;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Only final canonical destinations — never redirect sources (those inflate GSC "Page with redirect")
  const staticUrls: SitemapEntry[] = [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1.0 },

    { url: `${BASE_URL}/government`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/government/cabinet`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/government/commissions`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/government/presidency`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/government/deputy-presidency`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/government/prime-cabinet-secretary`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/government/people`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/government/institutions`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/government/judiciary`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/government/legislature`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/government/counties`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/government/presidential-visits`, changeFrequency: 'weekly', priority: 0.7 },

    { url: `${BASE_URL}/elections`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/elections/general-elections`, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE_URL}/elections/general-elections/timeline`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/elections/general-elections/operation-plan`, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE_URL}/elections/by-elections`, changeFrequency: 'weekly', priority: 0.75 },
    { url: `${BASE_URL}/elections/referendums`, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${BASE_URL}/elections/voter-registration`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/elections/political-parties`, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE_URL}/elections/coalitions`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/elections/polling-stations`, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE_URL}/elections/registered-voters`, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${BASE_URL}/elections/iebc-offices`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/elections/about`, changeFrequency: 'yearly', priority: 0.6 },

    { url: `${BASE_URL}/constitution`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/acts/parliament`, changeFrequency: 'weekly', priority: 0.8 },

    { url: `${BASE_URL}/documents`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/documents/vision-2030`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/documents/sessional-papers/1965-no-10`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE_URL}/documents/sessional-papers/1986-no-1`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE_URL}/documents/sessional-papers/2012-no-1`, changeFrequency: 'yearly', priority: 0.5 },

    { url: `${BASE_URL}/search`, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE_URL}/open-data`, changeFrequency: 'monthly', priority: 0.8 },

    { url: `${BASE_URL}/guides`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/society-and-culture`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/national-events`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/national-events/ask-shows`, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE_URL}/national-events/devolution-conference`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/national-events/devolution-sensitisation-week`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/national-events/kenya-music-festival`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/national-events/kenya-national-drama-and-film-festival`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/national-symbols`, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${BASE_URL}/religion-and-faith`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/services`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/services/a-z`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/services/popular`, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE_URL}/topics`, changeFrequency: 'weekly', priority: 0.9 },

    { url: `${BASE_URL}/how-government-works`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/county-vs-national`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/how-public-money-works`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/ecitizen`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/huduma-centres`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/huduma-centres/locations`, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE_URL}/find-your-representatives`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/contact-government`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/complain-about-government`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/access-to-information`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/scams`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/emergency-and-safety`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/kenya-gazette`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/guides/having-a-baby`, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE_URL}/guides/registering-a-death`, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE_URL}/guides/starting-a-business`, changeFrequency: 'monthly', priority: 0.75 },

    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/help`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/disclaimer`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE_URL}/copyright`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE_URL}/editorial-policy`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE_URL}/content-style-guide`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE_URL}/corrections`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE_URL}/accessibility`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/cookies`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/feedback`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/support`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/sitemap`, changeFrequency: 'monthly', priority: 0.4 },
  ];

  const topicSlugs = await getAllTopicSlugs();
  const topicUrls: SitemapEntry[] = topicSlugs.map((slug) => ({
    url: `${BASE_URL}/topics/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  const nationalEventSlugs = await getAllNationalEventSlugs();
  const nationalEventUrls: SitemapEntry[] = nationalEventSlugs.map((slug) => ({
    url: `${BASE_URL}/national-events/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.65,
  }));

  const askProfileSlugs = await getAllAskProfileSlugs();
  const askProfileUrls: SitemapEntry[] = askProfileSlugs.map((slug) => ({
    url: `${BASE_URL}/national-events/ask-shows/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const [supabaseUrls, sanityUrls] = await Promise.all([
    getSupabaseUrls(),
    getSanityUrls(),
  ]);

  const allUrls = [
    ...staticUrls,
    ...topicUrls,
    ...nationalEventUrls,
    ...askProfileUrls,
    ...supabaseUrls,
    ...sanityUrls,
  ];

  const unique = Array.from(new Map(allUrls.map((u) => [u.url, u])).values());

  return unique.map((entry) => ({
    url: entry.url,
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
