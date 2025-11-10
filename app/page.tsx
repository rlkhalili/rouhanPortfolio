import { HeaderNav } from "@/app/components/HeaderNav";
import { CapabilitiesSection } from "@/app/components/sections/CapabilitiesSection";
import { HeroSection } from "@/app/components/sections/HeroSection";
import { HowIWorkSection } from "@/app/components/sections/HowIWorkSection";
import { NextStepsSection } from "@/app/components/sections/NextStepsSection";
import { ProjectPreferencesSection } from "@/app/components/sections/ProjectPreferencesSection";
import { ToolkitSection } from "@/app/components/sections/ToolkitSection";
import { WorkSection } from "@/app/components/sections/WorkSection";
import {
  focusAreas,
  heroContent,
  howIWork,
  navItems,
  nextStepsContent,
  projectPreferences,
  projects,
  toolset,
} from "@/app/content/portfolio";

export default function Home() {
  return (
    <div className="bg-zinc-50 text-zinc-900 antialiased dark:bg-black dark:text-zinc-100">
      <HeaderNav items={navItems} />
      <main className="mx-auto grid min-h-screen max-w-6xl gap-10 px-6 py-4 font-sans sm:px-10 sm:py-12 lg:px-16">
        <HeroSection hero={heroContent} />
        <WorkSection projects={projects} />
        <section className="grid gap-8 lg:grid-cols-2">
          <HowIWorkSection copy={howIWork} />
          <CapabilitiesSection items={focusAreas} />
          <ProjectPreferencesSection items={projectPreferences} />
          <ToolkitSection tools={toolset} />
        </section>
        <NextStepsSection content={nextStepsContent} />
      </main>
    </div>
  );
}
