import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'egkekbgr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
  token: process.env.SANITY_API_TOKEN,
});

const builder = imageUrlBuilder(sanityClient);

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
      content,
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
      content,
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
      physicalAddress
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
      articleNumber,
      articleTitle,
      officialText
    }
    `,
    { chapter }
  );
}

export async function getAllConstitutionArticles() {
  return sanityClient.fetch(`
    *[_type == "constitutionArticle"] 
    | order(chapter asc, articleNumber asc) {
        _id,
        chapter,
        chapterTitle,
        articleNumber,
        articleTitle,
        officialText,
        amplifiedText,
        userIntents,
        
        // Fetch related data (optional but useful)
        relatedActs[]->{
          _id,
          title,
          citation
        },
        relatedJudgments[]->{
          _id,
          caseName,
          judgmentDate
        }
      }
  `);
}

export async function getChapters() {
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
    new Map(data.map((item: any) => [item.chapter, item])).values()
  );

  return uniqueChapters;
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
        partNumber,
        partTitle,
        sections[] {
          sectionNumber,
          sectionTitle,
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