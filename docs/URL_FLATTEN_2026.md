# URL flatten (2026) — national events & identity pages

## New canonical paths

| Path | Purpose |
|------|---------|
| `/national-events` | National events hub |
| `/national-events/[slug]` | Category / event detail (data-driven) |
| `/national-events/ask-shows` | ASK shows hub |
| `/national-events/ask-shows/[slug]` | ASK show profile |
| `/national-events/devolution-conference` | Devolution Conference |
| `/national-events/devolution-sensitisation-week` | DSW |
| `/national-events/kenya-music-festival` | Kenya Music Festival |
| `/national-events/kenya-national-drama-and-film-festival` | KNDFF |
| `/national-symbols` | Flag, arms, anthem |
| `/religion-and-faith` | Faith communities |

Society hub remains `/society-and-culture` and links to the short paths.

## Redirects

- **App:** permanent redirects in `next.config.ts`
- **Edge (preferred):** Cloudflare Redirect Rules — see `CLOUDFLARE.md` §2.5

## R2 ISR

See `CLOUDFLARE.md` §2.4 — bucket `kenyagov-info-next-cache`.
