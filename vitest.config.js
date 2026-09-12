// Vitest: runtime smoke over the real page modules (see tests/runtime-smoke.test.js).
// Page modules use relative imports only, so no aliasing is needed.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup-runtime.js'],
    include: ['tests/runtime-smoke.test.js'],
    testTimeout: 20000,
    pool: 'forks'
  }
});
