import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { siteContent } from "@/db/schema";
import { defaults, type Content } from "@/data/content";

export const SECTION_KEYS = Object.keys(defaults);

// Vérifie que `val` a la même structure que `ref` (évite de casser le site)
export function sameShape(ref: unknown, val: unknown): boolean {
  if (Array.isArray(ref)) {
    if (!Array.isArray(val)) return false;
    if (ref.length === 0) return true;
    return val.every((v) => sameShape(ref[0], v));
  }
  if (ref && typeof ref === "object") {
    if (!val || typeof val !== "object" || Array.isArray(val)) return false;
    const r = ref as Record<string, unknown>;
    const v = val as Record<string, unknown>;
    return Object.keys(r).every((k) => sameShape(r[k], v[k]));
  }
  return typeof ref === typeof val;
}

const okUrl = (s: string) => s === "" || /^(https?:\/\/|mailto:|tel:|\/(?!\/))/i.test(s);
const URL_KEYS = new Set(["href", "image", "github", "video"]);

// Les champs « lien » doivent commencer par https://, http://, mailto: ou tel:
export function urlsOk(v: unknown): boolean {
  if (Array.isArray(v)) return v.every(urlsOk);
  if (v && typeof v === "object") {
    return Object.entries(v).every(([k, x]) =>
      URL_KEYS.has(k) && typeof x === "string" ? okUrl(x) : urlsOk(x)
    );
  }
  return true;
}

// Lecture directe (sans cache) : valeurs par défaut + ce qui est enregistré
export async function readAll(): Promise<Content> {
  const out: Record<string, unknown> = { ...defaults };
  try {
    const rows = await db.select().from(siteContent);
    for (const r of rows) {
      const ref = (defaults as Record<string, unknown>)[r.key];
      if (ref !== undefined && sameShape(ref, r.data)) out[r.key] = r.data;
    }
  } catch (e) {
    console.error("Base indisponible, valeurs par défaut utilisées :", e);
  }
  return out as Content;
}

const live = <T,>(a: T[]): T[] => a.filter((x) => (x as { draft?: boolean }).draft !== true);

// Retire les éléments en brouillon pour le site public
export function toPublic(c: Content): Content {
  return {
    ...c,
    journey: live(c.journey),
    experiences: live(c.experiences),
    projects: live(c.projects),
    gallery: live(c.gallery),
  };
}

// Version du site public : mise en cache, invalidée à chaque enregistrement
export async function getContent(): Promise<Content> {
  "use cache";
  cacheTag("content");
  cacheLife("minutes");
  return toPublic(await readAll());
}