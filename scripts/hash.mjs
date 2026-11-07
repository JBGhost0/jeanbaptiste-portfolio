import { scryptSync, randomBytes } from "node:crypto";
const pw = process.argv[2];
if (!pw || pw.length < 12) {
  console.error("Donne un mot de passe de 12 caractères minimum.");
  process.exit(1);
}
const salt = randomBytes(16).toString("hex");
console.log(`${salt}:${scryptSync(pw, salt, 64).toString("hex")}`);