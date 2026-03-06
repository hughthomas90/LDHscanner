# Browser-only deployment walkthrough

This is the quickest path if your editorial team cannot run code locally.

## Part 1: GitHub

1. Create a new **private** GitHub repository, for example `ldh-scout`.
2. Upload every file from this folder through the GitHub web interface.
3. Commit the files to `main`.

## Part 2: Supabase

1. Create a new Supabase project.
2. Open **SQL Editor**.
3. Run `supabase/schema.sql`.
4. Run `supabase/seed-active-rubric.sql`.
5. Open **Authentication → Providers** and keep Email enabled.
6. Open **Authentication → URL Configuration**:
   - set **Site URL** to your future Vercel production URL
   - add `https://your-project.vercel.app/auth/callback` to redirect URLs

## Part 3: Get the Supabase keys

In Supabase, open **Connect** or **Project Settings → API** and copy:

- Project URL
- publishable key (or legacy anon key)
- service role key

## Part 4: Vercel

1. Create a Vercel account.
2. Click **Add New Project**.
3. Import the GitHub repository.
4. Before deploying, add these environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_BASE_URL`
- `CRON_SECRET`

Optional:

- `ALLOWED_EMAIL_DOMAIN`
- `PREPRINT_LOOKBACK_DAYS`
- `DAILY_DIGEST_LIMIT`
- `WEEKLY_DIGEST_LIMIT`

Suggested values:

- `APP_BASE_URL=https://your-project.vercel.app`
- `ALLOWED_EMAIL_DOMAIN=thelancet.com`
- `CRON_SECRET=` a long random string

5. Deploy.

## Part 5: First sign-in

1. Open the deployed site.
2. Go to `/login`.
3. Enter your editorial email.
4. Use the magic link from your email.
5. Return to `/`.

## Part 6: First fetch

1. On the dashboard, click **Run fetch now**.
2. Wait for the page to reload.
3. Review the first ranked batch of papers.
4. Open **Rubric** and adjust the draft if the ranking needs calibration.

## Part 7: Cron

The included `vercel.json` already registers:

- a daily fetch route
- a weekly digest route

After the first production deployment, Vercel will create those cron jobs automatically.

## Common setup mistakes

- Forgetting to add `/auth/callback` as a Supabase redirect URL
- Using the publishable key in place of the service role key
- Not setting `APP_BASE_URL`
- Forgetting to redeploy after changing environment variables
- Expecting preview deployments to run production cron jobs

## Safe first calibration workflow

- Run one manual fetch
- Review the top 20 papers
- Create a draft rubric
- Preview the deltas
- Activate only after checking the changes
