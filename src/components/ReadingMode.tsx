"use client";
import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type ReadingCtx = { simple: boolean; toggle: (x?: number, y?: number) => void };
const Ctx = createContext<ReadingCtx>({ simple: false, toggle: () => {} });
export const useReading = () => useContext(Ctx);

// Couleurs de la vague d'eau (de la plus vive à la couleur finale du thème)
const WATER = {
  simple: ["#ffffff", "#dfe6f0", "#b9c5d6", "#eef2f7"],
  dark: ["#bfe6ff", "#7fd3ff", "#26405c", "#050810"],
};
// Gouttelettes : [dx, dy] en vmin (dy négatif = vers le haut)
const DROPS: [number, number][] = [
  [-30, -55], [-18, -70], [-5, -80], [10, -72], [22, -60],
  [-38, -40], [30, -45], [-12, -62], [4, -88], [16, -78],
];

function WaterOverlay({ x, y, toSimple }: { x: number; y: number; toSimple: boolean }) {
  const c = toSimple ? WATER.simple : WATER.dark;
  const vars = { "--x": `${x}px`, "--y": `${y}px` } as CSSProperties;
  return (
    <div aria-hidden className="paint-out pointer-events-none fixed inset-0 z-[200]" style={vars}>
      <div className="jet" style={{ left: x - 9, top: 0, height: y, background: `linear-gradient(to top, ${c[1]}, ${c[0]})` }} />
      {c.map((col, i) => (
        <div key={col} className="paint-layer" style={{ background: col, animationDelay: `${0.45 + i * 0.12}s` }} />
      ))}
      {DROPS.map(([dx, dy], i) => {
        const size = `${1.2 + (i % 3) * 0.6}vmin`;
        return (
          <div
            key={i}
            className="drop"
            style={
              {
                left: x, top: y, width: size, height: size, background: c[i % 2],
                "--dx": `${dx}vmin`, "--dy": `${dy}vmin`, animationDelay: `${0.1 + i * 0.03}s`,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

export function ReadingProvider({ children }: { children: ReactNode }) {
  const [simple, setSimple] = useState(false);
  const [water, setWater] = useState<{ x: number; y: number; to: boolean } | null>(null);
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
    setWater({ x, y, to: next });
    setTimeout(() => apply(next), 1500);                 // le thème change sous la vague
    setTimeout(() => { setWater(null); busy.current = false; }, 2750);
  };

  return (
    <Ctx.Provider value={{ simple, toggle }}>
      {children}
      {water && <WaterOverlay x={water.x} y={water.y} toSimple={water.to} />}
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