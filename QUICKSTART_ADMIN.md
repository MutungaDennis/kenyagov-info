# Quick Start: Admin Dashboard & Dynamic Routing

## What's New

Your Kenya Government Info site now has:
1. **Multi-level hierarchical routing** for browsing government leadership and entities
2. **Admin dashboard** at `/admin` for managing all data
3. **Supabase integration** for persistent data storage
4. **Dynamic pages** that automatically organize data by category and role

## Public Navigation

### Browse Government Leadership
```
/leadership                    → All leadership categories
/leadership/executive          → Executive branch
/leadership/executive/cabinet-secretaries  → Cabinet members
```

**Categories:**
- Executive (President, Cabinet)
- Legislature (Parliament, Senate)
- Judiciary (Courts, Judges)
- County (Governors, County officials)

### Browse Government Entities
```
/entities                 → All government organizations
/entities/ministries      → Ministries & Departments
/entities/agencies        → Agencies & Commissions
/entities/counties        → County Governments
/entities/institutions    → Public Institutions
```

## Admin Operations

### Add an Official
1. Go to `/admin`
2. Click "Government Officials" or visit `/admin/officials`
3. Click "Add New Official"
4. Fill in:
   - First Name (required)
   - Last Name (required)
   - Position (optional)
   - County (optional)
   - Political Party (optional)
5. Click "Add Official"

The official now appears in leadership listings and can be browsed by:
- Category (e.g., `/leadership/county`)
- Subcategory (e.g., `/leadership/county/governors`)

### View Officials
Visit `/admin/officials` to see all added officials in a table view.

## File Structure

```
app/
├── leadership/
│   ├── page.tsx                    # Main leadership directory
│   └── [category]/
│       ├── page.tsx                # Category view (e.g., Executive)
│       └── [subcategory]/
│           └── page.tsx            # Subcategory view (e.g., Senators)
├── entities/
│   ├── page.tsx                    # Main entities directory
│   └── [category]/
│       └── page.tsx                # Entity category view
└── admin/
    ├── page.tsx                    # Admin dashboard
    └── officials/
        └── page.tsx                # Manage officials

lib/
├── data/
│   └── leadership-hierarchy.ts    # Category/subcategory definitions
├── supabase/
│   ├── leaders.ts                 # Leader data access functions
│   ├── entities.ts                # Entity data access functions
│   └── officials.ts               # Official data access functions
```

## Database Tables

### leaders
Contains all government officials with hierarchical data
```sql
SELECT * FROM leaders 
WHERE sub_category = 'governors'
ORDER BY name;
```

### entities
Contains government organizations and institutions
```sql
SELECT * FROM entities 
WHERE category = 'ministries'
ORDER BY name;
```

### officials
Contains more detailed official information (from existing data)
```sql
SELECT * FROM officials 
WHERE is_active = true
ORDER BY full_name;
```

## Common Tasks

### Populate Data from Existing Files
```typescript
// Import data from /data/governors.ts
import { governors } from '@/data/governors';

// Loop through and insert into Supabase leaders table
for (const gov of governors) {
  await createLeader({
    name: gov.name,
    title: 'Governor',
    category: 'county',
    sub_category: 'governors',
    county: gov.county,
    organization: gov.party,
    // ... other fields
  });
}
```

### Query Leaders by Category
```typescript
// Get all senators
const senators = await getLeadersBySubcategory('senate');

// Get all governors
const governors = await getLeadersBySubcategory('governors');

// Get all Cabinet Secretaries
const cabinet = await getLeadersBySubcategory('cabinet-secretaries');
```

### Query Entities
```typescript
// Get all ministries
const ministries = await getEntitiesByCategory('ministries');

// Get entities in a specific county
const countyEntities = await getEntitiesByCounty('Nairobi');

// Search entities
const results = await searchEntities('health');
```

## Next Steps

1. **Seed Initial Data**
   - Use admin dashboard to add governors, senators, MPs
   - Or import from existing `/data` files via migration script

2. **Customize Leadership Categories**
   - Edit `lib/data/leadership-hierarchy.ts` to add/modify categories
   - Update Supabase `leadership_categories` table

3. **Add Entity Details**
   - Use admin dashboard to add ministries, agencies, institutions
   - Add descriptions, websites, contact information

4. **Implement Individual Pages**
   - Create `/leadership/[category]/[subcategory]/[slug]/page.tsx` for leader profiles
   - Create `/entities/[category]/[slug]/page.tsx` for entity details

5. **Secure Admin Area**
   - Add authentication to `/admin` routes
   - Implement role-based access control
   - Add audit logging

## API Endpoints

### Officials
- `GET /api/officials` - List all officials
- `GET /api/officials?q=search&limit=20&offset=0` - Search officials
- `POST /api/officials` - Add new official

### Leaders (Ready to implement)
- `GET /api/leaders` - List all leaders
- `GET /api/leaders?category=senate` - Filter by category
- `POST /api/leaders` - Add new leader

### Entities (Ready to implement)
- `GET /api/entities` - List all entities
- `GET /api/entities?category=ministries` - Filter by category
- `POST /api/entities` - Add new entity

## Troubleshooting

### Officials not showing in /leadership
- Check `is_active = true` in database
- Verify `sub_category` value matches a valid subcategory
- Clear browser cache and reload

### Dynamic routes not working
- Ensure folder names match exactly: `[category]`, `[subcategory]`, `[slug]`
- Check that routes are under `/app` directory (not `/pages`)
- Verify Next.js is using App Router

### Database connection issues
- Check `NEXT_PUBLIC_SUPABASE_URL` is set
- Verify `SUPABASE_SERVICE_ROLE_KEY` in environment
- Check Supabase project is active

## Documentation

- **Full implementation details**: See `DYNAMIC_ROUTING_IMPLEMENTATION.md`
- **Admin features**: See `ADMIN_GUIDE.md`
- **Data structure**: See `lib/data/leadership-hierarchy.ts`

## Key Files to Understand

1. **`lib/data/leadership-hierarchy.ts`** - The hierarchy configuration
2. **`lib/supabase/leaders.ts`** - Data access for leaders
3. **`lib/supabase/entities.ts`** - Data access for entities
4. **`app/leadership/[category]/[subcategory]/page.tsx`** - Main dynamic page
5. **`app/admin/page.tsx`** - Admin dashboard hub
