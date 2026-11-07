"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReading } from "./ReadingMode";

export function useInView(once = true, margin = "-10% 0px") {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setSeen(true); if (once) io.disconnect(); }
        else if (!once) setSeen(false);
      },
      { rootMargin: margin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, margin]);
  return { ref, seen };
}

type V = "up" | "left" | "right" | "scale" | "blur";
const FROM: Record<V, string> = {
  up: "translateY(40px)",
  left: "translateX(-60px)",
  right: "translateX(60px)",
  scale: "scale(0.9)",
  blur: "translateY(10px)",
};

export default function Reveal({
  children, v = "up", delay = 0, className = "",
}: { children: ReactNode; v?: V; delay?: number; className?: string }) {
  const { ref, seen } = useInView();
  const { simple } = useReading();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: seen ? 1 : 0,
        // En lecture simple : simple fondu discret
        transform: seen ? "none" : simple ? "translateY(14px)" : FROM[v],
        filter: !simple && v === "blur" && !seen ? "blur(12px)" : "none",
        transition: simple
          ? `opacity .7s ease ${delay}s, transform .7s ease ${delay}s`
          : `opacity .9s ease ${delay}s, transform .9s cubic-bezier(.2,.7,.2,1) ${delay}s, filter .9s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// Texte révélé mot par mot (fondu simple en lecture simple)
export function Words({ text, className = "" }: { text: string; className?: string }) {
  const { ref, seen } = useInView();
  const { simple } = useReading();
  if (simple) {
    return (
      <div ref={ref} className={className} style={{ opacity: seen ? 1 : 0, transition: "opacity .8s ease" }}>
        {text}
      </div>
    );
  }
  return (
    <div ref={ref} className={className}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <span
            className="inline-block"
            style={{
              transform: seen ? "none" : "translateY(110%)",
              transition: `transform .8s cubic-bezier(.2,.7,.2,1) ${i * 0.03}s`,
            }}
          >
            {w}{"\u00A0"}
          </span>
        </span>
      ))}
    </div>
  );
}

// Titre « décodé » : lettres ADN / code qui se fixent une à une
export function ScrambleTitle({ text }: { text: string }) {
  const { ref, seen } = useInView();
  const { simple } = useReading();
  const [out, setOut] = useState(text);

  useEffect(() => {
    if (!seen || simple) { setOut(text); return; }
    const chars = "ATGC01<>/{}";
    let f = 0;
    const id = setInterval(() => {
      f++;
      setOut(
        text.split("").map((c, i) =>
          c === " " || i < f / 1.5 ? c : chars[Math.floor(Math.random() * chars.length)]
        ).join("")
      );
      if (f > text.length * 1.5) { clearInterval(id); setOut(text); }
    }, 35);
    return () => clearInterval(id);
  }, [seen, simple, text]);

  return <span ref={ref} aria-label={text}>{out}</span>;
}