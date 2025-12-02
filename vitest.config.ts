import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname)
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    // search tests anywhere in the repo and support both .test and .spec
    include: ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
    coverage: {
      reporter: ['text']
    }
  }
})
