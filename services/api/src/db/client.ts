import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env.js";
import * as schema from "./schema.js";

/**
 * Drizzle client. postgres.js connects lazily on first query, so importing this
 * never opens a socket — the scaffold's routes serve in-memory fixtures and the
 * API boots fine without a database. Replace each route's fixture with a real
 * `db.select()...` query as the backend comes online.
 */
const client = postgres(env.DATABASE_URL, { max: 10 });

export const db = drizzle(client, { schema });
export type Database = typeof db;
