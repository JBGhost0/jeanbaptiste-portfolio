"use client";
import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type ReadingCtx = { simple: boolean; toggle: (x?: number, y?: number) => void };
const Ctx = createContext<ReadingCtx>({ simple: false, toggle: () => {} });
export const useReading = () => useContext(Ctx);

// Trois couches versées l'une après l'autre. La dernière = couleur de fond du nouveau thème.
const LIQUID = {
  simple: ["#ffffff", "#c3cddb", "#eef2f7"],
  dark: ["#bfe6ff", "#5fb8ea", "#050810"],
};
// Gouttes : [position %, largeur px, longueur px]
const DRIPS: [number, number, number][] = [
  [8, 16, 150], [19, 11, 230], [31, 20, 120], [44, 13, 270],
  [57, 18, 170], [69, 12, 240], [81, 22, 140], [92, 14, 200],
];

function Wave() {
  return (
    <svg viewBox="0 0 2880 80" preserveAspectRatio="none" aria-hidden>
      <path d="M0 40Q180 80 360 40T720 40T1080 40T1440 40T1800 40T2160 40T2520 40T2880 40V0H0Z" />
    </svg>
  );
}

function PourOverlay({ toSimple }: { toSimple: boolean }) {
  const colors = toSimple ? LIQUID.simple : LIQUID.dark;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
      {colors.map((c, i) => (
        <div key={c} className="pour" style={{ "--c": c, animationDelay: `${i * 0.16}s` } as CSSProperties}>
          <div className="pour-wave top"><Wave /></div>
          <div className="pour-body" />
          <div className="pour-wave bot"><Wave /></div>
          <div className="pour-drips">
            {DRIPS.filter((_, k) => k % (i + 1) === 0).map(([l, w, h], k) => (
              <span
                key={k}
                className="drip"
                style={
                  {
                    left: `${l}%`,
                    "--w": `${w}px`,
                    "--h": `${Math.round(h * (1 - i * 0.3))}px`,
                    "--dl": `${0.25 + i * 0.16 + (k % 4) * 0.07}s`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReadingProvider({ children }: { children: ReactNode }) {
  const [simple, setSimple] = useState(false);
  const [pour, setPour] = useState<{ to: boolean } | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem("simple"); } catch {}
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setSimple(saved ? saved === "1" : reduced);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.simple = String(simple);
  }, [simple]);

  const apply = (next: boolean) => {
    setSimple(next);
    try { localStorage.setItem("simple", next ? "1" : "0"); } catch {}
  };

  const toggle = (x?: number, y?: number) => {
    if (busy.current) return;
    const next = !simple;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || x === undefined || y === undefined) { apply(next); return; }
    busy.current = true;
    setPour({ to: next });
    setTimeout(() => apply(next), 1600);   // écran entièrement recouvert : le thème change
    setTimeout(() => { setPour(null); busy.current = false; }, 3000);
  };

  return (
    <Ctx.Provider value={{ simple, toggle }}>
      {children}
      {pour && <PourOverlay toSimple={pour.to} />}
    </Ctx.Provider>
  );
}

export function ModeToggle() {
  const { simple, toggle } = useReading();
  return (
    <button
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        toggle(r.left + r.width / 2, r.top + r.height / 2);
      }}
      aria-pressed={simple}
      className="glass fixed bottom-5 right-5 z-[90] flex items-center gap-2 rounded-full px-4 py-2.5 text-sm transition hover:border-lime/60"
    >
      <span className={`h-2 w-2 rounded-full ${simple ? "bg-amber" : "bg-lime"}`} />
      {simple ? "Mode animé" : "Lecture simple"}
    </button>
  );
}

const DOTS = [
  [12, 22, 10], [78, 14, 14], [90, 52, 8], [30, 68, 12], [64, 82, 9], [8, 88, 11],
];

export function Ambient() {
  const { simple } = useReading();

  if (simple) {
    return (
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 0%, #ffffff, transparent 55%), radial-gradient(ellipse at 90% 100%, #dde4ee, transparent 50%)",
          }}
        />
        <div className="liquid" style={{ width: "46vmax", height: "46vmax", left: "-12vmax", top: "8vh" }} />
        <div className="liquid" style={{ width: "40vmax", height: "40vmax", right: "-14vmax", top: "38vh", animationDelay: "-9s", animationDuration: "34s" }} />
        <div className="liquid" style={{ width: "36vmax", height: "36vmax", left: "28vw", bottom: "-22vmax", animationDelay: "-17s", animationDuration: "31s" }} />
        <div className="sheen" />
        {DOTS.map(([l, t, s], i) => (
          <span
            key={i}
            className="floaty absolute rounded-full"
            style={
              {
                left: `${l}%`, top: `${t}%`, width: s, height: s,
                background: "rgba(90,110,140,0.25)",
                "--d": `${8 + i}s`, "--dl": `${-i * 1.7}s`, "--fx": "8px",
              } as CSSProperties
            }
          />
        ))}
      </div>
    );
  }

  const blob = (extra: CSSProperties): CSSProperties => ({ width: "60vw", height: "60vw", ...extra });
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center,#000 30%,transparent 80%)",
        }}
      />
      <div className="blob" style={blob({ left: "-10%", top: "10%", background: "radial-gradient(circle,rgba(127,211,255,.14),transparent 65%)" })} />
      <div className="blob" style={blob({ right: "-15%", top: "45%", animationDelay: "-8s", background: "radial-gradient(circle,rgba(200,215,235,.10),transparent 65%)" })} />
      <div className="blob" style={blob({ left: "20%", bottom: "-25%", animationDelay: "-15s", background: "radial-gradient(circle,rgba(127,211,255,.08),transparent 65%)" })} />
    </div>
  );
}