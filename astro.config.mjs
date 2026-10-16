// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://kosama.pe',
  output: 'static',
  // Versionado: Vercel reutiliza las variantes ya codificadas en vez de
  // generarlas en cada build. Regenerar con `pnpm build` al cambiar imágenes.
  cacheDir: './.astro-cache',
  adapter: vercel(),
  integrations: [react(), sitemap()],
  image: {
    layout: 'constrained',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
