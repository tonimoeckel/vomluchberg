import { defineConfig } from 'vitest/config';

// Unit tests cover the pure modules in src/lib (no Astro, no Tina client).
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
