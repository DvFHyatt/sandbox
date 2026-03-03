# Learning & Development Tracker (Millat-Owned Hyatt Hotels)

A mobile-first web application for training capture, OJT compliance, dashboarding, and reporting.

## Stack
- Next.js (web)
- Supabase (managed Postgres + Auth)
- Vercel (deployment)

## What to do next (quick start)
1. Create your Supabase project.
2. Run migration SQL files in order:
   - `supabase/migrations/001_init.sql`
   - `supabase/migrations/002_reporting_and_permissions.sql`
3. Seed master data with `supabase/seed/seed.sql`.
4. Create first admin colleague row with level `GA`.
5. Set `.env.local` from `.env.example`.
6. Run the app locally with `npm install && npm run dev`.
7. Deploy to Vercel and add the same environment variables.

## Supabase setup
1. Create project at https://supabase.com.
2. Enable Email provider in **Authentication > Providers**.
3. Copy API values from **Project Settings > API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Configure **Authentication > URL Configuration**:
   - **Site URL**: `http://localhost:3000` (local) or your deployed URL in production.
   - **Redirect URLs** must include `http://localhost:3000/auth/callback` and your deployed `/auth/callback` URL.
5. Invite/reset links are time-limited. If a user sees `otp_expired`, send a new link and open the newest email immediately.

## First admin user (GA)
1. Invite user in **Authentication > Users**.
2. Insert matching `colleagues` row with:
   - `id = auth.users.id`
   - `admin_level = 'GA'`
   - valid property/division/job_title references
   - `active = true`


## Colleague Master import
1. Run `supabase/migrations/003_colleague_master_fields.sql`.
2. Run `supabase/seed/colleague_master_seed.sql` for baseline admin/role rows.
3. Import your full Colleague Master using `supabase/seed/colleague_master_import_template.csv` as column format.
4. Ensure date format is `YYYY-MM-DD` during CSV import.
5. Keep `GID` unique and `Active` as `Y` or `N`.

## Local run
```bash
npm install
cp .env.example .env.local
npm run dev
```
Before running `npm run dev`, set the following in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Open `http://localhost:3000`.

## Reports implemented in UI
- Colleague
- Property Summary
- Property Detail
- Group Summary
- Colleague Leaderboard

All report date ranges are start/end inclusive.

## Deploy to Vercel
1. Push repo to GitHub.
2. Import project in Vercel.
3. Add env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

## Verification checklist
```bash
npm run test
npm run build
```
- Tests should pass.
- Build should complete.
