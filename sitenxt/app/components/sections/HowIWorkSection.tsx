interface HowIWorkSectionProps {
  copy: string;
}

export function HowIWorkSection({ copy }: HowIWorkSectionProps) {
  return (
    <article
      id="how-i-work"
      className="scroll-mt-28 space-y-4 rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-2"
    >
      <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">How I work</p>
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">Prototypes first, refinement after</h2>
      <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-300">{copy}</p>
    </article>
  );
}
