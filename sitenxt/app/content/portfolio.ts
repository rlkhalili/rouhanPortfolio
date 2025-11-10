export interface NavItem {
  label: string;
  href: `#${string}`;
}

export interface Project {
  title: string;
  status: string;
  summary: string;
  contribution: string;
  learning: string;
  tech: string;
}

export interface HeroContent {
  eyebrow: string;
  headline: string;
  blurb: string;
  availability: string;
  contactEmail: string;
  resumeUrl: string;
  portraitAlt: string;
}

export type ListContent = string[];

export interface NextStepsCta {
  label: string;
  href: string;
  variant: "primary" | "secondary";
}

export interface NextStepsContent {
  eyebrow: string;
  title: string;
  description: string;
  ctas: NextStepsCta[];
}

export const navItems: NavItem[] = [
  { label: "Intro", href: "#hero" },
  { label: "Work", href: "#work" },
  { label: "How I Work", href: "#how-i-work" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Projects", href: "#project-preferences" },
  { label: "Toolkit", href: "#toolkit" },
  { label: "Next Steps", href: "#next-steps" },
];

export const heroContent: HeroContent = {
  eyebrow: "Software developer, Computer Engineering technologist",
  headline:
    "I build useful web tools and experiments for small teams, independent creators, and anyone chasing an idea worth building.",
  blurb:
    "I'm a software developer who enjoys building the kind of tools that make ideas feel real. My work often blends scraping, APIs, and automation with interfaces that stay clear and practical.",
  availability: "Currently open to freelance, contract, or full-time roles.",
  contactEmail: "hello@example.com",
  resumeUrl: "#",
  portraitAlt: "Portrait of the developer",
};

export const focusAreas: ListContent = [
  "Data-focused development and automation",
  "API design, integration, and scraping",
  "Backend scripting and small-scale infrastructure tinkering",
  "Web development for creators and indie tools",
];

export const projectPreferences: ListContent = [
  "Web apps and small-scale SaaS tools",
  "APIs, scrapers, and backend utilities",
  "Automation systems for creators or indie businesses",
  "Experimental or playful technical projects",
];

export const toolset: ListContent = [
  "Python",
  "C",
  "C++",
  "C#",
  "Flask",
  "FastAPI",
  "JavaScript",
  "TypeScript",
  "Java",
  "React",
  "Vue.js",
  "Node.js",
  "Puppeteer",
  "Selenium",
  "Playwright",
  "SQLite & PostgreSQL",
  "Next.js",
  "REST & custom APIs",
  "Automation scripting",
  "Git",
  "Linux environments",
];

export const projects: Project[] = [
  {
    title: "Product Data Scraper Suite",
    status: "Client project",
    summary:
      "Automated data collection tools for a small Amazon retailer, combining Puppeteer, Selenium, and custom HTTP scrapers to surface supplier listings and hidden inventory data.",
    contribution:
      "Designed a set of schedulable scrapers tailored to each wholesaler, normalized their output, and handed the client a browsable dataset plus spreadsheet export.",
    learning:
      "Dialed in the balance between aggressive crawling and reliability while respecting rate limits across sites with wildly different architectures.",
    tech: "Puppeteer • Selenium • Python • Cron automation",
  },
  {
    title: "Whisper TTS Local GUI",
    status: "Tooling experiment",
    summary:
      "A lightweight Python desktop app that wraps OpenAI Whisper's text-to-speech workflow in a clean, click-first interface.",
    contribution:
      "Built a minimal GUI so non-developers can load text, pick a model, and play or save generated audio without touching the CLI.",
    learning:
      "Reaffirmed how a tiny UX layer can unlock complex AI utilities and taught me more about packaging Python apps for local install.",
    tech: "Python • Tkinter/PyQt • Whisper",
  },
  {
    title: "Unofficial API & Data Explorer",
    status: "In progress",
    summary:
      "Exploring how to repackage semi-public data from complex platforms (think LinkedIn) into a structured REST API plus interactive viewer.",
    contribution:
      "Experimenting with scraping and request interception tactics, then shaping the results into a searchable dataset with a simple front-end explorer.",
    learning:
      "A sandbox for turning messy ecosystems into something more intentional while respecting privacy boundaries.",
    tech: "Python • FastAPI • Requests/Playwright • SQLite/PostgreSQL",
  },
];

export const howIWork =
  "I like building super-fast MVPs—small, concrete versions I can iterate on once I'm immersed in the problem. Early prototypes might get scrapped, but the process leaves behind a pool of ideas worth far more than the initial code. I keep things scrappy until the concept is proven, then refine selectively to balance usability, structure, and a bit of aesthetic charm.";

export const nextStepsContent: NextStepsContent = {
  eyebrow: "Next steps",
  title: "Have a dataset to untangle or an idea to prototype?",
  description:
    "I love teaming up early, building a scrappy version fast, and iterating until the thing is both useful and expressive.",
  ctas: [
    { label: "Email me", href: "mailto:hello@example.com", variant: "primary" },
    { label: "Book a call", href: "#", variant: "secondary" },
  ],
};
