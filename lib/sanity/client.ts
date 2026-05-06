import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'egkekbgr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
  token: process.env.SANITY_API_TOKEN,
});

const builder = imageUrlBuilder(sanityClient);

export const urlFor = (source: SanityImageSource) => {
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
