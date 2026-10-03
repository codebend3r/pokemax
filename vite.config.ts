/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import pkg from './package.json' with { type: 'json' };

// https://vite.dev/config/ — Vitest reads this file too (`test` below).
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // GitHub Pages serves the site under `/pokemax/`, but Netlify serves it from
  // the root. Netlify auto-sets `NETLIFY=true` on its build env, so we use that
  // to pick the right base without an extra build flag.
  base: mode === 'production' && !process.env.NETLIFY ? '/pokemax/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  server: {
    // Allow tunnel hosts for phone testing (`cloudflared`, `ngrok`).
    // Vite 6 blocks unknown `Host` headers by default.
    allowedHosts: ['.trycloudflare.com', '.ngrok-free.app', '.ngrok.io'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
}));
