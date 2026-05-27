import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(path.resolve(__dirname, './package.json'), 'utf-8')) as {
  version: string;
};

// https://vite.dev/config/
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
}));
