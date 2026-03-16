# Editorial Radar

Internal editorial intelligence MVP for The Lancet Digital Health.

## Phase 1 contents

- Next.js App Router app with Tailwind CSS
- Supabase magic-link authentication
- Protected dashboard, items table, item detail, watchlists, and settings pages
- Supabase SQL schema with row level security
- Seed data for browser-based testing
- Starter rule dictionaries and scoring helpers for later ingestion phases

## Folder structure

```text
app/
  (app)/
    items/
      [id]/
    settings/
    watchlists/
    layout.tsx
    page.tsx
  auth/callback/
  login/
  globals.css
  layout.tsx
components/
  auth/
  dashboard/
  items/
  ui/
lib/
  rules/
  supabase/
  data.ts
  types.ts
  utils.ts
supabase/
  schema.sql
  seed.sql
middleware.ts
```
