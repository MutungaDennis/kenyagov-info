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
