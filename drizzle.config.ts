// import 'dotenv/config';
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

const envFile = process.env.DRIZZLE_ENV === 'production' ? '.env' : '.env.development';
const { parsed } = config({ path: envFile, override: true });

if (!parsed?.DATABASE_URL) {
  throw new Error(`DATABASE_URL is not set in ${envFile}.`);
}

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: parsed.DATABASE_URL!,
  },
});