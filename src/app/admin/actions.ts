"use server";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { count, gt, sql } from "drizzle-orm";
import { db } from "@/db";
import { loginFailures, siteContent } from "@/db/schema";
import { createSession, destroySession, isAuthed, verifyPassword } from "@/lib/auth";
import { SECTION_KEYS, sameShape, urlsOk } from "@/lib/content";
import { defaults } from "@/data/content";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function login(
  _prev: { error?: string } | null,
  fd: FormData
): Promise<{ error?: string } | null> {
  const pw = String(fd.get("password") ?? "");
  try {
    const since = new Date(Date.now() - 15 * 60 * 1000);
    const [{ n }] = await db
      .select({ n: count() })
      .from(loginFailures)
      .where(gt(loginFailures.at, since));
    if (n >= 5) return { error: "Trop de tentatives. Réessayez dans 15 minutes." };

    if (!verifyPassword(pw)) {
      await db.insert(loginFailures).values({});
      await sleep(800);
      return { error: "Mot de passe incorrect." };
    }
    await db.delete(loginFailures);
  } catch (e) {
    console.error(e);
    return { error: "Erreur serveur. Vérifiez la base de données et les variables d'environnement." };
  }
  await createSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin");
}

export async function saveSection(
  key: string,
  json: string
): Promise<{ ok: boolean; message: string }> {
  if (!(await isAuthed())) return { ok: false, message: "Session expirée : reconnectez-vous (ouvrez /admin dans un autre onglet)." };
  if (!SECTION_KEYS.includes(key)) return { ok: false, message: "Section inconnue." };
  if (json.length > 300_000) return { ok: false, message: "Contenu trop volumineux." };

  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return { ok: false, message: "Données illisibles." };
  }
  if (!sameShape((defaults as Record<string, unknown>)[key], data)) {
    return { ok: false, message: "Structure invalide : un champ est manquant ou d'un mauvais type." };
  }
  if (!urlsOk(data)) {
    return { ok: false, message: "Un lien est invalide : il doit commencer par https://, http://, mailto: ou tel:." };
  }

  try {
    await db
      .insert(siteContent)
      .values({ key, data })
      .onConflictDoUpdate({ target: siteContent.key, set: { data, updatedAt: sql`now()` } });
  } catch (e) {
    console.error(e);
    return { ok: false, message: "Échec de l'enregistrement en base." };
  }
  updateTag("content");
  return { ok: true, message: "Enregistré. Le site public est à jour." };
}