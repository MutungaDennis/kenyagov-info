import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

/** Public read client — CDN only (no API token; token bypasses CDN and costs CPU). */
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'egkekbgr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

const builder = createImageUrlBuilder(sanityClient);

export const urlFor = (source: any) => {
  return builder.image(source);
};

// Query functions for content
export async function getGuides() {
  return sanityClient.fetch(`
    *[_type == "guide"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      description,
      publishedAt,
      category,
      featured,
      author->{name}
    }
  `);
}

export async function getGuideBySlug(slug: string) {
  return sanityClient.fetch(
    `
    *[_type == "guide" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      content,
      publishedAt,
      category,
      featured,
      author->{name},
      relatedGuides[]->{title, slug}
    }
    `,
    { slug }
  );
}

export async function getNews() {
  return sanityClient.fetch(`
    *[_type == "news"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      category,
      featured,
      image,
      author->{name}
    }
  `);
}

export async function getNewsBySlug(slug: string) {
  return sanityClient.fetch(
    `
    *[_type == "news" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      excerpt,
      content,
      publishedAt,
      category,
      featured,
      image,
      author->{name}
    }
    `,
    { slug }
  );
}

export async function getServices() {
  return sanityClient.fetch(`
    *[_type == "service"] | order(name asc) {
      _id,
      name,
      slug,
      description,
      category,
      icon,
      link,
      featured
    }
  `);
}

export async function getServiceBySlug(slug: string) {
  return sanityClient.fetch(
    `
    *[_type == "service" && slug.current == $slug][0] {
      _id,
      name,
      slug,
      description,
      category,
      icon,
      link,
      featured,
      relatedServices[]->{name, slug}
    }
    `,
    { slug }
  );
}

export async function getFAQs() {
  return sanityClient.fetch(`
    *[_type == "faq"] | order(category, order asc) {
      _id,
      question,
      answer,
      category,
      order
    }
  `);
}

export async function getFAQsByCategory(category: string) {
  return sanityClient.fetch(
    `
    *[_type == "faq" && category == $category] | order(order asc) {
      _id,
      question,
      answer,
      category,
      order
    }
    `,
    { category }
  );
}

export async function getFAQCategories() {
  return sanityClient.fetch(`
    *[_type == "faq"] | order(category asc) {
      category
    } | group(category) | map({
      _id: _key,
      name: _key
    })
  `);
}

export async function getPages() {
  return sanityClient.fetch(`
    *[_type == "page"] | order(title asc) {
      _id,
      title,
      slug,
      content,
      featured,
      publishedAt
    }
  `);
}

export async function getPageBySlug(slug: string) {
  return sanityClient.fetch(
    `
    *[_type == "page" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      content,
      featured,
      publishedAt
    }
    `,
    { slug }
  );
}

export async function getInstitutionContent(slug: string) {
  return sanityClient.fetch(
    `
    *[_type == "institutionContent" && institutionSlug.current == $slug][0] {
      headquarters,
      whatItDoes,
      legalBasis,
      legalReference,
      website,
      email,
      phone,
      physicalAddress,
      contentType,
      servicesCharter,
      consularHoursDescription,
      localPublicHolidays,
      "coverBannerUrl": coverBannerImage.asset->url,
      downloadableDocuments[]{
        documentName,
        "fileUrl": fileAsset.asset->url
      },
      governingActs[]->{
        shortTitle,
        citation,
        "slug": slug.current
      }
    }
    `,
    { slug }
  );
}

// Add this function to your existing sanity client file
export async function getConstitutionArticle(chapter: number, article: number) {
  return sanityClient.fetch(`
    *[_type == "constitutionArticle" 
      && chapter == $chapter 
      && articleNumber == $article][0] {
        _id,
        chapter,
        chapterTitle,
        partNumber,
        partTitle,
        articleNumber,
        articleTitle,
        officialText,
        amplifiedText,
        userIntents,
        relatedActs[]->{
          _id,
          title,
          citation
        }
      }
  `, { chapter, article });
}

export async function getConstitutionChapter(chapter: number) {
  return sanityClient.fetch(
    `
    *[_type == "constitutionArticle" && chapter == $chapter] 
    | order(articleNumber asc) {
      _id,
      chapter,
      chapterTitle,
      partNumber,
      partTitle,
      articleNumber,
      articleTitle,
      officialText,
      amplifiedText
    }
    `,
    { chapter }
  );
}

/** TOC listing only — full text loads on chapter/article detail pages. */
export async function getAllConstitutionArticles() {
  try {
    return await sanityClient.fetch(`
    *[_type == "constitutionArticle"] 
    | order(chapter asc, articleNumber asc) {
        _id,
        chapter,
        chapterTitle,
        articleNumber,
        articleTitle
      }
  `);
  } catch (err) {
    console.error("[sanity] getAllConstitutionArticles failed:", err);
    return [];
  }
}

export async function getChapters() {
  try {
    const data = await sanityClient.fetch(`
    *[_type == "constitutionArticle"] 
    | order(chapter asc) 
    { 
      chapter, 
      chapterTitle 
    }
  `);

    // Remove duplicate chapters (client-side deduplication)
    const uniqueChapters = Array.from(
      new Map(
        (data || []).map((item: any) => [item.chapter, item]),
      ).values(),
    );

    return uniqueChapters;
  } catch (err) {
    console.error("[sanity] getChapters failed:", err);
    return [];
  }
}

export async function getChapterArticles(chapter: number) {
  return sanityClient.fetch(`
    *[_type == "constitutionArticle" && chapter == $chapter] 
    | order(articleNumber asc) {
        _id,
        articleNumber,
        articleTitle
      }
  `, { chapter });
}

export async function getConstitutionSettings() {
  try {
    return await sanityClient.fetch(
      `*[_type == "constitutionSettings" && _id == "constitutionSettings"][0]{
        _id,
        showPlainEnglishGlobal,
        chapterPlainEnglish[]{ chapter, showPlainEnglish }
      }`,
    );
  } catch (err) {
    console.error("[sanity] getConstitutionSettings failed:", err);
    return null;
  }
}

export async function getAllConstitutionSchedules() {
  try {
    return await sanityClient.fetch(
      `*[_type == "constitutionSchedule"] | order(scheduleNumber asc) {
        _id,
        scheduleNumber,
        "slug": slug.current,
        fullTitle,
        title,
        citation
      }`,
    );
  } catch (err) {
    console.error("[sanity] getAllConstitutionSchedules failed:", err);
    return [];
  }
}

export async function getConstitutionScheduleBySlug(slug: string) {
  try {
    return await sanityClient.fetch(
      `*[_type == "constitutionSchedule" && slug.current == $slug][0]{
        _id,
        scheduleNumber,
        "slug": slug.current,
        fullTitle,
        title,
        citation,
        officialText,
        amplifiedText
      }`,
      { slug },
    );
  } catch (err) {
    console.error("[sanity] getConstitutionScheduleBySlug failed:", err);
    return null;
  }
}

/** Enabled glossary phrases for display-time linking */
export async function getConstitutionLinkPhrases() {
  try {
    return await sanityClient.fetch(
      `*[_type == "constitutionLinkPhrase" && enabled != false] | order(sortOrder asc) {
        _id, phrase, matchMode, internalHref, externalHref, externalLabel,
        constitutionChapter, constitutionArticle, scopeChapters, enabled, sortOrder
      }`,
    );
  } catch (err) {
    console.error("[sanity] getConstitutionLinkPhrases failed:", err);
    return [];
  }
}

// ==========================================
// ACTS OF PARLIAMENT
// ==========================================

export async function getAllActsOfParliament() {
  return sanityClient.fetch(`
    *[_type == "actOfParliament"] 
    | order(yearEnacted desc, shortTitle asc) {
      _id,
      title,
      shortTitle,
      slug,
      citation,
      capNumber,
      yearEnacted,
      status,
      globalSummary,
      houseOfOrigin
    }
  `);
}

export async function getActOfParliamentBySlug(slug: string) {
  return sanityClient.fetch(
    `
    *[_type == "actOfParliament" && slug.current == $slug][0] {
      _id,
      title,
      shortTitle,
      slug,
      citation,
      capNumber,
      yearEnacted,
      dateOfAssent,
      dateOfCommencement,
      status,
      globalSummary,
      officialKenyaLawUrl,
      pdfDocument,
      houseOfOrigin,

      constitutionalBasis[]->{
        _id,
        articleNumber,
        articleTitle,
        chapter,
        chapterTitle
      },

      parts[] {
      _type,
        partNumber,
        partTitle,
        sections[] {
  sectionNumber,
  sectionTitle,
  officialText,
  plainSummary
},

scheduleNumber,
scheduleTitle,
relatedSection,
introText,

items[] {
  itemNumber,
  itemTitle,
  officialText,
  plainSummary
}
      },

      subsidiaryLegislation[] {
        title,
        legalNoticeNumber,
        year,
        pdfUrl
      },

      amendments[] {
        amendingAct,
        year,
        notes
      }
    }
    `,
    { slug }
  );
}

// ==========================================
// UNIFIED SANITY SEARCH (for /search page)
// Strong support for rich text content in Sanity (constitution, acts, guides, descriptions etc.)
// Uses pt::text() to search inside Portable Text blocks.
// Combined with Supabase structured data results for balanced full-site search.
// ==========================================
export async function searchSanityContent(query: string, limit = 25) {
  if (!query || query.trim().length < 2) return [];

  const term = query.toLowerCase().trim();
  const words = (term.match(/[\p{L}\p{N}]+/gu) || []).filter(word => word.length > 2).slice(0, 8);
  const wordParams = Object.fromEntries(words.map((word, index) => [`word${index}`, (word.length >= 6 ? word.slice(0, 3) : word) + "*"]));
  // Only parameter names enter GROQ; user text is always bound as a value.
  const wordFilters = words.length ? words.map((_, index) =>
    `lower(title) match $word${index} || lower(name) match $word${index} || pt::text(officialText) match $word${index} || pt::text(content) match $word${index}`
  ).join(' || ') : 'lower(title) match $term || lower(name) match $term';

  // Comprehensive GROQ across entire Sanity schema.
  // Covers guides, services, news, pages, constitution (parts/articles), acts/laws, institutionContent,
  // presidential trips, court pronouncements, report mandates, ministries, categories.
  // Uses pt::text() for all Portable Text rich content + strings + numbers (for "part 2", "article 35").
  return sanityClient.fetch(
    `
    *[
      _type in [
        "guide", "service", "news", "page", "constitutionArticle", 
        "actOfParliament", "institutionContent", "presidentialTrip",
        "courtPronouncement", "reportMandate", "governmentMinistry", "governmentCategory"
      ]
      && (
        ${wordFilters} ||
        // Raw for phrases
        pt::text(officialText) match $term ||
        pt::text(content) match $term
      )
    ] {
      _id,
      _type,
      title,
      name,
      shortTitle,
      articleTitle,
      chapter,
      articleNumber,
      partNumber,
      partTitle,
      chapterTitle,
      caseName,
      caseNumber,
      court,
      destinationCountry,
      tripType,
      departureDate,
      "slug": coalesce(slug.current, slug),
      "snippet": coalesce(
        pt::text(amplifiedText)[0...200], 
        pt::text(officialText)[0...200], 
        pt::text(content)[0...200],
        pt::text(purpose)[0...200],
        description, 
        excerpt, 
        globalSummary, 
        speechText,
        " "
      ),
      "base_route": select(
        _type == "guide" => "/guides",
        _type == "service" => "/services",
        _type == "news" => "/news",
        _type == "constitutionArticle" => "/constitution",
        _type == "actOfParliament" => "/acts/parliament",
        _type == "page" => "/",
        _type == "institutionContent" => "/government/institutions",
        _type == "presidentialTrip" => "/executive/presidency/international-visits",
        _type == "courtPronouncement" => "/judiciary",
        _type == "reportMandate" => "/documents",
        _type == "governmentMinistry" => "/government/institutions",
        _type == "governmentCategory" => "/services",
        "/"
      )
    } | order(_score desc, _createdAt desc) [0...$limit]
    `,
    { term, limit: Math.max(1, Math.min(limit, 100)), ...wordParams }
  );
}