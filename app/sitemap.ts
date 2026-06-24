import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { sanityClient } from '@/lib/sanity/client';

const BASE_URL = 'https://www.citizenguide.ke';

interface SitemapEntry {
  url: string;
  lastModified?: Date | string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

async function getSupabaseUrls(): Promise<SitemapEntry[]> {
  const supabase = await createClient();
  const urls: SitemapEntry[] = [];

  // 1. LEADERS
  try {
    const { data: leaders } = await supabase
      .from('leaders')
      .select('id, category, updated_at')
      .limit(1000);
    
    leaders?.forEach((leader: any) => {
      if (leader.category && leader.id) {
        urls.push({
          url: `${BASE_URL}/leaders/${leader.category}/${leader.id}`,
          lastModified: leader.updated_at ? new Date(leader.updated_at) : undefined,
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      }
    });
  } catch (e) { /* ignore */ }

  // 2. OFFICIALS
  try {
    const { data: officials } = await supabase
      .from('officials')
      .select('id, updated_at')
      .limit(1000);
    
    officials?.forEach((o: any) => {
      urls.push({
        url: `${BASE_URL}/officials/${o.id}`,
        lastModified: o.updated_at ? new Date(o.updated_at) : undefined,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });
  } catch (e) { /* ignore */ }

  // 3. INSTITUTIONS (Main + Subpages)
  try {
    const { data: institutions } = await supabase
      .from('institutions')
      .select('slug, updated_at')
      .eq('is_active', true)
      .limit(1000);
    
    institutions?.forEach((inst: any) => {
      if (inst.slug) {
        urls.push({
          url: `${BASE_URL}/institutions/${inst.slug}`,
          lastModified: inst.updated_at ? new Date(inst.updated_at) : undefined,
          changeFrequency: 'weekly',
          priority: 0.8,
        });

        // Institution subpages
        ['leadership', 'services', 'locations', 'publications', 'tenders', 'tools', 'data'].forEach(sub => {
          urls.push({
            url: `${BASE_URL}/institutions/${inst.slug}/${sub}`,
            changeFrequency: 'monthly',
            priority: 0.5,
          });
        });
      }
    });
  } catch (e) { /* ignore */ }

  // 4. COUNTIES
  try {
    const { data: counties } = await supabase
      .from('counties')
      .select('slug, updated_at')
      .eq('is_active', true);
    
    counties?.forEach((c: any) => {
      if (c.slug) {
        urls.push({
          url: `${BASE_URL}/counties/${c.slug}`,
          lastModified: c.updated_at ? new Date(c.updated_at) : undefined,
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      }
    });
  } catch (e) { /* ignore */ }

  // 5. WARDS (All ~1,450 wards)
  try {
    const { data: wards } = await supabase
      .from('wards')
      .select('slug, updated_at')
      .limit(2000);
    
    wards?.forEach((w: any) => {
      if (w.slug) {
        urls.push({
          url: `${BASE_URL}/counties/wards/${w.slug}`,
          lastModified: w.updated_at ? new Date(w.updated_at) : undefined,
          changeFrequency: 'monthly',
          priority: 0.5,
        });
      }
    });
  } catch (e) { /* ignore */ }

  // Root index pages
  urls.push({ url: `${BASE_URL}/leaders`, changeFrequency: 'weekly', priority: 0.8 });
  urls.push({ url: `${BASE_URL}/counties`, changeFrequency: 'weekly', priority: 0.8 });
  urls.push({ url: `${BASE_URL}/institutions`, changeFrequency: 'weekly', priority: 0.8 });
  urls.push({ url: `${BASE_URL}/officials`, changeFrequency: 'weekly', priority: 0.6 });

  return urls;
}

async function getSanityUrls(): Promise<SitemapEntry[]> {
  const urls: SitemapEntry[] = [];

  // ==========================================
  // GUIDES
  // ==========================================
  try {
    const guides = await sanityClient.fetch(
      `*[_type == "guide" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`
    );
    guides?.forEach((g: any) => {
      urls.push({
        url: `${BASE_URL}/guides/${g.slug}`,
        lastModified: g._updatedAt ? new Date(g._updatedAt) : undefined,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    });
  } catch (e) { /* ignore */ }

  // ==========================================
  // CONSTITUTION - Chapters + Articles (NEW STRUCTURE)
  // ==========================================
  try {
    const articles = await sanityClient.fetch(
      `*[_type == "constitutionArticle" && defined(chapter) && defined(articleNumber)]{ 
        chapter, 
        articleNumber, 
        _updatedAt,
        chapterTitle 
      }`
    );

    if (articles && articles.length > 0) {
      // 1. Generate unique Chapter pages
      const uniqueChapters = new Map<number, any>();
      
      articles.forEach((a: any) => {
        if (!uniqueChapters.has(a.chapter)) {
          uniqueChapters.set(a.chapter, a);
        }
      });

      // Add Chapter pages (e.g. /constitution/chapter/1)
      uniqueChapters.forEach((chapterData, chapterNum) => {
        urls.push({
          url: `${BASE_URL}/constitution/chapter/${chapterNum}`,
          lastModified: chapterData._updatedAt ? new Date(chapterData._updatedAt) : undefined,
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      });

      // 2. Add individual Article pages (NEW URL STRUCTURE)
      articles.forEach((a: any) => {
        urls.push({
          url: `${BASE_URL}/constitution/chapter/${a.chapter}/article/${a.articleNumber}`,
          lastModified: a._updatedAt ? new Date(a._updatedAt) : undefined,
          changeFrequency: 'monthly',
          priority: 0.8,
        });
      });
    }
  } catch (e) {
    console.error("Error generating Constitution sitemap entries:", e);
  }

  // ==========================================
  // ACTS OF PARLIAMENT
  // ==========================================
  try {
    const acts = await sanityClient.fetch(
      `*[_type == "actOfParliament" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`
    );
    acts?.forEach((a: any) => {
      urls.push({
        url: `${BASE_URL}/acts/parliament/${a.slug}`,
        lastModified: a._updatedAt ? new Date(a._updatedAt) : undefined,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    });
  } catch (e) { /* ignore */ }

  // ==========================================
  // PRESIDENTIAL INTERNATIONAL VISITS
  // ==========================================
  try {
    const trips = await sanityClient.fetch(
      `*[_type == "presidentialTrip" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`
    );
    trips?.forEach((t: any) => {
      urls.push({
        url: `${BASE_URL}/executive/presidency/international-visits/${t.slug}`,
        lastModified: t._updatedAt ? new Date(t._updatedAt) : undefined,
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    });
  } catch (e) { /* ignore */ }

  return urls;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls: SitemapEntry[] = [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/services`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/executive`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/legislature`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/judiciary`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/counties`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/institutions`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/leaders`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/politics`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/constitution`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/acts/parliament`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/documents`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/open-data`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/guides`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/society-and-culture`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/help`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const [supabaseUrls, sanityUrls] = await Promise.all([
    getSupabaseUrls(),
    getSanityUrls(),
  ]);

  const allUrls = [...staticUrls, ...supabaseUrls, ...sanityUrls];

  // Deduplicate
  const unique = Array.from(new Map(allUrls.map(u => [u.url, u])).values());

  return unique.map(entry => ({
    url: entry.url,
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}