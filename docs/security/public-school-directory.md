# Public school directory

Applied to the connected Supabase project using MCP migration `public_school_directory`.
Source: `lib/supabase/migrations/20260922_public_school_directory.sql`.
The migration is already applied; do not run it again on this project.

## Data and governance

The former `/schools-test` page reads `education_school_directory`, a view over
`education_schools`, offerings, identifiers, source records and geographic lookups.
The public institution directory now queries `education_schools` directly in pages
of 20. Institutions remain in their existing table; no school rows are duplicated.

- 18,302 public primary schools: Directorate of Primary Education, Ministry of Education.
- 6,304 public secondary schools: Directorate of Secondary Education, Ministry of Education.
- 4,938 private schools: administrator access only.
- One public ECDE record remains visible, with no assumed national directorate assignment.
- No imported junior-school classifications or national/extra-county categories exist.
  Junior records added or reclassified later automatically use DPE and MoE.

Database triggers maintain the hierarchy when ownership or main level changes.
Administrators manage public and private records through Admin > Schools.
`app/schools-test/page.tsx` has been removed; the route returns 404.
The editor supports name, short name, ownership, main level, description, contact
details, operating status, enrolment and teacher counts. Publication is controlled
separately. Deletion requires the exact saved school name and removes its dependent
aliases, identifiers, offerings and source links; unpublishing preserves those records.

## URLs and access

The school table already had a unique, non-null slug column. Its imported slugs
were normalized rather than adding a duplicate column. All 29,545 slugs are unique,
lowercase and hyphenated; articles a/an/the are omitted, initials retained, county
names distinguish duplicate names, with short IDs only where still necessary.
This follows [GOV.UK URL guidance](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/plan-manage-content/follow-url-standards/).
Old URLs are retained in `education_school_slug_aliases` and permanently redirect
to the public canonical profile. Private canonical URLs and aliases return 404.
Display-name edits keep existing URLs stable.

RLS restricts schools and associated rows to published public ownership for anonymous and
ordinary authenticated readers. Verified administrators retain access to all rows.
The public UI and search functions explicitly filter ownership and publication,
including for signed-in admins. Profiles are dynamically rendered so a publishing
change does not wait for a cached profile to expire.
The school editor API independently checks administrator authorization and rejects
unknown fields, preventing direct assignment of hierarchy or URL fields.

## Latest verification (22 September 2026)

- TypeScript and lint checks for changed files.
- 115 automated tests, including public-school lookup, unsafe website rejection,
  edit/delete validation, historical links and authorization of every admin API handler.
- Read-only publication regression: `tests/database/publication-readonly.sql`.
- Earlier school rollout checks: public school profile 200 with DSE/MoE;
  old URL 308; private school and private alias 404; admin page 307 to login;
  unauthenticated admin API 401.

The updated app is now serving on port 3000. No production frontend deployment was performed.
The in-app browser reported no available browser, so visual interaction checks could
not be completed.

The follow-up `school_publication` and `institution_publication_history` migrations
have been applied. See `docs/security/institution-history-and-school-admin.md`.
