# LDH Scout

LDH Scout is a browser-first editorial preprint scouting tool for **The Lancet Digital Health**.

It ingests newly posted preprints from medRxiv and bioRxiv, extracts public contact details where possible, scores papers against an editable editorial rubric, and stores daily / weekly digests for the editorial team.

## What is included

- **Daily ingestion workflow** from medRxiv and bioRxiv
- **Versioned scoring rubric** stored in Supabase, editable from `/admin/rubric`
- **Contact extraction** from public metadata and JATS XML when available
- **Dashboard** of ranked papers
- **Paper detail pages** with explanation traces and contact info
- **Daily and weekly digests**
- **Vercel cron routes** for automated runs

## Stack

- **Next.js App Router** for the web app and cron routes
- **Supabase** for Postgres, auth, and browser-first administration
- **Vercel** for hosting and scheduling

## Deployment steps

### 1. Create a GitHub repository

Create a new private repo, for example `ldh-scout`, then upload the contents of this folder.

### 2. Create a Supabase project

In Supabase:

1. Open the SQL editor.
2. Run `supabase/schema.sql`.
3. Run `supabase/seed-active-rubric.sql`.
4. Turn on email authentication with magic links.

### 3. Configure Supabase redirect URLs

In **Authentication → URL Configuration**, add:

- your Vercel production URL
- `https://your-domain/auth/callback`

Also set **Site URL** to your production URL.

### 4. Import the repo into Vercel

In Vercel:

1. Import the GitHub repository.
2. Add the environment variables from `.env.example`.
3. Redeploy after saving the variables.

Recommended minimum variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_BASE_URL`
- `CRON_SECRET`

### 5. Sign in and run the first fetch

After deployment:

1. Open `/login`
2. Sign in with your work email
3. Open `/`
4. Click **Run fetch now**

### 6. Tune the rubric

Open `/admin/rubric` and duplicate the active rubric into a new draft. Save it, preview the deltas on recent papers, then activate it when happy.

## Editing the rubric without code

Routine changes should not need a redeploy.

You can adjust:

- score weights
- thresholds
- topic weights
- methodology boosts
- penalties
- keyword boosts and penalties
- explanation templates
- hard filters

Every change is stored as a new version in `rubric_versions`.

## Cron schedule

`vercel.json` schedules:

- `/api/cron/fetch-preprints` daily at 06:00 UTC
- `/api/cron/generate-digest` every Friday at 06:30 UTC

## Notes and limits

- v1 uses **medRxiv** and **bioRxiv** only, to keep the ingestion path stable and low-friction.
- Contact extraction is based only on **publicly exposed metadata** and **public JATS XML**.
- The scoring model is intentionally **explainable**, not a black-box recommender.
- The first run is best treated as a calibration pass: edit the rubric after seeing real results.
