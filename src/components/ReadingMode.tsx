"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const Ctx = createContext({ simple: false, toggle: () => {} });
export const useReading = () => useContext(Ctx);

export function ReadingProvider({ children }: { children: ReactNode }) {
  const [simple, setSimple] = useState(false);

  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem("simple"); } catch {}
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setSimple(saved ? saved === "1" : reduced);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.simple = String(simple);
  }, [simple]);

  const toggle = () => {
    const next = !simple;
    setSimple(next);
    try { localStorage.setItem("simple", next ? "1" : "0"); } catch {}
  };

  return <Ctx.Provider value={{ simple, toggle }}>{children}</Ctx.Provider>;
}

export function ModeToggle() {
  const { simple, toggle } = useReading();
  return (
    <button
      onClick={toggle}
      aria-pressed={simple}
      className="glass fixed bottom-5 right-5 z-[90] flex items-center gap-2 rounded-full px-4 py-2.5 text-sm transition hover:border-lime/60"
    >
      <span className={`h-2 w-2 rounded-full ${simple ? "bg-amber" : "bg-lime"}`} />
      {simple ? "Mode animé" : "Lecture simple"}
    </button>
  );
}

export function Ambient() {
  const blob = (extra: React.CSSProperties) => ({
    width: "60vw", height: "60vw", ...extra,
  });
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
      <div className="blob" style={blob({ left: "-10%", top: "10%", background: "radial-gradient(circle,rgba(182,255,60,.14),transparent 65%)" })} />
      <div className="blob" style={blob({ right: "-15%", top: "45%", animationDelay: "-8s", background: "radial-gradient(circle,rgba(255,181,71,.10),transparent 65%)" })} />
      <div className="blob" style={blob({ left: "20%", bottom: "-25%", animationDelay: "-15s", background: "radial-gradient(circle,rgba(182,255,60,.08),transparent 65%)" })} />
    </div>
  );
}