const links = [
  ["À propos", "#apropos"],
  ["Parcours", "#parcours"],
  ["Expérience", "#experience"],
  ["Projets", "#projets"],
  ["Passe-temps", "#passe-temps"],
  ["Contact", "#contact"],
];

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-bg/60 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#accueil" className="font-display font-bold">
          JB<span className="text-lime">.</span>
        </a>
        <ul className="hidden gap-6 text-sm text-muted md:flex">
          {links.map(([label, href]) => (
            <li key={href}>
              <a href={href} className="transition hover:text-lime">{label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}