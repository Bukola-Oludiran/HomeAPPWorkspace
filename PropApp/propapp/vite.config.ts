import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Shared API contracts; see HomeAPPWorkspace/contracts/README.md.
      // Order matters: more specific subpath alias must be declared before the
      // bare alias so Vite tries it first.
      '@homeai/contracts/': path.resolve(__dirname, '../../contracts/') + '/',
      '@homeai/contracts': path.resolve(__dirname, '../../contracts/index.ts'),
    },
  },
})
