# Portfolio

Personal portfolio site. Built with the Next.js App Router, Tailwind CSS v4 styles, React Compiler. 

## Tech Stack

- Next.js 16 with the App Router
- TypeScript with strict settings
- Tailwind CSS v4 via the new `@tailwindcss/postcss` pipeline
- React Compiler (enabled through `reactCompiler: true` in `next.config.ts`)

## Environment

- Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_ANON_KEY` for read-only) in the Netlify env so the static export can fetch data at build time.
- The `NEXT_PUBLIC_SUPABASE_*` vars are no longer read; remove them (or add to Netlify `SECRETS_SCAN_OMIT_KEYS`) so the public Supabase credentials do not trip the secret scanner.
