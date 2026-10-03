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
  such as Dissolved, Defunct, Wound up, Renamed, Merged or Former, effective date
  and reason. Selecting a historical status publishes the record by default; keep it
  published so its original URL and officials' service links continue working.
  Use the optional **Detailed institution history** section only when a fuller
  timeline is needed: separate periods for bodies that stopped and later resumed,
  dated official names, or links to distinct earlier/later institutions. Choose
  which linked institution came first; mark a primary link only when it is the
  main predecessor or successor. Save this section with **Save history**; it is
  separate from the main institution form. Institution DELETE is disabled in the
  API and admin UI.
- A simple name correction can retain the same institution identity. When there is
  a distinct successor organisation, retain the former record and link the successor.
  Do not overwrite officials' historical service affiliations.

## Public presentation

The institutions directory defaults to current published bodies. A visible
**Show historical and former institutions** checkbox persists as
`?historical=include` and adds published dissolved, merged, renamed, split, wound-up
and defunct bodies to browsing and search. Historical profiles retain their URL,
identify the recorded change and effective date, explain the reason, link to
successors and show any dated operational periods and institutional relationships.
Officials' historical service records remain attached to the profile.

Publication is enforced by RLS for institutions, attached names, lifecycle periods,
relationships, locations and institution leadership records. Historical status never
automatically unpublishes a record. Unpublished predecessors are not exposed through
public name-history links. Existing officials' service records are retained.

The directory uses one search field, a narrow left column for counts and history
controls, and institution lists in the wider right column. The columns stack on
mobile. Public school browsing remains under the education directorates.

Institution branches and field offices are maintained separately from the
headquarters address under **Other offices and branches** on the institution edit
page. An office can record its type, service/geographic level, county,
constituency, sub-county, physical and postal addresses, contact details,
coordinates, opening/closing dates and notes. Published institution profiles
display these offices, including closed locations for historical reference.
Apply `lib/supabase/migrations/20261003_institution_offices.sql` before using this
admin section.

## Temporary public bodies

Task forces, working parties, advisory panels, commissions of inquiry, and similar
time-limited bodies are classified as `temporary_body`, not as institutions. The
admin form requires a body type and creating/parent institution; it also captures
appointing authority and optional start/end dates. Record people against the body
using the existing leader-role institution link so their service remains attached
to the right body after it closes.

The public institutions directory excludes temporary bodies. They are linked under
their creating institution with a type label and have a separate temporary-body
profile containing their purpose and service history. This preserves existing
institution and role references without misrepresenting a temporary committee as a
permanent government institution.

Before using this workflow, apply
`lib/supabase/migrations/20261003_temporary_public_bodies.sql` in Supabase.

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
