import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ContentProvider from "@/components/ContentProvider";
import { About, Skills, Journey, Experience, Projects, Gallery, Hobbies, Contact } from "@/components/Sections";
import { defaults, type Content } from "@/data/content";

// Les éléments avec draft: true sont cachés
const live = <T,>(a: T[]): T[] => a.filter((x) => (x as { draft?: boolean }).draft !== true);
const content: Content = {
  ...defaults,
  journey: live(defaults.journey),
  experiences: live(defaults.experiences),
  projects: live(defaults.projects),
  gallery: live(defaults.gallery),
};

export default function Home() {
  return (
    <ContentProvider value={content}>
      <main>
        <Nav />
        <Hero />
        <About />
        <Skills />
        <Journey />
        <Experience />
        <Projects />
        <Gallery />
        <Hobbies />
        <Contact />
        <footer className="border-t border-white/5 py-8 text-center font-mono text-xs text-muted">
          © 2026 Jean-Baptiste Mahougnon DADA
        </footer>
      </main>
    </ContentProvider>
  );
}