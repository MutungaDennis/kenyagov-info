# School administration and institutional history

Implemented on 22 September 2026. Database migrations are applied to the connected
Supabase project. Frontend changes are in the workspace; no production frontend
deployment was made.

## Admin workflow

- Open **Admin → Schools**, search/filter, then select the school name to edit it.
- Clear **Published**, then save, to remove a public school from public profiles,
  institution counts, school browsing and global search. Private schools always
  remain admin-only. Operating status describes whether the school operates and is
  independent of publication.
- Expand **Permanently delete this school** and type its exact saved name to delete
  that school and cascading aliases, identifiers, offerings and source links.
  The API authenticates administrators, checks request origin and matches both ID
  and saved name in the delete statement. No schools were deleted during testing.
- Open **Admin → Institutions → Edit details and history**. Set a lifecycle status
  such as Dissolved, Renamed, Merged or Former, effective date and reason. Use the
  existing lifecycle panel to record dated names, operational periods and lineage.
  Keep a historical institution published so its original URL and officials' service
  links continue working. Institution DELETE is disabled in the API and admin UI.
- A simple name correction can retain the same institution identity. When there is
  a distinct successor organisation, retain the former record and link the successor.
  Do not overwrite officials' historical service affiliations.

## Public presentation

The institutions directory defaults to current published bodies. The **Include
historical and former institutions** checkbox persists as `?historical=include`.
Previous names and links to published earlier organisations appear beneath current
entries in both list and table views and participate in directory searches.
Historical profiles retain their URL, show a warning and link to successors.
Historical global-search results have an explicit historical label and lower boost.

Publication is enforced by RLS for institutions, attached names, lifecycle periods,
relationships, locations and institution leadership records. Historical status never
automatically unpublishes a record. Unpublished predecessors are not exposed through
public name-history links. Existing officials' service records are retained.

The layout uses a full-width heading, indented organisational hierarchy, mobile
wrapping, labelled controls and a horizontally scrollable table. Public school
browsing remains behind the education directorate buttons.

Reference: [GOV.UK organisation guidance](https://guidance.publishing.service.gov.uk/publish-update-retire-content/organisations-people/organisations/)
retains closed organisation pages with closure/replacement information.

## Applied migrations

These migrations are already applied. Do not re-run the school publication migration
against this project; it appends a column to an existing view.

After the earlier school-directory and search migrations, the follow-up order was:

1. `lib/supabase/migrations/20260922_school_publication.sql`
2. `lib/supabase/migrations/20260922_scoped_directory_search.sql`
3. `lib/supabase/migrations/20260922_institution_publication_history.sql`

The scoped search migration completes typo-aware searches for cabinet briefs,
presidential speeches and wards while retaining their existing filters/pagination.

## Validation and limits

- Unit/API tests cover publication, deletion confirmation, authorisation, historical
  links, unpublished predecessors, search typos and URL safety.
- `tests/database/publication-readonly.sql` checks anonymous visibility, historical
  retention, search labels and absence of anonymous mutation privileges. It does
  not modify production rows. No live school was unpublished as a test.
- HTTP checks on localhost:3000 cover removed test route 404; public directory/profile
  200; typo searches for schools, cabinet briefs, speeches and wards 200.
- The in-app browser was unavailable. Interactive mobile and signed-in admin visual
  checks remain manual; code, API and database checks do not replace those checks.
- The earlier broad write-based RLS regression was rejected by automatic approval
  review because production UPDATE/DELETE fixtures can cause locks or trigger side
  effects despite rollback. It was not rerun; read-only checks were used instead.
