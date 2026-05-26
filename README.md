# Conduit

Conduit is a Vercel-ready AI referral intelligence demo for a private member network. It shows how a Servant-style platform can turn a trusted ask into ranked matches, a double opt-in intro draft, and a referral outcome trail.

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
