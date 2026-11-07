"use client";
import { Component, useEffect, useState, type ReactNode } from "react";
import { useInView } from "./Reveal";
import { useReading } from "./ReadingMode";

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

function webglOk() {
  try {
    const c = document.createElement("canvas");
    const o = { failIfMajorPerformanceCaveat: true };
    const gl = (c.getContext("webgl2", o) || c.getContext("webgl", o)) as WebGLRenderingContext | null;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch { return false; }
}

export default function Safe3D({
  children, className = "", fallback = null,
}: { children: ReactNode; className?: string; fallback?: ReactNode }) {
  const { simple } = useReading();
  const { ref, seen } = useInView(false, "100px 0px");
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(webglOk()), []);
  const live = ok && seen && !simple;
  return (
    <div ref={ref} className={`scene3d ${className}`}>
      {live ? <Boundary>{children}</Boundary> : fallback}
    </div>
  );
}