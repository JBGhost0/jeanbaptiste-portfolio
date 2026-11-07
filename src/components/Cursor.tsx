"use client";
import { useEffect, useRef } from "react";

export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ring.current;
    if (!el) return;
    el.style.opacity = "1";
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const move = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      el.style.transform = `translate3d(${x - 14}px, ${y - 14}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move);
    loop();
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ring}
      aria-hidden
      className="cursor-ring pointer-events-none fixed left-0 top-0 z-[100] h-7 w-7 rounded-full border border-lime/70 opacity-0 transition-opacity"
    />
  );
}