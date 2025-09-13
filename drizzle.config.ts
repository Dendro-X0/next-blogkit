import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import { existsSync } from 'node:fs';

// Load env for CLI usage: prefer .env.local, fallback to .env
if (existsSync('.env.local')) {
  config({ path: '.env.local' });
} else {
  config();
}

export default defineConfig({
  schema: ['./src/lib/db/schema.ts', './auth-schema.ts'],
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
