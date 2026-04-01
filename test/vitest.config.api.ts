import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'api',
    include: ['api/**/*.test.ts'],
    testTimeout: 15000,
    hookTimeout: 15000,
    // API tests are sequential because they share state (created users, questions, etc.)
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true }
    },
    globals: true
  }
})
