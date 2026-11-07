import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ContentProvider from "@/components/ContentProvider";
import { About, Skills, Journey, Experience, Projects, Gallery, Lab, Hobbies, Contact } from "@/components/Sections";
import { getContent } from "@/lib/content";

export default async function Home() {
  const content = await getContent();
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
        <Lab />
        <Hobbies />
        <Contact />
        <footer className="border-t border-white/5 py-8 text-center font-mono text-xs text-muted">
          © 2026 Jean-Baptiste Mahougnon DADA
        </footer>
      </main>
    </ContentProvider>
  );
}