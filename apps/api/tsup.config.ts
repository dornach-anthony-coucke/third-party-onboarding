import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['cjs'],
  dts: false,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  noExternal: [
    '@third-party-onboarding/database-nest-module',
    '@third-party-onboarding/drizzle-core',
  ],
  external: [
    '@nestjs/common',
    '@nestjs/core',
    '@nestjs/platform-express',
    '@nestjs/config',
    'drizzle-orm',
    'postgres',
    'reflect-metadata',
    'rxjs',
  ],
  target: 'node18',
});
