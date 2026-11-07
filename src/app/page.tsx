import Nav from "@/components/Nav";
import Hero from "@/components/Hero";

const sections = [
  ["apropos", "À propos"],
  ["competences", "Double compétence"],
  ["parcours", "Parcours"],
  ["experience", "Expérience"],
  ["projets", "Projets"],
  ["realisations", "Réalisations"],
  ["passe-temps", "Passe-temps"],
  ["contact", "Contact"],
];

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      {sections.map(([id, title]) => (
        <section key={id} id={id} className="mx-auto flex min-h-[60vh] max-w-6xl items-center px-6 py-24">
          <h2 className="font-display text-4xl font-bold">
            {title}
            <span className="text-lime">.</span>
          </h2>
        </section>
      ))}
    </main>
  );
}