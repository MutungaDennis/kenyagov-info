// lib/data/culturalEvents.utils.ts

export interface CulturalEvent {
  _id: string
  name: string
  slug: string
  shortDescription: string
  description?: any
  significance?: string
  timingType: 'fixed-date' | 'seasonal' | 'approximate' | 'periodic' | 'variable'
  specificDate?: string
  startMonth?: string
  endMonth?: string
  approximatePeriod?: string
  frequency: string
  nextExpectedYear?: number
  venue: string
  county: string
  isRotating?: boolean
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  eventCategory: string
  culturalGroups?: string[]
  organiser?: string
  mainImage?: any
  gallery?: any[]
  officialWebsite?: string
  externalLinks?: Array<{
    title: string
    url: string
  }>
  status: string
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const QUARTER_INFO = {
  Q1: { label: 'First quarter', months: 'January – March', range: [0, 2] },
  Q2: { label: 'Second quarter', months: 'April – June', range: [3, 5] },
  Q3: { label: 'Third quarter', months: 'July – September', range: [6, 8] },
  Q4: { label: 'Fourth quarter', months: 'October – December', range: [9, 11] },
}

export function getCurrentMonthIndex(): number {
  return new Date().getMonth()
}

export function getCurrentQuarter(): 'Q1' | 'Q2' | 'Q3' | 'Q4' {
  const month = getCurrentMonthIndex()
  if (month <= 2) return 'Q1'
  if (month <= 5) return 'Q2'
  if (month <= 8) return 'Q3'
  return 'Q4'
}

export function getMonthIndex(monthName: string): number {
  return MONTHS.indexOf(monthName)
}

export function formatEventTiming(event: CulturalEvent): string {
  switch (event.timingType) {
    case 'fixed-date':
      if (event.specificDate) {
        const date = new Date(event.specificDate)
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
      }
      return 'Fixed date'
    
    case 'seasonal':
      if (event.startMonth && event.endMonth) {
        return `${event.startMonth} – ${event.endMonth}`
      }
      if (event.startMonth) {
        return event.startMonth
      }
      return 'Seasonal'
    
    case 'approximate':
      return event.approximatePeriod || 'Approximate period'
    
    case 'periodic':
      if (event.nextExpectedYear) {
        return `Next expected: ${event.nextExpectedYear} (${event.frequency})`
      }
      return event.frequency
    
    case 'variable':
      return 'Dates vary each year'
    
    default:
      return 'Timing varies'
  }
}

export function formatEventLocation(event: CulturalEvent): string {
  if (event.isRotating) {
    return `${event.venue} (rotating host county)`
  }
  return `${event.venue}, ${event.county}`
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'cultural-festival': 'Cultural festival',
    'traditional-ceremony': 'Traditional ceremony',
    'national-celebration': 'National celebration',
    'sports': 'Sports and recreation',
    'natural-phenomenon': 'Natural phenomenon',
    'arts-music': 'Arts and music',
    'historical': 'Historical commemoration',
    'religious': 'Religious or spiritual',
  }
  return labels[category] || 'Cultural event'
}

export function getQuarterInfo(quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4') {
  return QUARTER_INFO[quarter]
}

export function groupEventsByQuarter(events: CulturalEvent[]): Record<string, CulturalEvent[]> {
  const grouped: Record<string, CulturalEvent[]> = {
    Q1: [],
    Q2: [],
    Q3: [],
    Q4: [],
  }
  
  events.forEach(event => {
    if (grouped[event.quarter]) {
      grouped[event.quarter].push(event)
    }
  })
  
  return grouped
}

export function getUpcomingPriority(event: CulturalEvent): number | null {
  const currentMonth = getCurrentMonthIndex()
  const quarterInfo = QUARTER_INFO[event.quarter]
  const [quarterStart, quarterEnd] = quarterInfo.range
  
  if (quarterStart > currentMonth) {
    return quarterStart - currentMonth
  }
  
  if (quarterStart <= currentMonth && currentMonth <= quarterEnd) {
    if (event.timingType === 'fixed-date' && event.specificDate) {
      const eventDate = new Date(event.specificDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      eventDate.setHours(0, 0, 0, 0)
      
      if (eventDate >= today) {
        return (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      }
    }
    
    if (event.timingType === 'seasonal' && event.startMonth) {
      const startIdx = getMonthIndex(event.startMonth)
      if (startIdx >= currentMonth) {
        return startIdx - currentMonth
      }
    }
    
    return 0.5
  }
  
  if (event.timingType === 'periodic' && event.nextExpectedYear) {
    const currentYear = new Date().getFullYear()
    if (event.nextExpectedYear > currentYear) {
      return 1000 + (event.nextExpectedYear - currentYear) * 12
    }
  }
  
  return null
}

export function getUpcomingEvents(events: CulturalEvent[], limit: number = 3): CulturalEvent[] {
  return events
    .map(event => ({ event, priority: getUpcomingPriority(event) }))
    .filter(item => item.priority !== null)
    .sort((a, b) => (a.priority || 0) - (b.priority || 0))
    .slice(0, limit)
    .map(item => item.event)
}

export function getCurrentQuarterEvents(events: CulturalEvent[]): CulturalEvent[] {
  const currentQuarter = getCurrentQuarter()
  return events.filter(event => event.quarter === currentQuarter)
}

export function getEventsForQuarter(events: CulturalEvent[], quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'): CulturalEvent[] {
  return events.filter(event => event.quarter === quarter)
}