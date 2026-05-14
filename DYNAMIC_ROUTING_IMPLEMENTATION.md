# Dynamic Hierarchical Routing Implementation

## Overview

This document outlines the implementation of multi-level dynamic routing for government hierarchy and entities in the Kenya Government Information platform.

## New URL Structure

### Leadership Routes
```
/leadership                                    → All leadership categories
/leadership/[category]                        → e.g., /leadership/executive
/leadership/[category]/[subcategory]          → e.g., /leadership/executive/cabinet-secretaries
/leadership/[category]/[subcategory]/[slug]   → Individual leader profile (future)
```

**Categories:**
- `executive` - The President and Cabinet
- `legislature` - National Assembly and Senate
- `judiciary` - Judges and Courts
- `county` - Governors and County Officials

**Subcategories:**
- cabinet-secretaries
- principal-secretaries
- national-assembly
- senate
- chief-justice
- governors
- deputy-governors

### Entities Routes
```
/entities                          → All entity categories
/entities/[category]               → e.g., /entities/ministries
/entities/[category]/[slug]        → Individual entity detail page
```

**Categories:**
- `ministries` - Ministries & Departments
- `agencies` - Agencies & Commissions
- `counties` - County Governments
- `institutions` - Public Institutions

## Implementation Files Created

### Data Structure Layer
- **`lib/data/leadership-hierarchy.ts`** - Defines all hierarchy mappings and validation functions
  - Leadership categories and subcategories
  - Entity categories
  - Type-safe hierarchy validation functions

### Pages
- **`app/leadership/page.tsx`** - Main leadership directory
- **`app/leadership/[category]/page.tsx`** - Category view (e.g., Executive branch)
- **`app/leadership/[category]/[subcategory]/page.tsx`** - Subcategory view (e.g., Cabinet Secretaries)
- **`app/entities/page.tsx`** - Main entities directory
- **`app/entities/[category]/page.tsx`** - Entity category view (e.g., Ministries)

### Admin Interface
- **`app/admin/page.tsx`** - Main admin dashboard
- **`app/admin/officials/page.tsx`** - Manage government officials
  - Add new officials
  - View all officials
  - Edit/delete functionality (ready for expansion)

### Database Layer
- **`lib/supabase/migrations/create_leaders_tables.sql`** - Database schema
  - `leadership_categories` - Category definitions
  - `leadership_subcategories` - Subcategory definitions
  - `leaders` - Individual leaders with hierarchical relationships
  - `entity_categories` - Entity category definitions
  - `entities` - Government organizations and institutions

## Data Access Functions

### To Be Implemented in Supabase Data Layer:

```typescript
// Leaders
getLeadersBySubcategory(subcategory: LeadershipSubcategory)
getLeaderBySlug(slug: string)
getLeadersbyCounty(county: string)
getLeadersbyParty(party: string)
addLeader(data: LeaderProfile)
updateLeader(id: string, data: Partial<LeaderProfile>)
deleteLeader(id: string)

// Entities
getEntitiesByCategory(category: EntityCategory)
getEntityBySlug(slug: string)
getEntitiesByCounty(county: string)
addEntity(data: Entity)
updateEntity(id: string, data: Partial<Entity>)
deleteEntity(id: string)
```

## Type Safety

All routes use TypeScript with full type safety:
- `isValidLeadershipCategory()` - Validates category values
- `isValidLeadershipSubcategory()` - Validates subcategory values
- `isValidEntityCategory()` - Validates entity category values
- `getCategoryBySubcategory()` - Gets parent category from subcategory

## Metadata Generation

All pages generate proper metadata for SEO:
- Dynamic title and description
- Breadcrumb navigation
- Structured data ready for future implementation

## Admin Features

The admin dashboard (`/admin`) provides:
1. **Officials Management** - Add, edit, delete government officials
2. **Counties Management** - Manage county information
3. **Positions Management** - Define government positions
4. **Parties Management** - Political party information
5. **Entities Management** - Government organizations

Admin features include:
- Form-based data entry
- Real-time table views
- Error handling and validation
- Direct Supabase integration via API routes

## Migration Path from Static Data

Currently, the data structure supports:
1. Static data from `/data` folder (governors.ts, senate-members.ts, etc.)
2. Supabase database integration (ready for seed data)
3. Admin interface to add/manage data

### Transition Steps:
1. Seed governors, senators, MPs into Supabase `leaders` table
2. Update data access functions to query Supabase
3. Update legacy pages to use new routes
4. Deprecate and remove `/data` folder

## Next Steps

1. **Seed Data**: Run migration to add governors, senators, MPs to Supabase
2. **Data Access Layer**: Implement `getLeadersBySubcategory()`, etc.
3. **Implement Subcategory Filters**: Add county, party filters to dynamic pages
4. **Admin Expansion**: Build edit/delete functionality for officials
5. **Legacy Page Migration**: Update `/legislature`, `/executive`, etc. to redirect to new routes

## Performance Considerations

- Routes use server-side rendering for SEO
- Database indexes on `slug`, `category_id`, `subcategory_id` for fast lookups
- RLS policies enable public read access for all data
- Future: Add caching for category and subcategory views

## Security

- RLS (Row Level Security) enabled on all tables
- Public read-only access for leadership and entities data
- Admin modifications require authentication (future implementation)
- All user inputs validated server-side

## Browser Compatibility

- Works with all modern browsers
- GOV.UK design system ensures accessibility (WCAG 2.1 AA)
- No JavaScript required for page navigation
