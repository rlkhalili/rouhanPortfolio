import type { ListContent } from "@/app/content/portfolio";

interface ToolkitSectionProps {
  tools: ListContent;
}

export function ToolkitSection({ tools }: ToolkitSectionProps) {
  return (
    <article
      id="toolkit"
      className="scroll-mt-28 rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-2"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">Toolkit</h2>
        <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">Frequently in rotation</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {tools.map((tool) => (
          <span
            key={tool}
            className="rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
          >
            {tool}
          </span>
        ))}
      </div>
    </article>
  );
}
