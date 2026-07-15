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

  // 1. LEADERS (Now at /government/people/[slug])
  try {
    const { data: leaders } = await supabase
      .from('leaders')
      .select('slug, updated_at')
      .eq('is_active', true)
      .limit(1000);
    
    leaders?.forEach((leader: any) => {
      if (leader.slug) {
        urls.push({
          url: `${BASE_URL}/government/people/${leader.slug}`,
          lastModified: leader.updated_at ? new Date(leader.updated_at) : undefined,
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      }
    });
  } catch (e) { /* ignore */ }

  // 2. INSTITUTIONS (Now at /government/institutions/[slug])
  try {
    const { data: institutions } = await supabase
      .from('institutions')
      .select('slug, updated_at')
      .eq('is_active', true)
      .limit(1000);
    
    institutions?.forEach((inst: any) => {
      if (inst.slug) {
        urls.push({
          url: `${BASE_URL}/government/institutions/${inst.slug}`,
          lastModified: inst.updated_at ? new Date(inst.updated_at) : undefined,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    });
  } catch (e) { /* ignore */ }

  // 3. COUNTIES (Now at /government/counties/[slug])
  try {
    const { data: counties } = await supabase
      .from('counties')
      .select('slug, updated_at')
      .eq('is_active', true);
    
    counties?.forEach((c: any) => {
      if (c.slug) {
        urls.push({
          url: `${BASE_URL}/government/counties/${c.slug}`,
          lastModified: c.updated_at ? new Date(c.updated_at) : undefined,
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      }
    });
  } catch (e) { /* ignore */ }

  // 4. WARDS (Now at /government/counties/wards/[slug]/about)
  try {
    const { data: wards } = await supabase
      .from('wards')
      .select('slug, updated_at')
      .limit(2000);
    
    wards?.forEach((w: any) => {
      if (w.slug) {
        urls.push({
          url: `${BASE_URL}/government/counties/wards/${w.slug}/about`,
          lastModified: w.updated_at ? new Date(w.updated_at) : undefined,
          changeFrequency: 'monthly',
          priority: 0.5,
        });
      }
    });
  } catch (e) { /* ignore */ }

  // 5. LEGISLATURE MEMBERS (National Assembly & Senate)
  try {
    const { data: naMembers } = await supabase
      .from('leaders')
      .select('slug, updated_at')
      .eq('is_active', true)
      .in('category', ['Member of Parliament', 'Senator'])
      .limit(500);
    
    naMembers?.forEach((m: any) => {
      if (m.slug) {
        urls.push({
          url: `${BASE_URL}/government/legislature/national-assembly/members/${m.slug}`,
          lastModified: m.updated_at ? new Date(m.updated_at) : undefined,
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    });
  } catch (e) { /* ignore */ }

  // Root index pages
  urls.push({ url: `${BASE_URL}/government`, changeFrequency: 'weekly', priority: 0.9 });
  urls.push({ url: `${BASE_URL}/government/people`, changeFrequency: 'weekly', priority: 0.8 });
  urls.push({ url: `${BASE_URL}/government/institutions`, changeFrequency: 'weekly', priority: 0.8 });
  urls.push({ url: `${BASE_URL}/government/counties`, changeFrequency: 'weekly', priority: 0.8 });
  urls.push({ url: `${BASE_URL}/government/legislature`, changeFrequency: 'weekly', priority: 0.8 });

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
  // CONSTITUTION - Chapters + Articles
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

      // 2. Add individual Article pages
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
  // PRESIDENTIAL INTERNATIONAL VISITS (Now at /government/presidential-visits/[slug])
  // ==========================================
  try {
    const trips = await sanityClient.fetch(
      `*[_type == "presidentialTrip" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`
    );
    trips?.forEach((t: any) => {
      urls.push({
        url: `${BASE_URL}/government/presidential-visits/${t.slug}`,
        lastModified: t._updatedAt ? new Date(t._updatedAt) : undefined,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });
  } catch (e) { /* ignore */ }

  // ==========================================
  // POLITICAL PARTIES (Now at /elections/political-parties/[slug])
  // ==========================================
  try {
    const parties = await sanityClient.fetch(
      `*[_type == "politicalParty" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`
    );
    parties?.forEach((p: any) => {
      urls.push({
        url: `${BASE_URL}/elections/political-parties/${p.slug}`,
        lastModified: p._updatedAt ? new Date(p._updatedAt) : undefined,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });
  } catch (e) { /* ignore */ }

  return urls;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls: SitemapEntry[] = [
    // Homepage
    { url: BASE_URL, changeFrequency: 'daily', priority: 1.0 },
    
    // Government Hub
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
    
    // Transparency Registers (Redirects to Search)
    { url: `${BASE_URL}/government/cabinet-decisions`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/government/executive-orders`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/government/presidential-visits`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/government/publications`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/government/speeches`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/government/consultations`, changeFrequency: 'weekly', priority: 0.7 },
    
    // Elections (was /politics)
    { url: `${BASE_URL}/elections`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/elections/general-elections`, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${BASE_URL}/elections/by-elections`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/elections/referendums`, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${BASE_URL}/elections/voter-registration`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/elections/political-parties`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/elections/coalitions`, changeFrequency: 'monthly', priority: 0.6 },
    
    // Constitution & Laws
    { url: `${BASE_URL}/constitution`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/acts/parliament`, changeFrequency: 'weekly', priority: 0.8 },
    
    // Documents & Resources
    { url: `${BASE_URL}/documents`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/documents/vision-2030`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/documents/sessional-papers/1965-no-10`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE_URL}/documents/sessional-papers/1986-no-1`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE_URL}/documents/sessional-papers/2012-no-1`, changeFrequency: 'yearly', priority: 0.5 },
    
    // Search & Data
    { url: `${BASE_URL}/search/all`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/open-data`, changeFrequency: 'monthly', priority: 0.8 },
    
    // Guides & Society
    { url: `${BASE_URL}/guides`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/society-and-culture`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/services`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/services/a-z`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/topics`, changeFrequency: 'weekly', priority: 0.9 },

    // Civic explainers
    { url: `${BASE_URL}/how-government-works`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/county-vs-national`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/how-public-money-works`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/ecitizen`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/huduma-centres`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/find-your-representatives`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/contact-government`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/complain-about-government`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/access-to-information`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/scams`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/emergency-and-safety`, changeFrequency: 'monthly', priority: 0.6 },
    
    // Static Pages
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/help`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/disclaimer`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE_URL}/editorial-policy`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE_URL}/corrections`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE_URL}/accessibility`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/cookies`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/feedback`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/support`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/sitemap`, changeFrequency: 'monthly', priority: 0.4 },
  ];

  // Topic hub pages
  const topicUrls: SitemapEntry[] = [
    'identity-civil-registration',
    'passports-travel',
    'driving-transport',
    'money-tax',
    'health',
    'education',
    'land-property',
    'business',
    'work-employment',
    'benefits-social-protection',
    'crime-justice',
    'local-county-services',
    'elections-participation',
    'environment-farming',
    'digital-government',
    'disability',
    'youth',
  ].map((slug) => ({
    url: `${BASE_URL}/topics/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  const [supabaseUrls, sanityUrls] = await Promise.all([
    getSupabaseUrls(),
    getSanityUrls(),
  ]);

  const allUrls = [...staticUrls, ...topicUrls, ...supabaseUrls, ...sanityUrls];

  // Deduplicate
  const unique = Array.from(new Map(allUrls.map(u => [u.url, u])).values());

  return unique.map(entry => ({
    url: entry.url,
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}