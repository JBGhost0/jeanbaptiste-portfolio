"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { useReading } from "./ReadingMode";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { simple } = useReading();
  useEffect(() => {
    if (simple || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1 });
    let raf = 0;
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, [simple]);
  return <>{children}</>;
}