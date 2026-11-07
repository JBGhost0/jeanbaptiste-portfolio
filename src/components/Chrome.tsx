"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Ambient, ModeToggle } from "./ReadingMode";
import SmoothScroll from "./SmoothScroll";
import Cursor from "./Cursor";

export default function Chrome({ children }: { children: ReactNode }) {
  if (usePathname().startsWith("/admin")) return <>{children}</>;
  return (
    <>
      <Ambient />
      <SmoothScroll>{children}</SmoothScroll>
      <Cursor />
      <ModeToggle />
    </>
  );
}