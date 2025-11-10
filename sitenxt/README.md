# SiteNxt Portfolio

Modern personal site for an automation-first developer. Built with the Next.js App Router, Tailwind CSS v4 styles, and the React Compiler for smooth client experiences.

## Tech Stack

- **Next.js 16** with the App Router
- **TypeScript** with strict settings
- **Tailwind CSS v4** via the new `@tailwindcss/postcss` pipeline
- **React Compiler** (enabled through `reactCompiler: true` in `next.config.ts`)

## Project Structure

- `app/content/portfolio.ts` – typed data sources for navigation, hero copy, projects, lists, and CTAs.
- `app/components` – small, focused UI slices (`HeaderNav`, section components, etc.).
- `app/page.tsx` – server component that composes the sections for the landing page.
- `public/` – static assets such as `portrait.png`.

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to work on the site locally.

## Quality Checks

- `npm run lint` – runs `next lint` with `--max-warnings=0`.
- `npm run build` – production build to validate routing, fonts, and React Compiler output.

## Deployment

This app targets the standard Next.js deployment flow (Vercel, containerized Node, or any platform that supports the Next.js runtime). Build with `npm run build` and serve via `npm run start` or your platform’s adapter.
