import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../drizzle/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be defined in your environment variables.");
}

// Disable pre-compilation of queries (prepare: false) to prevent issues with connection poolers like Supabase's transaction mode.
// Configure connection pool to prevent ECONNRESET errors with Supabase's pgBouncer.
const client = postgres(connectionString, {
  prepare: false,
  max: 25,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
