import type { Project } from "@/app/content/portfolio";

interface WorkSectionProps {
  projects: Project[];
}

export function WorkSection({ projects }: WorkSectionProps) {
  return (
    <section
      id="work"
      className="scroll-mt-28 rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/70"
    >
      <div className="flex flex-col gap-3 border-b border-zinc-100 pb-6 dark:border-zinc-800 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Selected work</p>
          <h2 className="text-3xl font-semibold text-zinc-900 dark:text-white">Automation-first builds</h2>
        </div>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">Real-world scrapers, tools, and experiments</span>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <article
            key={project.title}
            className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white/80 p-5 transition hover:-translate-y-1 hover:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-zinc-100"
          >
            <div className="flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-zinc-500">
              <span>{project.status}</span>
            </div>
            <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white">{project.title}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">{project.summary}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{project.contribution}</p>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{project.learning}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{project.tech}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
