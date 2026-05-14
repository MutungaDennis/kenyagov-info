# Admin Dashboard User Guide

## Overview

The admin dashboard (`/admin`) allows you to manage all government data stored in Supabase. All changes are immediately reflected across the public website.

## Accessing the Admin Dashboard

Navigate to: `/admin`

**Note:** Admin functionality currently has no authentication. In production, add authentication via Supabase Auth or NextAuth.js.

## Main Sections

### 1. Government Officials

**URL:** `/admin/officials`

**Features:**
- View all government officials in a paginated table
- Add new officials with:
  - First Name (required)
  - Last Name (required)
  - Position/Title
  - County
  - Political Party
- Edit/delete officials (coming soon)

**Data Stored:**
- Full name (auto-generated from first + last name)
- Position ID
- County
- Political Party ID
- Active status

### 2. Counties

**URL:** `/admin/counties`

**Coming Soon** - Will allow managing:
- County names
- County codes
- Region assignments
- Population data
- Area information

### 3. Positions

**URL:** `/admin/positions`

**Coming Soon** - Will allow managing:
- Government positions
- Position titles
- Position descriptions
- Government level (National, County)
- Entity assignments

### 4. Political Parties

**URL:** `/admin/parties`

**Coming Soon** - Will allow managing:
- Party names
- Party codes/abbreviations
- Party colors (for UI display)
- Founded dates

### 5. Government Entities

**URL:** `/admin/entities`

**Coming Soon** - Will allow managing:
- Ministries and Departments
- Agencies and Commissions
- Institutions
- Entity descriptions
- Websites and contact info

## Data Structure

### Officials Table Schema
```typescript
{
  id: string;              // UUID
  first_name: string;
  last_name: string;
  full_name: string;       // Auto-generated
  position_id: number;     // Links to positions table
  county: string;
  political_party_id: number;  // Links to parties table
  is_active: boolean;
  created_at: timestamp;
  updated_at: timestamp;
}
```

### Leaders Table Schema (for hierarchical browsing)
```typescript
{
  id: string;
  name: string;
  title: string;
  category: string;        // executive, legislature, judiciary, county
  sub_category: string;    // cabinet-secretaries, senate, governors, etc.
  county: string;
  constituency: string;
  organization: string;    // Political party
  description: string;
  image: string;           // URL to profile image
  link: string;            // External link
  created_at: timestamp;
  updated_at: timestamp;
}
```

### Entities Table Schema
```typescript
{
  id: string;
  name: string;
  slug: string;           // URL-friendly identifier
  description: string;
  category: string;       // ministries, agencies, counties, institutions
  county: string;
  region: string;
  image_url: string;
  website_url: string;
  headquarters: string;
  is_active: boolean;
  created_at: timestamp;
  updated_at: timestamp;
}
```

## API Endpoints

### Officials API
- **GET** `/api/officials` - Get all officials with pagination
  - Query params: `q` (search), `limit` (default 20), `offset` (default 0)
  - Response: `{ data: Official[], total: number, limit: number, offset: number }`

- **POST** `/api/officials` - Add new official
  - Body: `{ first_name, last_name, position?, county?, party? }`
  - Response: `{ id, full_name, ... }`

### Leaders API (Future)
- **GET** `/api/leaders` - Get all leaders
- **GET** `/api/leaders?category=senate` - Filter by category
- **POST** `/api/leaders` - Add new leader

### Entities API (Future)
- **GET** `/api/entities` - Get all entities
- **GET** `/api/entities?category=ministries` - Filter by category
- **POST** `/api/entities` - Add new entity

## Navigation & Routing

### Public Routes
```
/leadership                              → Browse leadership by category
/leadership/[category]                   → View category (e.g., executive)
/leadership/[category]/[subcategory]     → View role type (e.g., Cabinet Secretaries)

/entities                                → Browse entities by type
/entities/[category]                     → View entity category (e.g., Ministries)
```

### Admin Routes
```
/admin                          → Admin dashboard home
/admin/officials                → Manage officials
/admin/counties                 → Manage counties (coming soon)
/admin/positions                → Manage positions (coming soon)
/admin/parties                  → Manage political parties (coming soon)
/admin/entities                 → Manage government entities (coming soon)
```

## Best Practices

### When Adding Officials
1. Use consistent county name spelling (check existing entries)
2. Use party abbreviations consistently (UDA, ODM, etc.)
3. Use proper title capitalization
4. Ensure first/last name split is logical

### Slugs
- Slugs are auto-generated from names
- Format: `lowercase-with-dashes`
- Example: `john-doe-kabiru` → `/leadership/.../john-doe-kabiru`

### Categories & Subcategories

**Leadership Categories:**
- `executive` - President and Cabinet
- `legislature` - Parliament and Senate
- `judiciary` - Courts and Judges
- `county` - County Governors and officials

**Entity Categories:**
- `ministries` - Government Ministries
- `agencies` - Government Agencies
- `counties` - County Administrations
- `institutions` - Public Institutions

## Troubleshooting

### Officials Not Appearing in Lists
1. Check if `is_active` is set to `true`
2. Verify `sub_category` matches expected values
3. Check Supabase RLS policies allow access

### Links Not Working
- Verify slug format is correct (lowercase-with-dashes)
- Check category/subcategory names match exactly

### Missing Data
- Check Supabase console for sync errors
- Verify table RLS policies allow read access
- Check browser console for API errors

## Future Enhancements

1. **Authentication** - Restrict admin access to authorized users
2. **Bulk Import** - CSV/Excel import for large datasets
3. **Edit/Delete** - Full CRUD operations for all data types
4. **Image Upload** - Upload profile images directly
5. **Audit Trail** - Track who changed what and when
6. **Export** - Export data in various formats
7. **Advanced Search** - Filter by multiple criteria
8. **Analytics** - View popular searches and pages

## Support

For issues or questions:
1. Check Supabase logs for errors
2. Review browser console for client-side errors
3. Verify API responses in Network tab
4. Check RLS policies in Supabase dashboard
