import { createHash, createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "admin_session";
const TTL = 7 * 24 * 60 * 60; // 7 jours, en secondes

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET manquant ou trop court");
  return s;
}
const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("hex");
const safeEq = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function verifyPassword(pw: string) {
  // Option simple : mot de passe en clair dans ADMIN_PASSWORD (serveur uniquement)
  const plain = process.env.ADMIN_PASSWORD;
  if (plain) {
    const h = (s: string) => createHash("sha256").update(s).digest("hex");
    return safeEq(h(pw.trim()), h(plain.trim()));
  }

  // Ancienne option : hash sel:hash
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  return safeEq(scryptSync(pw, salt, 64).toString("hex"), hash);
}

export async function createSession() {
  const exp = String(Date.now() + TTL * 1000);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: TTL,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAuthed() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const [exp, sig] = raw.split(".");
  if (!exp || !sig || !safeEq(sig, sign(exp))) return false;
  return Number(exp) > Date.now();
}