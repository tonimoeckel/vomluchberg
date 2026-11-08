import { defineConfig } from 'vitest/config';

// Unit tests cover the pure modules in src/ and the Tina schema (no Astro, no Tina client).
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'tina/**/*.test.ts', 'scripts/**/*.test.mjs'],
  },
});
