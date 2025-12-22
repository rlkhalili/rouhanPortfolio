# Portfolio

Personal portfolio site. Built with the Next.js App Router, Tailwind CSS v4 styles, React Compiler. 

## Repo layout

- `app/` contains the portfolio site
- `apps/fashion-aggregator/` contains the standalone fashion aggregator app

## Tech Stack

- Next.js 16 with the App Router
- TypeScript with strict settings
- Tailwind CSS v4 via the new `@tailwindcss/postcss` pipeline
- React Compiler (enabled through `reactCompiler: true` in `next.config.ts`)

## Deployment (Netlify SSR)

- The app now builds in server/standalone mode by default; `NEXT_OUTPUT` controls optional export builds (leave unset for SSR).
- Netlify should use the included `netlify.toml` (`command = "npm run build"`, `publish = ".next"`, Next runtime plugin enabled).
- If you set `NEXT_PUBLIC_BASE_PATH`, confirm your domain/path matches to avoid broken asset prefixes.
- The fashion aggregator has its own Netlify config under `apps/fashion-aggregator/netlify.toml`.

## Environment

- The portfolio does not require runtime env vars by default.
- The fashion aggregator uses Supabase env vars documented in `apps/fashion-aggregator/.env.example`.
