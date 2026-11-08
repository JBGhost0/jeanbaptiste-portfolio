import { scryptSync, timingSafeEqual } from "node:crypto";
import { config } from "dotenv";

config({ path: ".env.local" });
const [salt, hash] = (process.env.ADMIN_PASSWORD_HASH ?? "").split(":");
console.log("sel :", salt?.length, "caractères (attendu 32)");
console.log("hash :", hash?.length, "caractères (attendu 128)");

const pw = process.argv[2] ?? "";
if (!salt || !hash) {
  console.log("ADMIN_PASSWORD_HASH est absent ou mal formé dans .env.local");
} else {
  const a = Buffer.from(scryptSync(pw, salt, 64).toString("hex"));
  const b = Buffer.from(hash);
  console.log(a.length === b.length && timingSafeEqual(a, b) ? "OK : ce mot de passe correspond" : "NON : ce mot de passe ne correspond pas");
}