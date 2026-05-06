# Kenya Government Info - Implementation Guide

## Overview

This document outlines the implementation of API routes, pages, filtering systems, and Sanity.io CMS integration for the Kenya Government Information platform.

## Architecture

### 1. Database Layer (Supabase)

**Location:** `/lib/supabase/officials.ts`

Provides TypeScript interfaces and query functions for:
- Officials (presidents, governors, senators, MPs, judges, etc.)
- Positions (with hierarchy and rank ordering)
- Political Parties (with color coding)
- Counties (all 47 Kenyan counties)
- Constituencies and Wards
- Government Levels

**Key Types:**
```typescript
interface Official {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  position_id?: string;
  political_party_id?: string;
  county_id?: string;
  constituency_id?: string;
  ward_id?: string;
  is_active: boolean;
  start_date: string;
}
```

**Query Functions:**
- `getAllOfficials(limit, offset)` - Paginated list of all officials
- `getOfficialById(id)` - Get single official with full details
- `getOfficialsByPosition(positionCode, limit, offset)` - Filter by position
- `getOfficialsByCounty(countyCode, limit, offset)` - Filter by county
- `getOfficialsByParty(partyCode, limit, offset)` - Filter by political party
- `searchOfficials(query, limit, offset)` - Full-text search
- `getFilterOptions()` - Get available positions, counties, and parties for filtering

### 2. API Routes

**Base:** `/app/api/officials/`

#### Main Endpoints

**GET `/api/officials`**
- Returns paginated list of all officials
- Query params: `page` (default: 1), `limit` (default: 20)
- Response: `{ data: Official[], total: number, page: number, limit: number }`

**GET `/api/officials/[id]`**
- Returns single official with full details
- Path param: `id` (official ID)
- Response: `{ data: Official }`

**GET `/api/officials/position/[code]`**
- Returns all officials in a specific position
- Path param: `code` (position code, e.g., "PRESIDENT", "GOVERNOR")
- Query params: `page`, `limit`
- Response: `{ data: Official[], total: number }`

**GET `/api/officials/county/[code]`**
- Returns all officials from a county
- Path param: `code` (county code, e.g., "NAIR" for Nairobi)
- Query params: `page`, `limit`
- Response: `{ data: Official[], total: number }`

**GET `/api/officials/party/[code]`**
- Returns all officials from a political party
- Path param: `code` (party code, e.g., "ODM", "UDA")
- Query params: `page`, `limit`
- Response: `{ data: Official[], total: number }`

**GET `/api/officials/filters/options`**
- Returns available filter options
- Response: 
```json
{
  "positions": [
    { "code": "PRESIDENT", "title": "President" },
    ...
  ],
  "counties": [
    { "code": "NAIR", "name": "Nairobi" },
    ...
  ],
  "parties": [
    { "code": "ODM", "name": "Orange Democratic Movement", "color": "#FF6600" },
    ...
  ]
}
```

### 3. Pages and Components

**Location:** `/app/officials/` and `/components/officials/`

#### Pages

**`/officials`** - Officials Directory
- Main listing page with search and filtering
- Shows paginated list of officials
- Integrates filter controls and search
- GOV.UK Design System styling

**`/officials/[id]`** - Official Detail Page
- Individual official's full profile
- Shows position, party affiliation, county/constituency
- Related officials in same position
- Contact information if available

#### Components

**`OfficialCard.tsx`**
- Displays official information in card format
- Shows name, position, party (with color), and county
- Interactive link to detail page
- Mobile-responsive design

**`OfficialDetail.tsx`**
- Full official profile component
- Displays comprehensive information
- Shows party affiliation with visual indicator
- Related officials section
- Linked to positions, counties, and parties

**`OfficialsList.tsx`**
- Renders list of officials with cards
- Pagination controls
- Loading states
- Empty state handling

**`OfficialFilters.tsx`**
- Advanced filtering interface
- Position filter (dropdown or select)
- County filter (searchable dropdown)
- Political party filter
- Search input for name/title
- Filter reset button
- Active filter badges

**`PositionHierarchy.tsx`**
- Visualizes government position hierarchy
- Shows President → Deputy President → Cabinet hierarchy
- Judges and Commission structures
- National vs County levels

### 4. Sanity.io CMS Integration

**Location:** `/lib/sanity/client.ts` and `/lib/sanity/queries.ts`

**Credentials:**
- Project ID: `egkekbgr`
- Organization ID: `oPARwvA07`
- API Token: (stored in `SANITY_API_TOKEN` env var)

#### Sanity Content Types

1. **Guide** - Procedural guides and tutorials
   - Title, slug, description, content
   - Category, featured flag
   - Author and publication date

2. **Service** - Government services
   - Title, slug, description
   - Full description, category
   - Contact info, website, location
   - Requirements and how to apply
   - Related services

3. **FAQ** - Frequently Asked Questions
   - Question and answer text
   - Category for grouping
   - Keywords for search

4. **News** - Government news and updates
   - Title, slug, excerpt, content
   - Image, category, featured flag
   - Author and publication date
   - Related news

5. **PageContent** - Static page content
   - Hero sections, CTAs
   - Editable page sections

#### Sanity Queries

Located in `/lib/sanity/queries.ts`:
- `GUIDE_QUERY` - All guides
- `SINGLE_GUIDE_QUERY` - Single guide with related guides
- `SERVICE_QUERY` - All services
- `SINGLE_SERVICE_QUERY` - Single service with details
- `FAQ_QUERY` - All FAQs
- `FAQ_BY_CATEGORY_QUERY` - FAQs in category
- `NEWS_QUERY` - All news articles
- `SINGLE_NEWS_QUERY` - Single news with related
- `HERO_CONTENT_QUERY` - Homepage hero content

#### Sanity Pages

**`/guides`** - Guides Directory
- Lists all procedural guides
- Filtered by category
- Links to individual guides

**`/guides/[slug]`** - Individual Guide
- Full guide content with PortableText rendering
- Related guides section
- Breadcrumbs and navigation

**`/services`** - Services Directory
- All government services from Sanity
- Grouped by category
- Interactive service cards
- Links to detail pages

**`/services/[slug]`** - Service Detail
- Complete service information
- Requirements and how to apply
- Contact information
- External website link
- Related services

**`/help`** - Help & FAQs
- FAQs from Sanity.io
- Grouped by category
- Expandable details elements
- FAQ search functionality

### 5. Components - Sanity Content

**`PortableTextContent.tsx`**
- Renders Sanity PortableText rich content
- Custom styling for headings, text, links
- Image rendering with captions
- List and code block support
- GOV.UK Design System alignment

## Environment Variables

Required `.env` or `.env.local`:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Sanity.io
NEXT_PUBLIC_SANITY_PROJECT_ID=egkekbgr
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=<your-token>
```

## Features Implemented

### Officials Directory
- ✅ Complete list of Kenyan government officials (55+)
- ✅ Full-text search by name and position
- ✅ Filter by position (President, Governor, Senator, MP, Judge, etc.)
- ✅ Filter by county
- ✅ Filter by political party
- ✅ Individual official profiles with complete information
- ✅ Party affiliation with visual color coding
- ✅ Position hierarchy visualization
- ✅ Related officials (same position) on detail pages
- ✅ Pagination with page size control
- ✅ Mobile-responsive design
- ✅ GOV.UK Design System styling

### Content Management (Sanity.io)
- ✅ Guides and procedural documentation
- ✅ Services directory
- ✅ FAQ section with categories
- ✅ News and updates
- ✅ Editable page content
- ✅ Rich text content with PortableText rendering
- ✅ Image support
- ✅ Related content linking

### Search & Discovery
- ✅ Advanced filtering UI
- ✅ Multi-criteria filtering
- ✅ Search bar with real-time results
- ✅ Filter reset functionality
- ✅ Pagination controls
- ✅ Active filter badges

## Performance Optimizations

- Server-side data fetching (no client-side API calls for initial data)
- Pagination to limit data transfer
- Indexed database queries for fast filtering
- Static page generation where possible
- Image optimization via Next.js Image component
- Sanity CDN for fast content delivery

## Testing

To test the implementation:

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Visit the pages:
   - `/officials` - Main officials directory
   - `/officials/[id]` - Individual official (e.g., `/officials/william-ruto`)
   - `/services` - Services directory (from Sanity)
   - `/help` - Help page with FAQs (from Sanity)

3. Test filtering:
   - Use position dropdown to filter by government level
   - Use county selector to find local officials
   - Use party filter to see party representation
   - Use search to find specific officials

4. Test Sanity content:
   - Check that services load from Sanity
   - Verify FAQs display correctly
   - Test PortableText rendering for guides

## Future Enhancements

- Advanced search with filters
- Official profiles with social media links
- Government structure diagrams
- Budget and spending information
- Voting records and legislative tracking
- Interactive maps of counties and constituencies
- Calendar of government events
- Accessibility improvements
- Progressive web app (PWA) features

## Troubleshooting

### Officials not loading
- Check Supabase connection and credentials
- Verify database has been seeded
- Check browser console for error messages

### Services/FAQs not loading
- Verify Sanity project ID and dataset name
- Check SANITY_API_TOKEN is valid
- Ensure content exists in Sanity CMS
- Check browser console for error messages

### Styling issues
- Verify GOV.UK Design System CSS is imported
- Check Tailwind CSS configuration
- Clear browser cache and rebuild

## Database Schema

See `/db/schema.sql` for complete schema with:
- officials table
- positions table (with hierarchy)
- political_parties table
- counties table
- constituencies table
- wards table
- government_levels table

## API Response Examples

### Get All Officials
```bash
curl "http://localhost:3000/api/officials?page=1&limit=20"
```

Response:
```json
{
  "data": [
    {
      "id": "william-ruto",
      "first_name": "William",
      "last_name": "Ruto",
      "full_name": "William Samoei Ruto",
      "position_id": 1,
      "position": { "title": "President", "code": "PRESIDENT" },
      "political_party_id": 2,
      "political_party": { "name": "Kenya Kwanza Alliance (UDA)", "color": "#0066FF" },
      "is_active": true,
      "start_date": "2022-09-13"
    }
  ],
  "total": 55,
  "page": 1,
  "limit": 20
}
```

### Filter Options
```bash
curl "http://localhost:3000/api/officials/filters/options"
```

Response:
```json
{
  "positions": [
    { "code": "PRESIDENT", "title": "President", "level": "National" },
    { "code": "GOVERNOR", "title": "Governor", "level": "County" }
  ],
  "counties": [
    { "code": "NAIR", "name": "Nairobi", "region": "Nairobi" },
    { "code": "KIAM", "name": "Kiambu", "region": "Central" }
  ],
  "parties": [
    { "code": "ODM", "name": "Orange Democratic Movement", "color": "#FF6600" },
    { "code": "UDA", "name": "Kenya Kwanza Alliance (UDA)", "color": "#0066FF" }
  ]
}
```

## Deployment

When deploying to Vercel:

1. Set environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `SANITY_API_TOKEN`

2. Deploy:
   ```bash
   vercel deploy
   ```

The app is ready for production use on Vercel with proper caching and edge optimization.
