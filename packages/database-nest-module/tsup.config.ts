import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: [
    '@nestjs/common',
    '@nestjs/core',
    '@third-party-onboarding/drizzle-core',
    'drizzle-orm',
    'reflect-metadata',
    'rxjs',
  ],
});
