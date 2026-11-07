"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type PointerEvent as RPointerEvent } from "react";
import dynamic from "next/dynamic";
import Reveal, { Words, ScrambleTitle } from "./Reveal";
import Safe3D from "./Safe3D";
import { useReading } from "./ReadingMode";
import { about, skills, journey, experiences, projects, gallery, hobbies, contact } from "@/data/content";

const Molecule3D = dynamic(() => import("./Molecule3D"), { ssr: false });

type Group = (typeof skills.agro)[number];

function Section({ id, n, title, children }: { id: string; n: string; title: string; children: ReactNode }) {
  const { simple } = useReading();
  return (
    <section id={id} className={`relative mx-auto max-w-6xl px-6 ${simple ? "py-20" : "py-28"}`}>
      <Reveal v="blur">
        <p className="font-mono text-xs tracking-[0.3em] text-lime">{n} / {title.toUpperCase()}</p>
      </Reveal>
      <h2 className="mt-3 font-display text-4xl font-bold sm:text-6xl">
        <span className="chrome-text"><ScrambleTitle text={title} /></span>
        <span className="text-lime">.</span>
      </h2>
      <div className={simple ? "mt-8" : "mt-12"}>{children}</div>
    </section>
  );
}

/* 01 — À PROPOS */
export function About() {
  const { simple } = useReading();
  return (
    <Section id="apropos" n="01" title="À propos">
      <div className={simple ? "mx-auto flex max-w-2xl flex-col items-center gap-10 text-center" : "grid items-center gap-14 md:grid-cols-[5fr_7fr]"}>
        <Reveal v="left" className="mb-6">
          <div className={`relative mx-auto aspect-square ${simple ? "w-40" : "w-64 sm:w-80"}`}>
            <div className="morph glass absolute inset-0 flex items-center justify-center overflow-hidden">
              <span className="font-display text-7xl font-bold text-lime/80">JB</span>
            </div>
            <div className="morph absolute -inset-3 border border-lime/30" style={{ animationDelay: "-4s" }} />
            <p className="absolute -bottom-9 inset-x-0 text-center font-mono text-xs text-muted">photo à venir</p>
          </div>
        </Reveal>
        <div>
          <Words text={about.lead} className={simple ? "text-xl leading-snug" : "text-2xl leading-snug sm:text-3xl"} />
          <Reveal delay={0.2}><p className="mt-6 text-muted">{about.more}</p></Reveal>
          <div className={`mt-8 flex flex-wrap gap-3 ${simple ? "justify-center" : ""}`}>
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

/* 02 — DOUBLE COMPÉTENCE : branches d'ADN */
function DnaDefs() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <defs>
        <pattern id="dna-tile" width="56" height="80" patternUnits="userSpaceOnUse">
          <path d="M10 0C10 20 46 20 46 40C46 60 10 60 10 80" fill="none" strokeWidth="2" style={{ stroke: "var(--lime)" }} />
          <path d="M46 0C46 20 10 20 10 40C10 60 46 60 46 80" fill="none" strokeWidth="2" style={{ stroke: "var(--amber)" }} />
          <path d="M10 40H46M10 0H46" fill="none" strokeWidth="1.5" style={{ stroke: "var(--muted)", opacity: 0.6 }} />
        </pattern>
      </defs>
    </svg>
  );
}

function SkillList({ title, color, groups }: { title: string; color: string; groups: Group[] }) {
  const [open, setOpen] = useState(-1);
  return (
    <div>
      <h3 className={`mb-4 font-display text-2xl ${color}`}>{title}</h3>
      <div className="space-y-3">
        {groups.map((g, i) => {
          const o = open === i;
          return (
            <Reveal key={g.name} v={title === "Agro" ? "left" : "right"} delay={i * 0.06}>
              <div className="glass overflow-hidden rounded-3xl">
                <button onClick={() => setOpen(o ? -1 : i)} aria-expanded={o} className="flex w-full items-center gap-4 p-5 text-left">
                  <span className="font-mono text-xs text-muted">0{i + 1}</span>
                  <span className="flex-1">
                    <span className="block font-display text-lg">{g.name}</span>
                    <span className="block text-sm text-muted">{g.summary}</span>
                  </span>
                  <span className={`text-2xl transition-transform duration-300 ${color} ${o ? "rotate-45" : ""}`}>+</span>
                </button>
                <div className="grid transition-[grid-template-rows] duration-700" style={{ gridTemplateRows: o ? "1fr" : "0fr" }}>
                  <div className="overflow-hidden">
                    <div className="flex gap-4 px-5 pb-5 pt-1">
                      <div className="relative w-14 shrink-0">
                        <div
                          className="absolute inset-0"
                          style={{ clipPath: o ? "inset(0 0 0 0)" : "inset(0 0 100% 0)", transition: "clip-path 1.4s ease" }}
                        >
                          <svg className="h-full w-14" aria-hidden>
                            <rect width="100%" height="100%" fill="url(#dna-tile)" />
                          </svg>
                        </div>
                      </div>
                      <ul className="flex-1 space-y-4">
                        {g.items.map((it, k) => (
                          <li
                            key={it.name}
                            style={{
                              opacity: o ? 1 : 0,
                              transform: o ? "none" : "translateX(-16px)",
                              transition: `opacity .6s ease ${o ? 0.3 + k * 0.18 : 0}s, transform .6s ease ${o ? 0.3 + k * 0.18 : 0}s`,
                            }}
                          >
                            <p className="font-display">{it.name}</p>
                            <p className="text-sm text-muted">{it.text}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

export function Skills() {
  const { simple } = useReading();
  const cols: [string, string, Group[]][] = [
    ["Agro", "text-lime", skills.agro],
    ["Dev", "text-amber", skills.dev],
  ];
  return (
    <Section id="competences" n="02" title="Double compétence">
      <DnaDefs />
      {simple ? (
        <div className="space-y-12">
          {cols.map(([t, c, gs]) => (
            <div key={t}>
              <h3 className={`mb-5 font-display text-2xl ${c}`}>{t}</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {gs.map((g, i) => (
                  <Reveal key={g.name} delay={i * 0.05}>
                    <div className="glass h-full rounded-3xl p-6">
                      <h4 className="font-display text-lg">{g.name}</h4>
                      <p className="mt-1 text-sm text-muted">{g.summary}</p>
                      <ul className="mt-4 space-y-2 text-sm">
                        {g.items.map((it) => (
                          <li key={it.name}>
                            <span className={c}>•</span> <strong className="font-medium">{it.name}</strong>{" "}
                            <span className="text-muted">— {it.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_200px_1fr]">
            <SkillList title="Agro" color="text-lime" groups={skills.agro} />
            <Safe3D className="hidden h-72 lg:block">
              <Molecule3D />
            </Safe3D>
            <SkillList title="Dev" color="text-amber" groups={skills.dev} />
          </div>
          <p className="mt-8 text-center font-mono text-xs text-muted">Cliquez sur une compétence pour dérouler sa branche</p>
        </>
      )}
    </Section>
  );
}

/* 03 — PARCOURS */
export function Journey() {
  const box = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const { simple } = useReading();

  useEffect(() => {
    if (simple) return;
    const set = (v: number) => { if (line.current) line.current.style.height = `${v * 100}%`; };
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

  if (simple) {
    return (
      <Section id="parcours" n="03" title="Parcours">
        <ul className="space-y-5 border-l border-white/10 pl-6">
          {journey.map((j, i) => (
            <li key={j.title} className="relative">
              <span className="absolute -left-[29px] top-4 h-2 w-2 rounded-full bg-lime" />
              <Reveal delay={i * 0.03}>
                <div className="glass rounded-2xl p-5">
                  <p className="font-mono text-xs text-lime">{j.tag}</p>
                  <h3 className="mt-1 font-display text-lg">{j.title}</h3>
                  <p className="mt-1 text-sm text-muted">{j.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>
    );
  }

  return (
    <Section id="parcours" n="03" title="Parcours">
      <div ref={box} className="relative">
        <div className="absolute bottom-0 left-4 top-0 w-px bg-white/10 md:left-1/2" />
        <div ref={line} className="absolute left-4 top-0 w-px bg-lime shadow-[0_0_12px_var(--lime)] md:left-1/2" style={{ height: 0 }} />
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

/* 04 — EXPÉRIENCE */
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
          {!simple && <span className={`text-2xl text-lime transition-transform duration-300 ${o ? "rotate-45" : ""}`}>+</span>}
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
  const { simple } = useReading();
  return (
    <Section id="experience" n="04" title="Expérience">
      <div className={simple ? "grid items-start gap-4 md:grid-cols-2" : "space-y-4"}>
        {experiences.map((e, i) => <ExpRow key={e.org} e={e} i={i} />)}
      </div>
    </Section>
  );
}

/* 05 — PROJETS */
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
  const { simple } = useReading();
  return (
    <Section id="projets" n="05" title="Projets">
      <div className={simple ? "grid gap-5" : "grid gap-5 md:grid-cols-3"}>
        {projects.map((p, i) => (
          <Reveal
            key={p.title}
            v={simple ? "up" : "scale"}
            delay={i * 0.1}
            className={!simple && i === 0 ? "md:col-span-2 md:row-span-2" : ""}
          >
            <Tilt className="flex flex-col">
              <div className={simple ? "flex flex-col gap-6 md:flex-row md:items-end md:justify-between" : "contents"}>
                <div className={simple ? "md:max-w-2xl" : ""}>
                  <p className="font-mono text-xs tracking-widest text-amber">{p.tag}</p>
                  <h3 className={`mt-2 font-display font-bold ${!simple && i === 0 ? "text-4xl sm:text-5xl" : "text-2xl"}`}>{p.title}</h3>
                  <p className="mt-4 text-muted">{p.text}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {p.tech.map((t) => (
                      <span key={t} className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-muted">{t}</span>
                    ))}
                  </div>
                </div>
                <div className={`flex flex-wrap items-center gap-3 ${simple ? "" : "mt-auto pt-8"}`}>
                  {p.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
                      className="liquid-btn rounded-full border border-lime/50 px-4 py-2 text-sm text-lime">
                      {l.label} ↗
                    </a>
                  ))}
                  {p.links.length > 0 && (
                    <span className="font-mono text-xs text-muted">code disponible sur demande</span>
                  )}
                </div>
              </div>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* 06 — RÉALISATIONS */
export function Gallery() {
  const { simple } = useReading();
  return (
    <Section id="realisations" n="06" title="Réalisations">
      <div className={simple ? "grid grid-cols-2 gap-4 md:grid-cols-3" : "-mx-6 flex snap-x gap-5 overflow-x-auto px-6 pb-6"}>
        {gallery.map((g, i) => (
          <Reveal key={g} v="scale" delay={i * 0.08} className={simple ? "" : "shrink-0 snap-start"}>
            <div className={`glass relative flex flex-col justify-end overflow-hidden rounded-3xl p-5 ${simple ? "h-40 w-full" : "h-72 w-64 sm:w-72"}`}>
              <div
                className="absolute inset-0 opacity-60"
                style={{
                  background: `radial-gradient(circle at ${30 + i * 15}% 20%, color-mix(in srgb, var(${i % 2 ? "--amber" : "--lime"}) 35%, transparent), transparent 60%)`,
                }}
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

/* 07 — PASSE-TEMPS */
function Stars() {
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cv.current;
    if (!c) return;
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
        ctx.fillStyle = s.z > 0.7 ? "#bfe6ff" : "#d5deea";
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
  }, []);
  return <canvas ref={cv} aria-hidden className="scene3d absolute inset-0 h-full w-full" />;
}

// Positions déterministes (pas d'aléatoire : compatible avec le pré-rendu)
const spread = (n: number, seed = 0) =>
  Array.from({ length: n }, (_, i) => {
    const k = i + seed;
    return {
      x: (k * 37 + 11) % 88, y: (k * 53 + 7) % 80, s: 22 + ((k * 17) % 28),
      d: 6 + (k % 5), dl: -(k * 1.3), r: ((k * 47) % 60) - 30, fx: k % 2 ? 14 : -14,
    };
  });

function Pad() {
  return (
    <svg viewBox="0 0 64 40" className="h-auto w-full" fill="currentColor">
      <path d="M14 6h36c6 0 10 6 12 16l2 10c1 5-3 8-7 7-4-1-6-4-9-7H16c-3 3-5 6-9 7-4 1-8-2-7-7l2-10C4 12 8 6 14 6z" />
      <path d="M16 15v8M12 19h8" strokeWidth="3" fill="none" style={{ stroke: "var(--bg)" }} />
      <circle cx="44" cy="16" r="2.6" style={{ fill: "var(--bg)" }} />
      <circle cx="50" cy="22" r="2.6" style={{ fill: "var(--bg)" }} />
    </svg>
  );
}
function Head() {
  return (
    <svg viewBox="0 0 48 48" className="h-auto w-full">
      <path d="M8 28v-4a16 16 0 0 1 32 0v4" fill="none" strokeWidth="4" style={{ stroke: "currentColor" }} />
      <rect x="4" y="26" width="9" height="14" rx="4" fill="currentColor" />
      <rect x="35" y="26" width="9" height="14" rx="4" fill="currentColor" />
      <path d="M9 40c0 4 6 5 12 5" fill="none" strokeWidth="3" style={{ stroke: "currentColor" }} />
    </svg>
  );
}
const INV = ["00100000100", "00010001000", "00111111100", "01101110110", "11111111111", "10111111101", "10100000101", "00011011000"];
function Invader() {
  return (
    <svg viewBox="0 0 11 8" className="h-auto w-full" fill="currentColor">
      {INV.flatMap((row, y) => row.split("").map((c, x) => (c === "1" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null)))}
    </svg>
  );
}
function Pixel() {
  return <div className="aspect-square w-full bg-current" />;
}

function Floaters({ n, seed, op, scale }: { n: number; seed: number; op: number; scale: number }) {
  return (
    <>
      {spread(n, seed).map((f, i) => {
        const Icon = [Pad, Head, Invader, Pixel][i % 4];
        const size = (i % 4 === 3 ? f.s * 0.35 : f.s) * scale;
        return (
          <div
            key={i}
            className={`floaty absolute ${i % 2 ? "text-amber" : "text-lime"}`}
            style={
              {
                left: `${f.x}%`, top: `${f.y}%`, width: size, opacity: op,
                "--d": `${f.d}s`, "--dl": `${f.dl}s`, "--r": `${f.r}deg`, "--fx": `${f.fx}px`,
              } as CSSProperties
            }
          >
            <Icon />
          </div>
        );
      })}
    </>
  );
}

const FORMULAS = ["E = mc²", "ψ", "H₂O", "ΔxΔp ≥ ħ/2", "C₆H₁₂O₆", "ATGC", "e⁻", "λ", "NaCl", "π"];
function Formulas() {
  return (
    <>
      {spread(FORMULAS.length, 5).map((f, i) => (
        <span
          key={i}
          className="floaty absolute font-mono text-lime"
          style={{ left: `${f.x}%`, top: `${f.y}%`, opacity: 0.2, fontSize: 14 + (i % 3) * 5, "--d": `${f.d + 3}s`, "--dl": `${f.dl}s`, "--fx": `${f.fx}px` } as CSSProperties}
        >
          {FORMULAS[i]}
        </span>
      ))}
    </>
  );
}

function Atom() {
  const orbit = "M-64 0a64 24 0 1 0 128 0a64 24 0 1 0 -128 0";
  return (
    <svg viewBox="-80 -80 160 160" className="h-44 w-44 sm:h-52 sm:w-52">
      {[0, 60, 120].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d={orbit} fill="none" strokeWidth="1" style={{ stroke: "var(--lime)", opacity: 0.5 }} />
          <circle r="4" style={{ fill: "var(--amber)" }}>
            <animateMotion dur={`${3 + a / 60}s`} repeatCount="indefinite" path={orbit} />
          </circle>
        </g>
      ))}
      <circle r="9" style={{ fill: "var(--lime)" }} />
      <circle r="16" fill="none" strokeWidth="1" style={{ stroke: "var(--lime)", opacity: 0.35 }} />
    </svg>
  );
}

function Planet() {
  return (
    <div className="relative h-44 w-44 sm:h-52 sm:w-52">
      <div
        className="absolute inset-[22%] rounded-full"
        style={{
          background: "radial-gradient(circle at 30% 30%, #f2f8ff, var(--lime) 45%, #0a1a2e 100%)",
          boxShadow: "0 0 50px color-mix(in srgb, var(--lime) 40%, transparent)",
        }}
      />
      <div
        className="absolute inset-0 rounded-full border-[5px] opacity-60"
        style={{ borderColor: "var(--amber)", transform: "rotateX(72deg) rotateZ(-18deg) scale(1.15)" }}
      />
      <div className="spin-slow absolute inset-0">
        <div className="absolute left-1/2 top-0 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-amber" />
      </div>
    </div>
  );
}

function SkyDots() {
  return (
    <>
      {spread(16, 2).map((f, i) => (
        <span
          key={i}
          className="twinkle absolute h-[3px] w-[3px] rounded-full bg-lime"
          style={{ left: `${f.x}%`, top: `${f.y}%`, "--dl": `${f.dl}s` } as CSSProperties}
        />
      ))}
      <div className="shoot absolute" style={{ left: "72%", top: "10%" }} />
    </>
  );
}

function Savanna() {
  const blades = Array.from({ length: 46 }, (_, i) => ({
    l: i * 2.2 + ((i * 7) % 5) * 0.3, h: 46 + ((i * 29) % 64), d: 3.2 + (i % 5) * 0.5,
    dl: -(i % 7) * 0.6, front: i % 3 === 0,
  }));
  return (
    <>
      <div
        className="absolute right-[12%] top-[14%] h-16 w-16 rounded-full"
        style={{ background: "radial-gradient(circle,#fff,var(--amber) 55%,transparent 72%)", opacity: 0.5 }}
      />
      {[0, 1].map((b) => (
        <svg key={b} className="bird absolute" width="28" height="12" viewBox="0 0 28 12" style={{ top: `${18 + b * 12}%`, animationDelay: `${-b * 11}s` }}>
          <path d="M1 8Q7 0 14 7Q21 0 27 8" fill="none" strokeWidth="1.6" style={{ stroke: "var(--amber)" }} />
        </svg>
      ))}
      <div
        className="absolute inset-x-0 bottom-0 h-28"
        style={{ background: "linear-gradient(to top, color-mix(in srgb, var(--lime) 18%, transparent), transparent)" }}
      />
      {blades.map((b, i) => (
        <div
          key={i}
          className="blade absolute bottom-0 rounded-t-full"
          style={
            {
              left: `${b.l}%`, height: b.h, width: b.front ? 4 : 3, opacity: b.front ? 0.55 : 0.3,
              background: "linear-gradient(to top, var(--lime), transparent)",
              "--d": `${b.d}s`, "--dl": `${b.dl}s`,
            } as CSSProperties
          }
        />
      ))}
    </>
  );
}

function SceneBack({ id }: { id: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
      {id === "gaming" && <Floaters n={9} seed={3} op={0.16} scale={2.2} />}
      {id === "science" && (
        <>
          <Formulas />
          <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 sm:block"><Atom /></div>
        </>
      )}
      {id === "astro" && (
        <>
          <SkyDots />
          <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 sm:block"><Planet /></div>
        </>
      )}
      {id === "docs" && <Savanna />}
    </div>
  );
}

export function Hobbies() {
  const { simple } = useReading();
  const [i, setI] = useState(0);
  const h = hobbies[i];
  const art = h.id === "science" || h.id === "astro";

  return (
    <div className="relative overflow-hidden">
      {!simple && <Stars />}
      <Section id="passe-temps" n="07" title="Passe-temps">
        {simple ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {hobbies.map((x, k) => (
              <Reveal key={x.id} delay={k * 0.08}>
                <div className="glass h-full rounded-3xl p-6">
                  <p className="font-mono text-xs tracking-widest text-lime">0{k + 1} · {x.label.toUpperCase()}</p>
                  <p className="mt-3 text-muted">{x.text}</p>
                  <ul className="mt-4 space-y-1 text-sm">
                    {x.points.map((p) => (
                      <li key={p.title}><span className="text-lime">•</span> {p.title}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <>
            <div role="tablist" className="flex flex-wrap gap-2">
              {hobbies.map((x, k) => (
                <button key={x.id} role="tab" aria-selected={k === i} onClick={() => setI(k)}
                  className={`rounded-full border px-5 py-2 text-sm transition ${k === i ? "border-lime bg-lime text-black" : "border-white/15 text-muted hover:border-lime hover:text-lime"}`}>
                  {x.label}
                </button>
              ))}
            </div>
            <div key={h.id} className="mt-8 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
              <div className="rise glass relative min-h-[340px] overflow-hidden rounded-3xl p-8 sm:p-10">
                <SceneBack id={h.id} />
                <div className={`relative z-10 ${art ? "sm:pr-56" : ""}`}>
                  <p className="font-mono text-xs tracking-widest text-lime">{h.label.toUpperCase()}</p>
                  <p className="mt-4 text-lg leading-relaxed sm:text-xl">{h.text}</p>
                </div>
                {h.id === "gaming" && (
                  <div aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
                    <Floaters n={5} seed={11} op={0.5} scale={1} />
                  </div>
                )}
              </div>
              <div className="grid gap-4">
                {h.points.map((p, k) => (
                  <div key={p.title} className="rise glass rounded-3xl p-5" style={{ animationDelay: `${0.15 + k * 0.12}s` }}>
                    <p className="font-mono text-xs text-amber">0{k + 1}</p>
                    <p className="mt-1 font-display text-lg">{p.title}</p>
                    <p className="mt-1 text-sm text-muted">{p.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </Section>
    </div>
  );
}

/* 08 — CONTACT */
export function Contact() {
  const { simple } = useReading();
  const send = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = `${f.get("message")}\n\n— ${f.get("name")} (${f.get("email")})`;
    // Provisoire : ouvre le client mail. Resend (/api/contact) viendra à l'étape 6.
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent("Contact depuis le portfolio")}&body=${encodeURIComponent(body)}`;
  };
  const field = "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-lime";
  return (
    <Section id="contact" n="08" title="Contact">
      <div className={simple ? "mx-auto max-w-xl space-y-10" : "grid gap-12 md:grid-cols-2"}>
        <div>
          <Words text="Un projet, une idée, une question ? Écrivez-moi." className={simple ? "text-2xl leading-snug" : "text-3xl leading-snug sm:text-4xl"} />
          <div className={`mt-8 flex gap-3 ${simple ? "flex-wrap" : "flex-col items-start"}`}>
            <a className="liquid-btn rounded-full border border-lime/50 px-5 py-2.5 text-lime" href={`mailto:${contact.email}`}>{simple ? "E-mail" : contact.email}</a>
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