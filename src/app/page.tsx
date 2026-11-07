import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import { About, Skills, Journey, Experience, Projects, Gallery, Lab, Hobbies, Contact } from "@/components/Sections";

export default function Home() {
  return (
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
  );
}