import { drizzle } from 'drizzle-orm/neon-http';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Expected a Neon connection string.');
}

// The neon-http driver issues one HTTP request per query and holds no connection,
// so a single module-scope instance is safe to share across requests.
export const db = drizzle(connectionString);
