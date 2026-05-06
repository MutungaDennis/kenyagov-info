# Data Migration Guide: Files to Supabase

This guide explains how to migrate data from static JSON/TS files to Supabase, removing file dependencies.

## Current Data Files

### Location: `/data/`

1. **`governors.ts`** - 47 governors
   - Fields: id, name, county, countySlug, party, region, deputyGovernor

2. **`senate-members.ts`** - 67+ senators
   - Fields: id, name, county, party, type, slug

3. **`national-assembly-members.ts`** - 400+ MPs
   - Fields: id, name, constituency, party, type, slug

4. **`counties/`** - County data (to be inventoried)

5. **`leaders/`** - Leader categories and definitions

## Migration Strategy

### Step 1: Map Data to Supabase Schema

#### Governors → leaders table
```typescript
// Mapping:
governors.name          → leaders.name
governors.county        → leaders.county
governors.party         → leaders.organization
(new)                   → leaders.category = 'county'
(new)                   → leaders.sub_category = 'governors'
(new)                   → leaders.title = 'Governor'
governors.deputyGovernor→ (create separate entry or notes)
```

#### Senators → leaders table
```typescript
// Mapping:
senateMembers.name      → leaders.name
senateMembers.county    → leaders.county
senateMembers.party     → leaders.organization
senateMembers.type      → (Elected/Nominated stored as note or field)
(new)                   → leaders.category = 'legislature'
(new)                   → leaders.sub_category = 'senate'
(new)                   → leaders.title = 'Senator'
```

#### MPs → leaders table
```typescript
// Mapping:
members.name            → leaders.name
members.constituency    → leaders.constituency
members.party           → leaders.organization
members.type            → (Constituency/Women Rep/Nominated)
(new)                   → leaders.category = 'legislature'
(new)                   → leaders.sub_category = 'national-assembly'
(new)                   → leaders.title = 'Member of Parliament'
```

### Step 2: Create Migration Script

Create `/scripts/migrate-data-to-supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { governors } from '@/data/governors';
import { senateMembers } from '@/data/senate-members';
import { nationalAssemblyMembers } from '@/data/national-assembly-members';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrateGovernors() {
  const governorsData = governors.map((gov) => ({
    id: `gov-${gov.id}`,
    name: gov.name,
    title: 'Governor',
    category: 'county',
    sub_category: 'governors',
    county: gov.county,
    constituency: null,
    organization: gov.party,
    description: `Governor of ${gov.county}`,
    image: null,
    link: null,
  }));

  const { error } = await supabase.from('leaders').insert(governorsData);
  if (error) console.error('Error migrating governors:', error);
  else console.log(`✓ Migrated ${governorsData.length} governors`);
}

async function migrateSenators() {
  const senatorsData = senateMembers.map((senator) => ({
    id: `senator-${senator.id}`,
    name: senator.name,
    title: 'Senator',
    category: 'legislature',
    sub_category: 'senate',
    county: senator.county,
    constituency: null,
    organization: senator.party,
    description: `${senator.type} Senator from ${senator.county}`,
    image: null,
    link: null,
  }));

  const { error } = await supabase.from('leaders').insert(senatorsData);
  if (error) console.error('Error migrating senators:', error);
  else console.log(`✓ Migrated ${senatorsData.length} senators`);
}

async function migrateNationalAssembly() {
  const mpsData = nationalAssemblyMembers.map((member) => ({
    id: `mp-${member.id}`,
    name: member.name,
    title: 'Member of Parliament',
    category: 'legislature',
    sub_category: 'national-assembly',
    county: extractCountyFromConstituency(member.constituency),
    constituency: member.constituency,
    organization: member.party,
    description: `${member.type} from ${member.constituency}`,
    image: null,
    link: null,
  }));

  const { error } = await supabase.from('leaders').insert(mpsData);
  if (error) console.error('Error migrating MPs:', error);
  else console.log(`✓ Migrated ${mpsData.length} MPs`);
}

function extractCountyFromConstituency(constituency: string): string {
  // Logic to map constituency to county
  // This may require a constituency→county mapping
  return constituency.split('(')[0].trim();
}

async function runMigration() {
  console.log('Starting data migration...\n');
  
  await migrateGovernors();
  await migrateSenators();
  await migrateNationalAssembly();

  console.log('\n✓ Migration complete!');
}

// Run: npx tsx scripts/migrate-data-to-supabase.ts
runMigration().catch(console.error);
```

### Step 3: Run Migration

```bash
# Create script directory if needed
mkdir -p scripts

# Create the migration script
# (copy the code from Step 2 above)

# Install tsx if needed
npm install --save-dev tsx

# Run the migration
npx tsx scripts/migrate-data-to-supabase.ts
```

### Step 4: Verify Data

Check Supabase dashboard:
1. Go to Supabase → SQL Editor
2. Run: `SELECT COUNT(*) as total, category, sub_category FROM leaders GROUP BY category, sub_category;`
3. Verify counts match:
   - County → governors: 47
   - Legislature → senate: 67+
   - Legislature → national-assembly: 400+

### Step 5: Remove Data File Imports

Find and update all files importing from `/data/`:

```bash
# Find all imports
grep -r "from '@/data/" app/ lib/
grep -r "from '../data/" app/ lib/
```

**Files to update:**
- `/app/legislature/national-assembly/members/page.tsx`
- `/app/legislature/senate/senators/page.tsx`
- `/app/counties/governors/page.tsx`
- `/app/counties/all-counties/page.tsx`
- Any other files using `/data` imports

**Update pattern:**
```typescript
// BEFORE
import { governors } from '@/data/governors';
export default function Page() {
  return <div>{governors.map(...)}</div>;
}

// AFTER
import { getLeadersBySubcategory } from '@/lib/supabase/leaders';
export default async function Page() {
  const governors = await getLeadersBySubcategory('governors');
  return <div>{governors.map(...)}</div>;
}
```

### Step 6: Update Legacy Pages

Update these pages to use new routes or remove them:

1. **`/legislature/national-assembly/members`**
   - → `/leadership/legislature/national-assembly`

2. **`/legislature/senate/senators`**
   - → `/leadership/legislature/senate`

3. **`/counties/governors`**
   - → `/leadership/county/governors`

4. **`/counties/all-counties`**
   - → Keep or update to `/entities/counties`

### Step 7: Deprecate Data Files

Once migration is complete:

1. **Create deprecation notice** in `/data/README.md`:
```markdown
# Deprecated Data Directory

This directory contains static data files that have been migrated to Supabase.

**Do not add new data here.** Use the admin dashboard at `/admin` instead.

Files marked for deletion:
- governors.ts
- senate-members.ts
- national-assembly-members.ts

These can be safely removed once all imports are removed from the codebase.
```

2. **Search codebase** for remaining imports:
```bash
grep -r "governors" app/ lib/ --include="*.ts" --include="*.tsx"
grep -r "senateMembers" app/ lib/ --include="*.ts" --include="*.tsx"
grep -r "nationalAssemblyMembers" app/ lib/ --include="*.ts" --include="*.tsx"
```

3. **Remove imports** and test all pages work with Supabase

4. **Delete files** when no imports remain:
```bash
rm -rf data/
```

## Verification Checklist

- [ ] Migration script created and tested
- [ ] All governors in Supabase with correct category/subcategory
- [ ] All senators in Supabase with correct category/subcategory
- [ ] All MPs in Supabase with correct category/subcategory
- [ ] `/leadership/county/governors` page displays governors
- [ ] `/leadership/legislature/senate` page displays senators
- [ ] `/leadership/legislature/national-assembly` page displays MPs
- [ ] Search functionality works for migrated data
- [ ] All legacy imports removed from codebase
- [ ] `/data` directory removed
- [ ] Admin dashboard used for any new data entries

## Rollback Plan

If migration needs to be rolled back:

1. **Backup current database**:
```bash
# In Supabase SQL Editor
CREATE TABLE leaders_backup AS SELECT * FROM leaders;
```

2. **Delete migrated data**:
```bash
DELETE FROM leaders WHERE category IN ('county', 'legislature');
```

3. **Restore from `/data` files**:
```bash
# Restore imports in pages
# Keep using static data
```

## Post-Migration Tasks

1. **Update navigation** to link to new routes
2. **Update sitemap** to include new routes
3. **Update metadata** for SEO
4. **Test all pages** work with Supabase
5. **Monitor Supabase logs** for errors
6. **Update documentation** links
7. **Announce deprecation** of old routes

## Performance Notes

Before migration:
- Pages read from static files (fast, but static)
- Data must be rebuilt for each page

After migration:
- Pages query Supabase (slightly slower, but dynamic)
- Data is real-time from admin dashboard
- Can add caching for performance
- Can add pagination for large lists

## Monitoring

After migration, monitor:
- API response times (should be <100ms)
- Database query times (check Supabase logs)
- Page load times (check Core Web Vitals)
- User engagement (page views, search usage)

## Timeline

- **Day 1**: Create and test migration script
- **Day 2**: Run migration, verify data
- **Day 3**: Update legacy pages to use Supabase
- **Day 4**: Remove all `/data` imports
- **Day 5**: Delete `/data` directory, deploy

## Support

If you encounter issues:

1. **Check Supabase logs**: Dashboard → Logs
2. **Check migration script output**: Verify counts and errors
3. **Test individual queries**: Use SQL Editor
4. **Compare source and destination**: Check data integrity
5. **Contact support**: Provide migration logs and error messages
