import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// L'adresse factice évite un plantage à l'import si la variable manque
// (les requêtes échoueront alors proprement, et le site garde les valeurs par défaut).
const url = process.env.DATABASE_URL ?? "postgresql://x:x@localhost/x";
export const db = drizzle({ client: neon(url) });