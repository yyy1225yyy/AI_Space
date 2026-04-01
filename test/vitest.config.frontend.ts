import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
      'zustand': path.resolve(__dirname, 'node_modules/zustand'),
    }
  },
  test: {
    name: 'frontend',
    include: ['frontend/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['frontend/setup.ts'],
    globals: true
  }
})
