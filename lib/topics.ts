/**
 * Citizen-facing topic taxonomy for /topics and related hubs.
 * Full topic bodies: public/data/topics.json (not embedded in Worker).
 */

import { loadStaticJson } from "@/lib/data/load-static-json";

export type TopicLink = {
  text: string;
  href: string;
  external?: boolean;
};

export type Topic = {
  slug: string;
  title: string;
  summary: string;
  lead: string;
  sections: Array<{
    heading: string;
    body: string[];
    links?: TopicLink[];
  }>;
  relatedServices?: TopicLink[];
  officialLinks?: TopicLink[];
};

type Bundle = { topics: Topic[] };

let cache: Topic[] | null = null;

export async function loadTopics(): Promise<Topic[]> {
  if (cache) return cache;
  const data = await loadStaticJson<Bundle>("data/topics.json");
  cache = data.topics ?? [];
  return cache;
}

/** Empty at module init — use loadTopics(). */
export const topics: Topic[] = [];

export async function getTopicBySlug(
  slug: string,
): Promise<Topic | undefined> {
  const list = await loadTopics();
  return list.find((t) => t.slug === slug);
}

export async function getAllTopicSlugs(): Promise<string[]> {
  const list = await loadTopics();
  return list.map((t) => t.slug);
}
