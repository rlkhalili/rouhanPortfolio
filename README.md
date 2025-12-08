# Portfolio

Personal portfolio site. Built with the Next.js App Router, Tailwind CSS v4 styles, React Compiler. 

## Tech Stack

- Next.js 16 with the App Router
- TypeScript with strict settings
- Tailwind CSS v4 via the new `@tailwindcss/postcss` pipeline
- React Compiler (enabled through `reactCompiler: true` in `next.config.ts`)

## Deployment (Netlify SSR)

- The app now builds in server/standalone mode by default; `NEXT_OUTPUT` controls optional export builds (leave unset for SSR).
- Netlify should use the included `netlify.toml` (`command = "npm run build"`, `publish = ".next"`, Next runtime plugin enabled).
- Ensure environment variables are set in the Netlify UI: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`), optional `SUPABASE_TABLE`.
- If you set `NEXT_PUBLIC_BASE_PATH`, confirm your domain/path matches to avoid broken asset prefixes.
- The manual Netlify function at `/.netlify/functions/fashion-products` remains available; the default API is `/api/fashion-products` via the Next runtime.

## Environment

- Copy `.env.example` to `.env.local` for local dev and fill in your Supabase values:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY` (read-only) or `SUPABASE_SERVICE_ROLE_KEY` (server-only).
- On Netlify, set the same variables in the UI. If you use the public anon key, add `SECRETS_SCAN_OMIT_KEYS=SUPABASE_URL,SUPABASE_ANON_KEY` so the secret scanner does not block the build on the expected public values.
- The `NEXT_PUBLIC_SUPABASE_*` vars are not read; leave them unset so they do not appear in build output.
