import type { NextStepsContent } from "@/app/content/portfolio";

interface NextStepsSectionProps {
  content: NextStepsContent;
}

const ctaStyles: Record<NextStepsContent["ctas"][number]["variant"], string> = {
  primary: "rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20",
  secondary:
    "rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10",
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
        {content.ctas.map((cta) => (
          <a key={cta.label} className={ctaStyles[cta.variant]} href={cta.href}>
            {cta.label}
          </a>
        ))}
      </div>
    </section>
  );
}
