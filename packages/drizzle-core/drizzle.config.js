import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schemas/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.THIRD_PARTY_ONBOARDING_MANAGER_DATABASE_HOST,
    port: parseInt(process.env.THIRD_PARTY_ONBOARDING_MANAGER_DATABASE_PORT),
    database: process.env.THIRD_PARTY_ONBOARDING_MANAGER_DATABASE_NAME,
    user: process.env.THIRD_PARTY_ONBOARDING_MANAGER_DATABASE_USER,
    password: process.env.THIRD_PARTY_ONBOARDING_MANAGER_DATABASE_PASSWORD,
    ssl: process.env.THIRD_PARTY_ONBOARDING_MANAGER_DATABASE_USE_SSL === 'true',
  },
  // Options utiles:
  strict: true,
  verbose: true,
});
