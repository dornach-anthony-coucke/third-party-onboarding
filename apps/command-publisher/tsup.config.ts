import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['cjs'],
  dts: false,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
});
