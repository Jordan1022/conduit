# Conduit

Conduit is a Vercel-ready AI referral intelligence demo for a private member network. It shows how a trusted operator community can turn a high-value ask into ranked matches, a double opt-in intro draft, and a referral outcome trail.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

The app works from seeded local data by default. To connect Supabase, run `supabase/schema.sql` in a Supabase project and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## Seed Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor to create the demo tables, RLS policies, and initial rows.
3. Add local seed credentials:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Use the service role key only locally or in trusted server-side environments. Never prefix it with `NEXT_PUBLIC_`.

Preview the seed counts without writing. This only requires `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`:

```bash
npm run seed:supabase:dry
```

Write or update the seeded rows. This requires `SUPABASE_SERVICE_ROLE_KEY`:

```bash
npm run seed:supabase
```

To use live AI draft generation, set:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
```

Without `OPENAI_API_KEY`, the API route returns a deterministic intro draft so the demo remains reliable.

## Verification

```bash
npm test
npm run build
```
