export const GUIDE_QUERY = `
  *[_type == "guide"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    description,
    content,
    category,
    featured,
    image,
    author,
    publishedAt,
    _createdAt
  }
`;

export const SINGLE_GUIDE_QUERY = `
  *[_type == "guide" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    content,
    category,
    image,
    author,
    publishedAt,
    _createdAt,
    relatedGuides[] -> {
      _id,
      title,
      slug,
      description
    }
  }
`;

export const SERVICE_QUERY = `
  *[_type == "service"] | order(title asc) {
    _id,
    title,
    slug,
    description,
    fullDescription,
    category,
    icon,
    contactInfo,
    website,
    location,
    _createdAt
  }
`;

export const SINGLE_SERVICE_QUERY = `
  *[_type == "service" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    fullDescription,
    category,
    icon,
    contactInfo,
    website,
    location,
    requirements,
    howToApply,
    relatedServices[] -> {
      _id,
      title,
      slug,
      description
    },
    _createdAt
  }
`;

export const FAQ_QUERY = `
  *[_type == "faq"] | order(category asc, order asc) {
    _id,
    question,
    answer,
    category,
    keywords,
    _createdAt
  }
`;

export const FAQ_BY_CATEGORY_QUERY = `
  *[_type == "faq" && category == $category] | order(order asc) {
    _id,
    question,
    answer,
    category,
    keywords
  }
`;

export const NEWS_QUERY = `
  *[_type == "news"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    content,
    image,
    category,
    featured,
    author,
    publishedAt,
    _createdAt
  }
`;

export const SINGLE_NEWS_QUERY = `
  *[_type == "news" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    content,
    image,
    category,
    author,
    publishedAt,
    _createdAt,
    relatedNews[] -> {
      _id,
      title,
      slug,
      excerpt,
      publishedAt
    }
  }
`;


export const HERO_CONTENT_QUERY = `
  *[_type == "pageContent" && page == "home"][0] {
    _id,
    page,
    heroTitle,
    heroDescription,
    heroImage,
    callToAction,
    ctaUrl,
    sections[]
  }
`;

// ==========================================
// CULTURAL EVENTS
// ==========================================

export const CULTURAL_EVENTS_QUERY = `
  *[_type == "culturalEvent" && status == "active"] | order(quarter asc, name asc) {
    _id,
    name,
    "slug": slug.current,
    shortDescription,
    description,
    significance,
    timingType,
    specificDate,
    startMonth,
    endMonth,
    approximatePeriod,
    frequency,
    nextExpectedYear,
    venue,
    county,
    isRotating,
    quarter,
    eventCategory,
    culturalGroups,
    organiser,
    mainImage,
    officialWebsite,
    status
  }
`;

export const CULTURAL_EVENT_BY_SLUG_QUERY = `
  *[_type == "culturalEvent" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    shortDescription,
    description,
    significance,
    timingType,
    specificDate,
    startMonth,
    endMonth,
    approximatePeriod,
    frequency,
    nextExpectedYear,
    venue,
    county,
    isRotating,
    quarter,
    eventCategory,
    culturalGroups,
    organiser,
    mainImage,
    gallery,
    externalLinks,
    officialWebsite,
    status
  }
`;

export const CULTURAL_EVENT_SLUGS_QUERY = `
  *[_type == "culturalEvent" && defined(slug.current)] {
    "slug": slug.current
  }
`;


export const HERITAGE_SITES_QUERY = `
  *[_type == "heritageSite" && status == "active"] | order(category asc, name asc) {
    _id,
    name,
    "slug": slug.current,
    shortDescription,
    fullDescription,
    category,
    region,
    county,
    designationYear,
    designatingBody,
    historicalPeriod,
    historicalSignificance,
    associatedCommunities,
    specificLocation,
    mainImage,
    officialWebsite,
    status
  }
`;

export const HERITAGE_SITE_BY_SLUG_QUERY = `
  *[_type == "heritageSite" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    shortDescription,
    fullDescription,
    category,
    region,
    county,
    designationYear,
    designatingBody,
    unescoInscriptionNumber,
    historicalPeriod,
    historicalSignificance,
    associatedCommunities,
    specificLocation,
    coordinates,
    visitorInfo,
    mainImage,
    gallery,
    officialWebsite,
    unescoLink,
    externalLinks,
    status
  }
`;

export const HERITAGE_SITE_SLUGS_QUERY = `
  *[_type == "heritageSite" && defined(slug.current)] {
    "slug": slug.current
  }
`;