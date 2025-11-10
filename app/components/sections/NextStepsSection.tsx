import type { NextStepsContent } from "@/app/content/portfolio";

interface NextStepsSectionProps {
  content: NextStepsContent;
}

const ctaStyles: Record<NextStepsContent["ctas"][number]["variant"], string> = {
  primary: "rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20",
  secondary:
    "rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10",
  icon: "flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white transition hover:border-white hover:bg-white/10",
};

const socialIcons: Record<NonNullable<NextStepsContent["ctas"][number]["icon"]>, JSX.Element> = {
  github: (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.92.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.74 1.27 3.41.97.1-.75.41-1.27.75-1.56-2.55-.29-5.23-1.28-5.23-5.72 0-1.26.45-2.3 1.19-3.11-.12-.29-.52-1.45.11-3.02 0 0 .97-.31 3.18 1.19a11 11 0 0 1 5.8 0c2.2-1.5 3.17-1.19 3.17-1.19.63 1.57.23 2.73.11 3.02.74.81 1.18 1.85 1.18 3.11 0 4.45-2.69 5.43-5.26 5.72.42.36.8 1.07.8 2.17 0 1.57-.02 2.83-.02 3.21 0 .31.21.68.8.56A10.53 10.53 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  ),
  linkedin: (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.454C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.225 0ZM7.059 20.452H3.496V9h3.563v11.452ZM5.279 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124Zm15.173 13.019h-3.563v-5.569c0-1.33-.027-3.043-1.855-3.043-1.856 0-2.141 1.45-2.141 2.949v5.663H9.33V9h3.418v1.561h.047c.476-.9 1.637-1.848 3.37-1.848 3.603 0 4.287 2.37 4.287 5.455v6.284Z" />
    </svg>
  ),
};

export function NextStepsSection({ content }: NextStepsSectionProps) {
  return (
    <section
      id="next-steps"
      className="scroll-mt-28 rounded-2xl border border-zinc-200 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 p-8 text-zinc-50 shadow-sm dark:border-zinc-700"
    >
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">{content.eyebrow}</p>
        <h2 className="text-3xl font-semibold">{content.title}</h2>
        <p className="text-base text-zinc-200">{content.description}</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {content.ctas.map((cta) => {
          const isIconCta = cta.icon && cta.variant === "icon";
          return (
            <a
              key={cta.label}
              className={ctaStyles[cta.variant]}
              href={cta.href}
              aria-label={isIconCta ? cta.label : undefined}
            >
              {isIconCta && cta.icon ? (
                <>
                  {socialIcons[cta.icon]}
                  <span className="sr-only">{cta.label}</span>
                </>
              ) : (
                cta.label
              )}
            </a>
          );
        })}
      </div>
    </section>
  );
}
