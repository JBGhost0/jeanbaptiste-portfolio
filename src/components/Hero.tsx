"use client";
import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

// Si la 3D plante, on l'enlève sans casser la page
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(e: unknown) {
    console.warn("3D désactivée :", e);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

// La 3D n'est lancée que si le navigateur a un vrai WebGL (accéléré)
function webglOk() {
  try {
    const c = document.createElement("canvas");
    const gl =
      c.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ||
      c.getContext("webgl", { failIfMajorPerformanceCaveat: true });
    return !!gl;
  } catch {
    return false;
  }
}

export default function Hero() {
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!webglOk()) return;
    const t = setTimeout(() => setShow3D(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <section id="accueil" className="relative flex min-h-screen items-center overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(182,255,60,0.08),transparent_60%)]"
      />
      {show3D && (
        <div className="absolute inset-0">
          <SceneBoundary>
            <HeroScene />
          </SceneBoundary>
        </div>
      )}
      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-6xl px-6">
        <p className="rise font-mono text-sm tracking-widest text-lime" style={{ animationDelay: "0.1s" }}>
          AGRONOMIE × CODE
        </p>
        <h1
          className="rise mt-4 font-display text-5xl font-bold leading-[1.02] sm:text-7xl lg:text-8xl"
          style={{ animationDelay: "0.25s" }}
        >
          Jean-Baptiste
          <br />
          <span className="text-lime">Mahougnon</span> DADA
        </h1>
        <p className="rise mt-6 max-w-xl text-lg text-muted" style={{ animationDelay: "0.45s" }}>
          Technicien agronome en nutrition et transformation alimentaire,
          et développeur. Là où la terre rencontre le code.
        </p>
        <div className="rise pointer-events-auto mt-10 flex gap-4" style={{ animationDelay: "0.65s" }}>
          <a href="#projets" className="rounded-full bg-lime px-6 py-3 font-medium text-black transition hover:brightness-110">
            Voir mes projets
          </a>
          <a href="#contact" className="rounded-full border border-white/20 px-6 py-3 transition hover:border-lime hover:text-lime">
            Me contacter
          </a>
        </div>
      </div>
    </section>
  );
}