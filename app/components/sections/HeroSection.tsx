import type { HeroContent } from "@/app/content/portfolio";
import type { StaticImageData } from "next/image";
import portraitWebpSm from "@/public/portrait-543.webp";
import portraitWebpLg from "@/public/portrait-686.webp";
import portraitJpgSm from "@/public/portrait-543.jpg";
import portraitJpgLg from "@/public/portrait-686.jpg";

const PORTRAIT_SIZES =
  "(min-width: 1024px) 220px, (min-width: 640px) 160px, (min-width: 480px) 128px, 100vw";

const buildSrcSet = (small: StaticImageData, large: StaticImageData) =>
  `${small.src} ${small.width}w, ${large.src} ${large.width}w`;

interface HeroSectionProps {
  hero: HeroContent;
}

export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="scroll-mt-28 rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/70"
    >
      <div className="flow-root">
        <p className="mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-zinc-500 sm:text-xs">
          {hero.eyebrow}
        </p>
        <figure className="float-none mb-4 w-full overflow-hidden rounded-2xl border border-dashed border-zinc-300 bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-100 [@media(min-width:480px)]:float-left [@media(min-width:480px)]:mr-5 sm:mr-6 sm:mb-3 [@media(min-width:480px)]:w-32 sm:w-40 md:w-[220px] aspect-[5/6] sm:aspect-auto dark:border-zinc-700 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-900">
          <picture>
            <source type="image/webp" srcSet={buildSrcSet(portraitWebpSm, portraitWebpLg)} sizes={PORTRAIT_SIZES} />
            <img
              src={portraitJpgLg.src}
              srcSet={buildSrcSet(portraitJpgSm, portraitJpgLg)}
              width={portraitJpgLg.width}
              height={portraitJpgLg.height}
              alt={hero.portraitAlt}
              className="h-full w-full rounded-xl border border-white/60 bg-white/60 object-cover object-center shadow-inner dark:border-white/10 dark:bg-black/30 sm:h-auto"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              sizes={PORTRAIT_SIZES}
            />
          </picture>
          <figcaption className="sr-only">{hero.portraitAlt}</figcaption>
        </figure>

        <h1 className="mt-2 text-xl font-semibold leading-snug text-zinc-900 sm:text-2xl dark:text-white">
          {hero.headline}
        </h1>

        <p className="mt-2 text-sm text-zinc-600 sm:text-base dark:text-zinc-300">{hero.blurb}</p>

        <p className="mt-2 text-xs font-medium text-zinc-500 sm:text-sm dark:text-zinc-400">
          {hero.availability}
        </p>

        <div className="mt-4 flex flex-wrap gap-3 sm:clear-left">
          <a
            className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-zinc-50 transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900"
            href={`mailto:${hero.contactEmail}`}
          >
            Get in touch!
          </a>
          <a
            className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-800 transition hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-200 dark:hover:text-white"
            href={hero.resumeUrl}
          >
            Download resume
          </a>
        </div>
      </div>
    </section>
  );
}
