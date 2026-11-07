"use client";
import { useEffect, useRef, useState, type ReactNode, type PointerEvent as RPointerEvent } from "react";
import dynamic from "next/dynamic";
import Reveal, { Words, ScrambleTitle } from "./Reveal";
import Safe3D from "./Safe3D";
import { useReading } from "./ReadingMode";
import { about, skills, journey, experiences, projects, gallery, hobbies, contact } from "@/data/content";

const Molecule3D = dynamic(() => import("./Molecule3D"), { ssr: false });

function Section({ id, n, title, children }: { id: string; n: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="relative mx-auto max-w-6xl px-6 py-28">
      <Reveal v="blur">
        <p className="font-mono text-xs tracking-[0.3em] text-lime">{n} / {title.toUpperCase()}</p>
      </Reveal>
      <h2 className="mt-3 font-display text-4xl font-bold sm:text-6xl">
        <ScrambleTitle text={title} />
        <span className="text-lime">.</span>
      </h2>
      <div className="mt-12">{children}</div>
    </section>
  );
}

/* 01 — À PROPOS : asymétrique, mot par mot */
export function About() {
  return (
    <Section id="apropos" n="01" title="À propos">
      <div className="grid items-center gap-14 md:grid-cols-[5fr_7fr]">
        <Reveal v="left">
          <div className="relative mx-auto aspect-square w-64 sm:w-80">
            <div className="morph glass absolute inset-0 flex items-center justify-center overflow-hidden">
              <span className="font-display text-7xl font-bold text-lime/80">JB</span>
            </div>
            <div className="morph absolute -inset-3 border border-lime/30" style={{ animationDelay: "-4s" }} />
            <p className="absolute -bottom-9 inset-x-0 text-center font-mono text-xs text-muted">photo à venir</p>
          </div>
        </Reveal>
        <div>
          <Words text={about.lead} className="text-2xl leading-snug sm:text-3xl" />
          <Reveal delay={0.2}><p className="mt-6 text-muted">{about.more}</p></Reveal>
          <div className="mt-8 flex flex-wrap gap-3">
            {about.chips.map((c, i) => (
              <Reveal key={c} v="scale" delay={0.3 + i * 0.1}>
                <span className="glass rounded-full px-4 py-2 font-mono text-sm">{c}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* 02 — DOUBLE COMPÉTENCE : 3 colonnes + molécule */
function Tags({ items, dir }: { items: string[]; dir: "left" | "right" }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((t, i) => (
        <Reveal key={t} v={dir} delay={i * 0.05}>
          <span className="glass glass-hover inline-block rounded-full px-4 py-2 text-sm">{t}</span>
        </Reveal>
      ))}
    </div>
  );
}

export function Skills() {
  return (
    <Section id="competences" n="02" title="Double compétence">
      <div className="grid items-center gap-10 md:grid-cols-[1fr_minmax(0,320px)_1fr]">
        <div>
          <h3 className="mb-4 font-display text-2xl text-lime">Agro</h3>
          <Tags items={skills.agro} dir="left" />
        </div>
        <Safe3D className="hidden h-80 md:block">
          <Molecule3D />
        </Safe3D>
        <div>
          <h3 className="mb-4 font-display text-2xl text-amber">Dev</h3>
          <Tags items={skills.dev} dir="right" />
        </div>
      </div>
    </Section>
  );
}

/* 03 — PARCOURS : frise qui se dessine au scroll */
export function Journey() {
  const box = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const { simple } = useReading();

  useEffect(() => {
    const set = (v: number) => { if (line.current) line.current.style.height = `${v * 100}%`; };
    if (simple) { set(1); return; }
    let raf = 0;
    const upd = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = box.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        set(Math.min(1, Math.max(0, (window.innerHeight * 0.65 - r.top) / r.height)));
      });
    };
    upd();
    window.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", upd);
      window.removeEventListener("resize", upd);
    };
  }, [simple]);

  return (
    <Section id="parcours" n="03" title="Parcours">
      <div ref={box} className="relative">
        <div className="absolute bottom-0 left-4 top-0 w-px bg-white/10 md:left-1/2" />
        <div ref={line} className="absolute left-4 top-0 w-px bg-lime shadow-[0_0_12px_#b6ff3c] md:left-1/2" style={{ height: 0 }} />
        <ul className="space-y-14">
          {journey.map((j, i) => {
            const left = i % 2 === 0;
            return (
              <li key={j.title} className={`relative pl-12 md:w-1/2 ${left ? "md:pl-0 md:pr-12 md:text-right" : "md:ml-auto md:pl-12"}`}>
                <span className={`absolute left-[12px] top-3 h-2 w-2 rounded-full bg-lime ${left ? "md:left-auto md:right-[-4px]" : "md:left-[-4px]"}`} />
                <Reveal v={left ? "left" : "right"}>
                  <div className="glass rounded-3xl p-6">
                    <p className="font-mono text-xs text-amber">{j.tag}</p>
                    <h3 className="mt-1 font-display text-xl">{j.title}</h3>
                    <p className="mt-2 text-sm text-muted">{j.text}</p>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}

/* 04 — EXPÉRIENCE : lignes dépliables */
function ExpRow({ e, i }: { e: (typeof experiences)[number]; i: number }) {
  const { simple } = useReading();
  const [open, setOpen] = useState(i === 0);
  const o = open || simple;
  return (
    <Reveal v={i % 2 ? "right" : "left"}>
      <div className="glass rounded-3xl">
        <button onClick={() => setOpen(!open)} aria-expanded={o} className="flex w-full items-center gap-5 p-6 text-left">
          <span className="font-mono text-sm text-lime">0{i + 1}</span>
          <span className="flex-1">
            <span className="block font-display text-xl sm:text-2xl">{e.title}</span>
            <span className="block text-sm text-muted">{e.org}</span>
          </span>
          <span className={`text-2xl text-lime transition-transform duration-300 ${o ? "rotate-45" : ""}`}>+</span>
        </button>
        <div className="grid transition-[grid-template-rows] duration-500" style={{ gridTemplateRows: o ? "1fr" : "0fr" }}>
          <div className="overflow-hidden">
            <ul className="space-y-2 px-6 pb-6 text-muted sm:pl-[4.5rem]">
              {e.points.map((p) => <li key={p}>→ {p}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function Experience() {
  return (
    <Section id="experience" n="04" title="Expérience">
      <div className="space-y-4">
        {experiences.map((e, i) => <ExpRow key={e.org} e={e} i={i} />)}
      </div>
    </Section>
  );
}

/* 05 — PROJETS : bento + cartes inclinables */
function Tilt({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { simple } = useReading();
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || simple || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.02)`;
    el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
  };
  const leave = () => { if (ref.current) ref.current.style.transform = ""; };
  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} className={`tilt glass relative h-full overflow-hidden rounded-3xl p-7 ${className}`}>
      {children}
    </div>
  );
}

export function Projects() {
  return (
    <Section id="projets" n="05" title="Projets">
      <div className="grid gap-5 md:grid-cols-3">
        {projects.map((p, i) => (
          <Reveal key={p.title} v="scale" delay={i * 0.1} className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}>
            <Tilt className="flex flex-col">
              <p className="font-mono text-xs tracking-widest text-amber">{p.tag}</p>
              <h3 className={`mt-2 font-display font-bold ${i === 0 ? "text-4xl sm:text-5xl" : "text-2xl"}`}>{p.title}</h3>
              <p className="mt-4 text-muted">{p.text}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {p.tech.map((t) => (
                  <span key={t} className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-muted">{t}</span>
                ))}
              </div>
              <div className="mt-auto flex flex-wrap gap-3 pt-8">
                {p.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
                    className="liquid-btn rounded-full border border-lime/50 px-4 py-2 text-sm text-lime">
                    {l.label} ↗
                  </a>
                ))}
                {p.links.length > 0 && (
                  <span className="self-center font-mono text-xs text-muted">code disponible sur demande</span>
                )}
              </div>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* 06 — RÉALISATIONS : galerie horizontale */
export function Gallery() {
  return (
    <Section id="realisations" n="06" title="Réalisations">
      <div className="-mx-6 flex snap-x gap-5 overflow-x-auto px-6 pb-6">
        {gallery.map((g, i) => (
          <Reveal key={g} v="scale" delay={i * 0.08} className="shrink-0 snap-start">
            <div className="glass relative flex h-72 w-64 flex-col justify-end overflow-hidden rounded-3xl p-5 sm:w-72">
              <div
                className="absolute inset-0 opacity-50"
                style={{ background: `radial-gradient(circle at ${30 + i * 15}% 20%, ${i % 2 ? "#ffb54766" : "#b6ff3c55"}, transparent 60%)` }}
              />
              <p className="relative font-mono text-xs text-muted">photo à venir</p>
              <p className="relative font-display text-xl">{g}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* 07 — PASSE-TEMPS : ciel étoilé + onglets */
function Stars() {
  const cv = useRef<HTMLCanvasElement>(null);
  const { simple } = useReading();
  useEffect(() => {
    const c = cv.current;
    if (!c || simple) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let w = 0, h = 0, mx = 0, my = 0, raf = 0, vis = true;
    const resize = () => { w = c.width = c.clientWidth; h = c.height = c.clientHeight; };
    resize();
    const n = window.innerWidth < 768 ? 50 : 90;
    const stars = Array.from({ length: n }, () => ({
      x: Math.random(), y: Math.random(), z: Math.random() * 0.8 + 0.2, s: Math.random() * 6,
    }));
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; });
    io.observe(c);
    const mv = (e: PointerEvent) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; };
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!vis) return;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const x = (((s.x * w - mx * 40 * s.z) % w) + w) % w;
        const y = s.y * h - my * 40 * s.z;
        ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t / 900 + s.s));
        ctx.fillStyle = s.z > 0.7 ? "#ffb547" : "#e8efe9";
        ctx.fillRect(x, y, s.z * 2, s.z * 2);
      }
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", mv);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", mv);
    };
  }, [simple]);
  return <canvas ref={cv} aria-hidden className="scene3d absolute inset-0 h-full w-full" />;
}

export function Hobbies() {
  const { simple } = useReading();
  const [i, setI] = useState(0);
  const list = simple ? hobbies : [hobbies[i]];
  return (
    <div className="relative overflow-hidden">
      <Stars />
      <Section id="passe-temps" n="07" title="Passe-temps">
        {!simple && (
          <div role="tablist" className="flex flex-wrap gap-2">
            {hobbies.map((h, k) => (
              <button key={h.id} role="tab" aria-selected={k === i} onClick={() => setI(k)}
                className={`rounded-full border px-5 py-2 text-sm transition ${k === i ? "border-lime bg-lime text-black" : "border-white/15 text-muted hover:border-lime hover:text-lime"}`}>
                {h.label}
              </button>
            ))}
          </div>
        )}
        <div className="mt-8 grid gap-5">
          {list.map((h) => (
            <div key={h.id} className="rise glass rounded-3xl p-8 sm:p-12">
              <p className="font-mono text-xs tracking-widest text-lime">{h.label.toUpperCase()}</p>
              <p className="mt-4 max-w-2xl text-2xl leading-snug sm:text-3xl">{h.text}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* 08 — CONTACT */
export function Contact() {
  const send = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = `${f.get("message")}\n\n— ${f.get("name")} (${f.get("email")})`;
    // Provisoire : ouvre ton client mail. On branchera Resend (/api/contact) à l'étape 6.
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent("Contact depuis le portfolio")}&body=${encodeURIComponent(body)}`;
  };
  const field = "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-lime";
  return (
    <Section id="contact" n="08" title="Contact">
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <Words text="Un projet, une idée, une question ? Écrivez-moi." className="text-3xl leading-snug sm:text-4xl" />
          <div className="mt-8 flex flex-col items-start gap-3">
            <a className="liquid-btn rounded-full border border-lime/50 px-5 py-2.5 text-lime" href={`mailto:${contact.email}`}>{contact.email}</a>
            {contact.whatsapp.map((w) => (
              <a key={w.href} className="liquid-btn rounded-full border border-white/20 px-5 py-2.5" href={w.href} target="_blank" rel="noopener noreferrer">WhatsApp · {w.label}</a>
            ))}
            <a className="liquid-btn rounded-full border border-white/20 px-5 py-2.5" href={contact.github} target="_blank" rel="noopener noreferrer">GitHub · JBGhost0</a>
          </div>
        </div>
        <Reveal v="right">
          <form onSubmit={send} className="glass space-y-4 rounded-3xl p-7">
            <input name="name" required placeholder="Votre nom" className={field} />
            <input name="email" type="email" required placeholder="Votre e-mail" className={field} />
            <textarea name="message" required rows={5} placeholder="Votre message" className={field} />
            <button className="liquid-btn w-full rounded-full border border-lime bg-lime/10 px-6 py-3 font-medium text-lime">Envoyer</button>
          </form>
        </Reveal>
      </div>
    </Section>
  );
}