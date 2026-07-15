import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@rpsa/game-core': fileURLToPath(new URL('../../packages/game-core/src/index.ts', import.meta.url)),
    },
  },
})
