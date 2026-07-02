// lib/data/heritageSites.utils.ts

export interface HeritageSite {
  _id: string
  name: string
  slug: string
  shortDescription: string
  fullDescription?: any
  category: string
  region: string
  county: string
  designationYear?: number
  designatingBody?: string
  unescoInscriptionNumber?: string
  historicalPeriod?: string
  historicalSignificance?: string
  associatedCommunities?: string[]
  specificLocation?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  visitorInfo?: {
    openingHours?: string
    admissionFee?: string
    accessibility?: string
    facilities?: string[]
  }
  mainImage?: any
  gallery?: any[]  // <-- ADDED
  officialWebsite?: string
  unescoLink?: string  // <-- ADDED
  externalLinks?: Array<{  // <-- ADDED
    title: string
    url: string
  }>
  status: string
}

export const CATEGORY_LABELS: Record<string, string> = {
  'unesco-cultural': 'UNESCO World Heritage (Cultural)',
  'unesco-natural': 'UNESCO World Heritage (Natural)',
  'national-monument': 'National Monument',
  'national-museum': 'National Museum',
  'archaeological': 'Archaeological Site',
}

export const REGION_LABELS: Record<string, string> = {
  'coastal': 'Coastal',
  'nairobi-central': 'Nairobi / Central',
  'rift-valley': 'Rift Valley',
  'nyanza-western': 'Nyanza / Western',
  'northern-eastern': 'Northern / Eastern',
}

export const STATUS_LABELS: Record<string, string> = {
  'active': 'Open to visitors',
  'restoration': 'Under restoration',
  'restricted': 'Restricted access',
  'closed': 'Currently closed',
}

/**
 * Get human-readable category label.
 */
export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || 'Heritage site'
}

/**
 * Get human-readable region label.
 */
export function getRegionLabel(region: string): string {
  return REGION_LABELS[region] || region
}

/**
 * Get human-readable status label.
 */
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status
}

/**
 * Check if site is a UNESCO site.
 */
export function isUnescoSite(category: string): boolean {
  return category.startsWith('unesco')
}

/**
 * Format designation year with context.
 */
export function formatDesignation(site: HeritageSite): string {
  if (!site.designationYear) return ''
  
  const body = site.designatingBody || 'Government of Kenya'
  return `Designated in ${site.designationYear} by ${body}`
}

/**
 * Group sites by category.
 */
export function groupSitesByCategory(sites: HeritageSite[]): Record<string, HeritageSite[]> {
  const grouped: Record<string, HeritageSite[]> = {}
  
  sites.forEach(site => {
    if (!grouped[site.category]) {
      grouped[site.category] = []
    }
    grouped[site.category].push(site)
  })
  
  return grouped
}

/**
 * Group sites by region.
 */
export function groupSitesByRegion(sites: HeritageSite[]): Record<string, HeritageSite[]> {
  const grouped: Record<string, HeritageSite[]> = {}
  
  sites.forEach(site => {
    if (!grouped[site.region]) {
      grouped[site.region] = []
    }
    grouped[site.region].push(site)
  })
  
  return grouped
}

/**
 * Filter sites by category and region.
 */
export function filterSites(
  sites: HeritageSite[],
  categoryFilter: string,
  regionFilter: string
): HeritageSite[] {
  return sites.filter(site => {
    const matchesCategory = categoryFilter === 'all' || site.category === categoryFilter
    const matchesRegion = regionFilter === 'all' || site.region === regionFilter
    return matchesCategory && matchesRegion
  })
}