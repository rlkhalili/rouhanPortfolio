import type { ListContent } from "@/app/content/portfolio";

interface CapabilitiesSectionProps {
  items: ListContent;
}

export function CapabilitiesSection({ items }: CapabilitiesSectionProps) {
  return (
    <article
      id="capabilities"
      className="scroll-mt-28 space-y-5 rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/70"
    >
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">Capabilities</h2>
      <ul className="space-y-3 text-base text-zinc-600 dark:text-zinc-300">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
