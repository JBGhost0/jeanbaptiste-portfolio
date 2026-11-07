"use client";
import { createContext, useContext, type ReactNode } from "react";
import { defaults, type Content } from "@/data/content";

const Ctx = createContext<Content>(defaults);
export const useContent = () => useContext(Ctx);

export default function ContentProvider({ value, children }: { value: Content; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}